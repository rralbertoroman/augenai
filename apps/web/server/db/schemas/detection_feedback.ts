import { pgTable, uuid, boolean, integer, real } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { standardSchema } from "./base_schemas";
import DetectionsTable from "./detection";
import UserProfilesTable from "./user_profile";

const DetectionFeedbackTable = pgTable("detection_feedback", {
  ...standardSchema,
  detectionId: uuid("detection_id")
    .notNull()
    .references(() => DetectionsTable.id),
  userProfileId: uuid("user_profile_id")
    .notNull()
    .references(() => UserProfilesTable.id),
  isMainUser: boolean("is_main_user").default(true).notNull(),
  isMainData: boolean("is_main_data").default(false).notNull(),
  classId: integer("class_id").notNull(),
  confidence: real("confidence").notNull(),
  xLeft: real("x_left").notNull(),
  yTop: real("y_top").notNull(),
  width: real("width").notNull(),
  height: real("height").notNull(),
});

export const detectionFeedbackRelations = relations(
  DetectionFeedbackTable,
  ({ one }) => ({
    detection: one(DetectionsTable, {
      fields: [DetectionFeedbackTable.detectionId],
      references: [DetectionsTable.id],
    }),
    userProfile: one(UserProfilesTable, {
      fields: [DetectionFeedbackTable.userProfileId],
      references: [UserProfilesTable.id],
    }),
  }),
);

export default DetectionFeedbackTable;
