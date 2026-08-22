import { z } from "zod";
import { publicProcedure, authenticationPocedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { 
  createUserwithEmailAndPasswordInputModel, 
  createUserwithEmailAndPasswordOutputModel, 
  signInUserwithEmailAndPasswordInputModel, 
  signInUserwithEmailAndPasswordOutputModel, 
  getLoggedInUserInfoInputModel, 
  getLoggedInUserInfoOutputModel,
  sendVerificationEmailInputModel,
  sendVerificationEmailOutputModel,
  sendResetPasswordEmailInputModel,
  sendResetPasswordEmailOutputModel,
  verifyEmailTokenInputModel,
  verifyEmailTokenOutputModel,
  forgotPasswordInputModel,
  forgotPasswordOutputModel,
  resetPasswordInputModel,
  resetPasswordOutputModel
} from "./model";
import { userService, emailService } from "@repo/services";
import { setAuthenticationCookie, getAuthenticationCookie, clearAuthenticationCookie } from "../../utils/cookie";

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

  getLoggedInUserInfo: authenticationPocedure.meta({
    openapi: {
      method: "GET",
      path: getPath('/getLoggedInUserInfo'),
      tags: TAGS
    }
  }).input(getLoggedInUserInfoInputModel).output(getLoggedInUserInfoOutputModel).query(async ({ ctx }) => {
      const {
        id,
        fullName,
        email,
        emailVerified,
        profileImageUrl
      } = await userService.getUserInfoById(ctx.user.id)
      
      return {
        id,
        fullName,
        email,
        emailVerified,
        profileImageUrl
      }
  }),

  signOut: publicProcedure.meta({
    openapi: {
      method: "POST",
      path: getPath('/signOut'),
      tags: TAGS
    }
  }).input(z.void()).output(z.object({ success: z.boolean() })).mutation(async ({ ctx }) => {
    clearAuthenticationCookie(ctx)
    return { success: true }
  }),

  // Send Verification Email via Nodemailer
  sendVerificationEmail: publicProcedure.meta({
    openapi: {
      method: "POST",
      path: getPath('/sendVerificationEmail'),
      tags: TAGS
    }
  }).input(sendVerificationEmailInputModel).output(sendVerificationEmailOutputModel).mutation(async ({ input }) => {
    const { to, verificationUrl } = input;
    return emailService.sendVerificationEmail({ to, verificationUrl });
  }),

  // Send Reset Password Email via Nodemailer
  sendResetPasswordEmail: publicProcedure.meta({
    openapi: {
      method: "POST",
      path: getPath('/sendResetPasswordEmail'),
      tags: TAGS
    }
  }).input(sendResetPasswordEmailInputModel).output(sendResetPasswordEmailOutputModel).mutation(async ({ input }) => {
    const { to, resetUrl } = input;
    return emailService.sendResetPasswordEmail({ to, resetUrl });
  }),

  // Verify email token
  verifyEmailToken: publicProcedure.meta({
    openapi: {
      method: "POST",
      path: getPath('/verifyEmailToken'),
      tags: TAGS
    }
  }).input(verifyEmailTokenInputModel).output(verifyEmailTokenOutputModel).mutation(async ({ input }) => {
    return userService.verifyEmailToken(input.token);
  }),

  // Forgot password
  forgotPassword: publicProcedure.meta({
    openapi: {
      method: "POST",
      path: getPath('/forgotPassword'),
      tags: TAGS
    }
  }).input(forgotPasswordInputModel).output(forgotPasswordOutputModel).mutation(async ({ input }) => {
    return userService.forgotPassword(input.email);
  }),

  // Reset password
  resetPassword: publicProcedure.meta({
    openapi: {
      method: "POST",
      path: getPath('/resetPassword'),
      tags: TAGS
    }
  }).input(resetPasswordInputModel).output(resetPasswordOutputModel).mutation(async ({ input }) => {
    return userService.resetPassword(input.token, input.password);
  }),

});
