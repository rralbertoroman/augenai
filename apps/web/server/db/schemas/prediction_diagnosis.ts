import { pgTable, uuid, integer, real } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { standardSchema } from "./base_schemas";
import PredictionsTable from "./prediction";
import FeedbackTable from "./feedback";

const PredictionDiagnosesTable = pgTable("prediction_diagnoses", {
  ...standardSchema,
  predictionId: uuid("prediction_id")
    .notNull()
    .references(() => PredictionsTable.id),
  classId: integer("class_id").notNull(),
  confidence: real("confidence").notNull(),
});

export const predictionDiagnosesRelations = relations(
  PredictionDiagnosesTable,
  ({ one, many }) => ({
    prediction: one(PredictionsTable, {
      fields: [PredictionDiagnosesTable.predictionId],
      references: [PredictionsTable.id],
    }),
    feedbacks: many(FeedbackTable),
  }),
);

export default PredictionDiagnosesTable;
