import { z } from "zod"

// ==============================
// Shared Enums
// ==============================

const questionTypeValues = ["MCQ", "MULTIPLE_SELECT", "TRUE_FALSE", "SHORT_ANSWER", "FILL_BLANK"] as const
const difficultyValues = ["EASY", "MEDIUM", "HARD"] as const
const visibilityValues = ["public", "unlisted"] as const
const attemptStatusValues = ["IN_PROGRESS", "SUBMITTED", "EXPIRED"] as const

// ==============================
// Option Schema
// ==============================

const optionInputModel = z.object({
    id: z.string().uuid().optional().describe("UUID of existing option (for updates)"),
    optionText: z.string().min(1).max(500).describe("Option text"),
    isCorrect: z.boolean().default(false).describe("Whether this option is correct"),
    order: z.number().int().min(0).default(0).describe("Display order"),
})

const optionOutputModel = z.object({
    id: z.string().describe("Option ID"),
    optionText: z.string().describe("Option text"),
    isCorrect: z.boolean().describe("Whether correct"),
    order: z.number().int().describe("Display order"),
    createdAt: z.coerce.date().nullable().optional(),
    updatedAt: z.coerce.date().nullable().optional(),
})

const optionPublicModel = z.object({
    id: z.string().describe("Option ID"),
    optionText: z.string().describe("Option text"),
    order: z.number().int().describe("Display order"),
})

// ==============================
// Quiz CRUD Models
// ==============================

export const createQuizInputModel = z.object({
    title: z.string().min(1).max(255).describe("Quiz title"),
    description: z.string().max(1000).optional().describe("Quiz description"),
    timeLimitMinutes: z.number().int().positive().optional().nullable().describe("Time limit in minutes"),
    maxAttempts: z.number().int().positive().default(1).describe("Maximum attempts"),
    passingScore: z.number().int().min(0).max(100).default(50).describe("Passing score %"),
    showResultImmediately: z.boolean().default(true),
    resultsPublished: z.boolean().default(true),
    showCorrectAnswers: z.boolean().default(true),
    shuffleQuestions: z.boolean().default(false),
    shuffleOptions: z.boolean().default(false),
    enableLeaderboard: z.boolean().default(true),
    accessCode: z.string().max(50).optional().nullable(),
    allowGuests: z.boolean().default(true),
})

export const createQuizOutputModel = z.object({
    formId: z.string().describe("UUID of created quiz form"),
})

export const updateQuizInputModel = z.object({
    formId: z.string().uuid().describe("UUID of the quiz to update"),
    title: z.string().min(1).max(255).optional(),
    description: z.string().max(1000).optional().nullable(),
})

export const updateQuizOutputModel = z.object({
    formId: z.string(),
    title: z.string(),
})

export const deleteQuizInputModel = z.object({
    formId: z.string().uuid().describe("UUID of the quiz to delete"),
})

export const deleteQuizOutputModel = z.object({
    deletedFormId: z.string(),
})

// ==============================
// Quiz Get/List Models
// ==============================

const questionOutputModel = z.object({
    id: z.string(),
    formId: z.string(),
    question: z.string(),
    questionType: z.enum(questionTypeValues),
    marks: z.number().int(),
    negativeMarks: z.number().int(),
    explanation: z.string().nullable().optional(),
    order: z.number().int(),
    difficulty: z.enum(difficultyValues),
    category: z.string().nullable().optional(),
    tags: z.array(z.string()).nullable().optional(),
    acceptedAnswers: z.array(z.string()).nullable().optional(),
    createdAt: z.coerce.date().nullable().optional(),
    updatedAt: z.coerce.date().nullable().optional(),
    options: z.array(optionOutputModel),
})

const settingsOutputModel = z.object({
    id: z.string(),
    formId: z.string(),
    timeLimitMinutes: z.number().int().nullable(),
    maxAttempts: z.number().int(),
    passingScore: z.number().int(),
    showResultImmediately: z.boolean(),
    resultsPublished: z.boolean().optional(),
    resultsPublishedAt: z.coerce.date().nullable().optional(),
    showCorrectAnswers: z.boolean(),
    shuffleQuestions: z.boolean(),
    shuffleOptions: z.boolean(),
    enableLeaderboard: z.boolean(),
    accessCode: z.string().nullable().optional(),
    allowGuests: z.boolean(),
    questionsToShow: z.number().int().nullable().optional(),
    difficultyDistribution: z.any().nullable().optional(),
    createdAt: z.coerce.date().nullable().optional(),
    updatedAt: z.coerce.date().nullable().optional(),
})

