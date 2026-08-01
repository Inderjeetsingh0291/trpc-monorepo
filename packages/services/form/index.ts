import { db, eq, asc, and, count, desc } from "@repo/database"
import { formsTable } from "@repo/database/models/form"
import { formSubmissionsTable } from "@repo/database/models/form-submition"
import { type CreateFormInputType, createFormInput } from "./model"
import {
    type ListFormsByUserIdInputType, listFormsByUserIdInput,
    type GetFormByIdInputType, getFormByIdInput,
    type DeleteFormInputType, deleteFormInput,
    type ToggleFormStatusInputType, toggleFormStatusInput,
    type ListPublicFormsInputType,
    type UpdateFormSettingsInputType, updateFormSettingsInput,
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
            layout: formsTable.layout,
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
            layout: formsTable.layout,
            createdAt: formsTable.createdAt,
        })
        .from(formsTable)
        .where(and(eq(formsTable.createdBy, userId), eq(formsTable.isArchived, false)))

        return { forms }
    }

    public async listArchivedForms(payload: ListFormsByUserIdInputType) {
        const { userId } = await listFormsByUserIdInput.parseAsync(payload)

        const forms = await db.select({
            id: formsTable.id,
            title: formsTable.title,
            description: formsTable.description,
            isActive: formsTable.isActive,
            visibility: formsTable.visibility,
            createdAt: formsTable.createdAt,
        })
        .from(formsTable)
        .where(and(eq(formsTable.createdBy, userId), eq(formsTable.isArchived, true)))

        return { forms }
    }

    public async archiveForm(payload: { formId: string; userId: string }) {
        const { formId, userId } = payload

        const result = await db.update(formsTable)
            .set({ isArchived: true, isActive: false, updatedBy: userId })
            .where(and(eq(formsTable.id, formId), eq(formsTable.createdBy, userId)))
            .returning({ id: formsTable.id })

        if (!result[0]) throw Error("Form not found or you are not authorized.")
        return { formId: result[0].id }
    }

    public async restoreForm(payload: { formId: string; userId: string }) {
        const { formId, userId } = payload

        const result = await db.update(formsTable)
            .set({ isArchived: false, updatedBy: userId })
            .where(and(eq(formsTable.id, formId), eq(formsTable.createdBy, userId)))
            .returning({ id: formsTable.id })

        if (!result[0]) throw Error("Form not found or you are not authorized.")
        return { formId: result[0].id }
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
                password: formsTable.password,
                layout: formsTable.layout,
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

        const { id, title, description, isActive, visibility, expiresAt, maxResponses, password, layout, createdAt, updatedAt } = firstRow.form
        const fields = rows
            .filter((r: any) => r.field !== null)
            .map((r: any) => r.field)

        return {
            form: {
                id,
                title,
                description,
                isActive,
                visibility,
                expiresAt,
                maxResponses,
                password,
                layout,
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

        // Update visibility when provided
        if (visibility) {
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

    public async updateFormSettings(payload: UpdateFormSettingsInputType) {
        const { formId, userId, title, description, layout, expiresAt, maxResponses, password } = await updateFormSettingsInput.parseAsync(payload)

        const updateValues: Partial<typeof formsTable.$inferInsert> = {
            updatedBy: userId,
        }

        if (title !== undefined) updateValues.title = title
        if (description !== undefined) updateValues.description = description ?? null
        if (layout !== undefined) updateValues.layout = layout
        if (expiresAt !== undefined) updateValues.expiresAt = expiresAt ?? null
        if (maxResponses !== undefined) updateValues.maxResponses = maxResponses ?? null
        if (password !== undefined) updateValues.password = password ? password : null

        const result = await db.update(formsTable)
            .set(updateValues)
            .where(and(eq(formsTable.id, formId), eq(formsTable.createdBy, userId)))
            .returning({
                layout: formsTable.layout,
                expiresAt: formsTable.expiresAt,
                maxResponses: formsTable.maxResponses,
                password: formsTable.password,
            })

        const updatedForm = result[0]
        if (!updatedForm) {
            throw Error(`Form not found or you are not authorized to update this form.`)
        }

        return { success: true, layout: updatedForm.layout }
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
            layout: formsTable.layout,
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
                fields.map((f: any) => ({
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

    public async getDashboardStats(payload: { userId: string }) {
        const { userId } = payload

        // Total forms (non-archived)
        const [totalFormsRow] = await db.select({ count: count() })
            .from(formsTable)
            .where(and(eq(formsTable.createdBy, userId), eq(formsTable.isArchived, false)))

        // Active forms
        const [activeFormsRow] = await db.select({ count: count() })
            .from(formsTable)
            .where(and(eq(formsTable.createdBy, userId), eq(formsTable.isActive, true), eq(formsTable.isArchived, false)))

        // Total submissions across all user's forms
        const [totalSubmissionsRow] = await db.select({ count: count() })
            .from(formSubmissionsTable)
            .innerJoin(formsTable, eq(formSubmissionsTable.formId, formsTable.id))
            .where(eq(formsTable.createdBy, userId))

        // 5 most recent submissions with form title
        const recentSubmissions = await db.select({
            id: formSubmissionsTable.id,
            formId: formSubmissionsTable.formId,
            formTitle: formsTable.title,
            createdAt: formSubmissionsTable.createdAt,
        })
        .from(formSubmissionsTable)
        .innerJoin(formsTable, eq(formSubmissionsTable.formId, formsTable.id))
        .where(eq(formsTable.createdBy, userId))
        .orderBy(desc(formSubmissionsTable.createdAt))
        .limit(5)

        return {
            totalForms: totalFormsRow?.count ?? 0,
            activeForms: activeFormsRow?.count ?? 0,
            totalSubmissions: totalSubmissionsRow?.count ?? 0,
            recentSubmissions,
        }
    }
}

export default FormService


