-- ============================================
-- MIMOZ - Add Purchaser User ID Migration
-- ============================================
-- Links gift card purchases to authenticated users
-- Run this in Supabase SQL Editor

-- Add purchaser_user_id column to gift_cards
ALTER TABLE gift_cards
ADD COLUMN IF NOT EXISTS purchaser_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create index for user's purchases lookup
CREATE INDEX IF NOT EXISTS idx_gift_cards_purchaser_user_id 
ON gift_cards(purchaser_user_id) 
WHERE purchaser_user_id IS NOT NULL;

-- ============================================
-- UPDATE RLS POLICIES
-- ============================================
-- Authenticated users can insert gift cards for themselves

-- Drop old anon policies (no longer needed)
DROP POLICY IF EXISTS "anon_insert_gift_cards" ON public.gift_cards;
DROP POLICY IF EXISTS "Anon can insert gift cards for checkout" ON public.gift_cards;

-- Allow authenticated users to INSERT gift cards where they are the purchaser
DROP POLICY IF EXISTS "Users can insert their own gift cards" ON public.gift_cards;
CREATE POLICY "Users can insert their own gift cards"
  ON public.gift_cards
  FOR INSERT
  TO authenticated
  WITH CHECK (purchaser_user_id = auth.uid());

-- Allow authenticated users to SELECT their own purchases
DROP POLICY IF EXISTS "Users can view their own purchases" ON public.gift_cards;
CREATE POLICY "Users can view their own purchases"
  ON public.gift_cards
  FOR SELECT
  TO authenticated
  USING (purchaser_user_id = auth.uid());

-- Grant permissions to authenticated role
GRANT INSERT, SELECT ON public.gift_cards TO authenticated;

-- Comment
COMMENT ON COLUMN gift_cards.purchaser_user_id IS 'The authenticated user who purchased this gift card';

SELECT 'Purchaser user ID migration applied successfully!' AS result;
