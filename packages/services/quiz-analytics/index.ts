import { db, eq, and, count, asc, desc } from "@repo/database"
import { formsTable } from "@repo/database/models/form"
import { quizQuestionsTable } from "@repo/database/models/quiz-question"
import { quizAttemptsTable } from "@repo/database/models/quiz-attempt"
import { quizAnswersTable } from "@repo/database/models/quiz-answer"
import { quizSettingsTable } from "@repo/database/models/quiz-settings"
import {
    type GetQuizAnalyticsInputType, getQuizAnalyticsInput,
    type GetQuestionAnalyticsInputType, getQuestionAnalyticsInput,
    type GetLeaderboardInputType, getLeaderboardInput,
    type ExportCSVInputType, exportCSVInput,
} from "./model"

class QuizAnalyticsService {

    /**
     * Verify quiz ownership
     */
    private async verifyQuizOwnership(formId: string, userId: string) {
        const [form] = await db.select({
            createdBy: formsTable.createdBy,
            type: formsTable.type,
        })
        .from(formsTable)
        .where(eq(formsTable.id, formId))

        if (!form) throw new Error("Quiz not found.")
        if (form.type !== "quiz") throw new Error("This is not a quiz.")
        if (form.createdBy !== userId) throw new Error("You are not authorized to view analytics for this quiz.")
    }

    /**
     * Get overall quiz analytics: attempt stats, score distribution, pass rate, etc.
     */
    public async getQuizAnalytics(payload: GetQuizAnalyticsInputType) {
        const { formId, userId } = await getQuizAnalyticsInput.parseAsync(payload)
        await this.verifyQuizOwnership(formId, userId)

        // 1. Total attempts
        const [totalAttemptsRow] = await db.select({ count: count() })
            .from(quizAttemptsTable)
            .where(eq(quizAttemptsTable.formId, formId))

        // 2. Submitted attempts
        const [submittedAttemptsRow] = await db.select({ count: count() })
            .from(quizAttemptsTable)
            .where(and(
                eq(quizAttemptsTable.formId, formId),
                eq(quizAttemptsTable.status, "SUBMITTED")
            ))

        // 3. Get all submitted attempts for score statistics
        const submittedAttempts = await db.select({
            score: quizAttemptsTable.score,
            totalMarks: quizAttemptsTable.totalMarks,
            percentage: quizAttemptsTable.percentage,
            passed: quizAttemptsTable.passed,
            timeTaken: quizAttemptsTable.timeTaken,
            submittedAt: quizAttemptsTable.submittedAt,
        })
        .from(quizAttemptsTable)
        .where(and(
            eq(quizAttemptsTable.formId, formId),
            eq(quizAttemptsTable.status, "SUBMITTED")
        ))
        .orderBy(desc(quizAttemptsTable.submittedAt))

        // 4. Calculate statistics
        const totalAttempts = totalAttemptsRow?.count ?? 0
        const submittedCount = submittedAttemptsRow?.count ?? 0

        let avgScore = 0
        let avgPercentage = 0
        let highestScore = 0
        let lowestScore = 0
        let avgTimeTaken = 0
        let passCount = 0
        let failCount = 0

        if (submittedAttempts.length > 0) {
            const scores = submittedAttempts.map(a => a.score)
            const percentages = submittedAttempts.map(a => a.percentage)
            const times = submittedAttempts.map(a => a.timeTaken)

            avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
            avgPercentage = Math.round(percentages.reduce((a, b) => a + b, 0) / percentages.length)
            highestScore = Math.max(...scores)
            lowestScore = Math.min(...scores)
            avgTimeTaken = Math.round(times.reduce((a, b) => a + b, 0) / times.length)
            passCount = submittedAttempts.filter(a => a.passed).length
            failCount = submittedCount - passCount
        }

        // 5. Score distribution (buckets: 0-10, 10-20, ..., 90-100)
        const scoreDistribution = Array(10).fill(0).map((_, i) => ({
            range: `${i * 10}-${(i + 1) * 10}`,
            count: 0,
        }))

        for (const attempt of submittedAttempts) {
            const bucket = Math.min(Math.floor(attempt.percentage / 10), 9)
            scoreDistribution[bucket]!.count++
        }

        // 6. Recent attempts (last 10)
        const recentAttempts = submittedAttempts.slice(0, 10).map(a => ({
            score: a.score,
            totalMarks: a.totalMarks,
            percentage: a.percentage,
            passed: a.passed,
            timeTaken: a.timeTaken,
            submittedAt: a.submittedAt,
        }))

        // 7. Get quiz settings (to know if results are published)
        const [settings] = await db.select({
            resultsPublished: quizSettingsTable.resultsPublished,
            resultsPublishedAt: quizSettingsTable.resultsPublishedAt,
            showResultImmediately: quizSettingsTable.showResultImmediately,
        })
            .from(quizSettingsTable)
            .where(eq(quizSettingsTable.formId, formId))

        // 8. Get all attempt entries for the Analytics entries table
        const allAttempts = await db.select({
            id: quizAttemptsTable.id,
            participantName: quizAttemptsTable.participantName,
            participantEmail: quizAttemptsTable.participantEmail,
            score: quizAttemptsTable.score,
            totalMarks: quizAttemptsTable.totalMarks,
            percentage: quizAttemptsTable.percentage,
            passed: quizAttemptsTable.passed,
            timeTaken: quizAttemptsTable.timeTaken,
            status: quizAttemptsTable.status,
            startedAt: quizAttemptsTable.startedAt,
            submittedAt: quizAttemptsTable.submittedAt,
        })
        .from(quizAttemptsTable)
        .where(eq(quizAttemptsTable.formId, formId))
        .orderBy(desc(quizAttemptsTable.submittedAt), desc(quizAttemptsTable.startedAt))

        return {
            analytics: {
                totalAttempts,
                submittedAttempts: submittedCount,
                avgScore,
                avgPercentage,
                highestScore,
                lowestScore,
                avgTimeTaken,
                passCount,
                failCount,
                passRate: submittedCount > 0 ? Math.round((passCount / submittedCount) * 100) : 0,
                scoreDistribution,
                recentAttempts,
                resultsPublished: settings?.resultsPublished ?? true,
                resultsPublishedAt: settings?.resultsPublishedAt ?? null,
                showResultImmediately: settings?.showResultImmediately ?? true,
                allAttempts,
            }
        }
    }

