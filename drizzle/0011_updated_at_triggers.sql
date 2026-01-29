CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at_on_user ON "user";
CREATE TRIGGER set_updated_at_on_user
BEFORE UPDATE ON "user"
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_on_address ON "address";
CREATE TRIGGER set_updated_at_on_address
BEFORE UPDATE ON "address"
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_on_cart ON "cart";
CREATE TRIGGER set_updated_at_on_cart
BEFORE UPDATE ON "cart"
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_on_cart_item ON "cart_item";
CREATE TRIGGER set_updated_at_on_cart_item
BEFORE UPDATE ON "cart_item"
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_on_wishlist ON "wishlist";
CREATE TRIGGER set_updated_at_on_wishlist
BEFORE UPDATE ON "wishlist"
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_on_order ON "order";
CREATE TRIGGER set_updated_at_on_order
BEFORE UPDATE ON "order"
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_on_review ON "review";
CREATE TRIGGER set_updated_at_on_review
BEFORE UPDATE ON "review"
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_on_category ON "category";
CREATE TRIGGER set_updated_at_on_category
BEFORE UPDATE ON "category"
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_on_product ON "product";
CREATE TRIGGER set_updated_at_on_product
BEFORE UPDATE ON "product"
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_on_product_variant ON "product_variant";
CREATE TRIGGER set_updated_at_on_product_variant
BEFORE UPDATE ON "product_variant"
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_on_coupon ON "coupon";
CREATE TRIGGER set_updated_at_on_coupon
BEFORE UPDATE ON "coupon"
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_on_banner ON "banner";
CREATE TRIGGER set_updated_at_on_banner
BEFORE UPDATE ON "banner"
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
