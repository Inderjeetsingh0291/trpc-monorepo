import { z } from "zod"

const fieldTypeValues = [
    "text",
    "number",
    "email",
    "phone",
    "textarea",
    "select",
    "radio",
    "checkbox",
    "YES_NO",
    "file",
    "image",
] as const

// --- Create Field ---

export const createFieldInput = z.object({
    label: z.string().min(1).max(100).describe("Display label for the field"),
    placeholder: z.string().max(100).optional().describe("Placeholder text"),
    description: z.string().max(255).optional().describe("Help text for the field"),
    isRequired: z.boolean().default(false).describe("Whether the field is mandatory"),
    index: z.string().describe("Fractional index for ordering (e.g. '1.00')"),
    type: z.enum(fieldTypeValues).describe("Type of the field"),
    formId: z.string().uuid().describe("UUID of the form this field belongs to"),
    createdBy: z.string().uuid().describe("UUID of the user creating the field"),
})

export type CreateFieldInputType = z.infer<typeof createFieldInput>

// --- Update Field ---

export const updateFieldInput = z.object({
    fieldId: z.string().uuid().describe("UUID of the field to update"),
    label: z.string().min(1).max(100).optional().describe("Updated display label"),
    placeholder: z.string().max(100).optional().nullable().describe("Updated placeholder text"),
    description: z.string().max(255).optional().nullable().describe("Updated help text"),
    isRequired: z.boolean().optional().describe("Updated required status"),
    index: z.string().optional().describe("Updated fractional index for reordering"),
    type: z.enum(fieldTypeValues).optional().describe("Updated field type"),
    updatedBy: z.string().uuid().describe("UUID of the user making the update"),
})

export type UpdateFieldInputType = z.infer<typeof updateFieldInput>

// --- Delete Field ---

export const deleteFieldInput = z.object({
    fieldId: z.string().uuid().describe("UUID of the field to delete"),
})

export type DeleteFieldInputType = z.infer<typeof deleteFieldInput>

// --- Get Field By ID ---

export const getFieldByIdInput = z.object({
    fieldId: z.string().uuid().describe("UUID of the field to retrieve"),
})

export type GetFieldByIdInputType = z.infer<typeof getFieldByIdInput>

// --- Get Fields By Form ID ---

export const getFieldsByFormIdInput = z.object({
    formId: z.string().uuid().describe("UUID of the form to retrieve fields for"),
})

export type GetFieldsByFormIdInputType = z.infer<typeof getFieldsByFormIdInput>
