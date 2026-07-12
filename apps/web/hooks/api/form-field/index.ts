import { trpc } from "~/trpc/client"

export const useCreateField = () => {
    const utils = trpc.useUtils()

    const {
        mutateAsync: createFieldAsync,
        mutate: createField,
        error,
        isPending,
        isError,
        isSuccess,
        status
    } = trpc.form.createField.useMutation({
        onSuccess: async () => {
            // Invalidate the getFields query to refresh the list when a new field is added
            await utils.form.getFields.invalidate()
        }
    })

    return {
        createField,
        createFieldAsync,
        error,
        isPending,
        isError,
        isSuccess,
        status
    }
}

export const useUpdateField = () => {
    const utils = trpc.useUtils()

    const {
        mutateAsync: updateFieldAsync,
        mutate: updateField,
        error,
        isPending,
        isError,
        isSuccess,
        status
    } = trpc.form.updateField.useMutation({
        onSuccess: async () => {
            await utils.form.getFields.invalidate()
            await utils.form.getField.invalidate()
        }
    })

    return {
        updateField,
        updateFieldAsync,
        error,
        isPending,
        isError,
        isSuccess,
        status
    }
}

export const useDeleteField = () => {
    const utils = trpc.useUtils()

    const {
        mutateAsync: deleteFieldAsync,
        mutate: deleteField,
        error,
        isPending,
        isError,
        isSuccess,
        status
    } = trpc.form.deleteField.useMutation({
        onSuccess: async () => {
            await utils.form.getFields.invalidate()
        }
    })

    return {
        deleteField,
        deleteFieldAsync,
        error,
        isPending,
        isError,
        isSuccess,
        status
    }
}

export const useGetField = (fieldId: string) => {
    const {
        data,
        error,
        isLoading,
        isError,
        isSuccess,
        status,
        refetch
    } = trpc.form.getField.useQuery(
        { fieldId },
        { enabled: !!fieldId }
    )

    return {
        field: data?.field ?? null,
        error,
        isLoading,
        isError,
        isSuccess,
        status,
        refetch
    }
}

export const useGetFields = (formId: string) => {
    const {
        data,
        error,
        isLoading,
        isError,
        isSuccess,
        status,
        refetch
    } = trpc.form.getFields.useQuery(
        { formId },
        { enabled: !!formId }
    )

    return {
        fields: data?.fields ?? [],
        error,
        isLoading,
        isError,
        isSuccess,
        status,
        refetch
    }
}
