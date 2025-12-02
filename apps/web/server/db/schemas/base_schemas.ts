import { uuid, timestamp } from "drizzle-orm/pg-core";

/**
 * Base schema with common timestamp fields
 */
export const baseSchema = {
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
};

/**
 * Standard schema with UUID primary key
 */
export const standardSchema = {
  ...baseSchema,
  id: uuid("id").primaryKey().defaultRandom(),
};

/**
 * Many-to-many schema for junction/pivot tables
 * Extends baseSchema but without ID (uses composite primary keys)
 */
export const manyToManyNoIDSchema = {
  ...baseSchema,
};
