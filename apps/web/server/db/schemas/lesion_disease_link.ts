import { pgTable, uuid, primaryKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { manyToManyNoIDSchema } from "./base_schemas";
import LesionsTable from "./lesion";
import DiseasesTable from "./disease";

const LesionDiseaseLinkTable = pgTable(
  "lesion_disease_link",
  {
    ...manyToManyNoIDSchema,
    lesionId: uuid("lesion_id")
      .notNull()
      .references(() => LesionsTable.id),
    diseaseId: uuid("disease_id")
      .notNull()
      .references(() => DiseasesTable.id),
  },
  (t) => [primaryKey({ columns: [t.lesionId, t.diseaseId] })],
);

export const lesionDiseaseLinkRelations = relations(
  LesionDiseaseLinkTable,
  ({ one }) => ({
    lesion: one(LesionsTable, {
      fields: [LesionDiseaseLinkTable.lesionId],
      references: [LesionsTable.id],
    }),
    disease: one(DiseasesTable, {
      fields: [LesionDiseaseLinkTable.diseaseId],
      references: [DiseasesTable.id],
    }),
  }),
);

export default LesionDiseaseLinkTable;
