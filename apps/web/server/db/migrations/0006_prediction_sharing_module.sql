CREATE TABLE "feedback" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"prediction_id" uuid NOT NULL,
	"user_profile_id" uuid NOT NULL,
	"is_main" boolean DEFAULT true NOT NULL,
	"feedback_data" jsonb NOT NULL,
	CONSTRAINT "feedback_prediction_id_user_profile_id_pk" PRIMARY KEY("prediction_id","user_profile_id")
);
--> statement-breakpoint
CREATE TABLE "prediction_sharings" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"prediction_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"has_feedback" boolean DEFAULT false NOT NULL,
	CONSTRAINT "prediction_sharings_prediction_id_user_id_pk" PRIMARY KEY("prediction_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_prediction_id_predictions_id_fk" FOREIGN KEY ("prediction_id") REFERENCES "public"."predictions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_user_profile_id_user_profiles_id_fk" FOREIGN KEY ("user_profile_id") REFERENCES "public"."user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prediction_sharings" ADD CONSTRAINT "prediction_sharings_prediction_id_predictions_id_fk" FOREIGN KEY ("prediction_id") REFERENCES "public"."predictions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prediction_sharings" ADD CONSTRAINT "prediction_sharings_user_id_user_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prediction_requests" ADD CONSTRAINT "prediction_requests_user_id_user_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "prediction_class_disease" DROP COLUMN "class_id";
ALTER TABLE "prediction_class_disease" ADD COLUMN "class_id" integer NOT NULL;