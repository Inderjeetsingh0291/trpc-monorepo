import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { env } from "./env";

const globalForDb = globalThis as unknown as {
  conn: pg.Pool | undefined;
};

const pool =
  globalForDb.conn ??
  new pg.Pool({
    connectionString: env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.conn = pool;
}

export const db = drizzle(pool);
export * from "drizzle-orm";
export default db;
