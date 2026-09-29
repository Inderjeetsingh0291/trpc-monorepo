/**
 * k6 Load Test — startAttempt Spike Test
 *
 * Spike test specifically for the startAttempt endpoint.
 * Simulates a sudden rush of students hitting "Start Quiz" simultaneously
 * (e.g., a professor releases the quiz for 500 students).
 *
 * Usage:
 *   k6 run k6/quiz-start-only.js
 *   k6 run -e VU_COUNT=500 -e QUIZ_ID=<uuid> k6/quiz-start-only.js
 */

import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend } from "k6/metrics";

const VU_COUNT = parseInt(__ENV.VU_COUNT || "100");
const BASE_URL = __ENV.BASE_URL || "http://localhost:8000";
const QUIZ_ID  = __ENV.QUIZ_ID  || "00000000-0000-4000-a000-000000000001";

const errorRate = new Rate("start_errors");
const startTime = new Trend("start_attempt_duration");

export const options = {
    scenarios: {
        spike: {
            executor: "ramping-vus",
            startVUs: 0,
            stages: [
                { duration: "10s", target: VU_COUNT },  // instant spike
                { duration: "30s", target: VU_COUNT },  // hold
                { duration: "10s", target: 0 },         // drop
            ],
        },
    },
    thresholds: {
        "start_errors":           ["rate<0.02"],       // < 2% errors under spike
        "start_attempt_duration": ["p(95)<1000"],      // < 1s p95 even at peak
        "http_req_duration":      ["p(95)<1000"],
    },
};

const HEADERS = { "Content-Type": "application/json" };

export default function () {
    const body = JSON.stringify({
        json: {
            formId: QUIZ_ID,
            participantName: `Student-${__VU}`,
            participantEmail: `student${__VU}@test.example`,
        },
    });

    const start = Date.now();
    const res = http.post(`${BASE_URL}/trpc/quiz.startAttempt`, body, { headers: HEADERS });
    startTime.add(Date.now() - start);

    const ok = check(res, {
        "startAttempt: status 200":    (r) => r.status === 200,
        "startAttempt: has attemptId": (r) => {
            try { return !!r.json("result.data.attemptId"); } catch { return false; }
        },
    });

    errorRate.add(!ok);
    sleep(0.5);
}