export const getQuizByIdInputModel = z.object({
    formId: z.string().uuid().describe("UUID of the quiz to retrieve"),
})

export const getQuizByIdOutputModel = z.object({
    quiz: z.object({
        id: z.string(),
        title: z.string(),
        description: z.string().nullable(),
        type: z.string(),
        isActive: z.boolean().nullable(),
        visibility: z.enum(visibilityValues),
        createdBy: z.string().nullable(),
        createdAt: z.coerce.date().nullable(),
        updatedAt: z.coerce.date().nullable(),
        settings: settingsOutputModel.nullable(),
        questions: z.array(questionOutputModel),
    }),
})

// Public quiz view (for quiz takers — no correct answers)
export const getQuizPublicInputModel = z.object({
    formId: z.string().uuid(),
})

export const getQuizPublicOutputModel = z.object({
    quiz: z.object({
        id: z.string(),
        title: z.string(),
        description: z.string().nullable(),
        isActive: z.boolean().default(true),
        settings: z.object({
            timeLimitMinutes: z.number().int().nullable(),
            maxAttempts: z.number().int(),
            shuffleQuestions: z.boolean(),
            shuffleOptions: z.boolean(),
            enableLeaderboard: z.boolean(),
            allowGuests: z.boolean(),
            questionsToShow: z.number().int().nullable().optional(),
            accessCode: z.boolean(), // true/false only
        }).nullable(),
        questionCount: z.number().int(),
        questions: z.array(z.object({
            id: z.string(),
            question: z.string(),
            questionType: z.enum(questionTypeValues),
            marks: z.number().int(),
            order: z.number().int(),
            options: z.array(optionPublicModel),
        })),
    }),
})

export const listQuizzesInputModel = z.void().describe("No input required")

export const listQuizzesOutputModel = z.object({
    quizzes: z.array(z.object({
        id: z.string(),
        title: z.string(),
        description: z.string().nullable(),
        isActive: z.boolean().nullable(),
        visibility: z.enum(visibilityValues),
        createdAt: z.coerce.date().nullable(),
        questionCount: z.number().int(),
    })),
})

// ==============================
// Publish/Unpublish Models
// ==============================

export const publishQuizInputModel = z.object({
    formId: z.string().uuid(),
    visibility: z.enum(visibilityValues).optional().default("public"),
})

export const publishQuizOutputModel = z.object({
    formId: z.string(),
    isActive: z.boolean().nullable(),
    visibility: z.enum(visibilityValues),
})

export const unpublishQuizInputModel = z.object({
    formId: z.string().uuid(),
})

export const unpublishQuizOutputModel = z.object({
    formId: z.string(),
    isActive: z.boolean().nullable(),
})

// ==============================
// Quiz Settings Models
// ==============================

export const updateQuizSettingsInputModel = z.object({
    formId: z.string().uuid(),
    timeLimitMinutes: z.number().int().positive().optional().nullable(),
    maxAttempts: z.number().int().positive().optional(),
    passingScore: z.number().int().min(0).max(100).optional(),
    showResultImmediately: z.boolean().optional(),
    resultsPublished: z.boolean().optional(),
    resultsPublishedAt: z.coerce.date().nullable().optional(),
    showCorrectAnswers: z.boolean().optional(),
    shuffleQuestions: z.boolean().optional(),
    shuffleOptions: z.boolean().optional(),
    enableLeaderboard: z.boolean().optional(),
    accessCode: z.string().max(50).optional().nullable(),
    allowGuests: z.boolean().optional(),
    questionsToShow: z.number().int().positive().optional().nullable(),
    difficultyDistribution: z.record(z.string(), z.number()).optional().nullable(),
})

export const updateQuizSettingsOutputModel = z.object({
    success: z.boolean(),
})

export const publishResultsInputModel = z.object({
    formId: z.string().uuid(),
    published: z.boolean().default(true),
})

export const publishResultsOutputModel = z.object({
    success: z.boolean(),
    published: z.boolean(),
})

// ==============================
// Question CRUD Models
// ==============================

export const createQuestionInputModel = z.object({
    formId: z.string().uuid(),
    question: z.string().min(1).max(2000),
    questionType: z.enum(questionTypeValues).default("MCQ"),
    marks: z.number().int().min(0).default(1),
    negativeMarks: z.number().int().min(0).default(0),
    explanation: z.string().max(2000).optional().nullable(),
    difficulty: z.enum(difficultyValues).default("MEDIUM"),
    category: z.string().max(100).optional().nullable(),
    tags: z.array(z.string()).optional().nullable(),
    acceptedAnswers: z.array(z.string()).optional().nullable(),
    options: z.array(optionInputModel).optional().default([]),
})

