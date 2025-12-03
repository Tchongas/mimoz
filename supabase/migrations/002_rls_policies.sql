-- ============================================
-- MIMOZ - Row Level Security Policies
-- ============================================
-- Run this after 001_initial_schema.sql
-- These policies enforce business isolation and role-based access

-- ============================================
-- BUSINESSES TABLE POLICIES
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can do everything on businesses" ON public.businesses;
DROP POLICY IF EXISTS "Business owners can read their own business" ON public.businesses;
DROP POLICY IF EXISTS "Business owners can update their own business" ON public.businesses;

-- ADMIN: Full access to all businesses
CREATE POLICY "Admins can do everything on businesses"
  ON public.businesses
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- BUSINESS_OWNER: Can read their own business
CREATE POLICY "Business owners can read their own business"
  ON public.businesses
  FOR SELECT
  TO authenticated
  USING (
    id = public.get_user_business_id(auth.uid())
    AND public.get_user_role(auth.uid()) IN ('BUSINESS_OWNER', 'CASHIER')
  );

-- BUSINESS_OWNER: Can update their own business
CREATE POLICY "Business owners can update their own business"
  ON public.businesses
  FOR UPDATE
  TO authenticated
  USING (
    id = public.get_user_business_id(auth.uid())
    AND public.get_user_role(auth.uid()) = 'BUSINESS_OWNER'
  )
  WITH CHECK (
    id = public.get_user_business_id(auth.uid())
    AND public.get_user_role(auth.uid()) = 'BUSINESS_OWNER'
  );

-- ============================================
-- PROFILES TABLE POLICIES
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can do everything on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can read their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Business owners can read profiles in their business" ON public.profiles;
DROP POLICY IF EXISTS "Business owners can update profiles in their business" ON public.profiles;

-- ADMIN: Full access to all profiles
CREATE POLICY "Admins can do everything on profiles"
  ON public.profiles
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- ALL USERS: Can read their own profile
CREATE POLICY "Users can read their own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- ALL USERS: Can update their own profile (limited fields - enforced in app)
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- BUSINESS_OWNER: Can read profiles in their business
CREATE POLICY "Business owners can read profiles in their business"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    business_id = public.get_user_business_id(auth.uid())
    AND public.get_user_role(auth.uid()) = 'BUSINESS_OWNER'
    AND business_id IS NOT NULL
  );

-- BUSINESS_OWNER: Can update profiles in their business (except role changes - enforced in app)
CREATE POLICY "Business owners can update profiles in their business"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (
    business_id = public.get_user_business_id(auth.uid())
    AND public.get_user_role(auth.uid()) = 'BUSINESS_OWNER'
    AND business_id IS NOT NULL
  )
  WITH CHECK (
    business_id = public.get_user_business_id(auth.uid())
    AND public.get_user_role(auth.uid()) = 'BUSINESS_OWNER'
    AND business_id IS NOT NULL
  );

-- ============================================
-- CODE_VALIDATIONS TABLE POLICIES
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can do everything on code_validations" ON public.code_validations;
DROP POLICY IF EXISTS "Business owners can read their business validations" ON public.code_validations;
DROP POLICY IF EXISTS "Cashiers can insert validations for their business" ON public.code_validations;
DROP POLICY IF EXISTS "Cashiers can read their own validations" ON public.code_validations;

-- ADMIN: Full access to all code_validations
CREATE POLICY "Admins can do everything on code_validations"
  ON public.code_validations
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- BUSINESS_OWNER: Can read all validations for their business
CREATE POLICY "Business owners can read their business validations"
  ON public.code_validations
  FOR SELECT
  TO authenticated
  USING (
    business_id = public.get_user_business_id(auth.uid())
    AND public.get_user_role(auth.uid()) = 'BUSINESS_OWNER'
  );

-- CASHIER: Can insert validations for their business
CREATE POLICY "Cashiers can insert validations for their business"
  ON public.code_validations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    business_id = public.get_user_business_id(auth.uid())
    AND cashier_id = auth.uid()
    AND public.get_user_role(auth.uid()) IN ('CASHIER', 'BUSINESS_OWNER')
  );

-- CASHIER: Can read their own validations
CREATE POLICY "Cashiers can read their own validations"
  ON public.code_validations
  FOR SELECT
  TO authenticated
  USING (
    cashier_id = auth.uid()
    AND public.get_user_role(auth.uid()) = 'CASHIER'
  );

-- ============================================
-- SERVICE ROLE BYPASS
-- ============================================
-- Note: Service role automatically bypasses RLS
-- This is used for admin operations via API

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Grant table permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.businesses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.code_validations TO authenticated;

-- Grant function permissions
GRANT EXECUTE ON FUNCTION public.get_user_role(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_business_id(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated;
