import { pgTable, uuid, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { standardSchema } from "./base_schemas";
import ModelsTable from "./model";
import PatientsTable from "./patient";
import PredictionClassesTable from "./prediction_class";

const PredictionsTable = pgTable("predictions", {
  ...standardSchema,
  classId: uuid("class_id")
    .notNull()
    .references(() => PredictionClassesTable.id),
  modelId: uuid("model_id")
    .notNull()
    .references(() => ModelsTable.id),
  predictionResult: jsonb("prediction_result").notNull(),
  predictionMetadata: jsonb("prediction_metadata").notNull(),
  userId: uuid("user_id").notNull(),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => PatientsTable.id),
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
  predictionClass: one(PredictionClassesTable, {
    fields: [PredictionsTable.classId],
    references: [PredictionClassesTable.id],
  }),
}));

export default PredictionsTable;
