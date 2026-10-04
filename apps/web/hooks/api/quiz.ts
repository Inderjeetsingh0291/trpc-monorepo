"use client"

import { trpc } from "~/trpc/client"

// ============================
// Quiz CRUD Hooks
// ============================

export const useCreateQuiz = () => {
    const utils = trpc.useUtils()

    const {
        mutateAsync: createQuizAsync,
        mutate: createQuiz,
        error,
        isPending,
        isError,
        isSuccess,
    } = trpc.quiz.create.useMutation({
        onSuccess: async () => {
            await utils.quiz.invalidate()
        },
    })

    return { createQuiz, createQuizAsync, error, isPending, isError, isSuccess }
}

export const useUpdateQuiz = () => {
    const utils = trpc.useUtils()

    const {
        mutateAsync: updateQuizAsync,
        mutate: updateQuiz,
        error,
        isPending,
        isError,
        isSuccess,
    } = trpc.quiz.update.useMutation({
        onSuccess: async () => {
            await utils.quiz.invalidate()
        },
    })

    return { updateQuiz, updateQuizAsync, error, isPending, isError, isSuccess }
}

export const useDeleteQuiz = () => {
    const utils = trpc.useUtils()

    const {
        mutateAsync: deleteQuizAsync,
        mutate: deleteQuiz,
        error,
        isPending,
        isError,
        isSuccess,
    } = trpc.quiz.delete.useMutation({
        onSuccess: async () => {
            await utils.quiz.invalidate()
        },
    })

    return { deleteQuiz, deleteQuizAsync, error, isPending, isError, isSuccess }
}

export const useGetQuizById = (formId: string) => {
    const { data, error, isLoading, isError, isSuccess, refetch } =
        trpc.quiz.getById.useQuery({ formId }, { enabled: !!formId })

    return { quiz: data?.quiz ?? null, error, isLoading, isError, isSuccess, refetch }
}

export const useGetQuizPublic = (formId: string) => {
    const { data, error, isLoading, isError, isSuccess, refetch, isFetching } =
        trpc.quiz.getPublic.useQuery(
            { formId },
            {
                enabled: !!formId,
                retry: false,
                staleTime: 5_000,
            }
        )

    return { quiz: data?.quiz ?? null, error, isLoading, isFetching, isError, isSuccess, refetch }
}

export const useListQuizzes = () => {
    const { data, error, isLoading, isError, isSuccess, refetch } =
        trpc.quiz.list.useQuery()

    return { quizzes: data?.quizzes ?? [], error, isLoading, isError, isSuccess, refetch }
}

// ============================
// Publish / Unpublish Hooks
// ============================

export const usePublishQuiz = () => {
    const utils = trpc.useUtils()

    const {
        mutateAsync: publishQuizAsync,
        mutate: publishQuiz,
        error,
        isPending,
    } = trpc.quiz.publish.useMutation({
        onSuccess: async () => {
            await utils.quiz.invalidate()
        },
    })

    return { publishQuiz, publishQuizAsync, error, isPending }
}

export const useUnpublishQuiz = () => {
    const utils = trpc.useUtils()

    const {
        mutateAsync: unpublishQuizAsync,
        mutate: unpublishQuiz,
        error,
        isPending,
    } = trpc.quiz.unpublish.useMutation({
        onSuccess: async () => {
            await utils.quiz.invalidate()
        },
    })

    return { unpublishQuiz, unpublishQuizAsync, error, isPending }
}

// ============================
// Quiz Settings Hook
// ============================

export const useUpdateQuizSettings = () => {
    const utils = trpc.useUtils()

    const {
        mutateAsync: updateSettingsAsync,
        mutate: updateSettings,
        error,
        isPending,
    } = trpc.quiz.updateSettings.useMutation({
        onSuccess: async () => {
            await utils.quiz.invalidate()
        },
    })

    return { updateSettings, updateSettingsAsync, error, isPending }
}

export const usePublishResults = () => {
    const utils = trpc.useUtils()

    const {
        mutateAsync: publishResultsAsync,
        mutate: publishResults,
        error,
        isPending,
    } = trpc.quiz.publishResults.useMutation({
        onSuccess: async () => {
            await utils.quiz.invalidate()
        },
    })

    return { publishResults, publishResultsAsync, error, isPending }
}

// ============================
// Question CRUD Hooks
// ============================

