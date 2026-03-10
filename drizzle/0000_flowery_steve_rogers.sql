CREATE TYPE "public"."cancellation_request_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."discount_type" AS ENUM('percentage', 'fixed');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'paid', 'failed', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."selling_mode" AS ENUM('meter', 'piece');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('customer', 'admin');--> statement-breakpoint
CREATE TABLE "cart_item" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"cart_id" varchar(255) NOT NULL,
	"product_id" varchar(255) NOT NULL,
	"variant_id" varchar(255),
	"quantity" numeric(10, 2) DEFAULT '1' NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "cart" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255),
	"session_id" varchar(255),
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "cart_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "wishlist_item" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"wishlist_id" varchar(255) NOT NULL,
	"product_id" varchar(255) NOT NULL,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wishlist" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "wishlist_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "account" (
	"user_id" varchar(255) NOT NULL,
	"type" varchar(255) NOT NULL,
	"provider" varchar(255) NOT NULL,
	"provider_account_id" varchar(255) NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" varchar(255),
	"scope" varchar(255),
	"id_token" text,
	"session_state" varchar(255),
	CONSTRAINT "account_provider_provider_account_id_pk" PRIMARY KEY("provider","provider_account_id")
);
--> statement-breakpoint
CREATE TABLE "address" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"address_line_one" varchar(500) NOT NULL,
	"address_line_two" varchar(500),
	"city" varchar(100) NOT NULL,
	"state" varchar(100) NOT NULL,
	"pincode" varchar(10) NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "session" (
	"session_token" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"expires" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"email" varchar(255) NOT NULL,
	"image" varchar(255),
	"password" varchar(255),
	"role" "user_role" DEFAULT 'customer' NOT NULL,
	"phone" varchar(20),
	"email_verified" timestamp with time zone,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification_token" (
	"identifier" varchar(255) NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires" timestamp with time zone NOT NULL,
	CONSTRAINT "verification_token_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
CREATE TABLE "category" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "category_name_unique" UNIQUE("name"),
	CONSTRAINT "category_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "product_image" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"product_id" varchar(255) NOT NULL,
	"url" varchar(500) NOT NULL,
	"public_id" varchar(255),
	"alt" varchar(255),
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_variant" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"product_id" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"size" varchar(50),
	"length" varchar(50),
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "product" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"price" numeric(10, 2) NOT NULL,
	"compare_price" numeric(10, 2),
	"selling_mode" "selling_mode" DEFAULT 'meter' NOT NULL,
	"min_order_quantity" numeric(10, 2) DEFAULT '1' NOT NULL,
	"color" varchar(100),
	"fabric_type" varchar(100),
	"stock_quantity" integer DEFAULT -1 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"category_id" varchar(255) NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "product_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
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
CREATE TABLE "order_item" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"order_id" varchar(255) NOT NULL,
	"product_id" varchar(255) NOT NULL,
	"variant_id" varchar(255),
	"product_name" varchar(255) NOT NULL,
	"product_sku" varchar(100),
	"variant_name" varchar(255),
	"price" numeric(10, 2) NOT NULL,
	"quantity" numeric(10, 2) NOT NULL,
	"unit" varchar(50) NOT NULL,
	"total" numeric(10, 2) NOT NULL,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"order_number" varchar(50) NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"subtotal" numeric(10, 2) NOT NULL,
	"tax" numeric(10, 2) DEFAULT '0' NOT NULL,
	"shipping_cost" numeric(10, 2) DEFAULT '0' NOT NULL,
	"discount" numeric(10, 2) DEFAULT '0' NOT NULL,
	"total" numeric(10, 2) NOT NULL,
	"status" "order_status" DEFAULT 'pending' NOT NULL,
	"payment_status" "payment_status" DEFAULT 'pending' NOT NULL,
	"payment_method" varchar(50) DEFAULT 'cod' NOT NULL,
	"payment_id" varchar(255),
	"utr_number" varchar(50),
	"name" varchar(255) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"address_line_one" varchar(500) NOT NULL,
	"address_line_two" varchar(500),
	"city" varchar(100) NOT NULL,
	"state" varchar(100) NOT NULL,
	"pincode" varchar(10) NOT NULL,
	"gst_number" varchar(15),
	"tracking_number" varchar(255),
	"shipped_at" timestamp with time zone,
	"delivered_at" timestamp with time zone,
	"customer_note" text,
	"admin_note" text,
	"coupon_code" varchar(100),
	"coupon_discount" numeric(10, 2),
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "order_order_number_unique" UNIQUE("order_number")
);
--> statement-breakpoint
CREATE TABLE "review" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"product_id" varchar(255) NOT NULL,
	"rating" integer NOT NULL,
	"comment" text,
	"is_verified" boolean DEFAULT false NOT NULL,
	"is_approved" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "banner" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"subtitle" varchar(500),
	"image" varchar(500) NOT NULL,
	"link" varchar(500),
	"position" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"start_date" timestamp with time zone,
	"end_date" timestamp with time zone,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "coupon" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"code" varchar(100) NOT NULL,
	"description" text,
	"discount_type" "discount_type" NOT NULL,
	"discount_value" numeric(10, 2) NOT NULL,
	"min_purchase" numeric(10, 2),
	"max_discount" numeric(10, 2),
	"usage_limit" integer,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "coupon_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "cart_item" ADD CONSTRAINT "cart_item_cart_id_cart_id_fk" FOREIGN KEY ("cart_id") REFERENCES "public"."cart"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_item" ADD CONSTRAINT "cart_item_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_item" ADD CONSTRAINT "cart_item_variant_id_product_variant_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variant"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart" ADD CONSTRAINT "cart_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlist_item" ADD CONSTRAINT "wishlist_item_wishlist_id_wishlist_id_fk" FOREIGN KEY ("wishlist_id") REFERENCES "public"."wishlist"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlist_item" ADD CONSTRAINT "wishlist_item_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlist" ADD CONSTRAINT "wishlist_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "address" ADD CONSTRAINT "address_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_image" ADD CONSTRAINT "product_image_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variant" ADD CONSTRAINT "product_variant_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cancellation_request" ADD CONSTRAINT "cancellation_request_order_id_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."order"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cancellation_request" ADD CONSTRAINT "cancellation_request_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_order_id_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."order"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order" ADD CONSTRAINT "order_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review" ADD CONSTRAINT "review_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review" ADD CONSTRAINT "review_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cart_item_cart_id_idx" ON "cart_item" USING btree ("cart_id");--> statement-breakpoint
