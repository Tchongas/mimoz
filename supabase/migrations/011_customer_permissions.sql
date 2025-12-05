-- ============================================
-- MIMOZ - Customer Permissions Migration
-- ============================================
-- Ensures authenticated customers can view store data and make purchases
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. BUSINESSES - Allow authenticated users to view
-- ============================================
-- Currently only anon can view, but authenticated users need to see stores too

DROP POLICY IF EXISTS "Authenticated users can view businesses" ON public.businesses;
CREATE POLICY "Authenticated users can view businesses"
  ON public.businesses
  FOR SELECT
  TO authenticated
  USING (true);

-- ============================================
-- 2. GIFT CARD TEMPLATES - Allow authenticated users to view active
-- ============================================
-- Ensure authenticated users can see active templates for purchase

DROP POLICY IF EXISTS "Authenticated users can view active templates" ON public.gift_card_templates;
CREATE POLICY "Authenticated users can view active templates"
  ON public.gift_card_templates
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- ============================================
-- 3. GIFT CARDS - Refine policies for customers
-- ============================================
-- The existing "Authenticated users can manage gift cards" is too broad
-- Let's make it more specific

-- Drop overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can manage gift cards" ON public.gift_cards;

-- Customers can INSERT their own gift cards (for purchases)
DROP POLICY IF EXISTS "Users can insert their own gift cards" ON public.gift_cards;
CREATE POLICY "Users can insert their own gift cards"
  ON public.gift_cards
  FOR INSERT
  TO authenticated
  WITH CHECK (purchaser_user_id = auth.uid());

-- Customers can SELECT their own purchases
DROP POLICY IF EXISTS "Users can view their own purchases" ON public.gift_cards;
CREATE POLICY "Users can view their own purchases"
  ON public.gift_cards
  FOR SELECT
  TO authenticated
  USING (purchaser_user_id = auth.uid());

-- Business owners/cashiers can view gift cards for their business
DROP POLICY IF EXISTS "Business staff can view business gift cards" ON public.gift_cards;
CREATE POLICY "Business staff can view business gift cards"
  ON public.gift_cards
  FOR SELECT
  TO authenticated
  USING (
    business_id IN (
      SELECT business_id FROM profiles WHERE id = auth.uid() AND business_id IS NOT NULL
    )
  );

-- Business owners/cashiers can update gift cards for their business (redemptions)
DROP POLICY IF EXISTS "Business staff can update business gift cards" ON public.gift_cards;
CREATE POLICY "Business staff can update business gift cards"
  ON public.gift_cards
  FOR UPDATE
  TO authenticated
  USING (
    business_id IN (
      SELECT business_id FROM profiles WHERE id = auth.uid() AND business_id IS NOT NULL
    )
  );

-- Admins can do everything
DROP POLICY IF EXISTS "Admins can manage all gift cards" ON public.gift_cards;
CREATE POLICY "Admins can manage all gift cards"
  ON public.gift_cards
  FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );

-- ============================================
-- 4. ENSURE GRANTS ARE IN PLACE
-- ============================================

GRANT SELECT ON public.businesses TO authenticated;
GRANT SELECT ON public.gift_card_templates TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.gift_cards TO authenticated;

SELECT 'Customer permissions migration applied successfully!' AS result;
