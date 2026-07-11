import {z} from "zod"

export const createUserwithEmailAndPasswordInput = z.object({
    fullName: z.string().describe("Full name of the user"),
    email: z.string().email().describe("Email of the user"),
    password: z.string().describe("Password of the user"),
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

