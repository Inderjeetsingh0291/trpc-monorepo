import { db, eq, and, count, asc, desc, ilike } from "@repo/database"
import { questionBankTable } from "@repo/database/models/question-bank"
import { formsTable } from "@repo/database/models/form"
import { quizQuestionsTable } from "@repo/database/models/quiz-question"
import { quizOptionsTable } from "@repo/database/models/quiz-option"
import {
    type CreateBankItemInputType, createBankItemInput,
    type UpdateBankItemInputType, updateBankItemInput,
    type DeleteBankItemInputType, deleteBankItemInput,
    type ListBankItemsInputType, listBankItemsInput,
    type AddBankItemToQuizInputType, addBankItemToQuizInput,
} from "./model"

class QuestionBankService {

    /**
     * Create a new question bank item
     */
    public async createBankItem(payload: CreateBankItemInputType) {
        const data = await createBankItemInput.parseAsync(payload)

        const [item] = await db.insert(questionBankTable).values({
            ownerId: data.ownerId,
            question: data.question,
            questionType: data.questionType,
            marks: data.marks,
            negativeMarks: data.negativeMarks,
            explanation: data.explanation ?? null,
            difficulty: data.difficulty,
            category: data.category ?? null,
            tags: data.tags ?? null,
            acceptedAnswers: data.acceptedAnswers ?? null,
            options: data.options ?? [],
        }).returning({
            id: questionBankTable.id,
        })

        if (!item) throw new Error("Failed to create question bank item.")

        return { id: item.id }
    }

    /**
     * Update a question bank item
     */
    public async updateBankItem(payload: UpdateBankItemInputType) {
        const data = await updateBankItemInput.parseAsync(payload)

        const updateValues: Partial<typeof questionBankTable.$inferInsert> = {}
        if (data.question !== undefined) updateValues.question = data.question
        if (data.questionType !== undefined) updateValues.questionType = data.questionType
        if (data.marks !== undefined) updateValues.marks = data.marks
        if (data.negativeMarks !== undefined) updateValues.negativeMarks = data.negativeMarks
        if (data.explanation !== undefined) updateValues.explanation = data.explanation ?? null
        if (data.difficulty !== undefined) updateValues.difficulty = data.difficulty
        if (data.category !== undefined) updateValues.category = data.category ?? null
        if (data.tags !== undefined) updateValues.tags = data.tags ?? null
        if (data.acceptedAnswers !== undefined) updateValues.acceptedAnswers = data.acceptedAnswers ?? null
        if (data.options !== undefined) updateValues.options = data.options

        const [updated] = await db.update(questionBankTable)
            .set(updateValues)
            .where(and(
                eq(questionBankTable.id, data.id),
                eq(questionBankTable.ownerId, data.ownerId)
            ))
            .returning({ id: questionBankTable.id })

        if (!updated) throw new Error("Question bank item not found or you are not authorized.")

        return { id: updated.id }
    }

    /**
     * Delete a question bank item
     */
    public async deleteBankItem(payload: DeleteBankItemInputType) {
        const { id, ownerId } = await deleteBankItemInput.parseAsync(payload)

        const [deleted] = await db.delete(questionBankTable)
            .where(and(
                eq(questionBankTable.id, id),
                eq(questionBankTable.ownerId, ownerId)
            ))
            .returning({ id: questionBankTable.id })

        if (!deleted) throw new Error("Question bank item not found or you are not authorized.")

        return { success: true, id: deleted.id }
    }

    /**
     * List bank items with filtering and pagination
     */
    public async listBankItems(payload: ListBankItemsInputType) {
        const data = await listBankItemsInput.parseAsync(payload)

        // Build where conditions
        const conditions: any[] = [eq(questionBankTable.ownerId, data.ownerId)]

        if (data.category) {
            conditions.push(eq(questionBankTable.category, data.category))
        }
        if (data.difficulty) {
            conditions.push(eq(questionBankTable.difficulty, data.difficulty))
        }
        if (data.questionType) {
            conditions.push(eq(questionBankTable.questionType, data.questionType))
        }
        if (data.search) {
            conditions.push(ilike(questionBankTable.question, `%${data.search}%`))
        }

        const whereClause = conditions.length === 1
            ? conditions[0]
            : and(...conditions)

        // Get items
        const items = await db.select()
            .from(questionBankTable)
            .where(whereClause)
            .orderBy(desc(questionBankTable.createdAt))
            .limit(data.limit)
            .offset(data.offset)

        // Get total count
        const [totalRow] = await db.select({ count: count() })
            .from(questionBankTable)
            .where(whereClause)

        return {
            items,
            total: totalRow?.count ?? 0,
        }
    }

    /**
     * Copy a bank item into a quiz as a quiz_question + quiz_options.
     * The item is COPIED (not linked) for stability.
     */
    public async addBankItemToQuiz(payload: AddBankItemToQuizInputType) {
        const { bankItemId, formId, userId } = await addBankItemToQuizInput.parseAsync(payload)

        // 1. Verify quiz ownership
        const [form] = await db.select({
            createdBy: formsTable.createdBy,
            type: formsTable.type,
        })
        .from(formsTable)
        .where(eq(formsTable.id, formId))

        if (!form) throw new Error("Quiz not found.")
        if (form.type !== "quiz") throw new Error("This is not a quiz.")
        if (form.createdBy !== userId) throw new Error("You are not authorized to modify this quiz.")

        // 2. Get the bank item
        const [bankItem] = await db.select()
            .from(questionBankTable)
            .where(and(
                eq(questionBankTable.id, bankItemId),
                eq(questionBankTable.ownerId, userId)
            ))

        if (!bankItem) throw new Error("Question bank item not found.")

        // 3. Get next order index
        const [countRow] = await db.select({ count: count() })
            .from(quizQuestionsTable)
            .where(eq(quizQuestionsTable.formId, formId))

        const nextOrder = (countRow?.count ?? 0) + 1

        // 4. Create quiz question from bank item
        const result = await db.transaction(async (tx: any) => {
            const [question] = await tx.insert(quizQuestionsTable).values({
                formId,
                question: bankItem.question,
                questionType: bankItem.questionType,
                marks: bankItem.marks,
                negativeMarks: bankItem.negativeMarks,
                explanation: bankItem.explanation,
                order: nextOrder,
                difficulty: bankItem.difficulty,
                category: bankItem.category,
                tags: bankItem.tags,
                acceptedAnswers: bankItem.acceptedAnswers,
            }).returning({ id: quizQuestionsTable.id })

            if (!question) throw new Error("Failed to add bank item to quiz.")

            // 5. Create options from bank item's embedded options
            const bankOptions = (bankItem.options ?? []) as Array<{ optionText: string; isCorrect: boolean }>
            if (bankOptions.length > 0) {
                await tx.insert(quizOptionsTable).values(
                    bankOptions.map((opt, idx) => ({
                        questionId: question.id,
                        optionText: opt.optionText,
                        isCorrect: opt.isCorrect,
                        order: idx,
                    }))
                )
            }

            return { questionId: question.id }
        })

        return result
    }
}

export default QuestionBankService
