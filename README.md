# Make Forms — Quiz Platform

> Build beautiful forms & quizzes with the spirit of Punjab. Collect responses with pride and warmth.

A full-stack, type-safe, monorepo **form + quiz management platform** built with **Next.js 16**, **tRPC**, **Drizzle ORM**, **PostgreSQL**, and **Turborepo**.

---

## 🚀 Features

### Forms
| Feature | Status |
|---------|--------|
| Creator authentication (JWT cookie) | ✅ |
| Create, edit, publish, delete forms | ✅ |
| Dynamic field builder (10+ types) | ✅ |
| Public & Unlisted visibility modes | ✅ |
| Public Explore page | ✅ |
| Form submission without login | ✅ |
| QR Code sharing | ✅ |
| Clone forms | ✅ |
| Response analytics + bar chart | ✅ |
| CSV export for responses | ✅ |
| Email notifications via Resend | ✅ (optional) |
| API documentation via Scalar | ✅ |
| Punjab-themed design system | ✅ |

### Quiz Platform
| Feature | Status |
|---------|--------|
| Create quizzes from the same dashboard | ✅ |
| 5 question types: MCQ, Multi-Select, True/False, Short Answer, Fill Blank | ✅ |
| Quiz settings: time limit, max attempts, passing score, shuffle | ✅ |
| Access code protection | ✅ |
| Server-side timer (tamper-proof) | ✅ |
| Debounced auto-save answers | ✅ |
| Idempotent submission (no duplicate grading) | ✅ |
| Negative marking support | ✅ |
| Server-side score calculation (client cannot tamper) | ✅ |
| Immediate or delayed result publication | ✅ |
| Question-by-question review with explanations | ✅ |
| Leaderboard (paginated, score+time ranked) | ✅ |
| Quiz analytics dashboard (attempts, avg score, pass rate) | ✅ |
| Question-level accuracy analytics | ✅ |
| CSV export of all attempts | ✅ |
| Question Bank (reusable question library) | ✅ |
| Random question selection from pool | ✅ |
| Difficulty-based question distribution (Easy/Medium/Hard) | ✅ |
| Guest (no-login) quiz taking | ✅ |

---

## 🏗️ Architecture

```
trpc-monorepo/
├── apps/
│   ├── api/          → Express + tRPC + OpenAPI (port 8000)
│   └── web/          → Next.js 16 frontend (port 3000)
├── packages/
│   ├── database/     → Drizzle ORM schema + migrations
│   ├── services/     → Business logic layer
│   │   ├── quiz/           → Quiz CRUD + settings
│   │   ├── quiz-question/  → Question CRUD
│   │   ├── quiz-attempt/   → Attempt lifecycle + scoring engine
│   │   ├── quiz-analytics/ → Analytics + leaderboard + CSV export
│   │   └── question-bank/  → Reusable question library
│   ├── trpc/         → Shared tRPC router + types
│   ├── logger/       → Structured logging
│   └── typescript-config/ → Shared TS config
├── load-tests/       → k6 + Artillery + Node.js load test scripts
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- pnpm 9+
- PostgreSQL 15+ (or Docker)

### 1. Clone and Install
```bash
git clone <repo-url>
cd trpc-monorepo
pnpm install
```

### 2. Configure Environment

Create `.env` in the **root** of the monorepo:
```env
# Required
DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5433/dev
JWT_SECRET=your-secret-here

