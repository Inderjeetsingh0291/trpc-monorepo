# Load Testing — Make Forms Quiz Platform

This directory contains load test scripts using [k6](https://k6.io/) and a lightweight Node.js Artillery alternative.

## Prerequisites

### Option A: k6 (Recommended)
```bash
# Windows (winget)
winget install k6 --source winget

# macOS
brew install k6

# Docker
docker pull grafana/k6
```

### Option B: Artillery
```bash
npm install -g artillery
```

## Quick Start

```bash
# Run with k6
k6 run k6/quiz-flow.js

# Run with Artillery
artillery run artillery/quiz-flow.yml

# Run with k6 at different load levels
k6 run -e VU_COUNT=100  k6/quiz-flow.js   # 100 concurrent users
k6 run -e VU_COUNT=250  k6/quiz-flow.js   # 250 concurrent users
k6 run -e VU_COUNT=500  k6/quiz-flow.js   # 500 concurrent users
```

## Test Scenarios

| Script | Description |
|--------|-------------|
| `k6/quiz-flow.js` | Full E2E flow: load → start → save answers → submit → result |
| `k6/quiz-start-only.js` | Spike test for startAttempt endpoint |
| `k6/save-answer-burst.js` | High-frequency saveAnswer stress test |
| `artillery/quiz-flow.yml` | Same E2E flow using Artillery YAML format |

## Expected Thresholds

| Metric | Target |
|--------|--------|
| p95 response time | < 500ms |
| p99 response time | < 1s |
| Error rate | < 1% |
| Throughput | > 100 req/s |

## Running with Docker (no k6 install)

```bash
docker run --rm -i grafana/k6 run - <k6/quiz-flow.js
```