export const useCreateQuestion = () => {
    const utils = trpc.useUtils()

    const {
        mutateAsync: createQuestionAsync,
        mutate: createQuestion,
        error,
        isPending,
    } = trpc.quiz.createQuestion.useMutation({
        onSuccess: async () => {
            await utils.quiz.invalidate()
        },
    })

    return { createQuestion, createQuestionAsync, error, isPending }
}

export const useUpdateQuestion = () => {
    const utils = trpc.useUtils()

    const {
        mutateAsync: updateQuestionAsync,
        mutate: updateQuestion,
        error,
        isPending,
    } = trpc.quiz.updateQuestion.useMutation({
        onSuccess: async () => {
            await utils.quiz.invalidate()
        },
    })

    return { updateQuestion, updateQuestionAsync, error, isPending }
}

export const useDeleteQuestion = () => {
    const utils = trpc.useUtils()

    const {
        mutateAsync: deleteQuestionAsync,
        mutate: deleteQuestion,
        error,
        isPending,
    } = trpc.quiz.deleteQuestion.useMutation({
        onSuccess: async () => {
            await utils.quiz.invalidate()
        },
    })

    return { deleteQuestion, deleteQuestionAsync, error, isPending }
}

export const useDuplicateQuestion = () => {
    const utils = trpc.useUtils()

    const {
        mutateAsync: duplicateQuestionAsync,
        mutate: duplicateQuestion,
        error,
        isPending,
    } = trpc.quiz.duplicateQuestion.useMutation({
        onSuccess: async () => {
            await utils.quiz.invalidate()
        },
    })

    return { duplicateQuestion, duplicateQuestionAsync, error, isPending }
}

export const useReorderQuestions = () => {
    const utils = trpc.useUtils()

    const {
        mutateAsync: reorderQuestionsAsync,
        mutate: reorderQuestions,
        error,
        isPending,
    } = trpc.quiz.reorderQuestions.useMutation({
        onSuccess: async () => {
            await utils.quiz.invalidate()
        },
    })

    return { reorderQuestions, reorderQuestionsAsync, error, isPending }
}

// ============================
// Attempt Hooks
// ============================

export const useStartAttempt = () => {
    const {
        mutateAsync: startAttemptAsync,
        mutate: startAttempt,
        error,
        isPending,
        data,
    } = trpc.quiz.startAttempt.useMutation()

    return { startAttempt, startAttemptAsync, error, isPending, data }
}

export const useGetPreviousAttempts = (formId: string, participantEmail: string) => {
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(participantEmail)
    const { data, error, isLoading, isFetching } =
        trpc.quiz.getPreviousAttempts.useQuery(
            { formId, participantEmail },
            {
                enabled: !!formId && isValidEmail,
                staleTime: 30_000, // cache for 30s — don't hammer DB on every keystroke
            }
        )

    return {
        previousAttempts: data?.attempts ?? [],
        totalAttempts: data?.totalAttempts ?? 0,
        resultsPublished: data?.resultsPublished ?? true,
        error,
        isLoading: isLoading || isFetching,
    }
}

export const useGetAttempt = (attemptId: string) => {
    const { data, error, isLoading, isError, isSuccess, refetch } =
        trpc.quiz.getAttempt.useQuery({ attemptId }, { enabled: !!attemptId })

    return { attempt: data?.attempt ?? null, answers: data?.answers ?? [], error, isLoading, isError, isSuccess, refetch }
}

export const useSaveAnswer = () => {
    const {
        mutateAsync: saveAnswerAsync,
        mutate: saveAnswer,
        error,
        isPending,
    } = trpc.quiz.saveAnswer.useMutation()

    return { saveAnswer, saveAnswerAsync, error, isPending }
}

export const useSubmitAttempt = () => {
    const {
        mutateAsync: submitAttemptAsync,
        mutate: submitAttempt,
        error,
        isPending,
        data,
    } = trpc.quiz.submitAttempt.useMutation()

    return { submitAttempt, submitAttemptAsync, error, isPending, data }
}

export const useGetResult = (attemptId: string) => {
    const { data, error, isLoading, isError, isSuccess, refetch } =
        trpc.quiz.getResult.useQuery({ attemptId }, { enabled: !!attemptId })

    return { result: data?.result ?? null, error, isLoading, isError, isSuccess, refetch }
}

