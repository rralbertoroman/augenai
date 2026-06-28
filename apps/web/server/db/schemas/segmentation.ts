import { pgTable, uuid, integer, real, text, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { standardSchema } from "./base_schemas";
import PredictionsTable from "./prediction";

const SegmentationsTable = pgTable("segmentations", {
  ...standardSchema,
  predictionId: uuid("prediction_id")
    .notNull()
    .references(() => PredictionsTable.id),
  classId: integer("class_id").notNull(),
  className: text("class_name").notNull(),
  polygon: jsonb("polygon").$type<number[][]>().notNull(),
  area: real("area").notNull(),
  confidence: real("confidence").notNull(),
});

export const segmentationsRelations = relations(
  SegmentationsTable,
  ({ one }) => ({
    prediction: one(PredictionsTable, {
      fields: [SegmentationsTable.predictionId],
      references: [PredictionsTable.id],
    }),
  }),
);

export default SegmentationsTable;
