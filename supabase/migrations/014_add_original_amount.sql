-- ============================================
-- MIMOZ - Add Original Amount Migration
-- ============================================
-- Adds original_amount_cents to track the original value
-- before any partial redemptions
-- Run this in Supabase SQL Editor

-- Add original_amount_cents column
-- This stores the initial amount when the gift card was purchased
-- (amount_cents may change if partial redemptions are allowed in the future)
ALTER TABLE gift_cards
ADD COLUMN IF NOT EXISTS original_amount_cents INTEGER;

-- Backfill existing records: set original_amount_cents = amount_cents
UPDATE gift_cards 
SET original_amount_cents = amount_cents 
WHERE original_amount_cents IS NULL;

-- Now make it NOT NULL after backfill
ALTER TABLE gift_cards
ALTER COLUMN original_amount_cents SET NOT NULL;

-- Add check constraint
ALTER TABLE gift_cards
ADD CONSTRAINT gift_cards_original_amount_positive 
CHECK (original_amount_cents > 0);

COMMENT ON COLUMN gift_cards.original_amount_cents IS 'Original purchase amount in cents (immutable)';

SELECT 'Original amount migration applied!' AS status;
