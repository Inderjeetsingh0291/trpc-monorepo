import { db, eq, and, asc, count } from "@repo/database"
import { formsTable } from "@repo/database/models/form"
import { quizQuestionsTable } from "@repo/database/models/quiz-question"
import { quizOptionsTable } from "@repo/database/models/quiz-option"
import {
    type CreateQuestionInputType, createQuestionInput,
    type UpdateQuestionInputType, updateQuestionInput,
    type DeleteQuestionInputType, deleteQuestionInput,
    type DuplicateQuestionInputType, duplicateQuestionInput,
    type ReorderQuestionsInputType, reorderQuestionsInput,
    type GetQuestionsByQuizIdInputType, getQuestionsByQuizIdInput,
    type BulkCreateQuestionsInputType, bulkCreateQuestionsInput,
} from "./model"

class QuizQuestionService {

    /**
     * Verify quiz ownership. Throws if not owner or not a quiz.
     */
    private async verifyQuizOwnership(formId: string, userId: string) {
        const [form] = await db.select({
            createdBy: formsTable.createdBy,
            type: formsTable.type,
        })
        .from(formsTable)
        .where(eq(formsTable.id, formId))

        if (!form) throw new Error("Quiz not found.")
        if (form.type !== "quiz") throw new Error("This form is not a quiz.")
        if (form.createdBy !== userId) throw new Error("You are not authorized to modify this quiz.")

        return form
    }

    /**
     * Get the next order index for a new question in a quiz
     */
    private async getNextOrder(formId: string): Promise<number> {
        const [maxRow] = await db.select({ count: count() })
            .from(quizQuestionsTable)
            .where(eq(quizQuestionsTable.formId, formId))

        return (maxRow?.count ?? 0) + 1
    }

    /**
     * Create a new question with its options
     */
    public async createQuestion(payload: CreateQuestionInputType) {
        const data = await createQuestionInput.parseAsync(payload)
        await this.verifyQuizOwnership(data.formId, data.userId)

        const nextOrder = await this.getNextOrder(data.formId)

        const result = await db.transaction(async (tx: any) => {
            // 1. Insert question
            const [question] = await tx.insert(quizQuestionsTable).values({
                formId: data.formId,
                question: data.question,
                questionType: data.questionType,
                marks: data.marks,
                negativeMarks: data.negativeMarks,
                explanation: data.explanation ?? null,
                order: nextOrder,
                difficulty: data.difficulty,
                category: data.category ?? null,
                tags: data.tags ?? null,
                acceptedAnswers: data.acceptedAnswers ?? null,
            }).returning({
                id: quizQuestionsTable.id,
                order: quizQuestionsTable.order,
            })

            if (!question) throw new Error("Failed to create question")

            // 2. Insert options (if any)
            if (data.options && data.options.length > 0) {
                await tx.insert(quizOptionsTable).values(
                    data.options.map((opt, idx) => ({
                        questionId: question.id,
                        optionText: opt.optionText,
                        isCorrect: opt.isCorrect,
                        order: opt.order ?? idx,
                    }))
                )
            }

            return { questionId: question.id }
        })

        return result
    }

    /**
     * Update a question and optionally replace its options
     */
    public async updateQuestion(payload: UpdateQuestionInputType) {
        const data = await updateQuestionInput.parseAsync(payload)

        // Get the question to find its formId
        const [existingQuestion] = await db.select({
            formId: quizQuestionsTable.formId,
        })
        .from(quizQuestionsTable)
        .where(eq(quizQuestionsTable.id, data.questionId))

        if (!existingQuestion) throw new Error("Question not found.")
        await this.verifyQuizOwnership(existingQuestion.formId, data.userId)

        const result = await db.transaction(async (tx: any) => {
            // 1. Update question fields
            const updateValues: Partial<typeof quizQuestionsTable.$inferInsert> = {}
            if (data.question !== undefined) updateValues.question = data.question
            if (data.questionType !== undefined) updateValues.questionType = data.questionType
            if (data.marks !== undefined) updateValues.marks = data.marks
            if (data.negativeMarks !== undefined) updateValues.negativeMarks = data.negativeMarks
            if (data.explanation !== undefined) updateValues.explanation = data.explanation ?? null
            if (data.difficulty !== undefined) updateValues.difficulty = data.difficulty
            if (data.category !== undefined) updateValues.category = data.category ?? null
            if (data.tags !== undefined) updateValues.tags = data.tags ?? null
            if (data.acceptedAnswers !== undefined) updateValues.acceptedAnswers = data.acceptedAnswers ?? null

            if (Object.keys(updateValues).length > 0) {
                const [updated] = await tx.update(quizQuestionsTable)
                    .set(updateValues)
                    .where(eq(quizQuestionsTable.id, data.questionId))
                    .returning({ id: quizQuestionsTable.id })

                if (!updated) throw new Error("Failed to update question")
            }

            // 2. Replace options if provided (delete all existing, insert new)
            if (data.options !== undefined) {
                await tx.delete(quizOptionsTable)
                    .where(eq(quizOptionsTable.questionId, data.questionId))

                if (data.options.length > 0) {
                    await tx.insert(quizOptionsTable).values(
                        data.options.map((opt, idx) => ({
                            questionId: data.questionId,
                            optionText: opt.optionText,
                            isCorrect: opt.isCorrect,
                            order: opt.order ?? idx,
                        }))
                    )
                }
            }

            return { questionId: data.questionId }
        })

        return result
    }

