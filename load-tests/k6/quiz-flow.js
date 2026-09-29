/**
 * k6 Load Test — Full Quiz E2E Flow
 *
 * Simulates a realistic user journey through the quiz platform:
 *   1. Load quiz landing page (GET /trpc/quiz/getPublic)
 *   2. Start an attempt (POST /trpc/quiz/startAttempt)
 *   3. Save answers progressively (POST /trpc/quiz/saveAnswer) × N questions
 *   4. Submit the attempt (POST /trpc/quiz/submitAttempt)
 *   5. View result (GET /trpc/quiz/getResult)
 *   6. (Optional) View leaderboard (GET /trpc/quiz/getLeaderboard)
 *
 * Usage:
 *   k6 run k6/quiz-flow.js
 *   k6 run -e VU_COUNT=250 -e BASE_URL=http://localhost:8000 k6/quiz-flow.js
 *   k6 run -e VU_COUNT=500 --out json=results.json k6/quiz-flow.js
 *
 * Environment variables:
 *   VU_COUNT  — number of virtual users (default: 50)
 *   DURATION  — test duration string (default: "2m")
 *   BASE_URL  — API base URL (default: "http://localhost:8000")
 *   QUIZ_ID   — UUID of the quiz to test against (required for real runs)
 */

import http from "k6/http";
import { check, sleep, group } from "k6";
import { Rate, Trend, Counter } from "k6/metrics";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const VU_COUNT  = parseInt(__ENV.VU_COUNT  || "50");
const DURATION  = __ENV.DURATION           || "2m";
const BASE_URL  = __ENV.BASE_URL           || "http://localhost:8000";
const QUIZ_ID   = __ENV.QUIZ_ID            || "00000000-0000-4000-a000-000000000001";

// ---------------------------------------------------------------------------
// Custom metrics
// ---------------------------------------------------------------------------

const errorRate        = new Rate("quiz_errors");
const startAttemptTime = new Trend("start_attempt_duration");
const saveAnswerTime   = new Trend("save_answer_duration");
const submitTime       = new Trend("submit_duration");
const resultTime       = new Trend("result_duration");
const successfulFlows  = new Counter("successful_full_flows");

// ---------------------------------------------------------------------------
// Load stages — ramp up → sustained → ramp down
// ---------------------------------------------------------------------------

