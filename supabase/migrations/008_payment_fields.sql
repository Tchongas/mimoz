-- ============================================
-- MIMOZ - Payment Fields Migration
-- ============================================
-- Adds payment tracking fields to gift_cards table
-- Required for AbacatePay integration

-- Add PENDING status to gift_cards check constraint
-- First drop the old constraint, then add new one with PENDING
ALTER TABLE gift_cards DROP CONSTRAINT IF EXISTS gift_cards_status_check;
ALTER TABLE gift_cards ADD CONSTRAINT gift_cards_status_check 
  CHECK (status IN ('PENDING', 'ACTIVE', 'REDEEMED', 'EXPIRED', 'CANCELLED'));

-- Add payment tracking columns to gift_cards
ALTER TABLE gift_cards
ADD COLUMN IF NOT EXISTS payment_provider_id TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS payment_fee_cents INTEGER DEFAULT NULL;

-- Create index for payment provider lookup (used by webhooks)
CREATE INDEX IF NOT EXISTS idx_gift_cards_payment_provider_id 
ON gift_cards(payment_provider_id) 
WHERE payment_provider_id IS NOT NULL;

-- Create index for pending gift cards
CREATE INDEX IF NOT EXISTS idx_gift_cards_pending 
ON gift_cards(status) 
WHERE status = 'PENDING';

-- Allow anonymous users to INSERT gift cards (for checkout)
-- They should only be able to insert, not read/update/delete
CREATE POLICY IF NOT EXISTS "Anon can insert gift cards for checkout"
  ON public.gift_cards FOR INSERT TO anon
  WITH CHECK (true);

-- Allow anonymous users to INSERT orders (for checkout)
CREATE POLICY IF NOT EXISTS "Anon can insert orders for checkout"
  ON public.orders FOR INSERT TO anon
  WITH CHECK (true);

-- Grant INSERT to anon for checkout flow
GRANT INSERT ON public.gift_cards TO anon;
GRANT INSERT ON public.orders TO anon;

-- Comments
COMMENT ON COLUMN gift_cards.payment_provider_id IS 'External payment ID from AbacatePay (bill_xxx)';
COMMENT ON COLUMN gift_cards.payment_method IS 'Payment method used: pix, card';
COMMENT ON COLUMN gift_cards.payment_fee_cents IS 'Platform fee charged by payment provider';
