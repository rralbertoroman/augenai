import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { standardSchema } from "./base_schemas";
import DiseasesTable from "./disease";
import PatientsTable from "./patient";
import PredictionsTable from "./prediction";

const DiagnosesTable = pgTable("diagnoses", {
  ...standardSchema,
  diseaseId: uuid("disease_id")
    .notNull()
    .references(() => DiseasesTable.id),
  currentStage: text("current_stage").notNull(),
});

export const diagnosesRelations = relations(
  DiagnosesTable,
  ({ one, many }) => ({
    disease: one(DiseasesTable, {
      fields: [DiagnosesTable.diseaseId],
      references: [DiseasesTable.id],
    }),
    patients: many(PatientsTable),
    predictions: many(PredictionsTable),
  }),
);

export default DiagnosesTable;
