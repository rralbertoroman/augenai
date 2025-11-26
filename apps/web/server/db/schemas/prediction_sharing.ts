import { pgTable, uuid, boolean, primaryKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { manyToManyNoIDSchema } from "./base_schemas";
import PredictionRequestsTable from "./prediction_request";
import UserProfilesTable from "./user_profile";

const PredictionSharingTable = pgTable(
  "prediction_sharings",
  {
    ...manyToManyNoIDSchema,
    predictionRequestId: uuid("prediction_request_id")
      .notNull()
      .references(() => PredictionRequestsTable.id),
    userId: uuid("user_id")
      .notNull()
      .references(() => UserProfilesTable.id),
    hasFeedback: boolean("has_feedback").default(false).notNull(),
  },
  (t) => [primaryKey({ columns: [t.predictionRequestId, t.userId] })],
);

export const predictionSharingRelations = relations(
  PredictionSharingTable,
  ({ one }) => ({
    predictionRequest: one(PredictionRequestsTable, {
      fields: [PredictionSharingTable.predictionRequestId],
      references: [PredictionRequestsTable.id],
    }),
    user: one(UserProfilesTable, {
      fields: [PredictionSharingTable.userId],
      references: [UserProfilesTable.id],
    }),
  }),
);

export default PredictionSharingTable;
