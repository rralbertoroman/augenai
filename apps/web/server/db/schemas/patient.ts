import { pgTable, text, date, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { standardSchema } from "./base_schemas";
import PredictionsTable from "./prediction";
import UserProfilesTable from "./user_profile";

const PatientsTable = pgTable("patients", {
  ...standardSchema,
  name: text("name").notNull(),
  dateOfBirth: date("date_of_birth").notNull(),
  gender: text("gender").notNull(),
  clinicalConditions: text("clinical_conditions").array().notNull(),
  doctorId: uuid("doctor_id")
    .notNull()
    .references(() => UserProfilesTable.id),
});

export const patientsRelations = relations(PatientsTable, ({ one, many }) => ({
  predictions: many(PredictionsTable),
  doctor: one(UserProfilesTable, {
    fields: [PatientsTable.doctorId],
    references: [UserProfilesTable.id],
  }),
}));

export default PatientsTable;
