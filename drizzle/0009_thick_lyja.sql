ALTER TABLE "product" ADD COLUMN "color" varchar(100);--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "fabric_type" varchar(100);--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "stock_quantity" integer DEFAULT -1 NOT NULL;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "payment_method" varchar(50) DEFAULT 'cod' NOT NULL;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "utr_number" varchar(50);