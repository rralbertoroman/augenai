import { pgTable, uuid, jsonb, text } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { standardSchema } from "./base_schemas";
import ModelsTable from "./model";
import PredictionRequestsTable from "./prediction_request";

const PredictionsTable = pgTable("predictions", {
  ...standardSchema,
  requestId: uuid("request_id")
    .notNull()
    .references(() => PredictionRequestsTable.id),
  modelId: uuid("model_id")
    .notNull()
    .references(() => ModelsTable.id),
  predictionResult: jsonb("prediction_result").notNull(),
  status: text("status").notNull().default("success"),
  error: text("error"),
});

export const predictionsRelations = relations(PredictionsTable, ({ one }) => ({
  model: one(ModelsTable, {
    fields: [PredictionsTable.modelId],
    references: [ModelsTable.id],
  }),
  request: one(PredictionRequestsTable, {
    fields: [PredictionsTable.requestId],
    references: [PredictionRequestsTable.id],
  }),
}));

export default PredictionsTable;
