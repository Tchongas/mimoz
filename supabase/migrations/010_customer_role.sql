-- ============================================
-- MIMOZ - Add CUSTOMER Role Migration
-- ============================================
-- Adds CUSTOMER role for regular buyers who purchase gift cards
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. UPDATE PROFILES ROLE CONSTRAINT
-- ============================================
-- Drop old constraint and add new one with CUSTOMER
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('ADMIN', 'BUSINESS_OWNER', 'CASHIER', 'CUSTOMER'));

-- ============================================
-- 2. UPDATE USER_INVITES ROLE CONSTRAINT (if exists)
-- ============================================
ALTER TABLE user_invites DROP CONSTRAINT IF EXISTS user_invites_role_check;
ALTER TABLE user_invites ADD CONSTRAINT user_invites_role_check 
  CHECK (role IN ('ADMIN', 'BUSINESS_OWNER', 'CASHIER', 'CUSTOMER'));

-- ============================================
-- 3. UPDATE DEFAULT ROLE FOR NEW USERS
-- ============================================
-- Change default from CASHIER to CUSTOMER for new signups
-- This way, regular users who sign up to buy gift cards get CUSTOMER role
ALTER TABLE profiles ALTER COLUMN role SET DEFAULT 'CUSTOMER';

-- ============================================
-- 4. UPDATE TRIGGER FUNCTION (if exists)
-- ============================================
-- Update the handle_new_user trigger to set CUSTOMER as default
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url',
    'CUSTOMER'  -- Default role for new signups
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
-- 5. RLS POLICIES FOR CUSTOMERS
-- ============================================
-- Customers can read their own profile
DROP POLICY IF EXISTS "Customers can read their own profile" ON public.profiles;
CREATE POLICY "Customers can read their own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Customers can update their own profile (name, avatar)
DROP POLICY IF EXISTS "Customers can update their own profile" ON public.profiles;
CREATE POLICY "Customers can update their own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

SELECT 'Customer role migration applied successfully!' AS result;
