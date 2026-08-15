import {z} from "zod"

// Source - https://stackoverflow.com/a/21456918
// Posted by Srinivas, modified by community. See post 'Timeline' for change history
// Retrieved 2026-08-15, License - CC BY-SA 4.0
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/
const PASSWORD_ERROR = "Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character (@$!%*#?&)"

export const createUserwithEmailAndPasswordInput = z.object({
    fullName: z.string().describe("Full name of the user"),
    email: z.string().email().describe("Email of the user"),
    password: z.string().regex(PASSWORD_REGEX, PASSWORD_ERROR).describe("Password of the user"),
})

export type CreateUserWithEmailAndPasswordInputType = z.infer<typeof createUserwithEmailAndPasswordInput>

export const GenerateUserTokenPayload =z.object({
    id: z.string().describe("uuid of the user")
})

export type GenerateUserTokenPayloadType = z.infer<typeof GenerateUserTokenPayload>

export const signInUserWithEmailAndPasswordInput = z.object({
    email: z.email().describe("Email of the user"),
    password: z.string().describe("Password of the user"),
})

export type SignInUserWithEmailAndPasswordInputType = z.infer<typeof signInUserWithEmailAndPasswordInput>
