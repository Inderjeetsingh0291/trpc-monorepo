import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import pg from "pg";
import { env } from "./env";

const isNeon = env.DATABASE_URL?.includes("neon.tech");

function createDb() {
  if (isNeon) {
    const sql = neon(env.DATABASE_URL);
    return drizzleNeon({ client: sql });
  } else {
    const pool = new pg.Pool({
      connectionString: env.DATABASE_URL || "",
      ssl:
        !env.DATABASE_URL ||
        env.DATABASE_URL.includes("localhost") ||
        env.DATABASE_URL.includes("127.0.0.1")
          ? false
          : { rejectUnauthorized: false },
    });
    return drizzlePg(pool);
  }
}

export const db = createDb() as any;
export * from "drizzle-orm";
export default db;