# Optional — for Resend email notifications
RESEND_API_KEY=re_xxxxxxxx
FROM_EMAIL=your@domain.com
```

### 3. Start PostgreSQL (Docker)
```bash
docker-compose up -d
```

### 4. Migrate Database
```bash
pnpm db:migrate
```

### 5. Seed Demo Data
```bash
pnpm seed
```

### 6. Start Development
```bash
pnpm dev
```

| Service | URL |
|---------|-----|
| Web App | http://localhost:3000 |
| API Server | http://localhost:8000 |
| API Docs (Scalar) | http://localhost:8000/docs |

---

## 🎭 Demo Credentials

After running `pnpm seed`:

| Field | Value |
|-------|-------|
| Email | `demo@sawaalnama.com` |
| Password | `password123` |

Or use the **"Login as Demo User"** button on the login page.

---

## 📡 API Documentation

Full interactive API docs are available at:
- **Via Web App**: http://localhost:3000/docs
- **Direct (Scalar)**: http://localhost:8000/docs
- **OpenAPI JSON**: http://localhost:8000/openapi.json

### Key Form Endpoints

| Route | Method | Description |
|-------|--------|-------------|
| `/trpc/form/createForm` | POST | Create a new form |
| `/trpc/form/listForms` | GET | List creator's forms |
| `/trpc/form/getFormById` | GET | Get form + fields |
| `/trpc/form/toggleFormStatus` | POST | Publish/unpublish |
| `/trpc/form/submitForm` | POST | Submit response (public) |
| `/trpc/form/listPublicForms` | GET | Public explore listing |
| `/trpc/form/cloneForm` | POST | Clone a form |

### Key Quiz Endpoints

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/trpc/quiz.create` | POST | ✅ | Create a new quiz |
| `/trpc/quiz.update` | POST | ✅ | Update quiz metadata |
| `/trpc/quiz.delete` | DELETE | ✅ | Delete quiz (cascade) |
| `/trpc/quiz.getById` | GET | ✅ | Get quiz with questions+options |
| `/trpc/quiz.getPublic` | GET | ❌ | Get quiz for taking (no answers) |
| `/trpc/quiz.list` | GET | ✅ | List user's quizzes |
| `/trpc/quiz.publish` | POST | ✅ | Publish a quiz |
| `/trpc/quiz.unpublish` | POST | ✅ | Unpublish a quiz |
| `/trpc/quiz.updateSettings` | POST | ✅ | Update quiz settings |
| `/trpc/quiz.publishResults` | POST | ✅ | Publish/withhold results |
| `/trpc/quiz.createQuestion` | POST | ✅ | Add question to quiz |
| `/trpc/quiz.updateQuestion` | POST | ✅ | Edit question |
| `/trpc/quiz.deleteQuestion` | DELETE | ✅ | Delete question |
| `/trpc/quiz.duplicateQuestion` | POST | ✅ | Duplicate a question |
| `/trpc/quiz.reorderQuestions` | POST | ✅ | Drag-and-drop reorder |
| `/trpc/quiz.startAttempt` | POST | ❌ | Start a quiz (rate limited) |
| `/trpc/quiz.getAttempt` | GET | ❌ | Get attempt state |
| `/trpc/quiz.saveAnswer` | POST | ❌ | Save/update answer (rate limited) |
| `/trpc/quiz.submitAttempt` | POST | ❌ | Submit (idempotent, rate limited) |
| `/trpc/quiz.getResult` | GET | ❌ | Get scored result |
| `/trpc/quiz.getLeaderboard` | GET | ❌ | Paginated leaderboard |
| `/trpc/quiz.getAnalytics` | GET | ✅ | Quiz analytics dashboard |
| `/trpc/quiz.getQuestionAnalytics` | GET | ✅ | Per-question accuracy |
| `/trpc/quiz.exportCSV` | GET | ✅ | Export attempts as CSV |
| `/trpc/quiz.bank/create` | POST | ✅ | Add to question bank |
| `/trpc/quiz.bank/list` | GET | ✅ | List bank items |
| `/trpc/quiz.bank/addToQuiz` | POST | ✅ | Import bank item to quiz |

---

## 🗄️ Database Schema

### Core Tables
| Table | Purpose |
|-------|---------| 
| `users` | Authentication + profiles |
| `forms` | Form/Quiz metadata (type discriminator: `form`\|`quiz`) |
| `form_fields` | Dynamic field definitions for forms |
| `form_submissions` | Collected form responses (JSONB) |

### Quiz Tables
| Table | Purpose |
|-------|---------|
| `quiz_settings` | Per-quiz configuration (time limit, attempts, shuffling, etc.) |
| `quiz_questions` | Questions with type, marks, difficulty, tags |
| `quiz_options` | Answer options (MCQ/MULTIPLE_SELECT/TRUE_FALSE) |
| `quiz_attempts` | Participant attempt records with server timestamps |
| `quiz_answers` | Per-question answers within an attempt |
| `question_bank_items` | User's reusable question library |

**Visibility Modes (forms/quizzes):**
- `public` — Shown in public explore gallery. Anyone can submit/take.
- `unlisted` — Hidden from listings. Only accessible via direct link.

---

## 🎨 Design System

Uses a custom **Punjab Theme** with:
- **Saffron**: `oklch(0.62 0.19 48)` — primary actions and highlights
- **Green**: `oklch(0.5 0.14 145)` — success states and published status
- Phulkari-inspired decorative dot patterns
- Gurmukhi welcome text on login
- All quiz UI components use the same oklch color tokens

