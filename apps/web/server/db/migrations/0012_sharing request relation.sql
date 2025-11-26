ALTER TABLE "prediction_sharings" RENAME COLUMN "prediction_id" TO "prediction_request_id";--> statement-breakpoint
ALTER TABLE "prediction_sharings" DROP CONSTRAINT "prediction_sharings_prediction_id_predictions_id_fk";
--> statement-breakpoint
ALTER TABLE "prediction_sharings" DROP CONSTRAINT "prediction_sharings_prediction_id_user_id_pk";--> statement-breakpoint
ALTER TABLE "prediction_sharings" ADD CONSTRAINT "prediction_sharings_prediction_request_id_user_id_pk" PRIMARY KEY("prediction_request_id","user_id");--> statement-breakpoint
ALTER TABLE "prediction_sharings" ADD CONSTRAINT "prediction_sharings_prediction_request_id_prediction_requests_id_fk" FOREIGN KEY ("prediction_request_id") REFERENCES "public"."prediction_requests"("id") ON DELETE no action ON UPDATE no action;