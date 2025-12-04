-- ============================================
-- MIMOZ - Fix Checkout RLS Policies
-- ============================================
-- Run this ONCE in Supabase SQL Editor to fix checkout
-- This allows anonymous users to purchase gift cards

-- ============================================
-- 1. ADD PENDING STATUS
-- ============================================
ALTER TABLE gift_cards DROP CONSTRAINT IF EXISTS gift_cards_status_check;
ALTER TABLE gift_cards ADD CONSTRAINT gift_cards_status_check 
  CHECK (status IN ('PENDING', 'ACTIVE', 'REDEEMED', 'EXPIRED', 'CANCELLED'));

-- ============================================
-- 2. ADD PAYMENT COLUMNS (if missing)
-- ============================================
ALTER TABLE gift_cards
ADD COLUMN IF NOT EXISTS payment_provider_id TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS payment_fee_cents INTEGER DEFAULT NULL;

-- ============================================
-- 3. FIX RLS POLICIES FOR ANONYMOUS CHECKOUT
-- ============================================

-- Drop existing policies first (ignore errors if they don't exist)
DROP POLICY IF EXISTS "Anon can insert gift cards for checkout" ON public.gift_cards;
DROP POLICY IF EXISTS "Anon can insert orders for checkout" ON public.orders;
DROP POLICY IF EXISTS "anon_insert_gift_cards" ON public.gift_cards;
DROP POLICY IF EXISTS "anon_insert_orders" ON public.orders;

-- Create new policies for anonymous insert
CREATE POLICY "anon_insert_gift_cards"
  ON public.gift_cards
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "anon_insert_orders"
  ON public.orders
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- ============================================
-- 4. GRANT PERMISSIONS
-- ============================================
GRANT INSERT ON public.gift_cards TO anon;
GRANT INSERT ON public.orders TO anon;

-- Also grant SELECT on templates so checkout can read them
GRANT SELECT ON public.gift_card_templates TO anon;
GRANT SELECT ON public.businesses TO anon;

-- ============================================
-- 5. VERIFY (optional - check policies exist)
-- ============================================
-- Run this to verify:
-- SELECT * FROM pg_policies WHERE tablename = 'gift_cards';

SELECT 'Checkout RLS fix applied successfully!' AS result;
