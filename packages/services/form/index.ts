import { db, eq, asc, and } from "@repo/database"
import { formsTable } from "@repo/database/models/form"
import { type CreateFormInputType, createFormInput } from "./model"
import {
    type ListFormsByUserIdInputType, listFormsByUserIdInput,
    type GetFormByIdInputType, getFormByIdInput,
    type DeleteFormInputType, deleteFormInput,
    type ToggleFormStatusInputType, toggleFormStatusInput,
    type ListPublicFormsInputType,
} from "./model"
import { formFieldsTable } from "@repo/database/models/form-field"

class FormService {

    public async createForm(payload: CreateFormInputType) {
        const { title, description, createdBy, expiresAt, maxResponses } = await createFormInput.parseAsync(payload)

        const formInsertResult = await db.insert(formsTable).values({
            title,
            description,
            createdBy: createdBy,
            updatedBy: createdBy,
            isActive: false,
            visibility: "unlisted",
            expiresAt,
            maxResponses,
        }).returning({
            id: formsTable.id,
            title: formsTable.title,
            description: formsTable.description,
            isActive: formsTable.isActive,
            visibility: formsTable.visibility,
            expiresAt: formsTable.expiresAt,
            maxResponses: formsTable.maxResponses,
            createdAt: formsTable.createdAt,
        })

        const insertedForm = formInsertResult[0]
        if (!insertedForm) throw Error(`Something went wrong while creating the form with title ${title} and description ${description}, try again`)

        return {
            formId: insertedForm.id,
        }
    }

    public async listFormsByUserId(payload: ListFormsByUserIdInputType) {
        const { userId } = await listFormsByUserIdInput.parseAsync(payload)

        const forms = await db.select({
            id: formsTable.id,
            title: formsTable.title,
            description: formsTable.description,
            isActive: formsTable.isActive,
            visibility: formsTable.visibility,
            expiresAt: formsTable.expiresAt,
            maxResponses: formsTable.maxResponses,
            createdAt: formsTable.createdAt,
        })
        .from(formsTable)
        .where(eq(formsTable.createdBy, userId))

        return { forms }
    }

    public async getFormById(payload: GetFormByIdInputType) {
        const { formId } = await getFormByIdInput.parseAsync(payload)

        const rows = await db.select({
            form: {
                id: formsTable.id,
                title: formsTable.title,
                description: formsTable.description,
                isActive: formsTable.isActive,
                visibility: formsTable.visibility,
                expiresAt: formsTable.expiresAt,
                maxResponses: formsTable.maxResponses,
                createdAt: formsTable.createdAt,
                updatedAt: formsTable.updatedAt,
            },
            field: formFieldsTable
        })
        .from(formsTable)
        .leftJoin(formFieldsTable, eq(formsTable.id, formFieldsTable.formId))
        .where(eq(formsTable.id, formId))
        .orderBy(asc(formFieldsTable.index))

        const firstRow = rows[0]
        if (!firstRow) {
            throw Error(`Form not found with id ${formId}`)
        }

        const { id, title, description, isActive, visibility, expiresAt, maxResponses, createdAt, updatedAt } = firstRow.form
        const fields = rows
            .filter(r => r.field !== null)
            .map(r => r.field as NonNullable<typeof r.field>)

        return {
            form: {
                id,
                title,
                description,
                isActive,
                visibility,
                expiresAt,
                maxResponses,
                createdAt,
                updatedAt,
                fields
            }
        }
    }

    public async toggleFormStatus(payload: ToggleFormStatusInputType) {
        const { formId, userId, isActive, visibility } = await toggleFormStatusInput.parseAsync(payload)

        const updateValues: Partial<typeof formsTable.$inferInsert> = {
            isActive,
            updatedBy: userId,
        }

        // Only update visibility when publishing (isActive = true) and a value is provided
        if (isActive && visibility) {
            updateValues.visibility = visibility
        }

        const result = await db.update(formsTable)
            .set(updateValues)
            .where(and(eq(formsTable.id, formId), eq(formsTable.createdBy, userId)))
            .returning({
                id: formsTable.id,
                isActive: formsTable.isActive,
                visibility: formsTable.visibility,
            })

        const updatedForm = result[0]
        if (!updatedForm) {
            throw Error(`Form not found or you are not authorized to update this form.`)
        }

        return { formId: updatedForm.id, isActive: updatedForm.isActive, visibility: updatedForm.visibility }
    }

    public async listPublicForms(_payload: ListPublicFormsInputType) {
        const forms = await db.select({
            id: formsTable.id,
            title: formsTable.title,
            description: formsTable.description,
            isActive: formsTable.isActive,
            visibility: formsTable.visibility,
            expiresAt: formsTable.expiresAt,
            maxResponses: formsTable.maxResponses,
            createdAt: formsTable.createdAt,
        })
        .from(formsTable)
        .where(and(eq(formsTable.isActive, true), eq(formsTable.visibility, "public")))

        return { forms }
    }

    public async deleteForm(payload: DeleteFormInputType) {
        const { formId, userId } = await deleteFormInput.parseAsync(payload)

        const deleteResult = await db.delete(formsTable)
            .where(and(eq(formsTable.id, formId), eq(formsTable.createdBy, userId)))
            .returning({ id: formsTable.id })

        const deletedForm = deleteResult[0]
        if (!deletedForm) {
            throw Error(`Form not found or you are not authorized to delete this form.`)
        }

        return { deletedFormId: deletedForm.id }
    }

    public async cloneForm(payload: { formId: string; userId: string }) {
        const { formId, userId } = payload

        // Get the original form
        const [original] = await db.select().from(formsTable).where(eq(formsTable.id, formId))
        if (!original) throw Error(`Form not found with id ${formId}`)

        // Create a clone with draft status
        const [cloned] = await db.insert(formsTable).values({
            title: `${original.title} (Copy)`,
            description: original.description,
            createdBy: userId,
            updatedBy: userId,
            isActive: false,
            visibility: "unlisted",
        }).returning({ id: formsTable.id })

        if (!cloned?.id) throw Error("Failed to clone form.")

        // Clone all fields
        const fields = await db.select().from(formFieldsTable).where(eq(formFieldsTable.formId, formId))

        if (fields.length > 0) {
            await db.insert(formFieldsTable).values(
                fields.map(f => ({
                    formId: cloned.id,
                    label: f.label,
                    labelKey: f.labelKey,
                    placeholder: f.placeholder,
                    description: f.description,
                    isRequired: f.isRequired,
                    index: f.index,
                    type: f.type,
                    createdBy: userId,
                    updatedBy: userId,
                }))
            )
        }

        return { formId: cloned.id }
    }
}

export default FormService


