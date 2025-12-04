-- ============================================
-- MIMOZ - Payment Fields Migration
-- ============================================
-- Adds payment tracking fields to gift_cards table
-- Required for AbacatePay integration

-- Add payment tracking columns to gift_cards
ALTER TABLE gift_cards
ADD COLUMN IF NOT EXISTS payment_provider_id TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS payment_fee_cents INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ DEFAULT NULL;

-- Rename amount_cents to original_amount_cents if needed
-- This makes it clearer that balance_cents is the current balance
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'gift_cards' AND column_name = 'amount_cents'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'gift_cards' AND column_name = 'original_amount_cents'
  ) THEN
    ALTER TABLE gift_cards RENAME COLUMN amount_cents TO original_amount_cents;
  END IF;
END $$;

-- Add original_amount_cents if it doesn't exist
ALTER TABLE gift_cards
ADD COLUMN IF NOT EXISTS original_amount_cents INTEGER;

-- Create index for payment provider lookup (used by webhooks)
CREATE INDEX IF NOT EXISTS idx_gift_cards_payment_provider_id 
ON gift_cards(payment_provider_id) 
WHERE payment_provider_id IS NOT NULL;

-- Create index for pending payments
CREATE INDEX IF NOT EXISTS idx_gift_cards_payment_status 
ON gift_cards(payment_status) 
WHERE payment_status = 'pending';

-- Comments
COMMENT ON COLUMN gift_cards.payment_provider_id IS 'External payment ID from AbacatePay (bill_xxx)';
COMMENT ON COLUMN gift_cards.payment_status IS 'Payment status: pending, paid, failed, refunded';
COMMENT ON COLUMN gift_cards.payment_method IS 'Payment method used: pix, card';
COMMENT ON COLUMN gift_cards.payment_fee_cents IS 'Platform fee charged by payment provider';
COMMENT ON COLUMN gift_cards.paid_at IS 'Timestamp when payment was confirmed';
