CREATE TABLE "user_profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"role" varchar(50) DEFAULT 'doctor' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_profiles_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "prediction_classes" RENAME TO "prediction_class_disease";--> statement-breakpoint
ALTER TABLE "prediction_class_disease" DROP CONSTRAINT "prediction_classes_model_id_models_id_fk";
--> statement-breakpoint
ALTER TABLE "prediction_class_disease" DROP CONSTRAINT "prediction_classes_disease_id_diseases_id_fk";
--> statement-breakpoint
ALTER TABLE "prediction_class_disease" ADD COLUMN "class_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "prediction_class_disease" ADD CONSTRAINT "prediction_class_disease_model_id_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."models"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prediction_class_disease" ADD CONSTRAINT "prediction_class_disease_disease_id_diseases_id_fk" FOREIGN KEY ("disease_id") REFERENCES "public"."diseases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "predictions" DROP COLUMN "prediction_metadata";