    /**
     * Get per-question analytics: accuracy, most missed, avg marks
     */
    public async getQuestionAnalytics(payload: GetQuestionAnalyticsInputType) {
        const { formId, userId } = await getQuestionAnalyticsInput.parseAsync(payload)
        await this.verifyQuizOwnership(formId, userId)

        // Get all questions
        const questions = await db.select({
            id: quizQuestionsTable.id,
            question: quizQuestionsTable.question,
            questionType: quizQuestionsTable.questionType,
            marks: quizQuestionsTable.marks,
            order: quizQuestionsTable.order,
        })
        .from(quizQuestionsTable)
        .where(eq(quizQuestionsTable.formId, formId))
        .orderBy(asc(quizQuestionsTable.order))

        // Get analytics for each question
        const questionStats = await Promise.all(questions.map(async (q) => {
            // Total answers for this question
            const [totalRow] = await db.select({ count: count() })
                .from(quizAnswersTable)
                .where(eq(quizAnswersTable.questionId, q.id))

            // Correct answers
            const [correctRow] = await db.select({ count: count() })
                .from(quizAnswersTable)
                .where(and(
                    eq(quizAnswersTable.questionId, q.id),
                    eq(quizAnswersTable.isCorrect, true)
                ))

            const totalAnswers = totalRow?.count ?? 0
            const correctAnswers = correctRow?.count ?? 0
            const accuracy = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0

            return {
                questionId: q.id,
                question: q.question,
                questionType: q.questionType,
                marks: q.marks,
                order: q.order,
                totalAnswers,
                correctAnswers,
                wrongAnswers: totalAnswers - correctAnswers,
                accuracy,
            }
        }))

        // Sort by accuracy ascending (most missed first)
        const mostMissed = [...questionStats]
            .sort((a, b) => a.accuracy - b.accuracy)
            .slice(0, 5)

        return {
            questionAnalytics: questionStats,
            mostMissed,
        }
    }