---

## 🔐 Security

- **Server-side timer**: `expiresAt` is set by the server at `startAttempt` — the frontend timer is display-only. The server validates deadline on `saveAnswer` and `submitAttempt`.
- **Server-side scoring**: Clients cannot send scores. All grading happens in `submitAttempt` service.
- **Rate limiting** (per IP, in-memory sliding window):
  - `startAttempt`: 5/min
  - `saveAnswer`: 60/min
  - `submitAttempt`: 5/min
- **Input validation**: All inputs validated via Zod schemas before any DB operation.
- **Authorization**: All owner-gated endpoints verify `form.createdBy === ctx.user.id`.
- **Access codes**: Validated server-side; not exposed in public quiz response.
- **Idempotent submission**: Prevents duplicate grading if a retry hits the endpoint.

> **Production note**: Rate limiters are in-memory (single-process). For multi-instance deployments, replace with Redis-backed implementation.

---

## 🧪 Testing

Run the test suite (no database required — pure unit tests):

```bash
# Run all tests
pnpm test

# Watch mode
pnpm --filter @repo/services test:watch

# With coverage report
pnpm test:coverage
```

### Test Coverage

| Suite | File | Tests |
|-------|------|-------|
| Scoring Engine | `scoring.test.ts` | MCQ/TF/Multi-Select/Short-Answer/Fill-Blank grading, edge cases |
| Attempt Lifecycle | `attempt-lifecycle.test.ts` | Attempt limits, timer/expiry, grace period, idempotency, pass/fail |
| Authorization & Security | `authorization.test.ts` | Owner checks, access codes, guest access, rate limiting, input sanitization |

---

## 📦 Load Testing

```bash
# Quick Node.js load test (no install required)
pnpm load-test

# k6 (install k6 first)
k6 run load-tests/k6/quiz-flow.js                          # 50 VUs E2E flow
k6 run -e VU_COUNT=250 load-tests/k6/quiz-flow.js          # 250 VUs
k6 run -e VU_COUNT=500 load-tests/k6/quiz-start-only.js    # 500 VU spike test
k6 run load-tests/k6/save-answer-burst.js                  # Save answer burst

# Artillery
artillery run load-tests/artillery/quiz-flow.yml
```

See [load-tests/README.md](load-tests/README.md) for detailed instructions and expected thresholds.

---

## 🔧 Available Commands

```bash
pnpm dev             # Start all services in development
pnpm build           # Build all packages
pnpm db:generate     # Generate Drizzle migration files
pnpm db:migrate      # Apply migrations to database
pnpm seed            # Seed demo data
pnpm lint            # Run ESLint
pnpm check-types     # Run TypeScript type checking
pnpm test            # Run unit tests (no DB required)
pnpm test:coverage   # Run tests with coverage report
pnpm load-test       # Run Node.js load test
```

---

## 📦 Field Types Supported (Forms)

`text`, `number`, `email`, `phone`, `textarea`, `select`, `radio`, `checkbox`, `YES_NO`, `file`, `image`, `rating`, `date`

## 📝 Question Types Supported (Quizzes)

| Type | Description |
|------|-------------|
| `MCQ` | Single correct option |
| `MULTIPLE_SELECT` | Multiple correct options (all must be selected) |
| `TRUE_FALSE` | True or False |
| `SHORT_ANSWER` | Open text, graded against accepted answers |
| `FILL_BLANK` | Fill-in-the-blank, same grading as short answer |

---

## 🌍 Visibility Checks

| Form/Quiz State | Public Listing | Direct Link | Submit/Take |
|----------------|----------------|-------------|-------------|
| Draft (isActive=false) | ❌ | ❌ | ❌ |
| Published + Unlisted | ❌ | ✅ | ✅ |
| Published + Public | ✅ | ✅ | ✅ |

---

## 🏋️ Production Scaling Notes

| Component | Dev Setting | Production Recommendation |
|-----------|-------------|--------------------------|
| DB connection pool | `max: 10` | `20-30` connections |
| Rate limiter | In-memory (single process) | Redis-backed sliding window |
| Session storage | JWT cookie | Same (stateless) |
| File uploads | Not implemented | S3 + presigned URLs |

---

Built with ❤️ in the spirit of Punjab.
