CREATE TABLE "prediction_diagnoses" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"prediction_id" uuid NOT NULL,
	"class_id" integer NOT NULL,
	"confidence" real NOT NULL
);
--> statement-breakpoint
ALTER TABLE "feedback" RENAME COLUMN "is_main" TO "is_main_user";--> statement-breakpoint
ALTER TABLE "feedback" DROP CONSTRAINT "feedback_prediction_id_predictions_id_fk";
--> statement-breakpoint
ALTER TABLE "feedback" DROP CONSTRAINT "feedback_prediction_id_user_profile_id_pk";--> statement-breakpoint
ALTER TABLE "feedback" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "feedback" ADD COLUMN "diagnosis_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "feedback" ADD COLUMN "is_main_data" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "feedback" ADD COLUMN "class_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "feedback" ADD COLUMN "confidence" real NOT NULL;--> statement-breakpoint
ALTER TABLE "prediction_diagnoses" ADD CONSTRAINT "prediction_diagnoses_prediction_id_predictions_id_fk" FOREIGN KEY ("prediction_id") REFERENCES "public"."predictions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_diagnosis_id_prediction_diagnoses_id_fk" FOREIGN KEY ("diagnosis_id") REFERENCES "public"."prediction_diagnoses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" DROP COLUMN "prediction_id";--> statement-breakpoint
ALTER TABLE "feedback" DROP COLUMN "feedback_data";--> statement-breakpoint
ALTER TABLE "predictions" DROP COLUMN "prediction_result";