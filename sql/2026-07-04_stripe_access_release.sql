-- Lets each product define its own access duration for the upcoming Stripe
-- webhook (checkout.session.completed -> auto-grant in user_product_access).
-- NULL = lifetime access (no expiry_date computed).
ALTER TABLE products ADD COLUMN IF NOT EXISTS access_duration_days INTEGER;
