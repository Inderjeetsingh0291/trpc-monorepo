import { z } from "zod"

// --- Get Quiz Analytics ---

export const getQuizAnalyticsInput = z.object({
    formId: z.string().uuid().describe("UUID of the quiz form"),
    userId: z.string().uuid().describe("UUID of the owning user"),
})

export type GetQuizAnalyticsInputType = z.infer<typeof getQuizAnalyticsInput>

// --- Get Question Analytics ---

export const getQuestionAnalyticsInput = z.object({
    formId: z.string().uuid().describe("UUID of the quiz form"),
    userId: z.string().uuid().describe("UUID of the owning user"),
})

export type GetQuestionAnalyticsInputType = z.infer<typeof getQuestionAnalyticsInput>

// --- Get Leaderboard ---

export const getLeaderboardInput = z.object({
    formId: z.string().uuid().describe("UUID of the quiz form"),
    limit: z.number().int().min(1).max(100).default(50).describe("Number of entries to return"),
    offset: z.number().int().min(0).default(0).describe("Offset for pagination"),
})

export type GetLeaderboardInputType = z.infer<typeof getLeaderboardInput>

// --- Export CSV ---

export const exportCSVInput = z.object({
    formId: z.string().uuid().describe("UUID of the quiz form"),
    userId: z.string().uuid().describe("UUID of the owning user"),
})

export type ExportCSVInputType = z.infer<typeof exportCSVInput>
