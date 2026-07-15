import { z } from "zod";

const envSchema = z.object({
  JWT_SECRET: z.string().describe("JWT secret key"),
});

function createEnv(env: NodeJS.ProcessEnv) {
  const safeParseResult = envSchema.safeParse(env);
  if (!safeParseResult.success) throw new Error(safeParseResult.error.message);
  return safeParseResult.data;
}

// Email env is optional — if not set, email notifications are silently skipped
const EmailEnvSchema = z.object({
  RESEND_API_KEY: z.string().optional().describe("Resend API key for email notifications"),
  FROM_EMAIL: z.string().email().optional().describe("From email address"),
})

function createEmailEnv(env: NodeJS.ProcessEnv) {
  const safeParseResult = EmailEnvSchema.safeParse(env);
  if (!safeParseResult.success) {
    console.warn("[services/env] Email env missing or invalid, email notifications disabled.");
    return { RESEND_API_KEY: undefined, FROM_EMAIL: undefined };
  }
  return safeParseResult.data;
}

export const env = createEnv(process.env);
export const emailEnv = createEmailEnv(process.env);

