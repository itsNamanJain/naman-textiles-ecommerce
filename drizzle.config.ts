import { type Config } from "drizzle-kit";

import { env } from "@/env";

// Append sslmode if not already present in the URL
const dbUrl = env.DATABASE_URL.includes("sslmode=")
  ? env.DATABASE_URL
  : `${env.DATABASE_URL}${env.DATABASE_URL.includes("?") ? "&" : "?"}sslmode=require`;

export default {
  schema: "./src/server/db/schema",
  dialect: "postgresql",
  dbCredentials: {
    url: dbUrl,
  },
} satisfies Config;
