import { z } from "zod"

export const createFormInput = z.object({
    title: z.string().min(1).max(55).describe("Title of the form"),
    description: z.string().max(55).optional().describe("Description of the form"),
    createdBy: z.string().uuid().describe("UUID of the user creating the form"),
})

export type CreateFormInputType = z.infer<typeof createFormInput>
