-- ============================================
-- MIMOZ - Complete Customer System Fix
-- ============================================
-- This migration properly adds CUSTOMER role support
-- Run this in Supabase SQL Editor (run all at once)
-- ============================================

-- ============================================
-- STEP 1: UPDATE ROLE CONSTRAINTS
-- ============================================
-- Add CUSTOMER to allowed roles

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('ADMIN', 'BUSINESS_OWNER', 'CASHIER', 'CUSTOMER'));

-- Also update user_invites if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_invites') THEN
    ALTER TABLE user_invites DROP CONSTRAINT IF EXISTS user_invites_role_check;
    ALTER TABLE user_invites ADD CONSTRAINT user_invites_role_check 
      CHECK (role IN ('ADMIN', 'BUSINESS_OWNER', 'CASHIER', 'CUSTOMER'));
  END IF;
END $$;

-- ============================================
-- STEP 2: UPDATE DEFAULT ROLE
-- ============================================
-- New signups should be CUSTOMER by default

ALTER TABLE profiles ALTER COLUMN role SET DEFAULT 'CUSTOMER';

-- ============================================
-- STEP 3: UPDATE TRIGGER FUNCTION
-- ============================================
-- The trigger that creates profiles on signup

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url',
    'CUSTOMER'  -- Default to CUSTOMER for new signups
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- STEP 4: FIX EXISTING USERS
-- ============================================
-- Users with CASHIER role but no business should be CUSTOMER

UPDATE profiles 
SET role = 'CUSTOMER', updated_at = NOW()
WHERE role = 'CASHIER' AND business_id IS NULL;

-- ============================================
-- STEP 5: ADD purchaser_user_id TO GIFT_CARDS
-- ============================================
-- Link purchases to user accounts

ALTER TABLE gift_cards
ADD COLUMN IF NOT EXISTS purchaser_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_gift_cards_purchaser_user_id 
ON gift_cards(purchaser_user_id) 
WHERE purchaser_user_id IS NOT NULL;

-- ============================================
-- STEP 6: UPDATE RLS POLICIES FOR BUSINESSES
-- ============================================
-- Customers need to view businesses (store pages)

DROP POLICY IF EXISTS "Authenticated users can view businesses" ON public.businesses;
CREATE POLICY "Authenticated users can view businesses"
  ON public.businesses
  FOR SELECT
  TO authenticated
  USING (true);

-- ============================================
-- STEP 7: UPDATE RLS POLICIES FOR TEMPLATES
-- ============================================
-- Customers need to view active templates

DROP POLICY IF EXISTS "Authenticated users can view active templates" ON public.gift_card_templates;
CREATE POLICY "Authenticated users can view active templates"
  ON public.gift_card_templates
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- ============================================
-- STEP 8: UPDATE RLS POLICIES FOR GIFT_CARDS
-- ============================================
-- More granular policies for gift cards

-- Remove overly permissive policy if exists
DROP POLICY IF EXISTS "Authenticated users can manage gift cards" ON public.gift_cards;

-- Customers can INSERT their own purchases
DROP POLICY IF EXISTS "Users can insert their own gift cards" ON public.gift_cards;
CREATE POLICY "Users can insert their own gift cards"
  ON public.gift_cards
  FOR INSERT
  TO authenticated
  WITH CHECK (purchaser_user_id = auth.uid());

-- Customers can VIEW their own purchases
DROP POLICY IF EXISTS "Users can view their own purchases" ON public.gift_cards;
CREATE POLICY "Users can view their own purchases"
  ON public.gift_cards
  FOR SELECT
  TO authenticated
  USING (purchaser_user_id = auth.uid());

-- Recipients can VIEW gift cards sent to their email
DROP POLICY IF EXISTS "Recipients can view their gift cards" ON public.gift_cards;
CREATE POLICY "Recipients can view their gift cards"
  ON public.gift_cards
  FOR SELECT
  TO authenticated
  USING (
    recipient_email = (SELECT email FROM profiles WHERE id = auth.uid())
  );

-- Business staff can VIEW their business's gift cards
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

-- Business staff can UPDATE their business's gift cards (for redemptions)
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

-- Admins have full access
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
-- STEP 9: ENSURE GRANTS
-- ============================================

GRANT SELECT ON public.businesses TO authenticated;
GRANT SELECT ON public.gift_card_templates TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.gift_cards TO authenticated;

-- ============================================
-- VERIFICATION
-- ============================================

SELECT 
  'Migration complete!' AS status,
  (SELECT COUNT(*) FROM profiles WHERE role = 'CUSTOMER') AS customer_count,
  (SELECT COUNT(*) FROM profiles WHERE role = 'CASHIER' AND business_id IS NULL) AS orphan_cashiers;
