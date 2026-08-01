import { z } from "zod";

const DEFAULT_DB_URL =
  "postgresql://neondb_owner:npg_4DVxhKXrP7vq@ep-purple-field-ax586309.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require";

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

