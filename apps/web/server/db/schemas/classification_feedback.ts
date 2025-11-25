import { pgTable, uuid, boolean, integer, real } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { standardSchema } from "./base_schemas";
import ClassificationsTable from "./classification";
import UserProfilesTable from "./user_profile";

const ClassificationFeedbackTable = pgTable("classification_feedback", {
  ...standardSchema,
  classificationId: uuid("classification_id")
    .notNull()
    .references(() => ClassificationsTable.id),
  userProfileId: uuid("user_profile_id")
    .notNull()
    .references(() => UserProfilesTable.id),
  isMainUser: boolean("is_main_user").default(true).notNull(),
  isMainData: boolean("is_main_data").default(false).notNull(),
  classId: integer("class_id").notNull(),
  confidence: real("confidence").notNull(),
});

export const classificationFeedbackRelations = relations(
  ClassificationFeedbackTable,
  ({ one }) => ({
    classification: one(ClassificationsTable, {
      fields: [ClassificationFeedbackTable.classificationId],
      references: [ClassificationsTable.id],
    }),
    userProfile: one(UserProfilesTable, {
      fields: [ClassificationFeedbackTable.userProfileId],
      references: [UserProfilesTable.id],
    }),
  }),
);

export default ClassificationFeedbackTable;
