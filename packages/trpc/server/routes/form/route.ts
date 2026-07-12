import { router, authenticationPocedure } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { createFormInputModel, createFormOutputModel, listFormsInputModel, listFormsOutputModel } from "./model";
import { formService } from "@repo/services";

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

})