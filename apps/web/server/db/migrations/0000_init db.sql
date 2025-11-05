CREATE TABLE "diseases" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"stages" text[] NOT NULL
);
--> statement-breakpoint
CREATE TABLE "models" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"model_name" text NOT NULL,
	"model_tasks" text[] NOT NULL,
	"diseases" text[] NOT NULL,
	"accepted_image_types" text[] NOT NULL,
	"latest_training" timestamp NOT NULL,
	"accuracy" real NOT NULL
);
--> statement-breakpoint
CREATE TABLE "patients" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"date_of_birth" date NOT NULL,
	"gender" text NOT NULL,
	"clinical_conditions" text[] NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prediction_classes" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"model_id" uuid NOT NULL,
	"disease_id" uuid NOT NULL,
	"stage_idx" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "predictions" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"class_id" uuid NOT NULL,
	"model_id" uuid NOT NULL,
	"prediction_result" jsonb NOT NULL,
	"prediction_metadata" jsonb NOT NULL,
	"user_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "prediction_classes" ADD CONSTRAINT "prediction_classes_model_id_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."models"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prediction_classes" ADD CONSTRAINT "prediction_classes_disease_id_diseases_id_fk" FOREIGN KEY ("disease_id") REFERENCES "public"."diseases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "predictions" ADD CONSTRAINT "predictions_class_id_prediction_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."prediction_classes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "predictions" ADD CONSTRAINT "predictions_model_id_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."models"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "predictions" ADD CONSTRAINT "predictions_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;