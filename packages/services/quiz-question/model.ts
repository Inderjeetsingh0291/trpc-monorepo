import { z } from "zod"

const questionTypeValues = ["MCQ", "MULTIPLE_SELECT", "TRUE_FALSE", "SHORT_ANSWER", "FILL_BLANK"] as const
const difficultyValues = ["EASY", "MEDIUM", "HARD"] as const

// --- Option Schema (used within question create/update) ---

const optionInput = z.object({
    id: z.string().uuid().optional().describe("UUID of existing option (for updates)"),
    optionText: z.string().min(1).max(500).describe("Option text"),
    isCorrect: z.boolean().default(false).describe("Whether this option is correct"),
    order: z.number().int().min(0).default(0).describe("Display order"),
})

// --- Create Question ---

export const createQuestionInput = z.object({
    formId: z.string().uuid().describe("UUID of the quiz form"),
    userId: z.string().uuid().describe("UUID of the owning user"),
    question: z.string().min(1).max(2000).describe("Question text"),
    questionType: z.enum(questionTypeValues).default("MCQ").describe("Type of question"),
    marks: z.number().int().min(0).default(1).describe("Marks for correct answer"),
    negativeMarks: z.number().int().min(0).default(0).describe("Negative marks for wrong answer"),
    explanation: z.string().max(2000).optional().nullable().describe("Explanation for correct answer"),
    difficulty: z.enum(difficultyValues).default("MEDIUM").describe("Difficulty level"),
    category: z.string().max(100).optional().nullable().describe("Question category"),
    tags: z.array(z.string()).optional().nullable().describe("Question tags"),
    acceptedAnswers: z.array(z.string()).optional().nullable().describe("Accepted answers for SHORT_ANSWER/FILL_BLANK"),
    options: z.array(optionInput).optional().default([]).describe("Options for MCQ/MULTIPLE_SELECT/TRUE_FALSE"),
})

export type CreateQuestionInputType = z.infer<typeof createQuestionInput>

// --- Update Question ---

export const updateQuestionInput = z.object({
    questionId: z.string().uuid().describe("UUID of the question to update"),
    userId: z.string().uuid().describe("UUID of the owning user"),
    question: z.string().min(1).max(2000).optional().describe("Updated question text"),
    questionType: z.enum(questionTypeValues).optional().describe("Updated type"),
    marks: z.number().int().min(0).optional().describe("Updated marks"),
    negativeMarks: z.number().int().min(0).optional().describe("Updated negative marks"),
    explanation: z.string().max(2000).optional().nullable().describe("Updated explanation"),
    difficulty: z.enum(difficultyValues).optional().describe("Updated difficulty"),
    category: z.string().max(100).optional().nullable().describe("Updated category"),
    tags: z.array(z.string()).optional().nullable().describe("Updated tags"),
    acceptedAnswers: z.array(z.string()).optional().nullable().describe("Updated accepted answers"),
    options: z.array(optionInput).optional().describe("Full replacement of options"),
})

export type UpdateQuestionInputType = z.infer<typeof updateQuestionInput>

// --- Delete Question ---

export const deleteQuestionInput = z.object({
    questionId: z.string().uuid().describe("UUID of the question to delete"),
    userId: z.string().uuid().describe("UUID of the owning user"),
})

export type DeleteQuestionInputType = z.infer<typeof deleteQuestionInput>

// --- Duplicate Question ---

export const duplicateQuestionInput = z.object({
    questionId: z.string().uuid().describe("UUID of the question to duplicate"),
    userId: z.string().uuid().describe("UUID of the owning user"),
})

export type DuplicateQuestionInputType = z.infer<typeof duplicateQuestionInput>

// --- Reorder Questions ---

export const reorderQuestionsInput = z.object({
    formId: z.string().uuid().describe("UUID of the quiz form"),
    userId: z.string().uuid().describe("UUID of the owning user"),
    questionIds: z.array(z.string().uuid()).describe("Ordered array of question IDs"),
})

export type ReorderQuestionsInputType = z.infer<typeof reorderQuestionsInput>

// --- Get Questions By Quiz ---

export const getQuestionsByQuizIdInput = z.object({
    formId: z.string().uuid().describe("UUID of the quiz form"),
})

export type GetQuestionsByQuizIdInputType = z.infer<typeof getQuestionsByQuizIdInput>

// --- Bulk Create Questions ---

export const bulkCreateQuestionsInput = z.object({
    formId: z.string().uuid().describe("UUID of the quiz form"),
    userId: z.string().uuid().describe("UUID of the owning user"),
    questions: z.array(z.object({
        question: z.string().min(1).max(2000).describe("Question text"),
        questionType: z.enum(questionTypeValues).default("MCQ"),
        marks: z.number().int().min(0).default(1),
        negativeMarks: z.number().int().min(0).default(0),
        explanation: z.string().max(2000).optional().nullable(),
        difficulty: z.enum(difficultyValues).default("MEDIUM"),
        category: z.string().max(100).optional().nullable(),
        tags: z.array(z.string()).optional().nullable(),
        acceptedAnswers: z.array(z.string()).optional().nullable(),
        options: z.array(optionInput).optional().default([]),
    })).describe("Array of questions to create"),
})

export type BulkCreateQuestionsInputType = z.infer<typeof bulkCreateQuestionsInput>
