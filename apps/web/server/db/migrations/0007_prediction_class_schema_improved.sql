-- Drop the old primary key constraint on id column
ALTER TABLE "prediction_class_disease" DROP CONSTRAINT IF EXISTS "prediction_class_disease_pkey";-->statement-breakpoint

-- Drop the id column
ALTER TABLE "prediction_class_disease" DROP COLUMN IF EXISTS "id";-->statement-breakpoint

-- Add the new composite primary key
ALTER TABLE "prediction_class_disease" ADD CONSTRAINT "prediction_class_disease_class_id_model_id_pk" PRIMARY KEY("class_id","model_id");