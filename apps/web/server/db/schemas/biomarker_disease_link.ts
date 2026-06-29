import { pgTable, uuid, primaryKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { manyToManyNoIDSchema } from "./base_schemas";
import BiomarkersTable from "./biomarker";
import DiseasesTable from "./disease";

const BiomarkerDiseaseLinkTable = pgTable(
  "biomarker_disease_link",
  {
    ...manyToManyNoIDSchema,
    biomarkerId: uuid("biomarker_id")
      .notNull()
      .references(() => BiomarkersTable.id),
    diseaseId: uuid("disease_id")
      .notNull()
      .references(() => DiseasesTable.id),
  },
  (t) => [primaryKey({ columns: [t.biomarkerId, t.diseaseId] })],
);

export const biomarkerDiseaseLinkRelations = relations(
  BiomarkerDiseaseLinkTable,
  ({ one }) => ({
    biomarker: one(BiomarkersTable, {
      fields: [BiomarkerDiseaseLinkTable.biomarkerId],
      references: [BiomarkersTable.id],
    }),
    disease: one(DiseasesTable, {
      fields: [BiomarkerDiseaseLinkTable.diseaseId],
      references: [DiseasesTable.id],
    }),
  }),
);

export default BiomarkerDiseaseLinkTable;
