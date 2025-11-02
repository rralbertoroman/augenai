import { pgTable, text } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { standardSchema } from "./base_schemas";
import DiagnosesTable from "./diagnosis";

const DiseasesTable = pgTable("diseases", {
  ...standardSchema,
  name: text("name").notNull(),
  stages: text("stages").array().notNull(),
});

export const diseasesRelations = relations(DiseasesTable, ({ many }) => ({
  diagnoses: many(DiagnosesTable),
}));

export default DiseasesTable;
