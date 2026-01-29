CREATE TYPE "public"."cancellation_request_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TABLE "cancellation_request" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"order_id" varchar(255) NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"reason" text,
	"status" "cancellation_request_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "cancellation_request" ADD CONSTRAINT "cancellation_request_order_id_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."order"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cancellation_request" ADD CONSTRAINT "cancellation_request_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cancellation_request_order_id_idx" ON "cancellation_request" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "cancellation_request_user_id_idx" ON "cancellation_request" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "cancellation_request_status_idx" ON "cancellation_request" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "cancellation_request_order_unique_idx" ON "cancellation_request" USING btree ("order_id");