export const useDeleteAttempt = () => {
    const utils = trpc.useUtils()

    const {
        mutateAsync: deleteAttemptAsync,
        mutate: deleteAttempt,
        error,
        isPending,
        isError,
        isSuccess,
    } = trpc.quiz.deleteAttempt.useMutation({
        onSuccess: async () => {
            await utils.quiz.invalidate()
        },
    })

    return { deleteAttempt, deleteAttemptAsync, error, isPending, isError, isSuccess }
}

export const useUpdateAttempt = () => {
    const utils = trpc.useUtils()

    const {
        mutateAsync: updateAttemptAsync,
        mutate: updateAttempt,
        error,
        isPending,
        isError,
        isSuccess,
    } = trpc.quiz.updateAttempt.useMutation({
        onSuccess: async () => {
            await utils.quiz.invalidate()
        },
    })

    return { updateAttempt, updateAttemptAsync, error, isPending, isError, isSuccess }
}


// ============================
// Leaderboard Hook
// ============================

export const useGetLeaderboard = (formId: string, limit = 50, offset = 0) => {
    const { data, error, isLoading, isError, isSuccess, refetch } =
        trpc.quiz.getLeaderboard.useQuery({ formId, limit, offset }, { enabled: !!formId })

    return {
        leaderboard: data?.leaderboard ?? [],
        total: data?.total ?? 0,
        resultsPublished: data?.resultsPublished ?? true,
        error, isLoading, isError, isSuccess, refetch,
    }
}

// ============================
// Analytics Hooks
// ============================

export const useGetQuizAnalytics = (formId: string) => {
    const { data, error, isLoading, isError, isSuccess, refetch } =
        trpc.quiz.getAnalytics.useQuery({ formId }, { enabled: !!formId })

    return { analytics: data?.analytics ?? null, error, isLoading, isError, isSuccess, refetch }
}

export const useGetQuestionAnalytics = (formId: string) => {
    const { data, error, isLoading, isError, isSuccess, refetch } =
        trpc.quiz.getQuestionAnalytics.useQuery({ formId }, { enabled: !!formId })

    return {
        questionAnalytics: data?.questionAnalytics ?? [],
        mostMissed: data?.mostMissed ?? [],
        error, isLoading, isError, isSuccess, refetch,
    }
}

export const useExportCSV = () => {
    const utils = trpc.useUtils()

    const exportCSV = async (formId: string) => {
        return await utils.quiz.exportCSV.fetch({ formId })
    }

    return { exportCSV }
}

// ============================
// Question Bank Hooks
// ============================

export const useCreateBankItem = () => {
    const utils = trpc.useUtils()

    const {
        mutateAsync: createBankItemAsync,
        error,
        isPending,
    } = trpc.quiz.createBankItem.useMutation({
        onSuccess: async () => {
            await utils.quiz.invalidate()
        },
    })

    return { createBankItemAsync, error, isPending }
}

export const useUpdateBankItem = () => {
    const utils = trpc.useUtils()

    const {
        mutateAsync: updateBankItemAsync,
        error,
        isPending,
    } = trpc.quiz.updateBankItem.useMutation({
        onSuccess: async () => {
            await utils.quiz.invalidate()
        },
    })

    return { updateBankItemAsync, error, isPending }
}

export const useDeleteBankItem = () => {
    const utils = trpc.useUtils()

    const {
        mutateAsync: deleteBankItemAsync,
        error,
        isPending,
    } = trpc.quiz.deleteBankItem.useMutation({
        onSuccess: async () => {
            await utils.quiz.invalidate()
        },
    })

    return { deleteBankItemAsync, error, isPending }
}

export const useListBankItems = (filters?: {
    category?: string | null
    difficulty?: "EASY" | "MEDIUM" | "HARD" | null
    questionType?: "MCQ" | "MULTIPLE_SELECT" | "TRUE_FALSE" | "SHORT_ANSWER" | "FILL_BLANK" | null
    search?: string | null
    limit?: number
    offset?: number
}) => {
    const { data, error, isLoading, isError, isSuccess, refetch } =
        trpc.quiz.listBankItems.useQuery(filters ?? {})

    return {
        items: data?.items ?? [],
        total: data?.total ?? 0,
        error, isLoading, isError, isSuccess, refetch,
    }
}

export const useAddBankItemToQuiz = () => {
    const utils = trpc.useUtils()

    const {
        mutateAsync: addBankItemToQuizAsync,
        error,
        isPending,
    } = trpc.quiz.addBankItemToQuiz.useMutation({
        onSuccess: async () => {
            await utils.quiz.invalidate()
        },
    })

    return { addBankItemToQuizAsync, error, isPending }
}
