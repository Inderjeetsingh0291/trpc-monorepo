import { z } from "zod";

const DEFAULT_DB_URL =
  "postgresql://postgres:postgres@localhost:5432/trpc_db";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1).default(DEFAULT_DB_URL),
});

function createEnv(env: NodeJS.ProcessEnv) {
  const safeParseResult = envSchema.safeParse(env);
  if (!safeParseResult.success) {
    return { DATABASE_URL: env.DATABASE_URL || DEFAULT_DB_URL };
  }
  return safeParseResult.data;
}

export const env = createEnv(process.env);

