import { z } from "zod"

const questionTypeValues = ["MCQ", "MULTIPLE_SELECT", "TRUE_FALSE", "SHORT_ANSWER", "FILL_BLANK"] as const
const difficultyValues = ["EASY", "MEDIUM", "HARD"] as const

const bankOptionInput = z.object({
    optionText: z.string().min(1).max(500).describe("Option text"),
    isCorrect: z.boolean().default(false).describe("Whether this option is correct"),
})

// --- Create Bank Item ---

export const createBankItemInput = z.object({
    ownerId: z.string().uuid().describe("UUID of the owning user"),
    question: z.string().min(1).max(2000).describe("Question text"),
    questionType: z.enum(questionTypeValues).default("MCQ").describe("Type of question"),
    marks: z.number().int().min(0).default(1).describe("Default marks"),
    negativeMarks: z.number().int().min(0).default(0).describe("Default negative marks"),
    explanation: z.string().max(2000).optional().nullable().describe("Explanation"),
    difficulty: z.enum(difficultyValues).default("MEDIUM").describe("Difficulty level"),
    category: z.string().max(100).optional().nullable().describe("Category"),
    tags: z.array(z.string()).optional().nullable().describe("Tags"),
    acceptedAnswers: z.array(z.string()).optional().nullable().describe("Accepted answers for SHORT_ANSWER/FILL_BLANK"),
    options: z.array(bankOptionInput).optional().default([]).describe("Options (embedded for bank items)"),
})

export type CreateBankItemInputType = z.infer<typeof createBankItemInput>

// --- Update Bank Item ---

export const updateBankItemInput = z.object({
    id: z.string().uuid().describe("UUID of the bank item"),
    ownerId: z.string().uuid().describe("UUID of the owning user"),
    question: z.string().min(1).max(2000).optional().describe("Updated question text"),
    questionType: z.enum(questionTypeValues).optional().describe("Updated type"),
    marks: z.number().int().min(0).optional().describe("Updated marks"),
    negativeMarks: z.number().int().min(0).optional().describe("Updated negative marks"),
    explanation: z.string().max(2000).optional().nullable().describe("Updated explanation"),
    difficulty: z.enum(difficultyValues).optional().describe("Updated difficulty"),
    category: z.string().max(100).optional().nullable().describe("Updated category"),
    tags: z.array(z.string()).optional().nullable().describe("Updated tags"),
    acceptedAnswers: z.array(z.string()).optional().nullable().describe("Updated accepted answers"),
    options: z.array(bankOptionInput).optional().describe("Updated options"),
})

export type UpdateBankItemInputType = z.infer<typeof updateBankItemInput>

// --- Delete Bank Item ---

export const deleteBankItemInput = z.object({
    id: z.string().uuid().describe("UUID of the bank item"),
    ownerId: z.string().uuid().describe("UUID of the owning user"),
})

export type DeleteBankItemInputType = z.infer<typeof deleteBankItemInput>

// --- List Bank Items ---

export const listBankItemsInput = z.object({
    ownerId: z.string().uuid().describe("UUID of the owning user"),
    category: z.string().max(100).optional().nullable().describe("Filter by category"),
    difficulty: z.enum(difficultyValues).optional().nullable().describe("Filter by difficulty"),
    questionType: z.enum(questionTypeValues).optional().nullable().describe("Filter by question type"),
    search: z.string().max(200).optional().nullable().describe("Search in question text"),
    limit: z.number().int().min(1).max(100).default(50).describe("Page size"),
    offset: z.number().int().min(0).default(0).describe("Pagination offset"),
})

export type ListBankItemsInputType = z.infer<typeof listBankItemsInput>

// --- Add Bank Item to Quiz ---

export const addBankItemToQuizInput = z.object({
    bankItemId: z.string().uuid().describe("UUID of the bank item"),
    formId: z.string().uuid().describe("UUID of the quiz form"),
    userId: z.string().uuid().describe("UUID of the owning user"),
})

export type AddBankItemToQuizInputType = z.infer<typeof addBankItemToQuizInput>
