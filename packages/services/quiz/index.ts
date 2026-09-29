import { db, eq, and, count, asc } from "@repo/database"
import { formsTable } from "@repo/database/models/form"
import { quizSettingsTable } from "@repo/database/models/quiz-settings"
import { quizQuestionsTable } from "@repo/database/models/quiz-question"
import { quizOptionsTable } from "@repo/database/models/quiz-option"
import {
    type CreateQuizInputType, createQuizInput,
    type UpdateQuizInputType, updateQuizInput,
    type DeleteQuizInputType, deleteQuizInput,
    type GetQuizByIdInputType, getQuizByIdInput,
    type ListQuizzesByUserIdInputType, listQuizzesByUserIdInput,
    type PublishQuizInputType, publishQuizInput,
    type UnpublishQuizInputType, unpublishQuizInput,
    type UpdateQuizSettingsInputType, updateQuizSettingsInput,
    type PublishQuizResultsInputType, publishQuizResultsInput,
} from "./model"

class QuizService {

    /**
     * Creates a new quiz: inserts into forms (type='quiz') + quiz_settings in a transaction
     */
    public async createQuiz(payload: CreateQuizInputType) {
        const data = await createQuizInput.parseAsync(payload)

        const result = await db.transaction(async (tx: any) => {
            // 1. Insert into forms table with type='quiz'
            const [form] = await tx.insert(formsTable).values({
                title: data.title,
                description: data.description,
                type: "quiz",
                createdBy: data.createdBy,
                updatedBy: data.createdBy,
                isActive: false,
                visibility: "unlisted",
            }).returning({
                id: formsTable.id,
                title: formsTable.title,
            })

            if (!form) throw new Error("Failed to create quiz form")

            // 2. Insert quiz settings
            const [settings] = await tx.insert(quizSettingsTable).values({
                formId: form.id,
                timeLimitMinutes: data.timeLimitMinutes ?? null,
                maxAttempts: data.maxAttempts,
                passingScore: data.passingScore,
                showResultImmediately: data.showResultImmediately,
                resultsPublished: data.resultsPublished ?? true,
                resultsPublishedAt: (data.resultsPublished ?? true) ? new Date() : null,
                showCorrectAnswers: data.showCorrectAnswers,
                shuffleQuestions: data.shuffleQuestions,
                shuffleOptions: data.shuffleOptions,
                enableLeaderboard: data.enableLeaderboard,
                accessCode: data.accessCode ?? null,
                allowGuests: data.allowGuests,
                difficultyDistribution: data.difficultyDistribution ?? null,
            }).returning({
                id: quizSettingsTable.id,
            })

            if (!settings) throw new Error("Failed to create quiz settings")

            return { formId: form.id }
        })

        return result
    }

    /**
     * Updates quiz form fields (title, description)
     */
    public async updateQuiz(payload: UpdateQuizInputType) {
        const { formId, userId, title, description } = await updateQuizInput.parseAsync(payload)

        const updateValues: Partial<typeof formsTable.$inferInsert> = {
            updatedBy: userId,
        }
        if (title !== undefined) updateValues.title = title
        if (description !== undefined) updateValues.description = description ?? null

        const [updated] = await db.update(formsTable)
            .set(updateValues)
            .where(and(
                eq(formsTable.id, formId),
                eq(formsTable.createdBy, userId),
                eq(formsTable.type, "quiz")
            ))
            .returning({ id: formsTable.id, title: formsTable.title })

        if (!updated) throw new Error("Quiz not found or you are not authorized.")

        return { formId: updated.id, title: updated.title }
    }

    /**
     * Deletes a quiz (cascades to settings, questions, options, attempts, answers)
     */
    public async deleteQuiz(payload: DeleteQuizInputType) {
        const { formId, userId } = await deleteQuizInput.parseAsync(payload)

        const [deleted] = await db.delete(formsTable)
            .where(and(
                eq(formsTable.id, formId),
                eq(formsTable.createdBy, userId),
                eq(formsTable.type, "quiz")
            ))
            .returning({ id: formsTable.id })

        if (!deleted) throw new Error("Quiz not found or you are not authorized.")

        return { deletedFormId: deleted.id }
    }

