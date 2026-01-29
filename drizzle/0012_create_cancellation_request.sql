DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'cancellation_request_status') THEN
    CREATE TYPE cancellation_request_status AS ENUM ('pending', 'approved', 'rejected');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "cancellation_request" (
  "id" varchar(255) PRIMARY KEY DEFAULT (gen_random_uuid()::text),
  "order_id" varchar(255) NOT NULL REFERENCES "order"("id") ON DELETE cascade,
  "user_id" varchar(255) NOT NULL REFERENCES "user"("id") ON DELETE cascade,
  "reason" text,
  "status" cancellation_request_status NOT NULL DEFAULT 'pending',
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone
);

CREATE UNIQUE INDEX IF NOT EXISTS "cancellation_request_order_unique_idx"
  ON "cancellation_request" ("order_id");

CREATE INDEX IF NOT EXISTS "cancellation_request_order_id_idx"
  ON "cancellation_request" ("order_id");

CREATE INDEX IF NOT EXISTS "cancellation_request_user_id_idx"
  ON "cancellation_request" ("user_id");

CREATE INDEX IF NOT EXISTS "cancellation_request_status_idx"
  ON "cancellation_request" ("status");
