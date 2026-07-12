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

// --- Form Field Models ---

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

export const createFieldInputModel = z.object({
    label: z.string().min(1).max(100).describe("Display label for the field"),
    placeholder: z.string().max(100).optional().describe("Placeholder text"),
    description: z.string().max(255).optional().describe("Help text for the field"),
    isRequired: z.boolean().default(false).describe("Whether the field is mandatory"),
    index: z.string().describe("Fractional index for ordering (e.g. '1.00')"),
    type: z.enum(fieldTypeValues).describe("Type of the field"),
    formId: z.string().uuid().describe("UUID of the form this field belongs to"),
})

export const createFieldOutputModel = z.object({
    fieldId: z.string().describe("Id of the created field"),
    labelKey: z.string().describe("Generated label key for the field"),
})

export const updateFieldInputModel = z.object({
    fieldId: z.string().uuid().describe("UUID of the field to update"),
    label: z.string().min(1).max(100).optional().describe("Updated display label"),
    placeholder: z.string().max(100).optional().nullable().describe("Updated placeholder text"),
    description: z.string().max(255).optional().nullable().describe("Updated help text"),
    isRequired: z.boolean().optional().describe("Updated required status"),
    index: z.string().optional().describe("Updated fractional index for reordering"),
    type: z.enum(fieldTypeValues).optional().describe("Updated field type"),
})

export const updateFieldOutputModel = z.object({
    fieldId: z.string().describe("Id of the updated field"),
})

export const deleteFieldInputModel = z.object({
    fieldId: z.string().uuid().describe("UUID of the field to delete"),
})

export const deleteFieldOutputModel = z.object({
    success: z.boolean().describe("Whether the deletion was successful"),
    fieldId: z.string().describe("Id of the deleted field"),
})

export const getFieldByIdInputModel = z.object({
    fieldId: z.string().uuid().describe("UUID of the field to retrieve"),
})

const fieldOutputModel = z.object({
    id: z.string().describe("Id of the field"),
    label: z.string().describe("Display label"),
    labelKey: z.string().describe("Label key"),
    placeholder: z.string().nullable().describe("Placeholder"),
    description: z.string().nullable().describe("Description"),
    isRequired: z.boolean().describe("Is required"),
    index: z.string().describe("Index"),
    type: z.enum(fieldTypeValues).describe("Field type"),
    formId: z.string().nullable().describe("Form ID"),
    createdAt: z.coerce.date().nullable().describe("Creation timestamp"),
})

export const getFieldByIdOutputModel = z.object({
    field: fieldOutputModel
})

export const getFieldsByFormIdInputModel = z.object({
    formId: z.string().uuid().describe("UUID of the form to retrieve fields for"),
})

export const getFieldsByFormIdOutputModel = z.object({
    fields: z.array(fieldOutputModel)
})
