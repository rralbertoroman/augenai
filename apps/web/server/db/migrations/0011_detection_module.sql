CREATE TABLE "detections" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"prediction_id" uuid NOT NULL,
	"class_id" integer NOT NULL,
	"confidence" real NOT NULL,
	"x_left" real NOT NULL,
	"y_top" real NOT NULL,
	"width" real NOT NULL,
	"height" real NOT NULL
);
--> statement-breakpoint
CREATE TABLE "detection_feedback" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"detection_id" uuid NOT NULL,
	"user_profile_id" uuid NOT NULL,
	"is_main_user" boolean DEFAULT true NOT NULL,
	"is_main_data" boolean DEFAULT false NOT NULL,
	"class_id" integer NOT NULL,
	"confidence" real NOT NULL,
	"x_left" real NOT NULL,
	"y_top" real NOT NULL,
	"width" real NOT NULL,
	"height" real NOT NULL
);
--> statement-breakpoint
ALTER TABLE "prediction_diagnoses" RENAME TO "classifications";--> statement-breakpoint
ALTER TABLE "feedback" RENAME TO "classification_feedback";--> statement-breakpoint
ALTER TABLE "classification_feedback" RENAME COLUMN "diagnosis_id" TO "classification_id";--> statement-breakpoint
ALTER TABLE "classification_feedback" DROP CONSTRAINT "feedback_diagnosis_id_prediction_diagnoses_id_fk";
--> statement-breakpoint
ALTER TABLE "classification_feedback" DROP CONSTRAINT "feedback_user_profile_id_user_profiles_id_fk";
--> statement-breakpoint
ALTER TABLE "classifications" DROP CONSTRAINT "prediction_diagnoses_prediction_id_predictions_id_fk";
--> statement-breakpoint
ALTER TABLE "detections" ADD CONSTRAINT "detections_prediction_id_predictions_id_fk" FOREIGN KEY ("prediction_id") REFERENCES "public"."predictions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "detection_feedback" ADD CONSTRAINT "detection_feedback_detection_id_detections_id_fk" FOREIGN KEY ("detection_id") REFERENCES "public"."detections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "detection_feedback" ADD CONSTRAINT "detection_feedback_user_profile_id_user_profiles_id_fk" FOREIGN KEY ("user_profile_id") REFERENCES "public"."user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "classification_feedback" ADD CONSTRAINT "classification_feedback_classification_id_classifications_id_fk" FOREIGN KEY ("classification_id") REFERENCES "public"."classifications"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "classification_feedback" ADD CONSTRAINT "classification_feedback_user_profile_id_user_profiles_id_fk" FOREIGN KEY ("user_profile_id") REFERENCES "public"."user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "classifications" ADD CONSTRAINT "classifications_prediction_id_predictions_id_fk" FOREIGN KEY ("prediction_id") REFERENCES "public"."predictions"("id") ON DELETE no action ON UPDATE no action;