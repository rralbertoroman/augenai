import { pgTable, uuid, integer, primaryKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { manyToManyNoIDSchema } from "./base_schemas";
import ModelsTable from "./model";
import LesionsTable from "./lesion";
import PredictionsTable from "./prediction";

const PredictionClassLesionsTable = pgTable(
  "prediction_class_lesion",
  {
    ...manyToManyNoIDSchema,
    classId: integer("class_id").notNull(),
    modelId: uuid("model_id")
      .notNull()
      .references(() => ModelsTable.id),
    lesionId: uuid("lesion_id")
      .notNull()
      .references(() => LesionsTable.id),
  },
  (t) => [primaryKey({ columns: [t.classId, t.modelId] })],
);

export const predictionClassLesionsRelations = relations(
  PredictionClassLesionsTable,
  ({ one, many }) => ({
    model: one(ModelsTable, {
      fields: [PredictionClassLesionsTable.modelId],
      references: [ModelsTable.id],
    }),
    lesion: one(LesionsTable, {
      fields: [PredictionClassLesionsTable.lesionId],
      references: [LesionsTable.id],
    }),
    predictions: many(PredictionsTable),
  }),
);

export default PredictionClassLesionsTable;
