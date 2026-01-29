import { drizzle } from "drizzle-orm/postgres-js";
import { CamelCasePlugin, Kysely, PostgresDialect } from "kysely";
import postgres from "postgres";

import { env } from "@/env";
import * as schema from "./schema";

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

// Append sslmode if not already present in the URL
const dbUrl = env.DATABASE_URL.includes("sslmode=")
  ? env.DATABASE_URL
  : `${env.DATABASE_URL}${env.DATABASE_URL.includes("?") ? "&" : "?"}sslmode=require`;

const conn = globalForDb.conn ?? postgres(dbUrl);
if (env.NODE_ENV !== "production") globalForDb.conn = conn;

export const drizzleDb = drizzle(conn, { schema });

export type Database = Record<string, unknown>;

export const kyselyDb = new Kysely<Database>({
  dialect: new PostgresDialect({
    postgres: conn,
  }),
  plugins: [new CamelCasePlugin()],
});
