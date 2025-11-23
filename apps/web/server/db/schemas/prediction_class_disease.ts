import { pgTable, uuid, integer, primaryKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { manyToManyNoIDSchema } from "./base_schemas";
import ModelsTable from "./model";
import DiseasesTable from "./disease";
import PredictionsTable from "./prediction";

const PredictionClassesTable = pgTable(
  "prediction_class_disease",
  {
    ...manyToManyNoIDSchema,
    classId: integer("class_id").notNull(),
    modelId: uuid("model_id")
      .notNull()
      .references(() => ModelsTable.id),
    diseaseId: uuid("disease_id")
      .notNull()
      .references(() => DiseasesTable.id),
    stageIdx: integer("stage_idx").notNull(),
  },
  (t) => [primaryKey({ columns: [t.classId, t.modelId] })],
);

export const predictionClassesRelations = relations(
  PredictionClassesTable,
  ({ one, many }) => ({
    model: one(ModelsTable, {
      fields: [PredictionClassesTable.modelId],
      references: [ModelsTable.id],
    }),
    disease: one(DiseasesTable, {
      fields: [PredictionClassesTable.diseaseId],
      references: [DiseasesTable.id],
    }),
    predictions: many(PredictionsTable),
  }),
);

export default PredictionClassesTable;
