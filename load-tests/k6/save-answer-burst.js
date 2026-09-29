/**
 * k6 Load Test — saveAnswer Burst Test
 *
 * Stress test for the saveAnswer endpoint which receives the highest
 * volume of requests during a quiz (debounced auto-save for every answer change).
 *
 * Scenario: 100 concurrent users each saving 1 answer per 500ms
 *           = ~200 req/s sustained for 3 minutes
 *
 * Usage:
 *   k6 run k6/save-answer-burst.js
 *   k6 run -e VU_COUNT=200 -e ATTEMPT_ID=<uuid> k6/save-answer-burst.js
 */

import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend, Counter } from "k6/metrics";

const VU_COUNT  = parseInt(__ENV.VU_COUNT  || "100");
const BASE_URL  = __ENV.BASE_URL           || "http://localhost:8000";
// For a real test, pre-create attempts and provide their IDs
// This script uses a placeholder that will 404 without a real attempt
const ATTEMPT_ID    = __ENV.ATTEMPT_ID    || "00000000-0000-4000-a000-000000000002";
const QUESTION_ID   = __ENV.QUESTION_ID   || "00000000-0000-4000-a000-000000000003";
const OPTION_ID     = __ENV.OPTION_ID     || "00000000-0000-4000-a000-000000000004";

const errorRate  = new Rate("save_errors");
const saveTime   = new Trend("save_answer_duration");
const saveCount  = new Counter("save_answer_total");

export const options = {
    scenarios: {
        burst: {
            executor: "constant-vus",
            vus: VU_COUNT,
            duration: "3m",
        },
    },
    thresholds: {
        "save_errors":          ["rate<0.01"],   // < 1%
        "save_answer_duration": ["p(95)<300"],   // < 300ms
        "http_req_duration":    ["p(99)<500"],
    },
};

const HEADERS = { "Content-Type": "application/json" };

export default function () {
    const body = JSON.stringify({
        json: {
            attemptId:         ATTEMPT_ID,
            questionId:        QUESTION_ID,
            selectedOptionIds: [OPTION_ID],
            textAnswer:        null,
        },
    });

    const start = Date.now();
    const res = http.post(`${BASE_URL}/trpc/quiz.saveAnswer`, body, { headers: HEADERS });
    saveTime.add(Date.now() - start);
    saveCount.add(1);

    const ok = check(res, {
        "saveAnswer: status 200": (r) => r.status === 200,
        "saveAnswer: saved=true": (r) => {
            try { return r.json("result.data.saved") === true; } catch { return false; }
        },
    });

    errorRate.add(!ok);
    sleep(0.5); // 500ms between saves per VU
}
