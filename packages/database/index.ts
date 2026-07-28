import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { env } from "./env";

const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
  ssl:
    !env.DATABASE_URL || env.DATABASE_URL.includes("localhost") || env.DATABASE_URL.includes("127.0.0.1")
      ? false
      : { rejectUnauthorized: false },
});

export const db = drizzle(pool);
export * from "drizzle-orm";
export default db;
