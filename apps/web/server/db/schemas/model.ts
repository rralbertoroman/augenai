import { pgTable, text, real, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { standardSchema } from "./base_schemas";
import PredictionsTable from "./prediction";

const ModelsTable = pgTable("models", {
  ...standardSchema,
  modelName: text("model_name").notNull(),
  modelTasks: text("model_tasks").array().notNull(),
  diseases: text("diseases").array().notNull(),
  acceptedImageTypes: text("accepted_image_types").array().notNull(),
  latestTraining: timestamp("latest_training").notNull(),
  accuracy: real("accuracy").notNull(),
});

export const modelsRelations = relations(ModelsTable, ({ many }) => ({
  predictions: many(PredictionsTable),
}));

export default ModelsTable;
