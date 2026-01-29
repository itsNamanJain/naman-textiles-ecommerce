import { drizzle } from "drizzle-orm/postgres-js";
import { CamelCasePlugin, Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import postgres from "postgres";

import { env } from "@/env";
import * as schema from "./schema";
import type { Database } from "./kysely-types";

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
  pool: Pool | undefined;
};

// Append sslmode if not already present in the URL
const dbUrl = env.DATABASE_URL.includes("sslmode=")
  ? env.DATABASE_URL
  : `${env.DATABASE_URL}${env.DATABASE_URL.includes("?") ? "&" : "?"}sslmode=require`;

const conn = globalForDb.conn ?? postgres(dbUrl);
if (env.NODE_ENV !== "production") globalForDb.conn = conn;

export const drizzleDb = drizzle(conn, { schema });

// Create pg Pool for Kysely
const pool = globalForDb.pool ?? new Pool({ connectionString: dbUrl });
if (env.NODE_ENV !== "production") globalForDb.pool = pool;

export type { Database };

export const kyselyDb = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool,
  }),
  plugins: [new CamelCasePlugin()],
});
