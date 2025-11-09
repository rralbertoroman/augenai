import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { standardSchema } from "./base_schemas";

const UserProfilesTable = pgTable("user_profiles", {
  id: uuid("id").primaryKey(), // ID from Supabase auth.users (not auto-generated)
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull().default("doctor"), // Values: "admin", "doctor", "patient"
  createdAt: standardSchema.createdAt,
  updatedAt: standardSchema.updatedAt,
});

export default UserProfilesTable;
