import { pgTable, uuid, integer, real } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { standardSchema } from "./base_schemas";
import PredictionsTable from "./prediction";
import ClassificationFeedbackTable from "./classification_feedback";

const ClassificationsTable = pgTable("classifications", {
  ...standardSchema,
  predictionId: uuid("prediction_id")
    .notNull()
    .references(() => PredictionsTable.id),
  classId: integer("class_id").notNull(),
  confidence: real("confidence").notNull(),
});

export const classificationsRelations = relations(
  ClassificationsTable,
  ({ one, many }) => ({
    prediction: one(PredictionsTable, {
      fields: [ClassificationsTable.predictionId],
      references: [PredictionsTable.id],
    }),
    feedbacks: many(ClassificationFeedbackTable),
  }),
);

export default ClassificationsTable;
