import { z } from "zod"

// --- Create Quiz ---

export const createQuizInput = z.object({
    title: z.string().min(1).max(255).describe("Title of the quiz"),
    description: z.string().max(1000).optional().describe("Description of the quiz"),
    createdBy: z.string().uuid().describe("UUID of the user creating the quiz"),
    // Quiz settings defaults
    timeLimitMinutes: z.number().int().positive().optional().nullable().describe("Time limit in minutes"),
    maxAttempts: z.number().int().positive().default(1).describe("Maximum attempts allowed"),
    passingScore: z.number().int().min(0).max(100).default(50).describe("Passing score percentage"),
    showResultImmediately: z.boolean().default(true).describe("Show result right after submission"),
    resultsPublished: z.boolean().default(true).describe("Whether results are published to participants"),
    showCorrectAnswers: z.boolean().default(true).describe("Show correct answers in results"),
    shuffleQuestions: z.boolean().default(false).describe("Randomize question order"),
    shuffleOptions: z.boolean().default(false).describe("Randomize option order"),
    enableLeaderboard: z.boolean().default(true).describe("Enable public leaderboard"),
    accessCode: z.string().max(50).optional().nullable().describe("Access code to take the quiz"),
    allowGuests: z.boolean().default(true).describe("Allow unauthenticated users"),
    difficultyDistribution: z.record(z.string(), z.number()).optional().nullable().describe("Difficulty distribution config"),
})

export type CreateQuizInputType = z.infer<typeof createQuizInput>

// --- Update Quiz ---

export const updateQuizInput = z.object({
    formId: z.string().uuid().describe("UUID of the quiz form to update"),
    userId: z.string().uuid().describe("UUID of the owning user"),
    title: z.string().min(1).max(255).optional().describe("Updated title"),
    description: z.string().max(1000).optional().nullable().describe("Updated description"),
})

export type UpdateQuizInputType = z.infer<typeof updateQuizInput>

// --- Delete Quiz ---

export const deleteQuizInput = z.object({
    formId: z.string().uuid().describe("UUID of the quiz form to delete"),
    userId: z.string().uuid().describe("UUID of the owning user"),
})

export type DeleteQuizInputType = z.infer<typeof deleteQuizInput>

// --- Get Quiz By Id ---

export const getQuizByIdInput = z.object({
    formId: z.string().uuid().describe("UUID of the quiz form to retrieve"),
})

export type GetQuizByIdInputType = z.infer<typeof getQuizByIdInput>

// --- List Quizzes By User ---

export const listQuizzesByUserIdInput = z.object({
    userId: z.string().uuid().describe("UUID of the user whose quizzes to list"),
})

export type ListQuizzesByUserIdInputType = z.infer<typeof listQuizzesByUserIdInput>

// --- Publish / Unpublish ---

export const publishQuizInput = z.object({
    formId: z.string().uuid().describe("UUID of the quiz form"),
    userId: z.string().uuid().describe("UUID of the owning user"),
    visibility: z.enum(["public", "unlisted"]).optional().default("public").describe("Visibility when publishing"),
})

export type PublishQuizInputType = z.infer<typeof publishQuizInput>

export const unpublishQuizInput = z.object({
    formId: z.string().uuid().describe("UUID of the quiz form"),
    userId: z.string().uuid().describe("UUID of the owning user"),
})

export type UnpublishQuizInputType = z.infer<typeof unpublishQuizInput>

// --- Update Quiz Settings ---

export const updateQuizSettingsInput = z.object({
    formId: z.string().uuid().describe("UUID of the quiz form"),
    userId: z.string().uuid().describe("UUID of the owning user"),
    timeLimitMinutes: z.number().int().positive().optional().nullable().describe("Time limit in minutes"),
    maxAttempts: z.number().int().positive().optional().describe("Maximum attempts allowed"),
    passingScore: z.number().int().min(0).max(100).optional().describe("Passing score percentage"),
    showResultImmediately: z.boolean().optional().describe("Show result right after submission"),
    resultsPublished: z.boolean().optional().describe("Whether results are published to participants"),
    resultsPublishedAt: z.coerce.date().optional().nullable().describe("Timestamp when results were published"),
    showCorrectAnswers: z.boolean().optional().describe("Show correct answers in results"),
    shuffleQuestions: z.boolean().optional().describe("Randomize question order"),
    shuffleOptions: z.boolean().optional().describe("Randomize option order"),
    enableLeaderboard: z.boolean().optional().describe("Enable public leaderboard"),
    accessCode: z.string().max(50).optional().nullable().describe("Access code to take the quiz"),
    allowGuests: z.boolean().optional().describe("Allow unauthenticated users"),
    questionsToShow: z.number().int().positive().optional().nullable().describe("Number of random questions to show"),
    difficultyDistribution: z.record(z.string(), z.number()).optional().nullable().describe("Difficulty distribution config"),
})

export type UpdateQuizSettingsInputType = z.infer<typeof updateQuizSettingsInput>

// --- Publish / Unpublish Quiz Results ---

export const publishQuizResultsInput = z.object({
    formId: z.string().uuid().describe("UUID of the quiz form"),
    userId: z.string().uuid().describe("UUID of the owning user"),
    published: z.boolean().default(true).describe("Whether results should be published"),
})

export type PublishQuizResultsInputType = z.infer<typeof publishQuizResultsInput>