    /**
     * Get leaderboard: sorted by score DESC, timeTaken ASC
     */
    public async getLeaderboard(payload: GetLeaderboardInputType) {
        const { formId, limit, offset } = await getLeaderboardInput.parseAsync(payload)

        // Check if leaderboard is enabled and results are published
        const [settings] = await db.select({
            enableLeaderboard: quizSettingsTable.enableLeaderboard,
            resultsPublished: quizSettingsTable.resultsPublished,
        })
            .from(quizSettingsTable)
            .where(eq(quizSettingsTable.formId, formId))

        if (!settings || !settings.enableLeaderboard) {
            throw new Error("Leaderboard is not enabled for this quiz.")
        }

        if (!settings.resultsPublished) {
            return {
                leaderboard: [],
                total: 0,
                resultsPublished: false,
            }
        }

        const entries = await db.select({
            participantName: quizAttemptsTable.participantName,
            score: quizAttemptsTable.score,
            totalMarks: quizAttemptsTable.totalMarks,
            percentage: quizAttemptsTable.percentage,
            timeTaken: quizAttemptsTable.timeTaken,
            submittedAt: quizAttemptsTable.submittedAt,
        })
        .from(quizAttemptsTable)
        .where(and(
            eq(quizAttemptsTable.formId, formId),
            eq(quizAttemptsTable.status, "SUBMITTED")
        ))
        .orderBy(
            desc(quizAttemptsTable.score),
            asc(quizAttemptsTable.timeTaken)
        )
        .limit(limit)
        .offset(offset)

        // Add rank
        const leaderboard = entries.map((entry, idx) => ({
            rank: offset + idx + 1,
            ...entry,
        }))

        // Total count for pagination
        const [totalRow] = await db.select({ count: count() })
            .from(quizAttemptsTable)
            .where(and(
                eq(quizAttemptsTable.formId, formId),
                eq(quizAttemptsTable.status, "SUBMITTED")
            ))

        return {
            leaderboard,
            total: totalRow?.count ?? 0,
            resultsPublished: true,
        }
    }

    /**
     * Export quiz attempts as CSV string
     */
    public async exportCSV(payload: ExportCSVInputType) {
        const { formId, userId } = await exportCSVInput.parseAsync(payload)
        await this.verifyQuizOwnership(formId, userId)

        const attempts = await db.select({
            participantName: quizAttemptsTable.participantName,
            participantEmail: quizAttemptsTable.participantEmail,
            score: quizAttemptsTable.score,
            totalMarks: quizAttemptsTable.totalMarks,
            percentage: quizAttemptsTable.percentage,
            passed: quizAttemptsTable.passed,
            timeTaken: quizAttemptsTable.timeTaken,
            status: quizAttemptsTable.status,
            startedAt: quizAttemptsTable.startedAt,
            submittedAt: quizAttemptsTable.submittedAt,
        })
        .from(quizAttemptsTable)
        .where(eq(quizAttemptsTable.formId, formId))
        .orderBy(desc(quizAttemptsTable.submittedAt))

        // Build CSV
        const headers = [
            "Participant Name",
            "Participant Email",
            "Score",
            "Total Marks",
            "Percentage",
            "Passed",
            "Time Taken (seconds)",
            "Status",
            "Started At",
            "Submitted At",
        ]

        const rows = attempts.map(a => [
            `"${(a.participantName ?? "").replace(/"/g, '""')}"`,
            `"${(a.participantEmail ?? "").replace(/"/g, '""')}"`,
            a.score,
            a.totalMarks,
            a.percentage,
            a.passed ? "Yes" : "No",
            a.timeTaken,
            a.status,
            a.startedAt?.toISOString() ?? "",
            a.submittedAt?.toISOString() ?? "",
        ])

        const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n")

        return { csv, count: attempts.length }
    }
}

export default QuizAnalyticsService