export const createQuestionOutputModel = z.object({
    questionId: z.string(),
})

export const updateQuestionInputModel = z.object({
    questionId: z.string().uuid(),
    question: z.string().min(1).max(2000).optional(),
    questionType: z.enum(questionTypeValues).optional(),
    marks: z.number().int().min(0).optional(),
    negativeMarks: z.number().int().min(0).optional(),
    explanation: z.string().max(2000).optional().nullable(),
    difficulty: z.enum(difficultyValues).optional(),
    category: z.string().max(100).optional().nullable(),
    tags: z.array(z.string()).optional().nullable(),
    acceptedAnswers: z.array(z.string()).optional().nullable(),
    options: z.array(optionInputModel).optional(),
})

export const updateQuestionOutputModel = z.object({
    questionId: z.string(),
})

export const deleteQuestionInputModel = z.object({
    questionId: z.string().uuid(),
})

export const deleteQuestionOutputModel = z.object({
    success: z.boolean(),
    questionId: z.string(),
})

export const duplicateQuestionInputModel = z.object({
    questionId: z.string().uuid(),
})

export const duplicateQuestionOutputModel = z.object({
    questionId: z.string(),
})

export const reorderQuestionsInputModel = z.object({
    formId: z.string().uuid(),
    questionIds: z.array(z.string().uuid()),
})

export const reorderQuestionsOutputModel = z.object({
    success: z.boolean(),
})

// ==============================
// Attempt Models
// ==============================

export const startAttemptInputModel = z.object({
    formId: z.string().uuid(),
    participantName: z.string().min(1).max(100),
    participantEmail: z.string().email().max(255),
    accessCode: z.string().max(50).optional().nullable(),
})

export const startAttemptOutputModel = z.object({
    attemptId: z.string(),
    startedAt: z.coerce.date(),
    expiresAt: z.coerce.date().nullable(),
    totalMarks: z.number().int(),
    questions: z.array(z.object({
        id: z.string(),
        question: z.string(),
        questionType: z.enum(questionTypeValues),
        marks: z.number().int(),
        options: z.array(optionPublicModel),
    })),
})

export const getAttemptInputModel = z.object({
    attemptId: z.string().uuid(),
})

export const getAttemptOutputModel = z.object({
    attempt: z.object({
        id: z.string(),
        formId: z.string(),
        status: z.enum(attemptStatusValues),
        startedAt: z.coerce.date(),
        expiresAt: z.coerce.date().nullable(),
        selectedQuestionIds: z.array(z.string()).nullable(),
    }),
    answers: z.array(z.object({
        id: z.string(),
        questionId: z.string(),
        selectedOptionIds: z.array(z.string()).nullable(),
        textAnswer: z.string().nullable(),
    })),
})

export const saveAnswerInputModel = z.object({
    attemptId: z.string().uuid(),
    questionId: z.string().uuid(),
    selectedOptionIds: z.array(z.string().uuid()).optional().default([]),
    textAnswer: z.string().max(2000).optional().nullable(),
})

export const saveAnswerOutputModel = z.object({
    answerId: z.string(),
    saved: z.boolean(),
})

export const submitAttemptInputModel = z.object({
    attemptId: z.string().uuid(),
})

export const submitAttemptOutputModel = z.object({
    attemptId: z.string(),
    score: z.number().int().nullable().optional(),
    totalMarks: z.number().int(),
    percentage: z.number().int().nullable().optional(),
    passed: z.boolean().nullable().optional(),
    timeTaken: z.number().int(),
    status: z.enum(attemptStatusValues),
    resultsPublished: z.boolean().optional(),
})

export const getResultInputModel = z.object({
    attemptId: z.string().uuid(),
})

export const getResultOutputModel = z.object({
    result: z.object({
        attemptId: z.string(),
        score: z.number().int().nullable().optional(),
        totalMarks: z.number().int(),
        percentage: z.number().int().nullable().optional(),
        passed: z.boolean().nullable().optional(),
        timeTaken: z.number().int(),
        status: z.enum(attemptStatusValues),
        submittedAt: z.coerce.date().nullable(),
        startedAt: z.coerce.date(),
        totalQuestions: z.number().int(),
        correct: z.number().int().nullable().optional(),
        wrong: z.number().int().nullable().optional(),
        skipped: z.number().int().nullable().optional(),
        showCorrectAnswers: z.boolean(),
        questionBreakdown: z.array(z.any()),
        resultsPublished: z.boolean().optional(),
        message: z.string().optional(),
    }),
})

