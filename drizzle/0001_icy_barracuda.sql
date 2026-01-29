ALTER TABLE "newsletter" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "newsletter" CASCADE;--> statement-breakpoint
ALTER TABLE "product_variant" DROP CONSTRAINT "product_variant_sku_unique";--> statement-breakpoint
ALTER TABLE "product" DROP CONSTRAINT "product_sku_unique";--> statement-breakpoint
DROP INDEX "category_parent_id_idx";--> statement-breakpoint
ALTER TABLE "category" DROP COLUMN "image";--> statement-breakpoint
ALTER TABLE "category" DROP COLUMN "parent_id";--> statement-breakpoint
ALTER TABLE "category" DROP COLUMN "position";--> statement-breakpoint
ALTER TABLE "category" DROP COLUMN "is_active";--> statement-breakpoint
ALTER TABLE "product_variant" DROP COLUMN "sku";--> statement-breakpoint
ALTER TABLE "product_variant" DROP COLUMN "stock_quantity";--> statement-breakpoint
ALTER TABLE "product_variant" DROP COLUMN "color";--> statement-breakpoint
ALTER TABLE "product" DROP COLUMN "short_description";--> statement-breakpoint
ALTER TABLE "product" DROP COLUMN "cost_price";--> statement-breakpoint
ALTER TABLE "product" DROP COLUMN "unit";--> statement-breakpoint
ALTER TABLE "product" DROP COLUMN "quantity_step";--> statement-breakpoint
ALTER TABLE "product" DROP COLUMN "max_order_quantity";--> statement-breakpoint
ALTER TABLE "product" DROP COLUMN "sku";--> statement-breakpoint
ALTER TABLE "product" DROP COLUMN "barcode";--> statement-breakpoint
ALTER TABLE "product" DROP COLUMN "fabric_type";--> statement-breakpoint
ALTER TABLE "product" DROP COLUMN "material";--> statement-breakpoint
ALTER TABLE "product" DROP COLUMN "width";--> statement-breakpoint
ALTER TABLE "product" DROP COLUMN "weight";--> statement-breakpoint
ALTER TABLE "product" DROP COLUMN "color";--> statement-breakpoint
ALTER TABLE "product" DROP COLUMN "pattern";--> statement-breakpoint
ALTER TABLE "product" DROP COLUMN "composition";--> statement-breakpoint
ALTER TABLE "product" DROP COLUMN "stock_quantity";--> statement-breakpoint
ALTER TABLE "product" DROP COLUMN "low_stock_threshold";--> statement-breakpoint
ALTER TABLE "product" DROP COLUMN "track_quantity";--> statement-breakpoint
ALTER TABLE "product" DROP COLUMN "allow_backorder";--> statement-breakpoint
ALTER TABLE "product" DROP COLUMN "meta_title";--> statement-breakpoint
ALTER TABLE "product" DROP COLUMN "meta_description";--> statement-breakpoint
DROP TYPE "public"."unit";