export const options = {
    stages: [
        { duration: "30s", target: Math.floor(VU_COUNT * 0.25) }, // ramp to 25%
        { duration: "30s", target: Math.floor(VU_COUNT * 0.75) }, // ramp to 75%
        { duration: DURATION,  target: VU_COUNT },                  // sustained load
        { duration: "30s", target: 0 },                             // ramp down
    ],
    thresholds: {
        // Error rate must be below 1%
        "quiz_errors":               ["rate<0.01"],
        // p95 of all HTTP requests < 500ms
        "http_req_duration":         ["p(95)<500", "p(99)<1000"],
        // Individual endpoint thresholds
        "start_attempt_duration":    ["p(95)<600"],
        "save_answer_duration":      ["p(95)<300"],
        "submit_duration":           ["p(95)<800"],
        "result_duration":           ["p(95)<400"],
    },
    // Limit rate limiting false positives — spread VUs over time
    noConnectionReuse: false,
    userAgent: "k6-quiz-loadtest/1.0",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const HEADERS = {
    "Content-Type": "application/json",
    "Accept": "application/json",
};

function trpcGet(path, params = {}) {
    const query = new URLSearchParams({ input: JSON.stringify(params) }).toString();
    return http.get(`${BASE_URL}/trpc/${path}?${query}`, { headers: HEADERS });
}

function trpcPost(path, body = {}) {
    return http.post(
        `${BASE_URL}/trpc/${path}`,
        JSON.stringify({ json: body }),
        { headers: HEADERS }
    );
}

function checkSuccess(res, name) {
    const ok = check(res, {
        [`${name}: status 200`]: (r) => r.status === 200,
        [`${name}: has result`]:  (r) => r.json("result") !== null,
    });
    errorRate.add(!ok);
    return ok;
}

function randomName() {
    const names = ["Alice", "Bob", "Carol", "Dave", "Eve", "Frank", "Grace", "Hank"];
    return `${names[Math.floor(Math.random() * names.length)]}-${__VU}-${Date.now()}`;
}

// ---------------------------------------------------------------------------
// Main VU scenario
// ---------------------------------------------------------------------------

export default function () {
    let attemptId = null;
    let questions = [];

    // ── 1. Load quiz info ──────────────────────────────────────────────────
    group("1. Load Quiz", () => {
        const res = trpcGet("quiz.getPublic", { formId: QUIZ_ID });
        checkSuccess(res, "getPublic");

        if (res.status === 200) {
            try {
                const data = res.json("result.data.quiz");
                if (data && data.questions) {
                    questions = data.questions;
                }
            } catch (_) {}
        }

        sleep(1); // user reads the quiz info
    });

    // ── 2. Start attempt ───────────────────────────────────────────────────
    group("2. Start Attempt", () => {
        const res = trpcPost("quiz.startAttempt", {
            formId: QUIZ_ID,
            participantName: randomName(),
            participantEmail: `vuser${__VU}@loadtest.example`,
        });

        const start = Date.now();
        const ok = checkSuccess(res, "startAttempt");
        startAttemptTime.add(Date.now() - start);

        if (ok) {
            try {
                const data = res.json("result.data");
                attemptId = data.attemptId;
                if (data.questions) questions = data.questions;
            } catch (_) {}
        }

        errorRate.add(!ok);
        sleep(2); // user reads the first question
    });

    if (!attemptId) {
        errorRate.add(1);
        return;
    }

    // ── 3. Answer questions ────────────────────────────────────────────────
    group("3. Answer Questions", () => {
        for (let i = 0; i < Math.min(questions.length, 5); i++) {
            const question = questions[i];
            if (!question) continue;

            const answerBody = {
                attemptId,
                questionId: question.id,
                selectedOptionIds: question.options && question.options.length > 0
                    ? [question.options[0].id] // always pick first option
                    : [],
                textAnswer: null,
            };

            const start = Date.now();
            const res = trpcPost("quiz.saveAnswer", answerBody);
            saveAnswerTime.add(Date.now() - start);
            checkSuccess(res, `saveAnswer[${i}]`);

            sleep(Math.random() * 3 + 1); // 1-4s per question (realistic)
        }
    });

    // ── 4. Submit attempt ──────────────────────────────────────────────────
    group("4. Submit", () => {
        const start = Date.now();
        const res = trpcPost("quiz.submitAttempt", { attemptId });
        submitTime.add(Date.now() - start);
        checkSuccess(res, "submitAttempt");

        sleep(1);
    });

    // ── 5. View result ─────────────────────────────────────────────────────
    group("5. Result", () => {
        const start = Date.now();
        const res = trpcGet("quiz.getResult", { attemptId });
        resultTime.add(Date.now() - start);
        const ok = checkSuccess(res, "getResult");

        if (ok) successfulFlows.add(1);
        sleep(2);
    });
}

// ---------------------------------------------------------------------------
// Summary report
// ---------------------------------------------------------------------------

export function handleSummary(data) {
    const summary = {
        timestamp: new Date().toISOString(),
        config: { vuCount: VU_COUNT, duration: DURATION, quizId: QUIZ_ID },
        thresholds: {},
        metrics: {},
    };

    for (const [name, metric] of Object.entries(data.metrics)) {
        summary.metrics[name] = {
            avg: metric.values?.avg,
            p95: metric.values?.["p(95)"],
            p99: metric.values?.["p(99)"],
            rate: metric.values?.rate,
            count: metric.values?.count,
        };
    }

    for (const [name, threshold] of Object.entries(data.thresholds || {})) {
        summary.thresholds[name] = { ok: !threshold.ok ? "FAILED" : "PASSED" };
    }

    return {
        "load-tests/results/latest.json": JSON.stringify(summary, null, 2),
        stdout: `\n✅ Load test complete — ${VU_COUNT} VUs for ${DURATION}\n`,
    };
}
