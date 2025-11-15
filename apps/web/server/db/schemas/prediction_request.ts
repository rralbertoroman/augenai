import { pgTable, uuid, text, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { standardSchema } from "./base_schemas";
import PatientsTable from "./patient";
import PredictionsTable from "./prediction";

const PredictionRequestsTable = pgTable("prediction_requests", {
  ...standardSchema,
  userId: uuid("user_id").notNull(),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => PatientsTable.id),
  task: text("task").notNull(), // e.g., "classification", "detection"
  imageType: text("image_type").notNull(), // e.g., "xray", "ct", "mri"
  diseases: jsonb("diseases").notNull().$type<string[]>(), // Array of disease names
  storagePath: text("storage_path").notNull(), // Path to image in storage
  bucketName: text("bucket_name").notNull(), // Storage bucket name
  modelsUsed: jsonb("models_used").notNull().$type<string[]>(), // Array of model IDs used
});

export const predictionRequestsRelations = relations(
  PredictionRequestsTable,
  ({ one, many }) => ({
    patient: one(PatientsTable, {
      fields: [PredictionRequestsTable.patientId],
      references: [PatientsTable.id],
    }),
    predictions: many(PredictionsTable),
  }),
);

export default PredictionRequestsTable;
