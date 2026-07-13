import { trpc } from "~/trpc/client"

export const useSubmitForm = () => {
    const {
        mutateAsync: submitFormAsync,
        mutate: submitForm,
        error,
        isPending,
        isError,
        isSuccess,
        status
    } = trpc.form.submitForm.useMutation()

    return {
        submitForm,
        submitFormAsync,
        error,
        isPending,
        isError,
        isSuccess,
        status
    }
}

export const useListSubmissions = (formId: string) => {
    const {
        data,
        error,
        isLoading,
        isError,
        isSuccess,
        status,
        refetch
    } = trpc.form.listSubmissions.useQuery(
        { formId },
        { enabled: !!formId }
    )

    return {
        submissions: data?.submissions ?? [],
        error,
        isLoading,
        isError,
        isSuccess,
        status,
        refetch
    }
}
