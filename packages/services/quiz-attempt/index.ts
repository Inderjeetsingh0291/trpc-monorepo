import { db, eq, and, count, asc, desc } from "@repo/database"
import { formsTable } from "@repo/database/models/form"
import { quizSettingsTable } from "@repo/database/models/quiz-settings"
import { quizQuestionsTable } from "@repo/database/models/quiz-question"
import { quizOptionsTable } from "@repo/database/models/quiz-option"
import { quizAttemptsTable } from "@repo/database/models/quiz-attempt"
import { quizAnswersTable } from "@repo/database/models/quiz-answer"
import {
    type StartAttemptInputType, startAttemptInput,
    type SaveAnswerInputType, saveAnswerInput,
    type SubmitAttemptInputType, submitAttemptInput,
    type GetAttemptInputType, getAttemptInput,
    type GetResultInputType, getResultInput,
    type GetPreviousAttemptsInputType, getPreviousAttemptsInput,
} from "./model"

class QuizAttemptService {

    /**
     * Start a new quiz attempt.
     * - Validates quiz is active
     * - Validates access code if required
     * - Checks attempt limits
     * - Creates attempt with server timestamps
     * - Handles random question selection if configured
     */
    public async startAttempt(payload: StartAttemptInputType) {
        const data = await startAttemptInput.parseAsync(payload)

        // 1. Get quiz form
        const [form] = await db.select({
            id: formsTable.id,
            isActive: formsTable.isActive,
            type: formsTable.type,
        })
        .from(formsTable)
        .where(eq(formsTable.id, data.formId))

        if (!form) throw new Error("Quiz not found.")
        if (form.type !== "quiz") throw new Error("This is not a quiz.")
        if (!form.isActive) throw new Error("This quiz is not currently accepting responses.")

        // 2. Get quiz settings
        const [settings] = await db.select()
            .from(quizSettingsTable)
            .where(eq(quizSettingsTable.formId, data.formId))

        if (!settings) throw new Error("Quiz settings not found.")

        // 3. Validate access code
        if (settings.accessCode && settings.accessCode !== data.accessCode) {
            throw new Error("Invalid access code.")
        }

        // 4. Check guest access
        if (!settings.allowGuests && !data.userId) {
            throw new Error("This quiz requires you to be logged in.")
        }

        // 5. Check attempt limits
        if (settings.maxAttempts > 0) {
            const identifier = data.userId
                ? eq(quizAttemptsTable.userId, data.userId)
                : data.participantEmail
                ? eq(quizAttemptsTable.participantEmail, data.participantEmail.toLowerCase().trim())

                    : null

            if (identifier) {
                const [attemptCount] = await db.select({ count: count() })
                    .from(quizAttemptsTable)
                    .where(and(
                        eq(quizAttemptsTable.formId, data.formId),
                        identifier
                    ))

                if (attemptCount && attemptCount.count >= settings.maxAttempts) {
                    throw new Error(`Maximum attempts (${settings.maxAttempts}) reached.`)
                }
            }
        }

        // 6. Get all questions with difficulty
        const allQuestions = await db.select({
            id: quizQuestionsTable.id,
            difficulty: quizQuestionsTable.difficulty,
        })
            .from(quizQuestionsTable)
            .where(eq(quizQuestionsTable.formId, data.formId))
            .orderBy(asc(quizQuestionsTable.order))

        if (allQuestions.length === 0) {
            throw new Error("This quiz has no questions.")
        }

        // 7. Handle difficulty distribution and random question selection
        let selectedIds: string[] = []
        const difficultyDist = (settings as any).difficultyDistribution as Record<string, number> | null

        if (difficultyDist && Object.keys(difficultyDist).length > 0) {
            // Group by difficulty
            const byDifficulty: Record<string, string[]> = { EASY: [], MEDIUM: [], HARD: [] }
            for (const q of allQuestions) {
                const diffKey = q.difficulty.toUpperCase()
                if (!byDifficulty[diffKey]) byDifficulty[diffKey] = []
                byDifficulty[diffKey]!.push(q.id)
            }

            // For each requested difficulty, shuffle and pick N
            for (const [diff, countNeeded] of Object.entries(difficultyDist)) {
                if (typeof countNeeded === "number" && countNeeded > 0) {
                    const pool = byDifficulty[diff.toUpperCase()] ?? []
                    const shuffledPool = [...pool]
                    for (let i = shuffledPool.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [shuffledPool[i], shuffledPool[j]] = [shuffledPool[j]!, shuffledPool[i]!]
                    }
                    selectedIds.push(...shuffledPool.slice(0, countNeeded))
                }
            }
        } else if (settings.questionsToShow && settings.questionsToShow < allQuestions.length) {
            // Fisher-Yates shuffle and take first N
            const allIds = allQuestions.map(q => q.id)
            const shuffled = [...allIds]
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!]
            }
            selectedIds = shuffled.slice(0, settings.questionsToShow)
        } else {
            selectedIds = allQuestions.map(q => q.id)
        }

        // Safety fallback: if distribution resulted in empty list, use all questions
        if (selectedIds.length === 0) {
            selectedIds = allQuestions.map(q => q.id)
        }

        // Shuffle questions if configured or if difficulty distribution was applied
        if (settings.shuffleQuestions || (difficultyDist && Object.keys(difficultyDist).length > 0)) {
            const shuffled = [...selectedIds]
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!]
            }
            selectedIds = shuffled
        }

        // 8. Calculate expiry
        const now = new Date()
        const expiresAt = settings.timeLimitMinutes
            ? new Date(now.getTime() + settings.timeLimitMinutes * 60 * 1000)
            : null

        // 9. Calculate total marks for selected questions
        const selectedQuestions = await Promise.all(selectedIds.map(async (id) => {
            const [q] = await db.select({
                id: quizQuestionsTable.id,
                question: quizQuestionsTable.question,
                questionType: quizQuestionsTable.questionType,
                marks: quizQuestionsTable.marks,
                order: quizQuestionsTable.order,
            })
            .from(quizQuestionsTable)
            .where(eq(quizQuestionsTable.id, id))

            return q
        }))

        const totalMarks = selectedQuestions.reduce((sum, q) => sum + (q?.marks ?? 0), 0)

        // 10. Create the attempt
        const [attempt] = await db.insert(quizAttemptsTable).values({
            formId: data.formId,
            userId: data.userId ?? null,
            participantName: data.participantName,
            participantEmail: data.participantEmail ? data.participantEmail.toLowerCase().trim() : null,

            startedAt: now,
            expiresAt,
            totalMarks,
            status: "IN_PROGRESS",
            selectedQuestionIds: selectedIds,
        }).returning({
            id: quizAttemptsTable.id,
            startedAt: quizAttemptsTable.startedAt,
            expiresAt: quizAttemptsTable.expiresAt,
        })

        if (!attempt) throw new Error("Failed to create attempt.")

        // 11. Get questions with options for the response (sanitized — no correct answers)
        const questionsForAttempt = await Promise.all(selectedIds.map(async (qId) => {
            const [q] = await db.select({
                id: quizQuestionsTable.id,
                question: quizQuestionsTable.question,
                questionType: quizQuestionsTable.questionType,
                marks: quizQuestionsTable.marks,
            })
            .from(quizQuestionsTable)
            .where(eq(quizQuestionsTable.id, qId))

            if (!q) throw new Error(`Question ${qId} not found`)

            let options = await db.select({
                id: quizOptionsTable.id,
                optionText: quizOptionsTable.optionText,
                order: quizOptionsTable.order,
            })
            .from(quizOptionsTable)
            .where(eq(quizOptionsTable.questionId, qId))
            .orderBy(asc(quizOptionsTable.order))

            // Shuffle options if configured
            if (settings.shuffleOptions) {
                const shuffled = [...options]
                for (let i = shuffled.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!]
                }
                options = shuffled
            }

            return {
                id: q.id,
                question: q.question,
                questionType: q.questionType,
                marks: q.marks,
                options,
            }
        }))

        return {
            attemptId: attempt.id,
            startedAt: attempt.startedAt,
            expiresAt: attempt.expiresAt,
            totalMarks,
            questions: questionsForAttempt,
        }
    }

    /**
     * Save/update an answer for a question within an active attempt.
     * Upserts: if answer exists for this attempt+question, update it; else insert.
     */
    public async saveAnswer(payload: SaveAnswerInputType) {
        const data = await saveAnswerInput.parseAsync(payload)

        // 1. Validate the attempt is still in progress
        const [attempt] = await db.select({
            status: quizAttemptsTable.status,
            expiresAt: quizAttemptsTable.expiresAt,
        })
        .from(quizAttemptsTable)
        .where(eq(quizAttemptsTable.id, data.attemptId))

        if (!attempt) throw new Error("Attempt not found.")
        if (attempt.status !== "IN_PROGRESS") throw new Error("This attempt has already been submitted.")

        // 2. Check if expired (server-side validation)
        if (attempt.expiresAt && new Date() > new Date(attempt.expiresAt)) {
            // Auto-expire the attempt
            await db.update(quizAttemptsTable)
                .set({ status: "EXPIRED" })
                .where(eq(quizAttemptsTable.id, data.attemptId))
            throw new Error("This attempt has expired.")
        }

        // 3. Check if an answer already exists for this attempt+question
        const [existing] = await db.select({ id: quizAnswersTable.id })
            .from(quizAnswersTable)
            .where(and(
                eq(quizAnswersTable.attemptId, data.attemptId),
                eq(quizAnswersTable.questionId, data.questionId)
            ))

        if (existing) {
            // Update existing answer
            await db.update(quizAnswersTable)
                .set({
                    selectedOptionIds: data.selectedOptionIds ?? [],
                    textAnswer: data.textAnswer ?? null,
                })
                .where(eq(quizAnswersTable.id, existing.id))

            return { answerId: existing.id, saved: true }
        } else {
            // Insert new answer
            const [answer] = await db.insert(quizAnswersTable).values({
                attemptId: data.attemptId,
                questionId: data.questionId,
                selectedOptionIds: data.selectedOptionIds ?? [],
                textAnswer: data.textAnswer ?? null,
            }).returning({ id: quizAnswersTable.id })

            if (!answer) throw new Error("Failed to save answer.")
            return { answerId: answer.id, saved: true }
        }
    }

    /**
     * Submit an attempt: grade all answers, calculate score, update attempt.
     * Idempotent: if already SUBMITTED, returns existing result.
     */
    public async submitAttempt(payload: SubmitAttemptInputType) {
        const { attemptId } = await submitAttemptInput.parseAsync(payload)

        // 1. Get the attempt
        const [attempt] = await db.select()
            .from(quizAttemptsTable)
            .where(eq(quizAttemptsTable.id, attemptId))

        if (!attempt) throw new Error("Attempt not found.")

        // 2. Idempotent: if already submitted, return existing result
        if (attempt.status === "SUBMITTED") {
            const [settings] = await db.select()
                .from(quizSettingsTable)
                .where(eq(quizSettingsTable.formId, attempt.formId))
            const areResultsPublished = settings?.resultsPublished ?? true

            return {
                attemptId: attempt.id,
                score: areResultsPublished ? attempt.score : null,
                totalMarks: attempt.totalMarks,
                percentage: areResultsPublished ? attempt.percentage : null,
                passed: areResultsPublished ? attempt.passed : null,
                timeTaken: attempt.timeTaken,
                status: attempt.status,
                resultsPublished: areResultsPublished,
            }
        }

        if (attempt.status === "EXPIRED") {
            throw new Error("This attempt has expired. Cannot submit.")
        }

        // 3. Get quiz settings for passing score
        const [settings] = await db.select()
            .from(quizSettingsTable)
            .where(eq(quizSettingsTable.formId, attempt.formId))

        const passingScore = settings?.passingScore ?? 50

        // 4. Validate server-side deadline
        const now = new Date()
        if (attempt.expiresAt && now > new Date(attempt.expiresAt)) {
            // Grace period: allow up to 10 seconds past deadline for network latency
            const gracePeriod = 10 * 1000
            if (now.getTime() - new Date(attempt.expiresAt).getTime() > gracePeriod) {
                await db.update(quizAttemptsTable)
                    .set({ status: "EXPIRED" })
                    .where(eq(quizAttemptsTable.id, attemptId))
                throw new Error("This attempt has expired.")
            }
        }

        // 5. Get all answers for this attempt
        const answers = await db.select()
            .from(quizAnswersTable)
            .where(eq(quizAnswersTable.attemptId, attemptId))

        // 6. Grade each answer
        let totalScore = 0
        const selectedQuestionIds = attempt.selectedQuestionIds as string[] ?? []

        await db.transaction(async (tx: any) => {
            for (const answer of answers) {
                const gradeResult = await this.gradeAnswer(answer.questionId, answer)
                totalScore += gradeResult.marksAwarded

                // Update the answer with grading results
                await tx.update(quizAnswersTable)
                    .set({
                        isCorrect: gradeResult.isCorrect,
                        marksAwarded: gradeResult.marksAwarded,
                    })
                    .where(eq(quizAnswersTable.id, answer.id))
            }

            // 7. Handle unanswered questions (award 0 marks — they just don't get graded)

            // 8. Calculate final results
            const finalScore = Math.max(0, totalScore)
            const percentage = attempt.totalMarks > 0
                ? Math.min(100, Math.max(0, Math.round((finalScore / attempt.totalMarks) * 100)))
                : 0

            const passed = percentage >= passingScore

            const timeTaken = Math.round(
                (now.getTime() - new Date(attempt.startedAt).getTime()) / 1000
            )

            // 9. Update attempt with results
            await tx.update(quizAttemptsTable)
                .set({
                    score: finalScore,
                    percentage,
                    passed,
                    timeTaken,
                    status: "SUBMITTED",
                    submittedAt: now,
                })
                .where(eq(quizAttemptsTable.id, attemptId))
        })

        // 10. Fetch updated attempt
        const [result] = await db.select()
            .from(quizAttemptsTable)
            .where(eq(quizAttemptsTable.id, attemptId))

        if (!result) throw new Error("Failed to retrieve attempt result.")

        const areResultsPublished = settings?.resultsPublished ?? true

        return {
            attemptId: result.id,
            score: areResultsPublished ? result.score : null,
            totalMarks: result.totalMarks,
            percentage: areResultsPublished ? result.percentage : null,
            passed: areResultsPublished ? result.passed : null,
            timeTaken: result.timeTaken,
            status: result.status,
            resultsPublished: areResultsPublished,
        }
    }

    /**
     * Grade a single answer against the question's correct answer(s).
     */
    private async gradeAnswer(
        questionId: string,
        answer: { selectedOptionIds: string[] | null; textAnswer: string | null }
    ): Promise<{ isCorrect: boolean; marksAwarded: number }> {
        // Get the question
        const [question] = await db.select()
            .from(quizQuestionsTable)
            .where(eq(quizQuestionsTable.id, questionId))

        if (!question) return { isCorrect: false, marksAwarded: 0 }

        const { questionType, marks, negativeMarks } = question
        const selectedIds = answer.selectedOptionIds ?? []
        const textAns = (answer.textAnswer ?? "").trim().toLowerCase()

        switch (questionType) {
            case "MCQ":
            case "TRUE_FALSE": {
                // Exactly one correct option must be selected
                if (selectedIds.length !== 1) {
                    return { isCorrect: false, marksAwarded: selectedIds.length > 0 ? -negativeMarks : 0 }
                }

                const correctOptions = await db.select({ id: quizOptionsTable.id })
                    .from(quizOptionsTable)
                    .where(and(
                        eq(quizOptionsTable.questionId, questionId),
                        eq(quizOptionsTable.isCorrect, true)
                    ))

                const correctIds = new Set(correctOptions.map(o => o.id))
                const isCorrect = correctIds.has(selectedIds[0]!)

                return {
                    isCorrect,
                    marksAwarded: isCorrect ? marks : -negativeMarks,
                }
            }

            case "MULTIPLE_SELECT": {
                // All correct options must be selected, no wrong ones
                if (selectedIds.length === 0) {
                    return { isCorrect: false, marksAwarded: 0 }
                }

                const allOptions = await db.select({
                    id: quizOptionsTable.id,
                    isCorrect: quizOptionsTable.isCorrect,
                })
                .from(quizOptionsTable)
                .where(eq(quizOptionsTable.questionId, questionId))

                const correctIds = new Set(allOptions.filter(o => o.isCorrect).map(o => o.id))
                const selectedSet = new Set(selectedIds)

                // Check: all correct selected AND no incorrect selected
                const allCorrectSelected = [...correctIds].every(id => selectedSet.has(id))
                const noIncorrectSelected = [...selectedSet].every(id => correctIds.has(id))
                const isCorrect = allCorrectSelected && noIncorrectSelected

                return {
                    isCorrect,
                    marksAwarded: isCorrect ? marks : -negativeMarks,
                }
            }

            case "SHORT_ANSWER":
            case "FILL_BLANK": {
                // Case-insensitive trimmed match against accepted answers
                if (!textAns) {
                    return { isCorrect: false, marksAwarded: 0 }
                }

                const acceptedAnswers = question.acceptedAnswers ?? []

                if (acceptedAnswers.length === 0) {
                    // No accepted answers configured — mark as needs manual review (award 0)
                    return { isCorrect: false, marksAwarded: 0 }
                }

                const isCorrect = acceptedAnswers.some(
                    accepted => accepted.trim().toLowerCase() === textAns
                )

                return {
                    isCorrect,
                    marksAwarded: isCorrect ? marks : (textAns.length > 0 ? -negativeMarks : 0),
                }
            }

            default:
                return { isCorrect: false, marksAwarded: 0 }
        }
    }

    /**
     * Get attempt details (for quiz-taking view)
     */
    public async getAttempt(payload: GetAttemptInputType) {
        const { attemptId } = await getAttemptInput.parseAsync(payload)

        const [attempt] = await db.select()
            .from(quizAttemptsTable)
            .where(eq(quizAttemptsTable.id, attemptId))

        if (!attempt) throw new Error("Attempt not found.")

        // Get saved answers
        const answers = await db.select({
            id: quizAnswersTable.id,
            questionId: quizAnswersTable.questionId,
            selectedOptionIds: quizAnswersTable.selectedOptionIds,
            textAnswer: quizAnswersTable.textAnswer,
        })
        .from(quizAnswersTable)
        .where(eq(quizAnswersTable.attemptId, attemptId))

        return {
            attempt: {
                id: attempt.id,
                formId: attempt.formId,
                status: attempt.status,
                startedAt: attempt.startedAt,
                expiresAt: attempt.expiresAt,
                selectedQuestionIds: attempt.selectedQuestionIds,
            },
            answers,
        }
    }

    /**
     * Get detailed result for a submitted attempt.
     * Includes per-question breakdown if quiz settings allow.
     */
    public async getResult(payload: GetResultInputType) {
        const { attemptId } = await getResultInput.parseAsync(payload)

        const [attempt] = await db.select()
            .from(quizAttemptsTable)
            .where(eq(quizAttemptsTable.id, attemptId))

        if (!attempt) throw new Error("Attempt not found.")
        if (attempt.status === "IN_PROGRESS") throw new Error("This attempt has not been submitted yet.")

        // Get quiz settings
        const [settings] = await db.select()
            .from(quizSettingsTable)
            .where(eq(quizSettingsTable.formId, attempt.formId))

        const areResultsPublished = settings?.resultsPublished ?? true

        // If results have not been published by the editor, withhold the score and answers
        if (!areResultsPublished) {
            const totalQuestions = (attempt.selectedQuestionIds as string[] ?? []).length
            return {
                result: {
                    attemptId: attempt.id,
                    score: null,
                    totalMarks: attempt.totalMarks,
                    percentage: null,
                    passed: null,
                    timeTaken: attempt.timeTaken,
                    status: attempt.status,
                    submittedAt: attempt.submittedAt,
                    startedAt: attempt.startedAt,
                    totalQuestions,
                    correct: null,
                    wrong: null,
                    skipped: null,
                    showCorrectAnswers: false,
                    questionBreakdown: [],
                    resultsPublished: false,
                }
            }
        }

        // Get all answers with grading
        const answers = await db.select()
            .from(quizAnswersTable)
            .where(eq(quizAnswersTable.attemptId, attemptId))

        // Calculate stats
        const totalQuestions = (attempt.selectedQuestionIds as string[] ?? []).length
        const answeredCount = answers.length
        const correctCount = answers.filter(a => a.isCorrect === true).length
        const wrongCount = answers.filter(a => a.isCorrect === false && (
            (a.selectedOptionIds as string[] ?? []).length > 0 || (a.textAnswer ?? "").length > 0
        )).length
        const skippedCount = totalQuestions - answeredCount

        let questionBreakdown: any[] = []

        // Include question-by-question review if settings allow
        if (settings?.showCorrectAnswers) {
            questionBreakdown = await Promise.all(answers.map(async (answer) => {
                const [question] = await db.select({
                    id: quizQuestionsTable.id,
                    question: quizQuestionsTable.question,
                    questionType: quizQuestionsTable.questionType,
                    marks: quizQuestionsTable.marks,
                    explanation: quizQuestionsTable.explanation,
                })
                .from(quizQuestionsTable)
                .where(eq(quizQuestionsTable.id, answer.questionId))

                const options = await db.select()
                    .from(quizOptionsTable)
                    .where(eq(quizOptionsTable.questionId, answer.questionId))
                    .orderBy(asc(quizOptionsTable.order))

                return {
                    question: question ?? null,
                    options,
                    userAnswer: {
                        selectedOptionIds: answer.selectedOptionIds,
                        textAnswer: answer.textAnswer,
                    },
                    isCorrect: answer.isCorrect,
                    marksAwarded: answer.marksAwarded,
                }
            }))
        }

        return {
            result: {
                attemptId: attempt.id,
                score: attempt.score,
                totalMarks: attempt.totalMarks,
                percentage: attempt.percentage,
                passed: attempt.passed,
                timeTaken: attempt.timeTaken,
                status: attempt.status,
                submittedAt: attempt.submittedAt,
                startedAt: attempt.startedAt,
                totalQuestions,
                correct: correctCount,
                wrong: wrongCount,
                skipped: skippedCount,
                showCorrectAnswers: settings?.showCorrectAnswers ?? false,
                questionBreakdown,
                resultsPublished: true,
            }
        }
    }

    /**
     * Expire an attempt (called by admin or system)
     */
    public async expireAttempt(payload: { attemptId: string }) {
        const [updated] = await db.update(quizAttemptsTable)
            .set({ status: "EXPIRED" })
            .where(and(
                eq(quizAttemptsTable.id, payload.attemptId),
                eq(quizAttemptsTable.status, "IN_PROGRESS")
            ))
            .returning({ id: quizAttemptsTable.id })

        if (!updated) throw new Error("Attempt not found or already submitted/expired.")

        return { attemptId: updated.id, status: "EXPIRED" as const }
    }

    /**
     * Get ALL attempts (any status) for a participant by email on a specific quiz.
     * Used on the quiz landing page so returning users can see their full history,
     * resume an in-progress attempt, or understand why they can't start again.
     *
     * Returns: SUBMITTED (with score), IN_PROGRESS (resumable), EXPIRED (show as expired).
     * This matches the count that startAttempt uses — so there's no mismatch.
     */
    public async getPreviousAttempts(payload: GetPreviousAttemptsInputType) {
        const { formId, participantEmail } = await getPreviousAttemptsInput.parseAsync(payload)

        // Get quiz settings to check if results are published
        const [settings] = await db.select({
            resultsPublished: quizSettingsTable.resultsPublished,
            passingScore: quizSettingsTable.passingScore,
        })
        .from(quizSettingsTable)
        .where(eq(quizSettingsTable.formId, formId))

        const resultsPublished = settings?.resultsPublished ?? true

        // ↓ Query ALL statuses (not just SUBMITTED) — matches what startAttempt counts
        const attempts = await db.select({
            id: quizAttemptsTable.id,
            participantName: quizAttemptsTable.participantName,
            score: quizAttemptsTable.score,
            totalMarks: quizAttemptsTable.totalMarks,
            percentage: quizAttemptsTable.percentage,
            passed: quizAttemptsTable.passed,
            timeTaken: quizAttemptsTable.timeTaken,
            status: quizAttemptsTable.status,
            submittedAt: quizAttemptsTable.submittedAt,
            startedAt: quizAttemptsTable.startedAt,
            expiresAt: quizAttemptsTable.expiresAt,
        })
        .from(quizAttemptsTable)
        .where(and(
            eq(quizAttemptsTable.formId, formId),
            eq(quizAttemptsTable.participantEmail, participantEmail.toLowerCase().trim()),
        ))
        .orderBy(desc(quizAttemptsTable.startedAt))

        // If results not published yet, hide score details on SUBMITTED attempts
        const sanitized = attempts.map(a => ({
            id: a.id,
            participantName: a.participantName,
            score: (resultsPublished && a.status === "SUBMITTED") ? a.score : null,
            totalMarks: a.totalMarks,
            percentage: (resultsPublished && a.status === "SUBMITTED") ? a.percentage : null,
            passed: (resultsPublished && a.status === "SUBMITTED") ? a.passed : null,
            timeTaken: a.timeTaken,
            status: a.status,
            submittedAt: a.submittedAt,
            startedAt: a.startedAt,
            expiresAt: a.expiresAt,
        }))

        return {
            attempts: sanitized,
            resultsPublished,
            totalAttempts: sanitized.length,
        }
    }
}

export default QuizAttemptService
