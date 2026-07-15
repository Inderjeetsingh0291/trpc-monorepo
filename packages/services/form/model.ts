import { z } from "zod"

export const createFormInput = z.object({
    title: z.string().min(1).max(55).describe("Title of the form"),
    description: z.string().max(55).optional().describe("Description of the form"),
    createdBy: z.string().uuid().describe("UUID of the user creating the form"),
    expiresAt: z.coerce.date().optional().nullable().describe("Optional expiry date"),
    maxResponses: z.number().int().optional().nullable().describe("Optional maximum response limit"),
})

export type CreateFormInputType = z.infer<typeof createFormInput>

export const listFormsByUserIdInput = z.object({
    userId: z.string().uuid().describe("UUID of the user whose forms to list"),
})

export type ListFormsByUserIdInputType = z.infer<typeof listFormsByUserIdInput>

export const getFormByIdInput = z.object({
    formId: z.string().uuid().describe("UUID of the form to retrieve"),
})

export type GetFormByIdInputType = z.infer<typeof getFormByIdInput>

export const deleteFormInput = z.object({
    formId: z.string().uuid().describe("UUID of the form to delete"),
    userId: z.string().uuid().describe("UUID of the user requesting deletion"),
})

export type DeleteFormInputType = z.infer<typeof deleteFormInput>

export const toggleFormStatusInput = z.object({
    formId: z.string().uuid().describe("UUID of the form"),
    userId: z.string().uuid().describe("UUID of the owning user"),
    isActive: z.boolean().describe("The new published/unpublished state"),
    visibility: z.enum(["public", "unlisted"]).optional().describe("Visibility mode when publishing"),
})

export type ToggleFormStatusInputType = z.infer<typeof toggleFormStatusInput>

export const listPublicFormsInput = z.object({}).describe("No input required")

export type ListPublicFormsInputType = z.infer<typeof listPublicFormsInput>

