import { pgTable, uuid, boolean, jsonb, primaryKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { manyToManyNoIDSchema } from "./base_schemas";
import PredictionsTable from "./prediction";
import UserProfilesTable from "./user_profile";
import type { FeedbackItem } from "../../zod-schemas/feedback";

const FeedbackTable = pgTable(
  "feedback",
  {
    ...manyToManyNoIDSchema,
    predictionId: uuid("prediction_id")
      .notNull()
      .references(() => PredictionsTable.id),
    userProfileId: uuid("user_profile_id")
      .notNull()
      .references(() => UserProfilesTable.id),
    isMain: boolean("is_main").default(true).notNull(),
    feedbackData: jsonb("feedback_data").$type<FeedbackItem[]>().notNull(),
  },
  (t) => [primaryKey({ columns: [t.predictionId, t.userProfileId] })],
);

export const feedbackRelations = relations(FeedbackTable, ({ one }) => ({
  prediction: one(PredictionsTable, {
    fields: [FeedbackTable.predictionId],
    references: [PredictionsTable.id],
  }),
  userProfile: one(UserProfilesTable, {
    fields: [FeedbackTable.userProfileId],
    references: [UserProfilesTable.id],
  }),
}));

export default FeedbackTable;
