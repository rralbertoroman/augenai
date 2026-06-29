import { pgTable, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { standardSchema } from "./base_schemas";
import ModelsTable from "./model";
import PredictionRequestsTable from "./prediction_request";
import PredictionSharingTable from "./prediction_sharing";
import ClassificationsTable from "./classification";
import DetectionsTable from "./detection";
import SegmentationsTable from "./segmentation";

const PredictionsTable = pgTable("predictions", {
  ...standardSchema,
  requestId: uuid("request_id")
    .notNull()
    .references(() => PredictionRequestsTable.id),
  modelId: uuid("model_id")
    .notNull()
    .references(() => ModelsTable.id),
});

export const predictionsRelations = relations(
  PredictionsTable,
  ({ one, many }) => ({
    model: one(ModelsTable, {
      fields: [PredictionsTable.modelId],
      references: [ModelsTable.id],
    }),
    request: one(PredictionRequestsTable, {
      fields: [PredictionsTable.requestId],
      references: [PredictionRequestsTable.id],
    }),
    sharings: many(PredictionSharingTable),
    classifications: many(ClassificationsTable),
    detections: many(DetectionsTable),
    segmentations: many(SegmentationsTable),
  }),
);

export default PredictionsTable;
