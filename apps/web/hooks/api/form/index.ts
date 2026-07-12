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

