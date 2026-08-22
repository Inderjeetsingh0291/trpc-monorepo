import { z } from "zod"

// Source - https://stackoverflow.com/a/21456918
// Posted by Srinivas, modified by community. See post 'Timeline' for change history
// Retrieved 2026-08-15, License - CC BY-SA 4.0
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/
const PASSWORD_ERROR = "Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character (@$!%*#?&)"

export const createUserwithEmailAndPasswordInputModel = z.object({
    fullName: z.string().describe("Full name of the user"),
    email: z.string().email().describe("Email of the user"),
    password: z.string().regex(PASSWORD_REGEX, PASSWORD_ERROR).describe("Password of the user"),
})

export const createUserwithEmailAndPasswordOutputModel = z.object({
    id: z.string().describe("Id of the user created"),
})

export const signInUserwithEmailAndPasswordInputModel = z.object({
    email: z.string().email().describe("Email of the user"),
    password: z.string().describe("Password of the user"),
})

export const signInUserwithEmailAndPasswordOutputModel = z.object({
    id: z.string().describe("Id of the user created"),
})

export const getLoggedInUserInfoInputModel = z.void()

export const getLoggedInUserInfoOutputModel = z.object({
    id: z.string().describe("Id of the user"),
    fullName: z.string().describe("Full name of the user"),
    email: z.string().email().describe("Email of the user"),
    emailVerified: z.boolean().nullable().optional().describe("Whether email is verified"),
    profileImageUrl: z.string().nullable().optional().describe("Profile image URL of the user"),
})

export const sendVerificationEmailInputModel = z.object({
    to: z.string().email().describe("Recipient email address"),
    verificationUrl: z.string().url().describe("Verification link URL"),
})

export const sendVerificationEmailOutputModel = z.object({
    success: z.boolean(),
    messageId: z.string().optional(),
})

export const sendResetPasswordEmailInputModel = z.object({
    to: z.string().email().describe("Recipient email address"),
    resetUrl: z.string().url().describe("Password reset link URL"),
})

export const sendResetPasswordEmailOutputModel = z.object({
    success: z.boolean(),
    messageId: z.string().optional(),
})

export const verifyEmailTokenInputModel = z.object({
    token: z.string().min(1).describe("Verification token"),
})

export const verifyEmailTokenOutputModel = z.object({
    success: z.boolean(),
    message: z.string(),
})

export const forgotPasswordInputModel = z.object({
    email: z.string().email().describe("User email address"),
})

export const forgotPasswordOutputModel = z.object({
    success: z.boolean(),
    message: z.string(),
})

export const resetPasswordInputModel = z.object({
    token: z.string().min(1).describe("Reset password token"),
    password: z.string().regex(PASSWORD_REGEX, PASSWORD_ERROR).describe("New password"),
})

export const resetPasswordOutputModel = z.object({
    success: z.boolean(),
    message: z.string(),
})

export const resendVerificationEmailInputModel = z.object({
    email: z.string().email().describe("User email address"),
})

export const resendVerificationEmailOutputModel = z.object({
    success: z.boolean(),
    message: z.string(),
})