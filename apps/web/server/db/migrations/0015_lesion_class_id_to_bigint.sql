ALTER TABLE "lesions" ALTER COLUMN "class_id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "models" ALTER COLUMN "latest_training" SET DATA TYPE timestamp with time zone;