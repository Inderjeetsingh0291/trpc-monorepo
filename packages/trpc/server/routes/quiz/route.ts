import { TRPCError } from "@trpc/server";
import { router, authenticationPocedure, publicProcedure } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { checkRateLimit, type RateLimitResult } from "../../utils/rate-limit";

/** Helper: throw a rate-limit error with retry-after hint */
function throwRateLimited(result: RateLimitResult, message: string): never {
    const retryAfterSec = Math.ceil((result.resetAt - Date.now()) / 1000);
    throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: `${message} Try again in ${retryAfterSec}s.`,
    });
}
import {
    quizService,
    quizQuestionService,
    quizAttemptService,
    quizAnalyticsService,
    questionBankService,
} from "@repo/services";

import {
    // Quiz CRUD
    createQuizInputModel, createQuizOutputModel,
    updateQuizInputModel, updateQuizOutputModel,
    deleteQuizInputModel, deleteQuizOutputModel,
    getQuizByIdInputModel, getQuizByIdOutputModel,
    getQuizPublicInputModel, getQuizPublicOutputModel,
    listQuizzesInputModel, listQuizzesOutputModel,
    // Publish / Unpublish
    publishQuizInputModel, publishQuizOutputModel,
    unpublishQuizInputModel, unpublishQuizOutputModel,
    // Settings
    updateQuizSettingsInputModel, updateQuizSettingsOutputModel,
    publishResultsInputModel, publishResultsOutputModel,
    // Questions
    createQuestionInputModel, createQuestionOutputModel,
    updateQuestionInputModel, updateQuestionOutputModel,
    deleteQuestionInputModel, deleteQuestionOutputModel,
    duplicateQuestionInputModel, duplicateQuestionOutputModel,
    reorderQuestionsInputModel, reorderQuestionsOutputModel,
    // Attempts
    startAttemptInputModel, startAttemptOutputModel,
    getAttemptInputModel, getAttemptOutputModel,
    saveAnswerInputModel, saveAnswerOutputModel,
    submitAttemptInputModel, submitAttemptOutputModel,
    getResultInputModel, getResultOutputModel,
    // Previous Attempts by Email
    getPreviousAttemptsInputModel, getPreviousAttemptsOutputModel,
    // Delete & Update Attempts (Host only)
    deleteAttemptInputModel, deleteAttemptOutputModel,
    updateAttemptInputModel, updateAttemptOutputModel,
    // Leaderboard
    getLeaderboardInputModel, getLeaderboardOutputModel,
    // Analytics
    getAnalyticsInputModel, getAnalyticsOutputModel,
    getQuestionAnalyticsInputModel, getQuestionAnalyticsOutputModel,
    exportCSVInputModel, exportCSVOutputModel,
    // Question Bank
    createBankItemInputModel, createBankItemOutputModel,
    updateBankItemInputModel, updateBankItemOutputModel,
    deleteBankItemInputModel, deleteBankItemOutputModel,
    listBankItemsInputModel, listBankItemsOutputModel,
    addBankItemToQuizInputModel, addBankItemToQuizOutputModel,
} from "./model";

const TAGS = ["Quiz"];
const getPath = generatePath("/quiz");

