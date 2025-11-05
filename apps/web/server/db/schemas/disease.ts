import { pgTable, text } from "drizzle-orm/pg-core";
import { standardSchema } from "./base_schemas";

const DiseasesTable = pgTable("diseases", {
  ...standardSchema,
  name: text("name").notNull(),
  stages: text("stages").array().notNull(),
});

export default DiseasesTable;
