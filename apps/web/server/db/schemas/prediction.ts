import { pgTable, uuid, date } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { standardSchema } from "./base_schemas";
import ModelsTable from "./model";
import PatientsTable from "./patient";
import DiagnosesTable from "./diagnosis";

const PredictionsTable = pgTable("predictions", {
  ...standardSchema,
  modelId: uuid("model_id")
    .notNull()
    .references(() => ModelsTable.id),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => PatientsTable.id),
  predictedDiagnosisId: uuid("predicted_diagnosis_id")
    .notNull()
    .references(() => DiagnosesTable.id),
  consultationDate: date("consultation_date").notNull(),
});

export const predictionsRelations = relations(PredictionsTable, ({ one }) => ({
  model: one(ModelsTable, {
    fields: [PredictionsTable.modelId],
    references: [ModelsTable.id],
  }),
  patient: one(PatientsTable, {
    fields: [PredictionsTable.patientId],
    references: [PatientsTable.id],
  }),
  predictedDiagnosis: one(DiagnosesTable, {
    fields: [PredictionsTable.predictedDiagnosisId],
    references: [DiagnosesTable.id],
  }),
}));

export default PredictionsTable;