export const quizRouter = router({

    // ============================
    // Quiz CRUD
    // ============================

    create: authenticationPocedure.meta({
        openapi: { method: "POST", path: getPath("/create"), tags: TAGS, protect: true },
    }).input(createQuizInputModel).output(createQuizOutputModel).mutation(async ({ input, ctx }) => {
        return await quizService.createQuiz({ ...input, createdBy: ctx.user.id });
    }),

    update: authenticationPocedure.meta({
        openapi: { method: "POST", path: getPath("/update"), tags: TAGS, protect: true },
    }).input(updateQuizInputModel).output(updateQuizOutputModel).mutation(async ({ input, ctx }) => {
        return await quizService.updateQuiz({ ...input, userId: ctx.user.id });
    }),

    delete: authenticationPocedure.meta({
        openapi: { method: "DELETE", path: getPath("/delete"), tags: TAGS, protect: true },
    }).input(deleteQuizInputModel).output(deleteQuizOutputModel).mutation(async ({ input, ctx }) => {
        return await quizService.deleteQuiz({ formId: input.formId, userId: ctx.user.id });
    }),

    getById: authenticationPocedure.meta({
        openapi: { method: "GET", path: getPath("/getById"), tags: TAGS, protect: true },
    }).input(getQuizByIdInputModel).output(getQuizByIdOutputModel).query(async ({ input }) => {
        return await quizService.getQuizById(input);
    }),

    getPublic: publicProcedure.meta({
        openapi: { method: "GET", path: getPath("/getPublic"), tags: TAGS, protect: false },
    }).input(getQuizPublicInputModel).output(getQuizPublicOutputModel).query(async ({ input }) => {
        return await quizService.getQuizForTaking(input);
    }),

    list: authenticationPocedure.meta({
        openapi: { method: "GET", path: getPath("/list"), tags: TAGS, protect: true },
    }).input(listQuizzesInputModel).output(listQuizzesOutputModel).query(async ({ ctx }) => {
        return await quizService.listQuizzesByUserId({ userId: ctx.user.id });
    }),

    // ============================
    // Publish / Unpublish
    // ============================

    publish: authenticationPocedure.meta({
        openapi: { method: "POST", path: getPath("/publish"), tags: TAGS, protect: true },
    }).input(publishQuizInputModel).output(publishQuizOutputModel).mutation(async ({ input, ctx }) => {
        return await quizService.publishQuiz({ ...input, userId: ctx.user.id });
    }),

    unpublish: authenticationPocedure.meta({
        openapi: { method: "POST", path: getPath("/unpublish"), tags: TAGS, protect: true },
    }).input(unpublishQuizInputModel).output(unpublishQuizOutputModel).mutation(async ({ input, ctx }) => {
        return await quizService.unpublishQuiz({ ...input, userId: ctx.user.id });
    }),

    // ============================
    // Quiz Settings
    // ============================

    updateSettings: authenticationPocedure.meta({
        openapi: { method: "POST", path: getPath("/updateSettings"), tags: ["Quiz Settings"], protect: true },
    }).input(updateQuizSettingsInputModel).output(updateQuizSettingsOutputModel).mutation(async ({ input, ctx }) => {
        return await quizService.updateQuizSettings({ ...input, userId: ctx.user.id });
    }),

    publishResults: authenticationPocedure.meta({
        openapi: { method: "POST", path: getPath("/publishResults"), tags: ["Quiz Settings"], protect: true },
    }).input(publishResultsInputModel).output(publishResultsOutputModel).mutation(async ({ input, ctx }) => {
        return await quizService.publishResults({ ...input, userId: ctx.user.id });
    }),

    // ============================
    // Question CRUD
    // ============================

    createQuestion: authenticationPocedure.meta({
        openapi: { method: "POST", path: getPath("/createQuestion"), tags: ["Quiz Questions"], protect: true },
    }).input(createQuestionInputModel).output(createQuestionOutputModel).mutation(async ({ input, ctx }) => {
        return await quizQuestionService.createQuestion({ ...input, userId: ctx.user.id });
    }),

    updateQuestion: authenticationPocedure.meta({
        openapi: { method: "POST", path: getPath("/updateQuestion"), tags: ["Quiz Questions"], protect: true },
    }).input(updateQuestionInputModel).output(updateQuestionOutputModel).mutation(async ({ input, ctx }) => {
        return await quizQuestionService.updateQuestion({ ...input, userId: ctx.user.id });
    }),

    deleteQuestion: authenticationPocedure.meta({
        openapi: { method: "DELETE", path: getPath("/deleteQuestion"), tags: ["Quiz Questions"], protect: true },
    }).input(deleteQuestionInputModel).output(deleteQuestionOutputModel).mutation(async ({ input, ctx }) => {
        return await quizQuestionService.deleteQuestion({ ...input, userId: ctx.user.id });
    }),

    duplicateQuestion: authenticationPocedure.meta({
        openapi: { method: "POST", path: getPath("/duplicateQuestion"), tags: ["Quiz Questions"], protect: true },
    }).input(duplicateQuestionInputModel).output(duplicateQuestionOutputModel).mutation(async ({ input, ctx }) => {
        return await quizQuestionService.duplicateQuestion({ ...input, userId: ctx.user.id });
    }),

    reorderQuestions: authenticationPocedure.meta({
        openapi: { method: "POST", path: getPath("/reorderQuestions"), tags: ["Quiz Questions"], protect: true },
    }).input(reorderQuestionsInputModel).output(reorderQuestionsOutputModel).mutation(async ({ input, ctx }) => {
        return await quizQuestionService.reorderQuestions({ ...input, userId: ctx.user.id });
    }),

    // ============================
    // Attempts
    // ============================

    startAttempt: publicProcedure.meta({
        openapi: { method: "POST", path: getPath("/startAttempt"), tags: ["Quiz Attempts"], protect: false },
    }).input(startAttemptInputModel).output(startAttemptOutputModel).mutation(async ({ input, ctx }) => {
        // Rate limit per participant email (5 starts/min) + high ceiling per IP (500/min) for school/college Wi-Fi
        const ip = ctx.ip ?? "unknown";
        const emailKey = input.participantEmail.toLowerCase().trim();
        const rlEmail = checkRateLimit(`quiz-start-email:${input.formId}:${emailKey}`, { limit: 5, windowMs: 60_000 });
        if (!rlEmail.allowed) throwRateLimited(rlEmail, "Too many quiz starts for this email address. Please wait a minute.");

        const rlIp = checkRateLimit(`quiz-start-ip:${ip}`, { limit: 500, windowMs: 60_000 });
        if (!rlIp.allowed) throwRateLimited(rlIp, "Too many quiz starts from this network.");

        // Pass userId if user is authenticated (from cookie, optional)
        const userId = (ctx as any).user?.id ?? null;
        return await quizAttemptService.startAttempt({ ...input, userId });
    }),

    getAttempt: publicProcedure.meta({
        openapi: { method: "GET", path: getPath("/getAttempt"), tags: ["Quiz Attempts"], protect: false },
    }).input(getAttemptInputModel).output(getAttemptOutputModel).query(async ({ input }) => {
        return await quizAttemptService.getAttempt(input);
    }),

    saveAnswer: publicProcedure.meta({
        openapi: { method: "POST", path: getPath("/saveAnswer"), tags: ["Quiz Attempts"], protect: false },
    }).input(saveAnswerInputModel).output(saveAnswerOutputModel).mutation(async ({ input }) => {
        // Rate limit per attempt: 60 saves per minute (allows all 500 users on same Wi-Fi)
        const rl = checkRateLimit(`quiz-save:${input.attemptId}`, { limit: 60, windowMs: 60_000 });
        if (!rl.allowed) throwRateLimited(rl, "Answer save rate exceeded.");
        return await quizAttemptService.saveAnswer(input);
    }),

    submitAttempt: publicProcedure.meta({
        openapi: { method: "POST", path: getPath("/submitAttempt"), tags: ["Quiz Attempts"], protect: false },
    }).input(submitAttemptInputModel).output(submitAttemptOutputModel).mutation(async ({ input }) => {
        // Rate limit per attempt: 5 submits per minute (allows all 500 users to submit simultaneously)
        const rl = checkRateLimit(`quiz-submit:${input.attemptId}`, { limit: 5, windowMs: 60_000 });
        if (!rl.allowed) throwRateLimited(rl, "Too many submission attempts.");
        return await quizAttemptService.submitAttempt(input);
    }),

    getResult: publicProcedure.meta({
        openapi: { method: "GET", path: getPath("/getResult"), tags: ["Quiz Attempts"], protect: false },
    }).input(getResultInputModel).output(getResultOutputModel).query(async ({ input }) => {
        return await quizAttemptService.getResult(input);
    }),

    /**
     * Get all previous submitted attempts for a participant identified by email.
     * Public endpoint — called on the quiz landing page when user types their email.
     * Returns score/pass history. Respects resultsPublished flag.
     */
    getPreviousAttempts: publicProcedure.meta({
        openapi: { method: "GET", path: getPath("/getPreviousAttempts"), tags: ["Quiz Attempts"], protect: false },
    }).input(getPreviousAttemptsInputModel).output(getPreviousAttemptsOutputModel).query(async ({ input }) => {
        return await quizAttemptService.getPreviousAttempts(input);
    }),

    deleteAttempt: authenticationPocedure.meta({
        openapi: { method: "DELETE", path: getPath("/attempt/delete"), tags: ["Quiz Attempts"], protect: true },
    }).input(deleteAttemptInputModel).output(deleteAttemptOutputModel).mutation(async ({ input, ctx }) => {
        return await quizAttemptService.deleteAttempt({ ...input, userId: ctx.user.id });
    }),

    updateAttempt: authenticationPocedure.meta({
        openapi: { method: "POST", path: getPath("/attempt/update"), tags: ["Quiz Attempts"], protect: true },
    }).input(updateAttemptInputModel).output(updateAttemptOutputModel).mutation(async ({ input, ctx }) => {
        return await quizAttemptService.updateAttempt({ ...input, userId: ctx.user.id });
    }),



    getLeaderboard: publicProcedure.meta({
        openapi: { method: "GET", path: getPath("/getLeaderboard"), tags: ["Quiz Leaderboard"], protect: false },
    }).input(getLeaderboardInputModel).output(getLeaderboardOutputModel).query(async ({ input }) => {
        return await quizAnalyticsService.getLeaderboard(input);
    }),

    // ============================
    // Analytics (owner only)
    // ============================

    getAnalytics: authenticationPocedure.meta({
        openapi: { method: "GET", path: getPath("/getAnalytics"), tags: ["Quiz Analytics"], protect: true },
    }).input(getAnalyticsInputModel).output(getAnalyticsOutputModel).query(async ({ input, ctx }) => {
        return await quizAnalyticsService.getQuizAnalytics({ ...input, userId: ctx.user.id });
    }),

    getQuestionAnalytics: authenticationPocedure.meta({
        openapi: { method: "GET", path: getPath("/getQuestionAnalytics"), tags: ["Quiz Analytics"], protect: true },
    }).input(getQuestionAnalyticsInputModel).output(getQuestionAnalyticsOutputModel).query(async ({ input, ctx }) => {
        return await quizAnalyticsService.getQuestionAnalytics({ ...input, userId: ctx.user.id });
    }),

    exportCSV: authenticationPocedure.meta({
        openapi: { method: "GET", path: getPath("/exportCSV"), tags: ["Quiz Analytics"], protect: true },
    }).input(exportCSVInputModel).output(exportCSVOutputModel).query(async ({ input, ctx }) => {
        return await quizAnalyticsService.exportCSV({ ...input, userId: ctx.user.id });
    }),

    // ============================
    // Question Bank
    // ============================

    createBankItem: authenticationPocedure.meta({
        openapi: { method: "POST", path: getPath("/bank/create"), tags: ["Question Bank"], protect: true },
    }).input(createBankItemInputModel).output(createBankItemOutputModel).mutation(async ({ input, ctx }) => {
        return await questionBankService.createBankItem({ ...input, ownerId: ctx.user.id });
    }),

    updateBankItem: authenticationPocedure.meta({
        openapi: { method: "POST", path: getPath("/bank/update"), tags: ["Question Bank"], protect: true },
    }).input(updateBankItemInputModel).output(updateBankItemOutputModel).mutation(async ({ input, ctx }) => {
        return await questionBankService.updateBankItem({ ...input, ownerId: ctx.user.id });
    }),

    deleteBankItem: authenticationPocedure.meta({
        openapi: { method: "DELETE", path: getPath("/bank/delete"), tags: ["Question Bank"], protect: true },
    }).input(deleteBankItemInputModel).output(deleteBankItemOutputModel).mutation(async ({ input, ctx }) => {
        return await questionBankService.deleteBankItem({ ...input, ownerId: ctx.user.id });
    }),

    listBankItems: authenticationPocedure.meta({
        openapi: { method: "GET", path: getPath("/bank/list"), tags: ["Question Bank"], protect: true },
    }).input(listBankItemsInputModel).output(listBankItemsOutputModel).query(async ({ input, ctx }) => {
        return await questionBankService.listBankItems({ ...input, ownerId: ctx.user.id });
    }),

    addBankItemToQuiz: authenticationPocedure.meta({
        openapi: { method: "POST", path: getPath("/bank/addToQuiz"), tags: ["Question Bank"], protect: true },
    }).input(addBankItemToQuizInputModel).output(addBankItemToQuizOutputModel).mutation(async ({ input, ctx }) => {
        return await questionBankService.addBankItemToQuiz({ ...input, userId: ctx.user.id });
    }),
});
