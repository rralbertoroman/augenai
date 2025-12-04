import { pgTable, text, bigint } from "drizzle-orm/pg-core";
import { standardSchema } from "./base_schemas";

const LesionsTable = pgTable("lesions", {
  ...standardSchema,
  name: text("name").notNull(),
  classId: bigint("class_id", { mode: "number" }).notNull(),
});

export default LesionsTable;
