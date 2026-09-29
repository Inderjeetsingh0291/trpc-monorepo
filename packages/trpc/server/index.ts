import { router, publicProcedure } from "./trpc";

import { authRouter } from "./routes/auth/route";
import { formRouter } from "./routes/form/route";
import { quizRouter } from "./routes/quiz/route";

export const serverRouter = router({
  auth: authRouter,
  form: formRouter,
  quiz: quizRouter,
});

export { createContext, createFetchContext } from "./context";
export { fetchRequestHandler } from "@trpc/server/adapters/fetch";
export type ServerRouter = typeof serverRouter;