CREATE INDEX "cart_item_product_id_idx" ON "cart_item" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "cart_user_id_idx" ON "cart" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "cart_session_id_idx" ON "cart" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "wishlist_item_wishlist_id_idx" ON "wishlist_item" USING btree ("wishlist_id");--> statement-breakpoint
CREATE INDEX "wishlist_item_product_id_idx" ON "wishlist_item" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "wishlist_user_id_idx" ON "wishlist" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "address_user_id_idx" ON "address" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_user_id_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_email_idx" ON "user" USING btree ("email");--> statement-breakpoint
CREATE INDEX "user_role_idx" ON "user" USING btree ("role");--> statement-breakpoint
CREATE INDEX "category_slug_idx" ON "category" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "product_image_product_id_idx" ON "product_image" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_variant_product_id_idx" ON "product_variant" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_slug_idx" ON "product" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "product_category_id_idx" ON "product" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "product_is_active_idx" ON "product" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "product_is_featured_idx" ON "product" USING btree ("is_featured");--> statement-breakpoint
CREATE INDEX "product_name_idx" ON "product" USING btree ("name");--> statement-breakpoint
CREATE INDEX "product_selling_mode_idx" ON "product" USING btree ("selling_mode");--> statement-breakpoint
CREATE INDEX "cancellation_request_order_id_idx" ON "cancellation_request" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "cancellation_request_user_id_idx" ON "cancellation_request" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "cancellation_request_status_idx" ON "cancellation_request" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "cancellation_request_order_unique_idx" ON "cancellation_request" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "order_item_order_id_idx" ON "order_item" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "order_item_product_id_idx" ON "order_item" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "order_user_id_idx" ON "order" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "order_order_number_idx" ON "order" USING btree ("order_number");--> statement-breakpoint
CREATE INDEX "order_status_idx" ON "order" USING btree ("status");--> statement-breakpoint
CREATE INDEX "order_payment_status_idx" ON "order" USING btree ("payment_status");--> statement-breakpoint
CREATE INDEX "order_created_at_idx" ON "order" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "review_user_id_idx" ON "review" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "review_product_id_idx" ON "review" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "review_is_approved_idx" ON "review" USING btree ("is_approved");--> statement-breakpoint
CREATE INDEX "review_rating_idx" ON "review" USING btree ("rating");--> statement-breakpoint
CREATE INDEX "banner_is_active_idx" ON "banner" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "banner_position_idx" ON "banner" USING btree ("position");--> statement-breakpoint
CREATE INDEX "coupon_code_idx" ON "coupon" USING btree ("code");--> statement-breakpoint
CREATE INDEX "coupon_is_active_idx" ON "coupon" USING btree ("is_active");