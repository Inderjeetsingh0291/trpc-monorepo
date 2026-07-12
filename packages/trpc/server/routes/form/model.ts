import { z } from "zod"

export const createFormInputModel = z.object({
    title: z.string().max(55).describe("Title of the form"),
    description: z.string().max(55).optional().describe("Description of the form"),
})

export const createFormOutputModel = z.object({
    formId: z.string().describe("Id of the form created"),
})

export const listFormsInputModel = z.void().describe("No input required")

export const listFormsOutputModel = z.object({
    forms: z.array(z.object({
        id: z.string().describe("Id of the form"),
        title: z.string().describe("Title of the form"),
        description: z.string().nullable().describe("Description of the form"),
        isActive: z.boolean().nullable().describe("Whether the form is active"),
        createdAt: z.coerce.date().nullable().describe("Creation timestamp"),
    }))
})