// ==============================
// Previous Attempts by Email
// ==============================

export const getPreviousAttemptsInputModel = z.object({
    formId: z.string().uuid(),
    participantEmail: z.string().email().max(255),
})

export const getPreviousAttemptsOutputModel = z.object({
    attempts: z.array(z.object({
        id: z.string(),
        participantName: z.string(),
        score: z.number().int().nullable(),
        totalMarks: z.number().int(),
        percentage: z.number().int().nullable(),
        passed: z.boolean().nullable(),
        timeTaken: z.number().int(),
        status: z.enum(attemptStatusValues),
        submittedAt: z.coerce.date().nullable(),
        startedAt: z.coerce.date(),
        expiresAt: z.coerce.date().nullable(),
    })),
    resultsPublished: z.boolean(),
    totalAttempts: z.number().int(),
})

// ==============================
// Delete / Update Attempt Models (Host only)
// ==============================

export const deleteAttemptInputModel = z.object({
    attemptId: z.string().uuid(),
})

export const deleteAttemptOutputModel = z.object({
    success: z.boolean(),
    deletedAttemptId: z.string(),
})

export const updateAttemptInputModel = z.object({
    attemptId: z.string().uuid(),
    participantName: z.string().min(1).max(100).optional(),
    participantEmail: z.string().email().max(255).optional().nullable(),
    score: z.number().int().min(0).optional(),
    passed: z.boolean().optional(),
})

export const updateAttemptOutputModel = z.object({
    success: z.boolean(),
    attempt: z.object({
        id: z.string(),
        participantName: z.string(),
        participantEmail: z.string().nullable(),
        score: z.number().int(),
        totalMarks: z.number().int(),
        percentage: z.number().int(),
        passed: z.boolean(),
        status: z.enum(attemptStatusValues),
    }),
})



export const getLeaderboardInputModel = z.object({
    formId: z.string().uuid(),
    limit: z.number().int().min(1).max(100).default(50),
    offset: z.number().int().min(0).default(0),
})

export const getLeaderboardOutputModel = z.object({
    leaderboard: z.array(z.object({
        rank: z.number().int(),
        participantName: z.string(),
        score: z.number().int(),
        totalMarks: z.number().int(),
        percentage: z.number().int(),
        timeTaken: z.number().int(),
        submittedAt: z.coerce.date().nullable(),
    })),
    total: z.number().int(),
    resultsPublished: z.boolean().optional(),
})

// ==============================
// Analytics Models
// ==============================

export const getAnalyticsInputModel = z.object({
    formId: z.string().uuid(),
})

export const getAnalyticsOutputModel = z.object({
    analytics: z.object({
        totalAttempts: z.number().int(),
        submittedAttempts: z.number().int(),
        avgScore: z.number().int(),
        avgPercentage: z.number().int(),
        highestScore: z.number().int(),
        lowestScore: z.number().int(),
        avgTimeTaken: z.number().int(),
        passCount: z.number().int(),
        failCount: z.number().int(),
        passRate: z.number().int(),
        scoreDistribution: z.array(z.object({
            range: z.string(),
            count: z.number().int(),
        })),
        recentAttempts: z.array(z.object({
            score: z.number().int(),
            totalMarks: z.number().int(),
            percentage: z.number().int(),
            passed: z.boolean(),
            timeTaken: z.number().int(),
            submittedAt: z.coerce.date().nullable(),
        })),
        resultsPublished: z.boolean().optional(),
        resultsPublishedAt: z.coerce.date().nullable().optional(),
        showResultImmediately: z.boolean().optional(),
        allAttempts: z.array(z.object({
            id: z.string(),
            participantName: z.string(),
            participantEmail: z.string().nullable().optional(),
            score: z.number().int(),
            totalMarks: z.number().int(),
            percentage: z.number().int(),
            passed: z.boolean(),
            timeTaken: z.number().int(),
            status: z.string(),
            startedAt: z.coerce.date().nullable().optional(),
            submittedAt: z.coerce.date().nullable().optional(),
        })).optional(),
    }),
})

export const getQuestionAnalyticsInputModel = z.object({
    formId: z.string().uuid(),
})

