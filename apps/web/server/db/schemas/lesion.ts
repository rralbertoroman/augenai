import { pgTable, text, integer } from "drizzle-orm/pg-core";
import { standardSchema } from "./base_schemas";

const LesionsTable = pgTable("lesions", {
  ...standardSchema,
  name: text("name").notNull(),
  classId: integer("class_id").notNull(),
});

export default LesionsTable;
