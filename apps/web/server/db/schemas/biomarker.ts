import { pgTable, text, bigint } from "drizzle-orm/pg-core";
import { standardSchema } from "./base_schemas";

const BiomarkersTable = pgTable("biomarkers", {
  ...standardSchema,
  name: text("name").notNull(),
  classId: bigint("class_id", { mode: "number" }).notNull(),
});

export default BiomarkersTable;
