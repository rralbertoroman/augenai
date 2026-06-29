CREATE TABLE "biomarkers" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"class_id" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "biomarker_disease_link" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"biomarker_id" uuid NOT NULL,
	"disease_id" uuid NOT NULL,
	CONSTRAINT "biomarker_disease_link_biomarker_id_disease_id_pk" PRIMARY KEY("biomarker_id","disease_id")
);
--> statement-breakpoint
CREATE TABLE "prediction_class_biomarker" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"class_id" integer NOT NULL,
	"model_id" uuid NOT NULL,
	"biomarker_id" uuid NOT NULL,
	CONSTRAINT "prediction_class_biomarker_class_id_model_id_pk" PRIMARY KEY("class_id","model_id")
);
--> statement-breakpoint
ALTER TABLE "biomarker_disease_link" ADD CONSTRAINT "biomarker_disease_link_biomarker_id_biomarkers_id_fk" FOREIGN KEY ("biomarker_id") REFERENCES "public"."biomarkers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "biomarker_disease_link" ADD CONSTRAINT "biomarker_disease_link_disease_id_diseases_id_fk" FOREIGN KEY ("disease_id") REFERENCES "public"."diseases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prediction_class_biomarker" ADD CONSTRAINT "prediction_class_biomarker_model_id_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."models"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prediction_class_biomarker" ADD CONSTRAINT "prediction_class_biomarker_biomarker_id_biomarkers_id_fk" FOREIGN KEY ("biomarker_id") REFERENCES "public"."biomarkers"("id") ON DELETE no action ON UPDATE no action;