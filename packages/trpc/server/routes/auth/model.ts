import { z } from "zod"

export const createUserwithEmailAndPasswordInputModel = z.object({
    fullName: z.string().describe("Full name of the user"),
    email: z.string().email().describe("Email of the user"),
    password: z.string().describe("Password of the user"),
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
    profileImageUrl: z.string().nullable().optional().describe("Profile image URL of the user"),
})