ALTER TABLE "predictions" DROP CONSTRAINT "predictions_class_id_prediction_classes_id_fk";
--> statement-breakpoint
ALTER TABLE "predictions" DROP COLUMN "class_id";