export const getQuestionAnalyticsOutputModel = z.object({
    questionAnalytics: z.array(z.object({
        questionId: z.string(),
        question: z.string(),
        questionType: z.enum(questionTypeValues),
        marks: z.number().int(),
        order: z.number().int(),
        totalAnswers: z.number().int(),
        correctAnswers: z.number().int(),
        wrongAnswers: z.number().int(),
        accuracy: z.number().int(),
    })),
    mostMissed: z.array(z.object({
        questionId: z.string(),
        question: z.string(),
        questionType: z.enum(questionTypeValues),
        marks: z.number().int(),
        order: z.number().int(),
        totalAnswers: z.number().int(),
        correctAnswers: z.number().int(),
        wrongAnswers: z.number().int(),
        accuracy: z.number().int(),
    })),
})

export const exportCSVInputModel = z.object({
    formId: z.string().uuid(),
})

export const exportCSVOutputModel = z.object({
    csv: z.string(),
    count: z.number().int(),
})

// ==============================
// Question Bank Models
// ==============================

const bankOptionInputModel = z.object({
    optionText: z.string().min(1).max(500),
    isCorrect: z.boolean().default(false),
})

const bankOptionOutputModel = z.object({
    optionText: z.string(),
    isCorrect: z.boolean(),
})

export const createBankItemInputModel = z.object({
    question: z.string().min(1).max(2000),
    questionType: z.enum(questionTypeValues).default("MCQ"),
    marks: z.number().int().min(0).default(1),
    negativeMarks: z.number().int().min(0).default(0),
    explanation: z.string().max(2000).optional().nullable(),
    difficulty: z.enum(difficultyValues).default("MEDIUM"),
    category: z.string().max(100).optional().nullable(),
    tags: z.array(z.string()).optional().nullable(),
    acceptedAnswers: z.array(z.string()).optional().nullable(),
    options: z.array(bankOptionInputModel).optional().default([]),
})

export const createBankItemOutputModel = z.object({
    id: z.string(),
})

export const updateBankItemInputModel = z.object({
    id: z.string().uuid(),
    question: z.string().min(1).max(2000).optional(),
    questionType: z.enum(questionTypeValues).optional(),
    marks: z.number().int().min(0).optional(),
    negativeMarks: z.number().int().min(0).optional(),
    explanation: z.string().max(2000).optional().nullable(),
    difficulty: z.enum(difficultyValues).optional(),
    category: z.string().max(100).optional().nullable(),
    tags: z.array(z.string()).optional().nullable(),
    acceptedAnswers: z.array(z.string()).optional().nullable(),
    options: z.array(bankOptionInputModel).optional(),
})

export const updateBankItemOutputModel = z.object({
    id: z.string(),
})

export const deleteBankItemInputModel = z.object({
    id: z.string().uuid(),
})

export const deleteBankItemOutputModel = z.object({
    success: z.boolean(),
    id: z.string(),
})

export const listBankItemsInputModel = z.object({
    category: z.string().max(100).optional().nullable(),
    difficulty: z.enum(difficultyValues).optional().nullable(),
    questionType: z.enum(questionTypeValues).optional().nullable(),
    search: z.string().max(200).optional().nullable(),
    limit: z.number().int().min(1).max(100).default(50),
    offset: z.number().int().min(0).default(0),
})

export const listBankItemsOutputModel = z.object({
    items: z.array(z.object({
        id: z.string(),
        ownerId: z.string(),
        question: z.string(),
        questionType: z.enum(questionTypeValues),
        marks: z.number().int(),
        negativeMarks: z.number().int(),
        explanation: z.string().nullable().optional(),
        difficulty: z.enum(difficultyValues),
        category: z.string().nullable().optional(),
        tags: z.array(z.string()).nullable().optional(),
        acceptedAnswers: z.array(z.string()).nullable().optional(),
        options: z.array(bankOptionOutputModel).nullable().optional(),
        createdAt: z.coerce.date().nullable().optional(),
        updatedAt: z.coerce.date().nullable().optional(),
    })),
    total: z.number().int(),
})

export const addBankItemToQuizInputModel = z.object({
    bankItemId: z.string().uuid(),
    formId: z.string().uuid(),
})

export const addBankItemToQuizOutputModel = z.object({
    questionId: z.string(),
})

// ==============================
// Dashboard Stats Models
// ==============================

export const getDashboardStatsInputModel = z.void().describe("No input required")

export const getDashboardStatsOutputModel = z.object({
    totalForms: z.number(),
    activeForms: z.number(),
    totalSubmissions: z.number(),
    totalQuizzes: z.number(),
    activeQuizzes: z.number(),
    totalAttempts: z.number(),
    recentSubmissions: z.array(z.object({
        id: z.string(),
        formId: z.string(),
        formTitle: z.string(),
        createdAt: z.coerce.date().nullable(),
    })),
})
