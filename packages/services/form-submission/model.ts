import { z } from "zod"

// --- Submit Form (public) ---

export const submitFormInput = z.object({
    formId: z.string().uuid().describe("UUID of the form being submitted"),
    values: z.array(z.object({
        formFieldId: z.string().uuid().describe("UUID of the form field"),
        value: z.string().describe("User-provided value for this field"),
    })).describe("Array of field answers"),
})

export type SubmitFormInputType = z.infer<typeof submitFormInput>

// --- List Submissions (authenticated, form owner) ---

export const listSubmissionsByFormIdInput = z.object({
    formId: z.string().uuid().describe("UUID of the form to list submissions for"),
})

export type ListSubmissionsByFormIdInputType = z.infer<typeof listSubmissionsByFormIdInput>
