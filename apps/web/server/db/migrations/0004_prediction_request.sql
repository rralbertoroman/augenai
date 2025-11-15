CREATE TABLE "prediction_requests" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"task" text NOT NULL,
	"image_type" text NOT NULL,
	"diseases" jsonb NOT NULL,
	"storage_path" text NOT NULL,
	"bucket_name" text NOT NULL,
	"models_used" jsonb NOT NULL
);
--> statement-breakpoint
ALTER TABLE "predictions" DROP CONSTRAINT "predictions_patient_id_patients_id_fk";
--> statement-breakpoint
ALTER TABLE "predictions" ADD COLUMN "request_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "predictions" ADD COLUMN "status" text DEFAULT 'success' NOT NULL;--> statement-breakpoint
ALTER TABLE "predictions" ADD COLUMN "error" text;--> statement-breakpoint
ALTER TABLE "prediction_requests" ADD CONSTRAINT "prediction_requests_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "predictions" ADD CONSTRAINT "predictions_request_id_prediction_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."prediction_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "predictions" DROP COLUMN "user_id";--> statement-breakpoint
ALTER TABLE "predictions" DROP COLUMN "patient_id";