import { db, eq, asc } from "@repo/database"
import { formFieldsTable } from "@repo/database/models/form-field"
import { 
    type CreateFieldInputType, createFieldInput,
    type UpdateFieldInputType, updateFieldInput,
    type DeleteFieldInputType, deleteFieldInput,
    type GetFieldByIdInputType, getFieldByIdInput,
    type GetFieldsByFormIdInputType, getFieldsByFormIdInput
} from "./model"

function generateLabelKey(label: string) {
    const base = label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const uniqueSuffix = Math.random().toString(36).substring(2, 7);
    return `${base || 'field'}_${uniqueSuffix}`;
}

class FormFieldService {

    public async createField(payload: CreateFieldInputType) {
        const { label, placeholder, description, isRequired, index, type, formId, createdBy } = await createFieldInput.parseAsync(payload)

        const labelKey = generateLabelKey(label)

        const fieldInsertResult = await db.insert(formFieldsTable).values({
            label,
            labelKey,
            placeholder,
            description,
            isRequired,
            index,
            type,
            formId,
            createdBy: createdBy,
            updatedBy: createdBy,
        }).returning({
            id: formFieldsTable.id,
            label: formFieldsTable.label,
            labelKey: formFieldsTable.labelKey,
        })

        if (!fieldInsertResult || fieldInsertResult.length === 0 || !fieldInsertResult[0]?.id) {
            throw Error(`Something went wrong while creating the field with label ${label}, try again`)
        }

        return {
            fieldId: fieldInsertResult[0].id,
            labelKey: fieldInsertResult[0].labelKey
        }
    }

    public async updateField(payload: UpdateFieldInputType) {
        const { fieldId, label, placeholder, description, isRequired, index, type, updatedBy } = await updateFieldInput.parseAsync(payload)

        const fieldUpdateResult = await db.update(formFieldsTable)
            .set({
                ...(label !== undefined ? { label } : {}),
                ...(placeholder !== undefined ? { placeholder } : {}),
                ...(description !== undefined ? { description } : {}),
                ...(isRequired !== undefined ? { isRequired } : {}),
                ...(index !== undefined ? { index } : {}),
                ...(type !== undefined ? { type } : {}),
                updatedBy: updatedBy,
            })
            .where(eq(formFieldsTable.id, fieldId))
            .returning({
                id: formFieldsTable.id,
            })

        if (!fieldUpdateResult || fieldUpdateResult.length === 0 || !fieldUpdateResult[0]?.id) {
            throw Error(`Field not found or something went wrong while updating field ${fieldId}`)
        }

        return {
            fieldId: fieldUpdateResult[0].id,
        }
    }

    public async deleteField(payload: DeleteFieldInputType) {
        const { fieldId } = await deleteFieldInput.parseAsync(payload)

        const fieldDeleteResult = await db.delete(formFieldsTable)
            .where(eq(formFieldsTable.id, fieldId))
            .returning({
                id: formFieldsTable.id,
            })

        if (!fieldDeleteResult || fieldDeleteResult.length === 0 || !fieldDeleteResult[0]?.id) {
            throw Error(`Field not found or something went wrong while deleting field ${fieldId}`)
        }

        return {
            success: true,
            fieldId: fieldDeleteResult[0].id,
        }
    }

    public async getFieldById(payload: GetFieldByIdInputType) {
        const { fieldId } = await getFieldByIdInput.parseAsync(payload)

        const [field] = await db.select()
            .from(formFieldsTable)
            .where(eq(formFieldsTable.id, fieldId))

        if (!field) {
            throw Error(`Field not found with id ${fieldId}`)
        }

        return { field }
    }

    public async reorderFields(payload: { fieldIds: string[]; updatedBy: string }) {
        const { fieldIds, updatedBy } = payload;
        await db.transaction(async (tx: any) => {
            for (let i = 0; i < fieldIds.length; i++) {
                await tx.update(formFieldsTable)
                    .set({ index: (-(i + 1)).toFixed(2), updatedBy })
                    .where(eq(formFieldsTable.id, fieldIds[i]!))
            }
            for (let i = 0; i < fieldIds.length; i++) {
                await tx.update(formFieldsTable)
                    .set({ index: (i + 1).toFixed(2), updatedBy })
                    .where(eq(formFieldsTable.id, fieldIds[i]!))
            }
        });
        return { success: true };
    }

    public async getFieldsByFormId(payload: GetFieldsByFormIdInputType) {
        const { formId } = await getFieldsByFormIdInput.parseAsync(payload)

        const fields = await db.select()
            .from(formFieldsTable)
            .where(eq(formFieldsTable.formId, formId))
            .orderBy(asc(formFieldsTable.index))

        return { fields }
    }

}

export default FormFieldService

