import { initTRPC, TRPCError } from "@trpc/server";
import { OpenApiMeta } from "trpc-to-openapi";

import { createContext } from "./context";
import { getAuthenticationCookie } from "./utils/cookie";
import { userService } from "@repo/services";

export const tRPCContext = initTRPC
  .meta<OpenApiMeta>()
  .context<typeof createContext>()
  .create({});

export const router = tRPCContext.router;

export const publicProcedure = tRPCContext.procedure;

export const authenticationPocedure = tRPCContext.procedure.use(async options => {
  const { ctx } = options

  const userToken = getAuthenticationCookie(ctx)
  if (!userToken) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "You must be logged in to access this resource." })
  }

  let userId: string
  try {
    const { id } = await userService.verifyAndDecodeUserToken(userToken)
    userId = id
  } catch {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Session expired or invalid. Please log in again." })
  }

  return options.next({
    ctx: {
      ...ctx,
      user: { id: userId },
    },
  })
})

