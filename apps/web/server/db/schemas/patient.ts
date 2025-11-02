import { pgTable, text, uuid, date } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { standardSchema } from "./base_schemas";
import DiagnosesTable from "./diagnosis";
import PredictionsTable from "./prediction";

const PatientsTable = pgTable("patients", {
  ...standardSchema,
  name: text("name").notNull(),
  dateOfBirth: date("date_of_birth").notNull(),
  gender: text("gender").notNull(),
  diagnosisId: uuid("diagnosis_id").references(() => DiagnosesTable.id),
  clinicalConditions: text("clinical_conditions").array().notNull(),
});

export const patientsRelations = relations(PatientsTable, ({ one, many }) => ({
  diagnosis: one(DiagnosesTable, {
    fields: [PatientsTable.diagnosisId],
    references: [DiagnosesTable.id],
  }),
  predictions: many(PredictionsTable),
}));

export default PatientsTable;
