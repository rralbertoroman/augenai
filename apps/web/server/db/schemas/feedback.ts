import { pgTable, uuid, boolean, integer, real } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { standardSchema } from "./base_schemas";
import PredictionDiagnosesTable from "./prediction_diagnosis";
import UserProfilesTable from "./user_profile";

const FeedbackTable = pgTable("feedback", {
  ...standardSchema,
  diagnosisId: uuid("diagnosis_id")
    .notNull()
    .references(() => PredictionDiagnosesTable.id),
  userProfileId: uuid("user_profile_id")
    .notNull()
    .references(() => UserProfilesTable.id),
  isMainUser: boolean("is_main_user").default(true).notNull(),
  isMainData: boolean("is_main_data").default(false).notNull(),
  classId: integer("class_id").notNull(),
  confidence: real("confidence").notNull(),
});

export const feedbackRelations = relations(FeedbackTable, ({ one }) => ({
  diagnosis: one(PredictionDiagnosesTable, {
    fields: [FeedbackTable.diagnosisId],
    references: [PredictionDiagnosesTable.id],
  }),
  userProfile: one(UserProfilesTable, {
    fields: [FeedbackTable.userProfileId],
    references: [UserProfilesTable.id],
  }),
}));

export default FeedbackTable;