    /**
     * Gets a quiz with settings, questions, and options
     */
    public async getQuizById(payload: GetQuizByIdInputType) {
        const { formId } = await getQuizByIdInput.parseAsync(payload)

        // 1. Get form
        const [form] = await db.select({
            id: formsTable.id,
            title: formsTable.title,
            description: formsTable.description,
            type: formsTable.type,
            isActive: formsTable.isActive,
            visibility: formsTable.visibility,
            createdBy: formsTable.createdBy,
            createdAt: formsTable.createdAt,
            updatedAt: formsTable.updatedAt,
        })
        .from(formsTable)
        .where(and(eq(formsTable.id, formId), eq(formsTable.type, "quiz")))

        if (!form) throw new Error(`Quiz not found with id ${formId}`)

        // 2. Get settings
        const [settings] = await db.select()
            .from(quizSettingsTable)
            .where(eq(quizSettingsTable.formId, formId))

        // 3. Get questions with options
        const questions = await db.select()
            .from(quizQuestionsTable)
            .where(eq(quizQuestionsTable.formId, formId))
            .orderBy(asc(quizQuestionsTable.order))

        // 4. Get all options for these questions
        const questionIds = questions.map(q => q.id)
        let optionsByQuestion: Record<string, typeof quizOptionsTable.$inferSelect[]> = {}

        if (questionIds.length > 0) {
            for (const qId of questionIds) {
                const opts = await db.select()
                    .from(quizOptionsTable)
                    .where(eq(quizOptionsTable.questionId, qId))
                    .orderBy(asc(quizOptionsTable.order))
                optionsByQuestion[qId] = opts
            }
        }

        const questionsWithOptions = questions.map(q => ({
            ...q,
            options: optionsByQuestion[q.id] ?? [],
        }))

        return {
            quiz: {
                ...form,
                settings: settings ?? null,
                questions: questionsWithOptions,
            }
        }
    }

    /**
     * Gets a quiz for public taking (excludes correct answers, owner-only fields)
     */
    public async getQuizForTaking(payload: GetQuizByIdInputType) {
        const { quiz } = await this.getQuizById(payload)

        if (!quiz.isActive) {
            return {
                quiz: {
                    id: quiz.id,
                    title: quiz.title,
                    description: quiz.description,
                    isActive: false,
                    settings: null,
                    questionCount: quiz.questions?.length ?? 0,
                    questions: [],
                }
            }
        }

        // Strip correct answer info from questions/options
        const sanitizedQuestions = quiz.questions.map(q => ({
            id: q.id,
            question: q.question,
            questionType: q.questionType,
            marks: q.marks,
            order: q.order,
            options: q.options.map(o => ({
                id: o.id,
                optionText: o.optionText,
                order: o.order,
            })),
        }))

        return {
            quiz: {
                id: quiz.id,
                title: quiz.title,
                description: quiz.description,
                isActive: true,
                settings: quiz.settings ? {
                    timeLimitMinutes: quiz.settings.timeLimitMinutes,
                    maxAttempts: quiz.settings.maxAttempts,
                    shuffleQuestions: quiz.settings.shuffleQuestions,
                    shuffleOptions: quiz.settings.shuffleOptions,
                    enableLeaderboard: quiz.settings.enableLeaderboard,
                    allowGuests: quiz.settings.allowGuests,
                    questionsToShow: quiz.settings.questionsToShow,
                    accessCode: quiz.settings.accessCode ? true : false, // only expose whether code is needed
                } : null,
                questionCount: sanitizedQuestions.length,
                questions: sanitizedQuestions,
            }
        }
    }

    /**
     * Lists quizzes by user id (non-archived)
     */
    public async listQuizzesByUserId(payload: ListQuizzesByUserIdInputType) {
        const { userId } = await listQuizzesByUserIdInput.parseAsync(payload)

        const quizzes = await db.select({
            id: formsTable.id,
            title: formsTable.title,
            description: formsTable.description,
            isActive: formsTable.isActive,
            visibility: formsTable.visibility,
            createdAt: formsTable.createdAt,
        })
        .from(formsTable)
        .where(and(
            eq(formsTable.createdBy, userId),
            eq(formsTable.type, "quiz"),
            eq(formsTable.isArchived, false)
        ))

        // Get question counts for each quiz
        const quizzesWithCounts = await Promise.all(quizzes.map(async (quiz) => {
            const [countRow] = await db.select({ count: count() })
                .from(quizQuestionsTable)
                .where(eq(quizQuestionsTable.formId, quiz.id))

            return {
                ...quiz,
                questionCount: countRow?.count ?? 0,
            }
        }))

        return { quizzes: quizzesWithCounts }
    }

    /**
     * Publish a quiz (sets isActive=true and visibility)
     */
    public async publishQuiz(payload: PublishQuizInputType) {
        const { formId, userId, visibility } = await publishQuizInput.parseAsync(payload)

        // Verify quiz has at least one question
        const [questionCount] = await db.select({ count: count() })
            .from(quizQuestionsTable)
            .where(eq(quizQuestionsTable.formId, formId))

        if (!questionCount || questionCount.count === 0) {
            throw new Error("Cannot publish a quiz with no questions.")
        }

        const [updated] = await db.update(formsTable)
            .set({
                isActive: true,
                visibility,
                updatedBy: userId,
            })
            .where(and(
                eq(formsTable.id, formId),
                eq(formsTable.createdBy, userId),
                eq(formsTable.type, "quiz")
            ))
            .returning({
                id: formsTable.id,
                isActive: formsTable.isActive,
                visibility: formsTable.visibility,
            })

        if (!updated) throw new Error("Quiz not found or you are not authorized.")

        return { formId: updated.id, isActive: updated.isActive, visibility: updated.visibility }
    }

