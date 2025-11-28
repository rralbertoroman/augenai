CREATE TABLE "lesion_disease_link" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"lesion_id" uuid NOT NULL,
	"disease_id" uuid NOT NULL,
	CONSTRAINT "lesion_disease_link_lesion_id_disease_id_pk" PRIMARY KEY("lesion_id","disease_id")
);
--> statement-breakpoint
CREATE TABLE "lesions" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"class_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prediction_class_lesion" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"class_id" integer NOT NULL,
	"model_id" uuid NOT NULL,
	"lesion_id" uuid NOT NULL,
	CONSTRAINT "prediction_class_lesion_class_id_model_id_pk" PRIMARY KEY("class_id","model_id")
);
--> statement-breakpoint
ALTER TABLE "lesion_disease_link" ADD CONSTRAINT "lesion_disease_link_lesion_id_lesions_id_fk" FOREIGN KEY ("lesion_id") REFERENCES "public"."lesions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesion_disease_link" ADD CONSTRAINT "lesion_disease_link_disease_id_diseases_id_fk" FOREIGN KEY ("disease_id") REFERENCES "public"."diseases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prediction_class_lesion" ADD CONSTRAINT "prediction_class_lesion_model_id_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."models"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prediction_class_lesion" ADD CONSTRAINT "prediction_class_lesion_lesion_id_lesions_id_fk" FOREIGN KEY ("lesion_id") REFERENCES "public"."lesions"("id") ON DELETE no action ON UPDATE no action;