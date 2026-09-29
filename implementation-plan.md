# Make Forms → Quiz Platform: Implementation Plan

> **Phase 1 Complete** — Full codebase inspection done. This document contains the architecture analysis and step-by-step implementation plan.

---

## 📋 Current Architecture Summary

### Database Layer (`packages/database`)
| Table | File | Key Columns |
|---|---|---|
| `users` | [user.ts](file:///d:/Cohort26/trpc-monorepo/packages/database/models/user.ts) | id, fullName, email, password, salt, emailVerified |
| `forms` | [form.ts](file:///d:/Cohort26/trpc-monorepo/packages/database/models/form.ts) | id, title, description, isActive, visibility(`public`/`unlisted`), expiresAt, maxResponses, password, isArchived, layout, createdBy |
| `form_fields` | [form-field.ts](file:///d:/Cohort26/trpc-monorepo/packages/database/models/form-field.ts) | id, label, labelKey, placeholder, type(14 types), isRequired, index, formId |
| `form_submissions` | [form-submition.ts](file:///d:/Cohort26/trpc-monorepo/packages/database/models/form-submition.ts) | id, formId, values(JSONB), createdBy |

- **Connection pool**: Already configured (`max: 10`, idle timeout 30s) in [index.ts](file:///d:/Cohort26/trpc-monorepo/packages/database/index.ts)
- **ORM**: Drizzle with `node-postgres` driver
- **15 existing migrations** in `drizzle/` folder
- **Drizzle config** points to `./schema.ts` which re-exports all models

### Service Layer (`packages/services`)
| Service | File | Methods |
|---|---|---|
| `FormService` | [form/index.ts](file:///d:/Cohort26/trpc-monorepo/packages/services/form/index.ts) | createForm, listFormsByUserId, listArchivedForms, archiveForm, restoreForm, getFormById, toggleFormStatus, updateFormSettings, listPublicForms, deleteForm, cloneForm, getDashboardStats |
| `FormFieldService` | [form-field/index.ts](file:///d:/Cohort26/trpc-monorepo/packages/services/form-field/index.ts) | createField, updateField, deleteField, getFieldById, reorderFields, getFieldsByFormId |
| `FormSubmissionService` | [form-submission/index.ts](file:///d:/Cohort26/trpc-monorepo/packages/services/form-submission/index.ts) | submitForm (with Resend email), listSubmissionsByFormId |
| `UserService` | [user/index.ts](file:///d:/Cohort26/trpc-monorepo/packages/services/user/index.ts) | Auth, JWT, password management |
| `EmailService` | [email/index.ts](file:///d:/Cohort26/trpc-monorepo/packages/services/email/index.ts) | Verification & reset emails |

### tRPC Layer (`packages/trpc`)
- **Router**: [server/index.ts](file:///d:/Cohort26/trpc-monorepo/packages/trpc/server/index.ts) → `auth` + `form` routers
- **Procedures**: `publicProcedure` + `authenticationPocedure` (with JWT middleware)
- **OpenAPI**: `trpc-to-openapi` meta for Scalar docs
- **Context**: Express req/res cookie helpers + IP extraction
- **Rate limiter**: In-memory sliding window in [rate-limit.ts](file:///d:/Cohort26/trpc-monorepo/packages/trpc/server/utils/rate-limit.ts)
- **Zod models**: Separate `model.ts` per route folder

### API App (`apps/api`)
- Express server with cookie-parser, CORS, tRPC adapter, OpenAPI middleware
- Scalar API docs at `/docs`, OpenAPI JSON at `/openapi.json`
- REST at `/api`, tRPC at `/trpc`

### Web App (`apps/web`)
- **Next.js** with TailwindCSS (v4 syntax `@import "tailwindcss"`)
- **Punjab-themed design** using oklch colors (saffron: `oklch(0.62 0.19 48)`, green: `oklch(0.5 0.14 145)`)
- **tRPC client**: React Query integration via `@trpc/react-query`
- **Key routes**: `/dashboard`, `/dashboard/forms`, `/dashboard/forms/[id]`, `/form/[form_id]`, auth routes
- **Components**: shadcn/ui components in `components/ui/`, builder components in `components/builder/`
- **Sidebar nav**: Dashboard, My Forms, Public Forms, Submissions, Pricing, API Docs

---

## 🏗️ Implementation Steps (15 Phases, ~50 Steps)

---

### Phase 2: Database Schema Changes
> Add quiz tables & form type column. Create Drizzle migrations.

#### Step 2.1 — Add `formTypeEnum` and `type` column to forms table
- **File**: [packages/database/models/form.ts](file:///d:/Cohort26/trpc-monorepo/packages/database/models/form.ts)
- Add `pgEnum("form_type", ["form", "quiz"])`
- Add `type` column with default `"form"` (backward compatible)
- Existing records auto-get `"form"` type

#### Step 2.2 — Create `quiz_settings` table
- **New file**: `packages/database/models/quiz-settings.ts`
- Columns: id, formId (FK→forms), timeLimitMinutes, maxAttempts, passingScore, showResultImmediately, showCorrectAnswers, shuffleQuestions, shuffleOptions, enableLeaderboard, accessCode, allowGuests
- One-to-one with forms (where type='quiz')

#### Step 2.3 — Create `quiz_questions` table
- **New file**: `packages/database/models/quiz-question.ts`
- Columns: id, formId (FK→forms CASCADE), question, questionType (enum: MCQ, MULTIPLE_SELECT, TRUE_FALSE, SHORT_ANSWER, FILL_BLANK), marks, negativeMarks, explanation, order, difficulty (enum: EASY, MEDIUM, HARD), category, tags (text[]), createdAt, updatedAt
- Index on formId

#### Step 2.4 — Create `quiz_options` table
- **New file**: `packages/database/models/quiz-option.ts`
- Columns: id, questionId (FK→quiz_questions CASCADE), optionText, isCorrect, order, createdAt, updatedAt
- Index on questionId

#### Step 2.5 — Create `quiz_attempts` table
- **New file**: `packages/database/models/quiz-attempt.ts`
- Columns: id, formId (FK→forms), userId (FK→users, nullable), participantName, participantEmail, startedAt, submittedAt, expiresAt, score, totalMarks, percentage, status (enum: IN_PROGRESS, SUBMITTED, EXPIRED), timeTaken, selectedQuestionIds (jsonb — for random selection stability), createdAt, updatedAt
- Indexes on formId, userId, status

#### Step 2.6 — Create `quiz_answers` table
- **New file**: `packages/database/models/quiz-answer.ts`
- Columns: id, attemptId (FK→quiz_attempts CASCADE), questionId (FK→quiz_questions), selectedOptionIds (jsonb — supports multi-select), answerText, isCorrect, marksAwarded, createdAt, updatedAt
- Indexes on attemptId, questionId

#### Step 2.7 — Create `question_bank_items` table
- **New file**: `packages/database/models/question-bank.ts`
- Columns: id, ownerId (FK→users CASCADE), question, questionType, marks, negativeMarks, explanation, difficulty, category, tags (text[]), options (jsonb — embedded for bank), createdAt, updatedAt
- Index on ownerId

#### Step 2.8 — Update schema.ts & generate migration
- Update [schema.ts](file:///d:/Cohort26/trpc-monorepo/packages/database/schema.ts) to export all new models
- Run `pnpm db:generate` to create migration file
- Run `pnpm db:migrate` to apply
- Verify existing form records are intact

---

### Phase 3: Backend — Quiz CRUD & Question CRUD
> Build services and tRPC routes for quiz management.

#### Step 3.1 — Quiz Service (`packages/services/quiz/`)
- **New files**: `packages/services/quiz/index.ts`, `packages/services/quiz/model.ts`
- Methods: createQuiz, updateQuiz, deleteQuiz, getQuizById, publishQuiz, unpublishQuiz, listQuizzesByUserId, getQuizSettings, updateQuizSettings
- createQuiz: insert into forms (type='quiz') + quiz_settings
- getQuizById: join forms + quiz_settings + quiz_questions + quiz_options

#### Step 3.2 — Quiz Question Service (`packages/services/quiz-question/`)
- **New files**: `packages/services/quiz-question/index.ts`, `model.ts`
- Methods: createQuestion, updateQuestion, deleteQuestion, duplicateQuestion, reorderQuestions, getQuestionsByQuizId, bulkCreateQuestions
- Handle question options (create/update/delete quiz_options alongside)

#### Step 3.3 — Quiz Attempt Service (`packages/services/quiz-attempt/`)
- **New files**: `packages/services/quiz-attempt/index.ts`, `model.ts`
- Methods: startAttempt, saveAnswer, submitAttempt, getAttempt, getResult, expireAttempt
- startAttempt: validate quiz, check limits, create attempt with server timestamps, handle random question selection
- submitAttempt: transaction — validate deadline, grade answers, calculate score, update attempt
- Idempotent: if attempt already SUBMITTED, return existing result

#### Step 3.4 — Quiz Analytics Service (`packages/services/quiz-analytics/`)
- **New files**: `packages/services/quiz-analytics/index.ts`, `model.ts`
- Methods: getQuizAnalytics, getQuestionAnalytics, getLeaderboard, exportCSV

#### Step 3.5 — Question Bank Service (`packages/services/question-bank/`)
- **New files**: `packages/services/question-bank/index.ts`, `model.ts`
- Methods: createBankItem, updateBankItem, deleteBankItem, listBankItems (with pagination, filters), addBankItemToQuiz, removeBankItemFromQuiz

#### Step 3.6 — Export all new services from `packages/services/index.ts`

#### Step 3.7 — Quiz tRPC Router (`packages/trpc/server/routes/quiz/`)
- **New files**: `route.ts`, `model.ts`
- Zod models for all quiz inputs/outputs
- Routes:
  - `quiz.create` (auth)
  - `quiz.update` (auth)
  - `quiz.delete` (auth)
  - `quiz.getById` (public, for quiz takers)
  - `quiz.publish` / `quiz.unpublish` (auth)
  - `quiz.updateSettings` (auth)
  - `quiz.createQuestion` / `quiz.updateQuestion` / `quiz.deleteQuestion` / `quiz.duplicateQuestion` / `quiz.reorderQuestions` (auth)
  - `quiz.startAttempt` (public, rate-limited)
  - `quiz.getAttempt` (public)
  - `quiz.saveAnswer` (public, rate-limited)
  - `quiz.submitAttempt` (public, rate-limited, idempotent)
  - `quiz.getResult` (public)
  - `quiz.getLeaderboard` (public)
  - `quiz.getAnalytics` (auth)
  - `quiz.getQuestionAnalytics` (auth)
  - `quiz.exportCSV` (auth)

#### Step 3.8 — Register quiz router in server router
- Update [server/index.ts](file:///d:/Cohort26/trpc-monorepo/packages/trpc/server/index.ts) to add `quiz: quizRouter`

#### Step 3.9 — Question Bank tRPC Router
- Routes: `quiz.getQuestionBank`, `quiz.createBankItem`, `quiz.updateBankItem`, `quiz.deleteBankItem`, `quiz.addBankItemToQuiz`

#### Step 3.10 — Update Dashboard Stats
- Modify `FormService.getDashboardStats` to include quiz counts and attempt totals

---

### Phase 4: Quiz Builder UI
> Create the quiz creation/editing interface.

#### Step 4.1 — Create Quiz Dialog
- **File**: `apps/web/app/dashboard/forms/_components/create-form-dialog.tsx` (modify existing)
- Add type selector: Form / Quiz
- When Quiz selected → create with type='quiz', redirect to quiz builder

#### Step 4.2 — Quiz Builder Page
- **New route**: `apps/web/app/dashboard/forms/[id]/quiz-builder/page.tsx`
- Main layout with quiz settings panel + question list

#### Step 4.3 — Quiz Settings Panel Component
- **New file**: `apps/web/components/quiz-builder/quiz-settings-panel.tsx`
- Time limit, max attempts, passing score, show results, shuffle, leaderboard, access code

#### Step 4.4 — Question Editor Component
- **New file**: `apps/web/components/quiz-builder/question-editor.tsx`
- Question text, type selector, marks, negative marks, explanation
- Option list with correct answer marking
- Duplicate/delete buttons

#### Step 4.5 — Option Editor Component
- **New file**: `apps/web/components/quiz-builder/option-editor.tsx`
- Option text input, correct toggle, delete button, reorder handle

#### Step 4.6 — Question List Component (with drag-and-drop)
- **New file**: `apps/web/components/quiz-builder/question-list.tsx`
- Sortable list using `@dnd-kit` (already likely available or install)
- Add question button, question type quick-selector

#### Step 4.7 — Quiz Builder Header
- **New file**: `apps/web/components/quiz-builder/quiz-header.tsx`
- Title, save/publish actions, back navigation

#### Step 4.8 — Quiz Builder API Hooks
- **New file**: `apps/web/hooks/api/quiz.ts`
- Hooks for all quiz tRPC procedures using react-query

---

### Phase 5: Quiz Taking UI
> Create the quiz participation experience.

#### Step 5.1 — Quiz Landing Page
- **New route**: `apps/web/app/quiz/[slug]/page.tsx`
- Show quiz title, description, time limit, question count
- Access code input (if configured)
- Start Quiz button

#### Step 5.2 — Quiz Taking Page
- **New route**: `apps/web/app/quiz/[slug]/attempt/[attemptId]/page.tsx`
- Question display with answer selection
- Timer display (synced with server expiry)
- Navigation panel (question grid)
- Previous/Next buttons
- Submit button

#### Step 5.3 — Quiz Timer Component
- **New file**: `apps/web/components/quiz/quiz-timer.tsx`
- Countdown from server `expiresAt`
- Visual warning at < 5 minutes
- Auto-submit on expiry

#### Step 5.4 — Question Display Components
- **New files**: `apps/web/components/quiz/question-mcq.tsx`, `question-multi-select.tsx`, `question-true-false.tsx`, `question-short-answer.tsx`, `question-fill-blank.tsx`
- Each renders appropriate answer UI

#### Step 5.5 — Question Navigator Component
- **New file**: `apps/web/components/quiz/question-navigator.tsx`
- Grid of numbered buttons with status colors (unanswered/answered/current)

---

### Phase 6: Attempts — Start, Timer, Save, Submit

#### Step 6.1 — Start Attempt Flow
- Frontend calls `quiz.startAttempt` → receives attemptId, startedAt, expiresAt, questions
- Redirects to attempt page
- Stores attempt state in React context

#### Step 6.2 — Answer Saving with Debounce
- Use debounced mutation (300ms) for `quiz.saveAnswer`
- Maintain local state for immediate UI feedback
- Queue unsaved answers, retry on failure
- Show save indicator (saving/saved/error)

#### Step 6.3 — Submit Attempt Flow
- Confirmation dialog before submit
- Call `quiz.submitAttempt`
- Handle idempotent responses
- Redirect to result page

#### Step 6.4 — Auto-expire Handling
- Timer component checks expiry
- On expiry → auto-call submit
- Backend validates server time regardless

---

### Phase 7: Scoring and Results

#### Step 7.1 — Scoring Engine (in quiz-attempt service)
- Already planned in Step 3.3's `submitAttempt`
- MCQ/TRUE_FALSE: exact match
- MULTIPLE_SELECT: all correct + no wrong
- SHORT_ANSWER/FILL_BLANK: case-insensitive trimmed match with accepted answers
- Apply marks / negative marks / zero for skipped

#### Step 7.2 — Result Page
- **New route**: `apps/web/app/quiz/[slug]/result/[attemptId]/page.tsx`
- Score, percentage, correct/wrong/skipped counts, time taken, pass/fail
- Conditional: show correct answers based on quiz settings
- Question-by-question review (if enabled)

---

### Phase 8: Analytics

#### Step 8.1 — Quiz Analytics Dashboard
- **New route**: `apps/web/app/dashboard/forms/[id]/quiz-analytics/page.tsx`
- Cards: total attempts, avg score, highest/lowest, pass rate, avg time
- Charts: score distribution, attempts over time, pass/fail pie

#### Step 8.2 — Question-Level Analytics
- Accuracy per question bar chart
- Most missed questions list

#### Step 8.3 — CSV Export for Quiz
- Add export button to analytics page
- Streams CSV with: participant, score, percentage, correct, wrong, skipped, time, submitted_at

---

### Phase 9: Leaderboard

#### Step 9.1 — Leaderboard API
- `quiz.getLeaderboard`: paginated, sorted by score DESC, timeTaken ASC
- Only returns when leaderboard enabled in quiz settings

#### Step 9.2 — Leaderboard UI
- **New component**: `apps/web/components/quiz/leaderboard.tsx`
- Accessible from result page and quiz landing
- Rank, participant name, score, percentage, time

---

### Phase 10: Question Bank

#### Step 10.1 — Question Bank Page
- **New route**: `apps/web/app/dashboard/question-bank/page.tsx`
- List all bank items with filters (category, difficulty, type, tags)
- CRUD operations

#### Step 10.2 — Import from Bank to Quiz
- In quiz builder: "Add from Bank" button
- Modal to search/filter bank items
- Selected items get copied into quiz_questions

#### Step 10.3 — Sidebar Navigation Update
- Add "Question Bank" to [app-sidebar.tsx](file:///d:/Cohort26/trpc-monorepo/apps/web/components/app-sidebar.tsx)

---

### Phase 11: Random Questions & Difficulty

#### Step 11.1 — Random Selection Config
- In quiz settings: totalBankQuestions (pool), questionsToShow
- On startAttempt: randomly select N questions, store selection in attempt.selectedQuestionIds

#### Step 11.2 — Difficulty Filtering
- In quiz settings: filter by difficulty distribution
- E.g., 5 EASY + 10 MEDIUM + 5 HARD

---

### Phase 12: Performance & Security

#### Step 12.1 — Database Indexes
- Add indexes listed in spec to migration
- forms: owner_id, slug (if added), status
- All FK columns on quiz tables

#### Step 12.2 — Rate Limiting Enhancement
- Add rate limits to: startAttempt (5/min/IP), saveAnswer (60/min/IP), submitAttempt (5/min/IP)
- Existing rate limiter in [rate-limit.ts](file:///d:/Cohort26/trpc-monorepo/packages/trpc/server/utils/rate-limit.ts) works

#### Step 12.3 — Connection Pool Tuning
- Current pool max=10 is reasonable for development
- Add config note for production scaling (20-30 connections)

#### Step 12.4 — Pagination
- Add cursor/offset pagination to: listAttempts, leaderboard, questionBank, submissions

#### Step 12.5 — Security Hardening
- Server-side score calculation (never trust client)
- Server-side timer validation
- Access code validation on backend
- Authorization checks: only quiz owner can view analytics
- Input sanitization via Zod (already in place)

---

### Phase 13: Testing

#### Step 13.1 — Setup test infrastructure
- Add vitest to packages/services
- Create test helpers for DB mocking

#### Step 13.2 — Scoring tests
- Correct answer → +marks
- Wrong answer → -negativeMarks
- Skipped → 0
- Multiple correct (MULTIPLE_SELECT)
- Edge cases: all wrong, all correct, all skipped

#### Step 13.3 — Attempt lifecycle tests
- Start → save answers → submit → verify result
- Attempt limit enforcement
- Expired attempt handling
- Duplicate submission (idempotent)

#### Step 13.4 — Authorization tests
- Unauthorized quiz access
- Invalid access code
- Non-owner analytics access

---

### Phase 14: Load Testing

#### Step 14.1 — Create k6 or Artillery load test scripts
- **New folder**: `load-tests/`
- Scripts for: quiz loading, start attempt, save answers, submit, view results
- Configs for 100/250/500 concurrent users

#### Step 14.2 — Documentation
- How to run load tests
- Expected metrics and thresholds

---

### Phase 15: Documentation

#### Step 15.1 — Update README
- Add quiz features documentation
- Environment variables documentation
- Setup instructions

#### Step 15.2 — API Documentation
- All new quiz routes automatically appear in Scalar docs (via OpenAPI meta)
- Verify `/docs` shows quiz endpoints

#### Step 15.3 — Development Report
- Final deliverable summary

---

## 📊 Files to Create/Modify Summary

### New Files (~30+)
```
packages/database/models/
  ├── quiz-settings.ts
  ├── quiz-question.ts
  ├── quiz-option.ts
  ├── quiz-attempt.ts
  ├── quiz-answer.ts
  └── question-bank.ts

packages/services/
  ├── quiz/index.ts, model.ts
  ├── quiz-question/index.ts, model.ts
  ├── quiz-attempt/index.ts, model.ts
  ├── quiz-analytics/index.ts, model.ts
  └── question-bank/index.ts, model.ts

packages/trpc/server/routes/quiz/
  ├── route.ts
  └── model.ts

apps/web/components/quiz-builder/
  ├── quiz-settings-panel.tsx
  ├── question-editor.tsx
  ├── option-editor.tsx
  ├── question-list.tsx
  └── quiz-header.tsx

apps/web/components/quiz/
  ├── quiz-timer.tsx
  ├── question-mcq.tsx
  ├── question-multi-select.tsx
  ├── question-true-false.tsx
  ├── question-short-answer.tsx
  ├── question-fill-blank.tsx
  ├── question-navigator.tsx
  └── leaderboard.tsx

apps/web/app/quiz/[slug]/page.tsx
apps/web/app/quiz/[slug]/attempt/[attemptId]/page.tsx
apps/web/app/quiz/[slug]/result/[attemptId]/page.tsx
apps/web/app/dashboard/forms/[id]/quiz-builder/page.tsx
apps/web/app/dashboard/forms/[id]/quiz-analytics/page.tsx
apps/web/app/dashboard/question-bank/page.tsx
apps/web/hooks/api/quiz.ts

load-tests/...
```

### Modified Files (~10)
```
packages/database/models/form.ts          → add type column
packages/database/schema.ts               → export new models
packages/services/index.ts                → export new services
packages/trpc/server/index.ts             → add quiz router
apps/web/components/app-sidebar.tsx        → add quiz nav items
apps/web/app/dashboard/page.tsx            → add quiz stats cards
apps/web/app/dashboard/forms/page.tsx      → quiz templates
apps/web/app/dashboard/forms/_components/create-form-dialog.tsx → type selector
packages/services/form/index.ts            → getDashboardStats with quiz counts
```

---

## ⚠️ Key Design Decisions

1. **Quiz uses same `forms` table** with a `type` discriminator — avoids data duplication while keeping forms/quizzes under unified ownership
2. **Separate quiz_questions table** (not JSONB) — enables per-question analytics, proper foreign keys, and efficient queries
3. **Server-side timer** via `started_at`/`expires_at` timestamps — frontend timer is display-only
4. **Incremental answer saving** — debounced per-answer API calls, not full quiz re-submission
5. **Idempotent submission** — attempt status check prevents duplicate grading
6. **Question Bank as separate table** — questions copied (not linked) to quizzes for stability
7. **Random selection stored in attempt** — `selectedQuestionIds` persisted so refresh doesn't change questions
8. **Punjab theme preserved** — all new UI uses existing oklch color tokens

---

> [!IMPORTANT]
> Ready to begin **Step 2.1** — adding the form type column and quiz database tables. Shall I proceed?
