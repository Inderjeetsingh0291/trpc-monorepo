import {trpc} from "~/trpc/client"

export const useSignup = () => {
    const utils = trpc.useUtils();
    const {
        mutateAsync:createUserWithEmailAndPasswordAsync,
        mutate: createUserWithEmailAndPassword,
        error,
        failureCount,
        isError,
        isIdle,
        isSuccess,
        status
    } = 
    trpc.auth.createUserwithEmailAndPassword.useMutation({
        onSuccess: async () => {
        await utils.auth.getLoggedInUserInfo.invalidate();
        }
    });

    return {
        createUserWithEmailAndPassword,
        createUserWithEmailAndPasswordAsync,
        error,
        failureCount,
        isError,
        isIdle,
        isSuccess,
        status
    }
}

export const useSignIn = () => {
    const utils = trpc.useUtils();
    const {
        mutateAsync:signInUserWithEmailAndPasswordAsync,
        mutate: signInUserWithEmailAndPassword,
        error,
        failureCount,
        isError,
        isIdle,
        isSuccess,
        status
    } = 
    trpc.auth.signInUserWithEmailAndPassword.useMutation({
        onSuccess: async () => {
            await utils.auth.getLoggedInUserInfo.invalidate();
        }
    });

    return {
        signInUserWithEmailAndPassword,
        signInUserWithEmailAndPasswordAsync,
        error,
        failureCount,
        isError,
        isIdle,
        isSuccess,
        status
    }
}

export const useUser = () => {
    const {
        data: user,
        error,
        isFetched,
        isFetching,
        isLoading,
        status
    } = 
    trpc.auth.getLoggedInUserInfo.useQuery();

    return {
        user,
        error,
        isFetched,
        isFetching,
        isLoading,
        status
    }
}

export const useSignOut = () => {
    const utils = trpc.useUtils();
    const { mutateAsync: signOutAsync, isPending } = trpc.auth.signOut.useMutation({
        onSuccess: async () => {
            await utils.auth.getLoggedInUserInfo.invalidate();
        }
    });

    return { signOutAsync, isPending }
}

export const useSendVerificationEmail = () => {
    const {
        mutateAsync: sendVerificationEmailAsync,
        mutate: sendVerificationEmail,
        error,
        isError,
        isPending,
        isSuccess,
        status
    } = trpc.auth.sendVerificationEmail.useMutation();

    return {
        sendVerificationEmail,
        sendVerificationEmailAsync,
        error,
        isError,
        isPending,
        isSuccess,
        status
    }
}

export const useSendResetPasswordEmail = () => {
    const {
        mutateAsync: sendResetPasswordEmailAsync,
        mutate: sendResetPasswordEmail,
        error,
        isError,
        isPending,
        isSuccess,
        status
    } = trpc.auth.sendResetPasswordEmail.useMutation();

    return {
        sendResetPasswordEmail,
        sendResetPasswordEmailAsync,
        error,
        isError,
        isPending,
        isSuccess,
        status
    }
}

export const useVerifyEmailToken = () => {
    const utils = trpc.useUtils();
    const {
        mutateAsync: verifyEmailTokenAsync,
        mutate: verifyEmailToken,
        error,
        isError,
        isPending,
        isSuccess,
        status
    } = trpc.auth.verifyEmailToken.useMutation({
        onSuccess: async () => {
            await utils.auth.getLoggedInUserInfo.invalidate();
        }
    });

    return {
        verifyEmailToken,
        verifyEmailTokenAsync,
        error,
        isError,
        isPending,
        isSuccess,
        status
    }
}

export const useForgotPassword = () => {
    const {
        mutateAsync: forgotPasswordAsync,
        mutate: forgotPassword,
        error,
        isError,
        isPending,
        isSuccess,
        status
    } = trpc.auth.forgotPassword.useMutation();

    return {
        forgotPassword,
        forgotPasswordAsync,
        error,
        isError,
        isPending,
        isSuccess,
        status
    }
}

export const useResetPassword = () => {
    const {
        mutateAsync: resetPasswordAsync,
        mutate: resetPassword,
        error,
        isError,
        isPending,
        isSuccess,
        status
    } = trpc.auth.resetPassword.useMutation();

    return {
        resetPassword,
        resetPasswordAsync,
        error,
        isError,
        isPending,
        isSuccess,
        status
    }
}