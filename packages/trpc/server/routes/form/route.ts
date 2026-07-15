import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, authenticationPocedure, publicProcedure } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { checkRateLimit } from "../../utils/rate-limit";
import { 
  createFormInputModel, createFormOutputModel, 
  listFormsInputModel, listFormsOutputModel,
  getFormByIdInputModel, getFormByIdOutputModel,
  createFieldInputModel, createFieldOutputModel,
  updateFieldInputModel, updateFieldOutputModel,
  deleteFieldInputModel, deleteFieldOutputModel,
  getFieldByIdInputModel, getFieldByIdOutputModel,
  getFieldsByFormIdInputModel, getFieldsByFormIdOutputModel,
  submitFormInputModel, submitFormOutputModel,
  listSubmissionsInputModel, listSubmissionsOutputModel,
  deleteFormInputModel, deleteFormOutputModel,
  toggleFormStatusInputModel, toggleFormStatusOutputModel,
  listPublicFormsInputModel, listPublicFormsOutputModel,
} from "./model";
import { formService, formFieldService, formSubmissionService } from "@repo/services";

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
    const { title, description, expiresAt, maxResponses } = input;
    const { formId } = await formService.createForm({ title, description, createdBy: ctx.user.id, expiresAt, maxResponses });

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

  getFormById: publicProcedure.meta({
    openapi: {
      method: "GET",
      path: getPath('/getFormById'),
      tags: TAGS,
      protect: false
    }
  }).input(getFormByIdInputModel).output(getFormByIdOutputModel).query(async ({ input }) => {
    return await formService.getFormById(input);
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

  getField: publicProcedure.meta({ // this must be public 
    openapi: {
      method: "GET",
      path: getPath('/getField'),
      tags: ["Form Fields"],
      protect: false
    }
  }).input(getFieldByIdInputModel).output(getFieldByIdOutputModel).query(async ({ input }) => {
    return await formFieldService.getFieldById(input);
  }),

  getFields: publicProcedure.meta({
    openapi: {
      method: "GET",
      path: getPath('/getFields'),
      tags: ["Form Fields"],
      protect: false
    }
  }).input(getFieldsByFormIdInputModel).output(getFieldsByFormIdOutputModel).query(async ({ input }) => {
    return await formFieldService.getFieldsByFormId(input);
  }),

  // --- Submission Procedures ---

  submitForm: publicProcedure.meta({
    openapi: {
      method: "POST",
      path: getPath('/submitForm'),
      tags: ["Submissions"],
      protect: false
    }
  }).input(submitFormInputModel).output(submitFormOutputModel).mutation(async ({ input, ctx }) => {
    // Rate limit: 10 submissions per IP per minute
    const ip = ctx.ip ?? "unknown"
    const allowed = checkRateLimit(`submit:${ip}`, { limit: 10, windowMs: 60_000 })
    if (!allowed) {
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: "Too many submissions. Please wait a moment before trying again.",
      })
    }
    return await formSubmissionService.submitForm(input);
  }),

  listSubmissions: authenticationPocedure.meta({
    openapi: {
      method: "GET",
      path: getPath('/listSubmissions'),
      tags: ["Submissions"],
      protect: true
    }
  }).input(listSubmissionsInputModel).output(listSubmissionsOutputModel).query(async ({ input }) => {
    return await formSubmissionService.listSubmissionsByFormId(input);
  }),

  deleteForm: authenticationPocedure.meta({
    openapi: {
      method: "DELETE",
      path: getPath('/deleteForm'),
      tags: TAGS,
      protect: true
    }
  }).input(deleteFormInputModel).output(deleteFormOutputModel).mutation(async ({ input, ctx }) => {
    const { formId } = input;
    const { deletedFormId } = await formService.deleteForm({ formId, userId: ctx.user.id });
    return { success: true, formId: deletedFormId };
  }),

  // --- Publish / Visibility Procedures ---

  toggleFormStatus: authenticationPocedure.meta({
    openapi: {
      method: "POST",
      path: getPath('/toggleFormStatus'),
      tags: TAGS,
      protect: true
    }
  }).input(toggleFormStatusInputModel).output(toggleFormStatusOutputModel).mutation(async ({ input, ctx }) => {
    const result = await formService.toggleFormStatus({
      formId: input.formId,
      userId: ctx.user.id,
      isActive: input.isActive,
      visibility: input.visibility,
    });
    return result;
  }),

  listPublicForms: publicProcedure.meta({
    openapi: {
      method: "GET",
      path: getPath('/listPublicForms'),
      tags: TAGS,
      protect: false
    }
  }).input(listPublicFormsInputModel).output(listPublicFormsOutputModel).query(async () => {
    return await formService.listPublicForms({});
  }),

  // --- Clone Form ---

  cloneForm: authenticationPocedure.meta({
    openapi: {
      method: "POST",
      path: getPath('/cloneForm'),
      tags: TAGS,
      protect: true
    }
  }).input(z.object({ formId: z.string().uuid() })).output(createFormOutputModel).mutation(async ({ input, ctx }) => {
    return await formService.cloneForm({ formId: input.formId, userId: ctx.user.id });
  }),

})

