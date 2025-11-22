import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { standardSchema } from "./base_schemas";
import PredictionSharingTable from "./prediction_sharing";
import PredictionRequestsTable from "./prediction_request";

const UserProfilesTable = pgTable("user_profiles", {
  id: uuid("id").primaryKey(), // ID from Supabase auth.users (not auto-generated)
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull().default("doctor"), // Values: "admin", "doctor", "patient"
  createdAt: standardSchema.createdAt,
  updatedAt: standardSchema.updatedAt,
});

export const userProfilesRelations = relations(
  UserProfilesTable,
  ({ many }) => ({
    sharings: many(PredictionSharingTable),
    predictionRequests: many(PredictionRequestsTable),
  }),
);

export default UserProfilesTable;
