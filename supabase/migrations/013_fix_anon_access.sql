-- ============================================
-- MIMOZ - Fix Anonymous Access for Store Pages
-- ============================================
-- Ensures unauthenticated users can view store pages
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. ENSURE ANON CAN VIEW BUSINESSES
-- ============================================
DROP POLICY IF EXISTS "Public can view businesses" ON public.businesses;
CREATE POLICY "Public can view businesses"
  ON public.businesses
  FOR SELECT
  TO anon
  USING (true);

-- ============================================
-- 2. ENSURE ANON CAN VIEW ACTIVE TEMPLATES
-- ============================================
DROP POLICY IF EXISTS "Public can view active templates" ON public.gift_card_templates;
CREATE POLICY "Public can view active templates"
  ON public.gift_card_templates
  FOR SELECT
  TO anon
  USING (is_active = true);

-- ============================================
-- 3. ENSURE GRANTS FOR ANON
-- ============================================
GRANT SELECT ON public.businesses TO anon;
GRANT SELECT ON public.gift_card_templates TO anon;

-- ============================================
-- VERIFICATION
-- ============================================
SELECT 'Anon access policies created!' AS status;
