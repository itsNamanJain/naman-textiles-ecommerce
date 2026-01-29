ALTER TABLE "address" RENAME COLUMN "address_line_1" TO "address_line_one";--> statement-breakpoint
ALTER TABLE "address" RENAME COLUMN "address_line_2" TO "address_line_two";--> statement-breakpoint
ALTER TABLE "order" RENAME COLUMN "shipping_name" TO "name";--> statement-breakpoint
ALTER TABLE "order" RENAME COLUMN "shipping_phone" TO "phone";--> statement-breakpoint
ALTER TABLE "order" RENAME COLUMN "shipping_address_line_1" TO "address_line_one";--> statement-breakpoint
ALTER TABLE "order" RENAME COLUMN "shipping_address_line_2" TO "address_line_two";--> statement-breakpoint
ALTER TABLE "order" RENAME COLUMN "shipping_city" TO "city";--> statement-breakpoint
ALTER TABLE "order" RENAME COLUMN "shipping_state" TO "state";--> statement-breakpoint
ALTER TABLE "order" RENAME COLUMN "shipping_pincode" TO "pincode";--> statement-breakpoint
ALTER TABLE "order" DROP COLUMN "payment_method";