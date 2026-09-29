#!/usr/bin/env node
/**
 * Lightweight load test runner using Node.js built-ins (no k6 required).
 * Uses the native `fetch` API (Node 18+) for HTTP requests.
 *
 * Tests the quiz startAttempt endpoint concurrently to validate
 * the rate limiter and database under load.
 *
 * Usage:
 *   node load-tests/node-runner/quiz-load.mjs
 *   BASE_URL=http://localhost:8000 QUIZ_ID=<uuid> VUS=100 node load-tests/node-runner/quiz-load.mjs
 */

const BASE_URL = process.env.BASE_URL || "http://localhost:8000";
const QUIZ_ID  = process.env.QUIZ_ID  || "00000000-0000-4000-a000-000000000001";
const VUS      = parseInt(process.env.VUS || "50");
const ROUNDS   = parseInt(process.env.ROUNDS || "3");

// ---------------------------------------------------------------------------
// Stats collector
// ---------------------------------------------------------------------------

class Stats {
    durations = [];
    errors    = 0;
    success   = 0;
    rateLimited = 0;

    record(duration, status) {
        if (status === 200) {
            this.success++;
            this.durations.push(duration);
        } else if (status === 429) {
            this.rateLimited++;
        } else {
            this.errors++;
        }
    }

    percentile(p) {
        if (this.durations.length === 0) return 0;
        const sorted = [...this.durations].sort((a, b) => a - b);
        const idx = Math.floor((p / 100) * sorted.length);
        return sorted[Math.min(idx, sorted.length - 1)];
    }

    avg() {
        if (this.durations.length === 0) return 0;
        return Math.round(this.durations.reduce((a, b) => a + b, 0) / this.durations.length);
    }

    print(label) {
        const total = this.success + this.errors + this.rateLimited;
        console.log(`\n📊 ${label}`);
        console.log(`   Total requests : ${total}`);
        console.log(`   ✅ Success      : ${this.success}`);
        console.log(`   ❌ Errors       : ${this.errors}`);
        console.log(`   🚦 Rate limited : ${this.rateLimited}`);
        console.log(`   ⏱ Avg latency  : ${this.avg()}ms`);
        console.log(`   ⏱ p50 latency  : ${this.percentile(50)}ms`);
        console.log(`   ⏱ p95 latency  : ${this.percentile(95)}ms`);
        console.log(`   ⏱ p99 latency  : ${this.percentile(99)}ms`);
        console.log(`   📈 Error rate   : ${((this.errors / total) * 100).toFixed(2)}%`);
    }
}

// ---------------------------------------------------------------------------
// HTTP helpers
// ---------------------------------------------------------------------------

async function trpcPost(path, body) {
    const start = Date.now();
    try {
        const res = await fetch(`${BASE_URL}/trpc/${path}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ json: body }),
            signal: AbortSignal.timeout(10_000),
        });
        return { status: res.status, duration: Date.now() - start };
    } catch (err) {
        return { status: 0, duration: Date.now() - start, error: err.message };
    }
}

// ---------------------------------------------------------------------------
// Test scenarios
// ---------------------------------------------------------------------------

async function runStartAttemptTest(vuCount, stats) {
    const promises = Array.from({ length: vuCount }, (_, i) =>
        trpcPost("quiz.startAttempt", {
            formId:           QUIZ_ID,
            participantName:  `LoadUser-${i}-${Date.now()}`,
            participantEmail: `load${i}@test.example`,
        }).then(({ status, duration }) => stats.record(duration, status))
    );
    await Promise.all(promises);
}

async function runSaveAnswerTest(attemptId, questionId, optionId, vuCount, stats) {
    const promises = Array.from({ length: vuCount }, () =>
        trpcPost("quiz.saveAnswer", {
            attemptId,
            questionId,
            selectedOptionIds: optionId ? [optionId] : [],
            textAnswer:        null,
        }).then(({ status, duration }) => stats.record(duration, status))
    );
    await Promise.all(promises);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

console.log(`\n🚀 Quiz Platform Load Test`);
console.log(`   Base URL  : ${BASE_URL}`);
console.log(`   Quiz ID   : ${QUIZ_ID}`);
console.log(`   VUs       : ${VUS}`);
console.log(`   Rounds    : ${ROUNDS}`);
console.log(`\n⚠️  Note: Rate limits may block some requests — this is expected behavior.\n`);

// --- Test 1: Concurrent startAttempt ---
const startStats = new Stats();
console.log(`\n🔬 Test 1: ${VUS} concurrent startAttempt requests (${ROUNDS} rounds)`);
for (let round = 0; round < ROUNDS; round++) {
    process.stdout.write(`   Round ${round + 1}/${ROUNDS}... `);
    await runStartAttemptTest(VUS, startStats);
    console.log(`done`);
    // Wait 5s between rounds to reset rate limit window
    if (round < ROUNDS - 1) {
        await new Promise(r => setTimeout(r, 5_000));
    }
}
startStats.print("startAttempt Concurrent Test");

// Thresholds
const p95 = startStats.percentile(95);
const errRate = (startStats.errors / (startStats.success + startStats.errors + startStats.rateLimited)) * 100;
const passed = p95 < 500 && errRate < 1;

console.log(`\n${passed ? "✅" : "❌"} Thresholds: p95 < 500ms (${p95}ms) | error rate < 1% (${errRate.toFixed(2)}%)`);

if (!passed) {
    console.log(`\n❌ LOAD TEST FAILED — check server logs and database connections`);
    process.exit(1);
} else {
    console.log(`\n✅ All load test thresholds passed!\n`);
}
