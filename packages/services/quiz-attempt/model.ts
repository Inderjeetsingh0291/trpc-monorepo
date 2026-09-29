import { z } from "zod"

// --- Start Attempt ---

export const startAttemptInput = z.object({
    formId: z.string().uuid().describe("UUID of the quiz form"),
    participantName: z.string().min(1).max(100).describe("Name of the participant"),
    participantEmail: z.string().email().max(255).describe("Email of the participant (required)"),
    userId: z.string().uuid().optional().nullable().describe("UUID of authenticated user (if logged in)"),
    accessCode: z.string().max(50).optional().nullable().describe("Access code for protected quizzes"),
})

export type StartAttemptInputType = z.infer<typeof startAttemptInput>

// --- Get Previous Attempts by Email ---

export const getPreviousAttemptsInput = z.object({
    formId: z.string().uuid().describe("UUID of the quiz form"),
    participantEmail: z.string().email().max(255).describe("Email to look up previous attempts"),
})

export type GetPreviousAttemptsInputType = z.infer<typeof getPreviousAttemptsInput>



// --- Save Answer ---

export const saveAnswerInput = z.object({
    attemptId: z.string().uuid().describe("UUID of the active attempt"),
    questionId: z.string().uuid().describe("UUID of the question being answered"),
    selectedOptionIds: z.array(z.string().uuid()).optional().default([]).describe("Selected option IDs for MCQ/MULTIPLE_SELECT/TRUE_FALSE"),
    textAnswer: z.string().max(2000).optional().nullable().describe("Text answer for SHORT_ANSWER/FILL_BLANK"),
})

export type SaveAnswerInputType = z.infer<typeof saveAnswerInput>

// --- Submit Attempt ---

export const submitAttemptInput = z.object({
    attemptId: z.string().uuid().describe("UUID of the attempt to submit"),
})

export type SubmitAttemptInputType = z.infer<typeof submitAttemptInput>

// --- Get Attempt ---

export const getAttemptInput = z.object({
    attemptId: z.string().uuid().describe("UUID of the attempt to retrieve"),
})

export type GetAttemptInputType = z.infer<typeof getAttemptInput>

// --- Get Result ---

export const getResultInput = z.object({
    attemptId: z.string().uuid().describe("UUID of the attempt to get results for"),
})

export type GetResultInputType = z.infer<typeof getResultInput>