    /**
     * Delete a question (cascade deletes options)
     */
    public async deleteQuestion(payload: DeleteQuestionInputType) {
        const { questionId, userId } = await deleteQuestionInput.parseAsync(payload)

        // Get the question to verify ownership
        const [question] = await db.select({
            formId: quizQuestionsTable.formId,
        })
        .from(quizQuestionsTable)
        .where(eq(quizQuestionsTable.id, questionId))

        if (!question) throw new Error("Question not found.")
        await this.verifyQuizOwnership(question.formId, userId)

        const [deleted] = await db.delete(quizQuestionsTable)
            .where(eq(quizQuestionsTable.id, questionId))
            .returning({ id: quizQuestionsTable.id })

        if (!deleted) throw new Error("Failed to delete question")

        return { success: true, questionId: deleted.id }
    }

    /**
     * Duplicate a question with all its options
     */
    public async duplicateQuestion(payload: DuplicateQuestionInputType) {
        const { questionId, userId } = await duplicateQuestionInput.parseAsync(payload)

        // Get the original question
        const [original] = await db.select()
            .from(quizQuestionsTable)
            .where(eq(quizQuestionsTable.id, questionId))

        if (!original) throw new Error("Question not found.")
        await this.verifyQuizOwnership(original.formId, userId)

        const nextOrder = await this.getNextOrder(original.formId)

        const result = await db.transaction(async (tx: any) => {
            // 1. Clone question
            const [cloned] = await tx.insert(quizQuestionsTable).values({
                formId: original.formId,
                question: `${original.question} (Copy)`,
                questionType: original.questionType,
                marks: original.marks,
                negativeMarks: original.negativeMarks,
                explanation: original.explanation,
                order: nextOrder,
                difficulty: original.difficulty,
                category: original.category,
                tags: original.tags,
                acceptedAnswers: original.acceptedAnswers,
            }).returning({ id: quizQuestionsTable.id })

            if (!cloned) throw new Error("Failed to duplicate question")

            // 2. Clone options
            const options = await db.select()
                .from(quizOptionsTable)
                .where(eq(quizOptionsTable.questionId, questionId))
                .orderBy(asc(quizOptionsTable.order))

            if (options.length > 0) {
                await tx.insert(quizOptionsTable).values(
                    options.map(opt => ({
                        questionId: cloned.id,
                        optionText: opt.optionText,
                        isCorrect: opt.isCorrect,
                        order: opt.order,
                    }))
                )
            }

            return { questionId: cloned.id }
        })

        return result
    }

    /**
     * Reorder questions within a quiz
     */
    public async reorderQuestions(payload: ReorderQuestionsInputType) {
        const { formId, userId, questionIds } = await reorderQuestionsInput.parseAsync(payload)
        await this.verifyQuizOwnership(formId, userId)

        await db.transaction(async (tx: any) => {
            // Two-pass to avoid unique constraint violations (same as form-field reorder)
            for (let i = 0; i < questionIds.length; i++) {
                await tx.update(quizQuestionsTable)
                    .set({ order: -(i + 1) })
                    .where(and(
                        eq(quizQuestionsTable.id, questionIds[i]!),
                        eq(quizQuestionsTable.formId, formId)
                    ))
            }
            for (let i = 0; i < questionIds.length; i++) {
                await tx.update(quizQuestionsTable)
                    .set({ order: i + 1 })
                    .where(and(
                        eq(quizQuestionsTable.id, questionIds[i]!),
                        eq(quizQuestionsTable.formId, formId)
                    ))
            }
        })

        return { success: true }
    }

    /**
     * Get all questions (with options) for a quiz, ordered
     */
    public async getQuestionsByQuizId(payload: GetQuestionsByQuizIdInputType) {
        const { formId } = await getQuestionsByQuizIdInput.parseAsync(payload)

        const questions = await db.select()
            .from(quizQuestionsTable)
            .where(eq(quizQuestionsTable.formId, formId))
            .orderBy(asc(quizQuestionsTable.order))

        const questionsWithOptions = await Promise.all(questions.map(async (q) => {
            const options = await db.select()
                .from(quizOptionsTable)
                .where(eq(quizOptionsTable.questionId, q.id))
                .orderBy(asc(quizOptionsTable.order))

            return { ...q, options }
        }))

        return { questions: questionsWithOptions }
    }

    /**
     * Bulk create questions with their options
     */
    public async bulkCreateQuestions(payload: BulkCreateQuestionsInputType) {
        const data = await bulkCreateQuestionsInput.parseAsync(payload)
        await this.verifyQuizOwnership(data.formId, data.userId)

        let startOrder = await this.getNextOrder(data.formId)
        const createdIds: string[] = []

        await db.transaction(async (tx: any) => {
            for (const qData of data.questions) {
                const [question] = await tx.insert(quizQuestionsTable).values({
                    formId: data.formId,
                    question: qData.question,
                    questionType: qData.questionType,
                    marks: qData.marks,
                    negativeMarks: qData.negativeMarks,
                    explanation: qData.explanation ?? null,
                    order: startOrder++,
                    difficulty: qData.difficulty,
                    category: qData.category ?? null,
                    tags: qData.tags ?? null,
                    acceptedAnswers: qData.acceptedAnswers ?? null,
                }).returning({ id: quizQuestionsTable.id })

                if (!question) throw new Error("Failed to create question in bulk")

                createdIds.push(question.id)

                if (qData.options && qData.options.length > 0) {
                    await tx.insert(quizOptionsTable).values(
                        qData.options.map((opt, idx) => ({
                            questionId: question.id,
                            optionText: opt.optionText,
                            isCorrect: opt.isCorrect,
                            order: opt.order ?? idx,
                        }))
                    )
                }
            }
        })

        return { questionIds: createdIds, count: createdIds.length }
    }
}

export default QuizQuestionService
