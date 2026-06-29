CREATE TABLE "segmentations" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"prediction_id" uuid NOT NULL,
	"class_id" integer NOT NULL,
	"class_name" text NOT NULL,
	"polygon" jsonb NOT NULL,
	"area" real NOT NULL,
	"confidence" real NOT NULL
);
--> statement-breakpoint
ALTER TABLE "segmentations" ADD CONSTRAINT "segmentations_prediction_id_predictions_id_fk" FOREIGN KEY ("prediction_id") REFERENCES "public"."predictions"("id") ON DELETE no action ON UPDATE no action;