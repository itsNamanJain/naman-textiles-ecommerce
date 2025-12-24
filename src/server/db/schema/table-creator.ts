import { pgTableCreator } from "drizzle-orm/pg-core";

/**
 * Table creator for Drizzle ORM.
 */
export const createTable = pgTableCreator((name) => name);
