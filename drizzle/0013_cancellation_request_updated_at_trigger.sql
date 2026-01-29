CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at_on_cancellation_request ON "cancellation_request";
CREATE TRIGGER set_updated_at_on_cancellation_request
BEFORE UPDATE ON "cancellation_request"
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
