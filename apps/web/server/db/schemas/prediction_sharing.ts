import { pgTable, uuid, boolean, primaryKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { manyToManyNoIDSchema } from "./base_schemas";
import PredictionsTable from "./prediction";
import UserProfilesTable from "./user_profile";

const PredictionSharingTable = pgTable(
  "prediction_sharings",
  {
    ...manyToManyNoIDSchema,
    predictionId: uuid("prediction_id")
      .notNull()
      .references(() => PredictionsTable.id),
    userId: uuid("user_id")
      .notNull()
      .references(() => UserProfilesTable.id),
    hasFeedback: boolean("has_feedback").default(false).notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.predictionId, t.userId] }),
  }),
);

export const predictionSharingRelations = relations(
  PredictionSharingTable,
  ({ one }) => ({
    prediction: one(PredictionsTable, {
      fields: [PredictionSharingTable.predictionId],
      references: [PredictionsTable.id],
    }),
    user: one(UserProfilesTable, {
      fields: [PredictionSharingTable.userId],
      references: [UserProfilesTable.id],
    }),
  }),
);

export default PredictionSharingTable;
