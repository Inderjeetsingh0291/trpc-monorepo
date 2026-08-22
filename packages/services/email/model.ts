import { z } from "zod";

export const sendVerificationEmailInput = z.object({
    to: z.string().email().describe("Recipient email address"),
    verificationUrl: z.string().url().describe("Verification link URL"),
});

export type SendVerificationEmailInputType = z.infer<typeof sendVerificationEmailInput>;

export const sendResetPasswordEmailInput = z.object({
    to: z.string().email().describe("Recipient email address"),
    resetUrl: z.string().url().describe("Password reset link URL"),
});

export type SendResetPasswordEmailInputType = z.infer<typeof sendResetPasswordEmailInput>;
