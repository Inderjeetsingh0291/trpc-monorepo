import { router, authenticationPocedure } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { 
  createFormInputModel, createFormOutputModel, 
  listFormsInputModel, listFormsOutputModel,
  createFieldInputModel, createFieldOutputModel,
  updateFieldInputModel, updateFieldOutputModel,
  deleteFieldInputModel, deleteFieldOutputModel,
  getFieldByIdInputModel, getFieldByIdOutputModel,
  getFieldsByFormIdInputModel, getFieldsByFormIdOutputModel
} from "./model";
import { formService, formFieldService } from "@repo/services";

const TAGS = ["Forms"];
const getPath = generatePath("/form");

export const formRouter = router({

  // create form
  createForm: authenticationPocedure.meta({
    openapi: {
      method: "POST",
      path: getPath('/createForm'),
      tags: TAGS,
      protect: true
    }
  }).input(createFormInputModel).output(createFormOutputModel).mutation(async ({ input, ctx }) => {
    const { title, description } = input;
    const { formId } = await formService.createForm({ title, description, createdBy: ctx.user.id });

    return { formId };
  }),

  // list forms by authenticated user
  listForms: authenticationPocedure.meta({
    openapi: {
      method: "GET",
      path: getPath('/listForms'),
      tags: TAGS,
      protect: true
    }
  }).input(listFormsInputModel).output(listFormsOutputModel).query(async ({ ctx }) => {
    const { forms } = await formService.listFormsByUserId({ userId: ctx.user.id });

    return { forms };
  }),

  // --- Form Field Procedures ---

  createField: authenticationPocedure.meta({
    openapi: {
      method: "POST",
      path: getPath('/createField'),
      tags: ["Form Fields"],
      protect: true
    }
  }).input(createFieldInputModel).output(createFieldOutputModel).mutation(async ({ input, ctx }) => {
    return await formFieldService.createField({
      ...input,
      createdBy: ctx.user.id
    });
  }),

  updateField: authenticationPocedure.meta({
    openapi: {
      method: "POST",
      path: getPath('/updateField'),
      tags: ["Form Fields"],
      protect: true
    }
  }).input(updateFieldInputModel).output(updateFieldOutputModel).mutation(async ({ input, ctx }) => {
    return await formFieldService.updateField({
      ...input,
      updatedBy: ctx.user.id
    });
  }),

  deleteField: authenticationPocedure.meta({
    openapi: {
      method: "DELETE",
      path: getPath('/deleteField'),
      tags: ["Form Fields"],
      protect: true
    }
  }).input(deleteFieldInputModel).output(deleteFieldOutputModel).mutation(async ({ input }) => {
    return await formFieldService.deleteField(input);
  }),

  getField: authenticationPocedure.meta({
    openapi: {
      method: "GET",
      path: getPath('/getField'),
      tags: ["Form Fields"],
      protect: true
    }
  }).input(getFieldByIdInputModel).output(getFieldByIdOutputModel).query(async ({ input }) => {
    return await formFieldService.getFieldById(input);
  }),

  getFields: authenticationPocedure.meta({
    openapi: {
      method: "GET",
      path: getPath('/getFields'),
      tags: ["Form Fields"],
      protect: true
    }
  }).input(getFieldsByFormIdInputModel).output(getFieldsByFormIdOutputModel).query(async ({ input }) => {
    return await formFieldService.getFieldsByFormId(input);
  }),

})