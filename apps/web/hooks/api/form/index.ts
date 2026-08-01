import {trpc} from "~/trpc/client"

export const useCreateForm = () => {
    const utils = trpc.useUtils();

    const {
        mutateAsync: createFormAsync,
        mutate: createForm,
        error,
        failureCount,
        isPending,
        isError,
        isIdle,
        isSuccess,
        status
    } = 
    trpc.form.createForm.useMutation({
        onSuccess: async () => {
            await utils.form.invalidate()
        }
    });

    return {
        createForm,
        createFormAsync,
        error,
        failureCount,
        isPending,
        isError,
        isIdle,
        isSuccess,
        status
    }
}

export const useListForms = () => {
    const {
        data,
        error,
        isLoading,
        isError,
        isSuccess,
        status,
        refetch
    } = trpc.form.listForms.useQuery();

    return {
        forms: data?.forms ?? [],
        error,
        isLoading,
        isError,
        isSuccess,
        status,
        refetch
    }
}

export const useGetFormById = (formId: string) => {
    const {
        data,
        error,
        isLoading,
        isError,
        isSuccess,
        status,
        refetch
    } = trpc.form.getFormById.useQuery(
        { formId },
        { enabled: !!formId }
    );

    return {
        form: data?.form ?? null,
        error,
        isLoading,
        isError,
        isSuccess,
        status,
        refetch
    }
}

export const useDeleteForm = () => {
    const utils = trpc.useUtils();

    const {
        mutateAsync: deleteFormAsync,
        mutate: deleteForm,
        error,
        isPending,
        isError,
        isSuccess,
        status
    } = trpc.form.deleteForm.useMutation({
        onSuccess: async () => {
            await utils.form.invalidate()
        }
    });

    return {
        deleteForm,
        deleteFormAsync,
        error,
        isPending,
        isError,
        isSuccess,
        status
    }
}

export const useToggleFormStatus = () => {
    const utils = trpc.useUtils();

    const {
        mutateAsync: toggleFormStatusAsync,
        mutate: toggleFormStatus,
        error,
        isPending,
        isError,
        isSuccess,
    } = trpc.form.toggleFormStatus.useMutation({
        onSuccess: async () => {
            await utils.form.invalidate()
        }
    });

    return {
        toggleFormStatus,
        toggleFormStatusAsync,
        error,
        isPending,
        isError,
        isSuccess,
    }
}

export const useListPublicForms = () => {
    const {
        data,
        error,
        isLoading,
        isError,
        isSuccess,
        refetch,
    } = trpc.form.listPublicForms.useQuery();

    return {
        forms: data?.forms ?? [],
        error,
        isLoading,
        isError,
        isSuccess,
        refetch,
    }
}

export const useCloneForm = () => {
    const utils = trpc.useUtils();

    const {
        mutateAsync: cloneFormAsync,
        mutate: cloneForm,
        error,
        isPending,
        isError,
        isSuccess,
    } = trpc.form.cloneForm.useMutation({
        onSuccess: async () => {
            await utils.form.invalidate()
        }
    });

    return {
        cloneForm,
        cloneFormAsync,
        error,
        isPending,
        isError,
        isSuccess,
    }
}

export const useArchiveForm = () => {
    const utils = trpc.useUtils();

    const {
        mutateAsync: archiveFormAsync,
        mutate: archiveForm,
        error,
        isPending,
        isError,
        isSuccess,
    } = trpc.form.archiveForm.useMutation({
        onSuccess: async () => {
            await utils.form.invalidate()
        }
    });

    return {
        archiveForm,
        archiveFormAsync,
        error,
        isPending,
        isError,
        isSuccess,
    }
}

export const useRestoreForm = () => {
    const utils = trpc.useUtils();

    const {
        mutateAsync: restoreFormAsync,
        mutate: restoreForm,
        error,
        isPending,
        isError,
        isSuccess,
    } = trpc.form.restoreForm.useMutation({
        onSuccess: async () => {
            await utils.form.invalidate()
        }
    });

    return {
        restoreForm,
        restoreFormAsync,
        error,
        isPending,
        isError,
        isSuccess,
    }
}

export const useListArchivedForms = () => {
    const {
        data,
        error,
        isLoading,
        isError,
        isSuccess,
        refetch,
    } = trpc.form.listArchivedForms.useQuery();

    return {
        forms: data?.forms ?? [],
        error,
        isLoading,
        isError,
        isSuccess,
        refetch,
    }
}

export const useGetDashboardStats = () => {
    const {
        data,
        error,
        isLoading,
        isError,
        isSuccess,
        refetch,
    } = trpc.form.getDashboardStats.useQuery();

    return {
        stats: data ?? null,
        error,
        isLoading,
        isError,
        isSuccess,
        refetch,
    }
}

