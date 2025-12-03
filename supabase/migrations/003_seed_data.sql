-- ============================================
-- MIMOZ - Seed Data (Development Only)
-- ============================================
-- Run this to create test data for development
-- DO NOT run in production

-- Create test businesses
INSERT INTO public.businesses (id, name, slug) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Loja Exemplo', 'loja-exemplo'),
  ('22222222-2222-2222-2222-222222222222', 'Café Central', 'cafe-central'),
  ('33333333-3333-3333-3333-333333333333', 'Restaurante Sabor', 'restaurante-sabor')
ON CONFLICT (id) DO NOTHING;

-- Note: Profiles are created automatically when users sign up via Google OAuth
-- To set up test users:
-- 1. Sign in with Google
-- 2. Run the following SQL to assign roles (replace USER_ID with actual auth.users.id):

-- Make a user an ADMIN:
-- UPDATE public.profiles SET role = 'ADMIN' WHERE id = 'USER_ID';

-- Make a user a BUSINESS_OWNER and assign to a business:
-- UPDATE public.profiles 
-- SET role = 'BUSINESS_OWNER', business_id = '11111111-1111-1111-1111-111111111111' 
-- WHERE id = 'USER_ID';

-- Make a user a CASHIER and assign to a business:
-- UPDATE public.profiles 
-- SET role = 'CASHIER', business_id = '11111111-1111-1111-1111-111111111111' 
-- WHERE id = 'USER_ID';

-- ============================================
-- TEST CODE VALIDATIONS (requires existing users)
-- ============================================
-- Uncomment and modify after creating test users:

-- INSERT INTO public.code_validations (business_id, cashier_id, code) VALUES
--   ('11111111-1111-1111-1111-111111111111', 'CASHIER_USER_ID', 'GIFT-ABC123'),
--   ('11111111-1111-1111-1111-111111111111', 'CASHIER_USER_ID', 'GIFT-DEF456'),
--   ('11111111-1111-1111-1111-111111111111', 'CASHIER_USER_ID', 'GIFT-GHI789');
