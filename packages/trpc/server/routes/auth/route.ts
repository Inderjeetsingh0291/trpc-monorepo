import { publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { createUserwithEmailAndPasswordInputModel, createUserwithEmailAndPasswordOutputModel, signInUserwithEmailAndPasswordInputModel, signInUserwithEmailAndPasswordOutputModel, getLoggedInUserInfoInputModel, getLoggedInUserInfoOutputModel } from "./model";
import { userService } from "@repo/services";
import { setAuthenticationCookie, getAuthenticationCookie } from "../../utils/cookie";

const TAGS = ["Authentication"];
const getPath = generatePath("/authentication");

export const authRouter = router({

  // create user
  createUserwithEmailAndPassword: publicProcedure.meta({
    openapi: {
      method: "POST",
      path: getPath('/createUserwithEmailAndPassword'),
      tags: TAGS,
      protect: true
    }
  }).input(createUserwithEmailAndPasswordInputModel).output(createUserwithEmailAndPasswordOutputModel).mutation(async ({ input, ctx }) => {
    const { fullName, email, password } = input;
    const { id, token } = await userService.createUserwithEmailAndPassword({ fullName, email, password });

    setAuthenticationCookie(ctx, token);

    return { id };
  }),

  // Sign In User
  signInUserWithEmailAndPassword: publicProcedure.meta({
    openapi: {
      method: "POST",
      path: getPath('/signInUserWithEmailAndPassword'),
      tags: TAGS
    }
  }).input(signInUserwithEmailAndPasswordInputModel).output(signInUserwithEmailAndPasswordOutputModel).mutation(async ({ input, ctx }) => {
    const { email, password } = input;
    const { id, token } = await userService.signInUserWithEmailAndPassword({ email, password });

    setAuthenticationCookie(ctx, token);

    return { id };
  }),

  getLoggedInUserInfo: publicProcedure.meta({
    openapi: {
      method: "GET",
      path: getPath('/getLoggedInUserInfo'),
      tags: TAGS
    }
  }).input(getLoggedInUserInfoInputModel).output(getLoggedInUserInfoOutputModel)
    .query(async ({ ctx }) => {


      const {
        id,
        fullName,
        email,
        profileImageUrl
      } = await userService.verifyAndDecodeUserToken(ctx.user.id)
      
      return {
        id,
        fullName,
        email,
        profileImageUrl
      }
    })










});
