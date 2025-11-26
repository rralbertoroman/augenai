import { pgTable, uuid, integer, real } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { standardSchema } from "./base_schemas";
import PredictionsTable from "./prediction";
import DetectionFeedbackTable from "./detection_feedback";

const DetectionsTable = pgTable("detections", {
  ...standardSchema,
  predictionId: uuid("prediction_id")
    .notNull()
    .references(() => PredictionsTable.id),
  classId: integer("class_id").notNull(),
  confidence: real("confidence").notNull(),
  xLeft: real("x_left").notNull(),
  yTop: real("y_top").notNull(),
  width: real("width").notNull(),
  height: real("height").notNull(),
});

export const detectionsRelations = relations(
  DetectionsTable,
  ({ one, many }) => ({
    prediction: one(PredictionsTable, {
      fields: [DetectionsTable.predictionId],
      references: [PredictionsTable.id],
    }),
    feedbacks: many(DetectionFeedbackTable),
  }),
);

export default DetectionsTable;