    /**
     * Unpublish a quiz
     */
    public async unpublishQuiz(payload: UnpublishQuizInputType) {
        const { formId, userId } = await unpublishQuizInput.parseAsync(payload)

        const [updated] = await db.update(formsTable)
            .set({
                isActive: false,
                updatedBy: userId,
            })
            .where(and(
                eq(formsTable.id, formId),
                eq(formsTable.createdBy, userId),
                eq(formsTable.type, "quiz")
            ))
            .returning({
                id: formsTable.id,
                isActive: formsTable.isActive,
            })

        if (!updated) throw new Error("Quiz not found or you are not authorized.")

        return { formId: updated.id, isActive: updated.isActive }
    }

    /**
     * Get quiz settings
     */
    public async getQuizSettings(payload: { formId: string }) {
        const [settings] = await db.select()
            .from(quizSettingsTable)
            .where(eq(quizSettingsTable.formId, payload.formId))

        if (!settings) throw new Error("Quiz settings not found.")

        return { settings }
    }

    /**
     * Update quiz settings
     */
    public async updateQuizSettings(payload: UpdateQuizSettingsInputType) {
        const { formId, userId, ...settingsData } = await updateQuizSettingsInput.parseAsync(payload)

        // Verify ownership
        const [form] = await db.select({ createdBy: formsTable.createdBy })
            .from(formsTable)
            .where(and(eq(formsTable.id, formId), eq(formsTable.type, "quiz")))

        if (!form) throw new Error("Quiz not found.")
        if (form.createdBy !== userId) throw new Error("You are not authorized to update this quiz.")

        const updateValues: Partial<typeof quizSettingsTable.$inferInsert> = {}

        if (settingsData.timeLimitMinutes !== undefined) updateValues.timeLimitMinutes = settingsData.timeLimitMinutes
        if (settingsData.maxAttempts !== undefined) updateValues.maxAttempts = settingsData.maxAttempts
        if (settingsData.passingScore !== undefined) updateValues.passingScore = settingsData.passingScore
        if (settingsData.showResultImmediately !== undefined) updateValues.showResultImmediately = settingsData.showResultImmediately
        if (settingsData.resultsPublished !== undefined) {
            updateValues.resultsPublished = settingsData.resultsPublished
            if (settingsData.resultsPublished) {
                updateValues.resultsPublishedAt = new Date()
            }
        }
        if (settingsData.resultsPublishedAt !== undefined) updateValues.resultsPublishedAt = settingsData.resultsPublishedAt
        if (settingsData.showCorrectAnswers !== undefined) updateValues.showCorrectAnswers = settingsData.showCorrectAnswers
        if (settingsData.shuffleQuestions !== undefined) updateValues.shuffleQuestions = settingsData.shuffleQuestions
        if (settingsData.shuffleOptions !== undefined) updateValues.shuffleOptions = settingsData.shuffleOptions
        if (settingsData.enableLeaderboard !== undefined) updateValues.enableLeaderboard = settingsData.enableLeaderboard
        if (settingsData.accessCode !== undefined) updateValues.accessCode = settingsData.accessCode ?? null
        if (settingsData.allowGuests !== undefined) updateValues.allowGuests = settingsData.allowGuests
        if (settingsData.questionsToShow !== undefined) updateValues.questionsToShow = settingsData.questionsToShow ?? null
        if (settingsData.difficultyDistribution !== undefined) updateValues.difficultyDistribution = settingsData.difficultyDistribution ?? null

        const [updated] = await db.update(quizSettingsTable)
            .set(updateValues)
            .where(eq(quizSettingsTable.formId, formId))
            .returning({ id: quizSettingsTable.id })

        if (!updated) throw new Error("Quiz settings not found.")

        return { success: true }
    }

    /**
     * Publish or unpublish quiz results
     */
    public async publishResults(payload: PublishQuizResultsInputType) {
        const { formId, userId, published } = await publishQuizResultsInput.parseAsync(payload)

        // Verify ownership
        const [form] = await db.select({ createdBy: formsTable.createdBy })
            .from(formsTable)
            .where(and(eq(formsTable.id, formId), eq(formsTable.type, "quiz")))

        if (!form) throw new Error("Quiz not found.")
        if (form.createdBy !== userId) throw new Error("You are not authorized to update this quiz.")

        await db.update(quizSettingsTable)
            .set({
                resultsPublished: published,
                resultsPublishedAt: published ? new Date() : null,
            })
            .where(eq(quizSettingsTable.formId, formId))

        return { success: true, published }
    }
}

export default QuizService
