import { router, authenticationPocedure } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { createFormInputModel, createFormOutputModel } from "./model";
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

})