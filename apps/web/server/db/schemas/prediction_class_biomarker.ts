import { pgTable, uuid, integer, primaryKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { manyToManyNoIDSchema } from "./base_schemas";
import ModelsTable from "./model";
import BiomarkersTable from "./biomarker";
import PredictionsTable from "./prediction";

const PredictionClassBiomarkersTable = pgTable(
  "prediction_class_biomarker",
  {
    ...manyToManyNoIDSchema,
    classId: integer("class_id").notNull(),
    modelId: uuid("model_id")
      .notNull()
      .references(() => ModelsTable.id),
    biomarkerId: uuid("biomarker_id")
      .notNull()
      .references(() => BiomarkersTable.id),
  },
  (t) => [primaryKey({ columns: [t.classId, t.modelId] })],
);

export const predictionClassBiomarkersRelations = relations(
  PredictionClassBiomarkersTable,
  ({ one, many }) => ({
    model: one(ModelsTable, {
      fields: [PredictionClassBiomarkersTable.modelId],
      references: [ModelsTable.id],
    }),
    biomarker: one(BiomarkersTable, {
      fields: [PredictionClassBiomarkersTable.biomarkerId],
      references: [BiomarkersTable.id],
    }),
    predictions: many(PredictionsTable),
  }),
);

export default PredictionClassBiomarkersTable;
