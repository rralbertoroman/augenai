import { pgTable, text, date } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { standardSchema } from "./base_schemas";
import PredictionsTable from "./prediction";

const PatientsTable = pgTable("patients", {
  ...standardSchema,
  name: text("name").notNull(),
  dateOfBirth: date("date_of_birth").notNull(),
  gender: text("gender").notNull(),
  clinicalConditions: text("clinical_conditions").array().notNull(),
});

export const patientsRelations = relations(PatientsTable, ({ many }) => ({
  predictions: many(PredictionsTable),
}));

export default PatientsTable;
