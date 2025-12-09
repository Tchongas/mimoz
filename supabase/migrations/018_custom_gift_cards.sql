-- ============================================
-- MIMOZ - Custom Gift Cards Migration
-- ============================================
-- Adds support for user-customizable gift cards where buyers can:
-- - Set their own amount (within business-defined limits)
-- - Choose a custom color or background image
-- - Add a custom title/headline
-- - Write a personalized message
-- This creates a more personal gift-giving experience

-- ============================================
-- BUSINESS SETTINGS FOR CUSTOM CARDS
-- ============================================
-- Add settings to businesses table to control custom card feature

ALTER TABLE public.businesses 
ADD COLUMN IF NOT EXISTS custom_cards_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS custom_cards_min_amount_cents INTEGER DEFAULT 1000,  -- R$10 minimum
ADD COLUMN IF NOT EXISTS custom_cards_max_amount_cents INTEGER DEFAULT 100000, -- R$1000 maximum
ADD COLUMN IF NOT EXISTS custom_cards_preset_amounts INTEGER[] DEFAULT '{2500, 5000, 10000, 15000, 20000, 50000}',
ADD COLUMN IF NOT EXISTS custom_cards_allow_custom_amount BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS custom_cards_section_title TEXT DEFAULT 'Crie seu Vale-Presente Personalizado',
ADD COLUMN IF NOT EXISTS custom_cards_section_subtitle TEXT DEFAULT 'Personalize com sua mensagem especial',
ADD COLUMN IF NOT EXISTS hide_template_cards BOOLEAN DEFAULT false;

-- ============================================
-- GIFT CARD CUSTOMIZATION FIELDS
-- ============================================
-- Add customization fields to gift_cards table for storing user choices

ALTER TABLE public.gift_cards 
ADD COLUMN IF NOT EXISTS is_custom BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS custom_title TEXT,
ADD COLUMN IF NOT EXISTS custom_bg_type TEXT DEFAULT 'color' CHECK (custom_bg_type IN ('color', 'gradient', 'image')),
ADD COLUMN IF NOT EXISTS custom_bg_color TEXT,
ADD COLUMN IF NOT EXISTS custom_bg_gradient_start TEXT,
ADD COLUMN IF NOT EXISTS custom_bg_gradient_end TEXT,
ADD COLUMN IF NOT EXISTS custom_bg_image_url TEXT,
ADD COLUMN IF NOT EXISTS custom_text_color TEXT DEFAULT '#ffffff';

-- ============================================
-- PRESET BACKGROUNDS FOR CUSTOM CARDS
-- ============================================
-- Businesses can define preset background options for customers

CREATE TABLE IF NOT EXISTS public.custom_card_backgrounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'color' CHECK (type IN ('color', 'gradient', 'image')),
  color TEXT,
  gradient_start TEXT,
  gradient_end TEXT,
  gradient_direction TEXT DEFAULT 'to-br',
  image_url TEXT,
  text_color TEXT DEFAULT '#ffffff',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_custom_card_backgrounds_business ON public.custom_card_backgrounds(business_id);

-- ============================================
-- DEFAULT BACKGROUNDS (System-wide)
-- ============================================
-- These are available to all businesses by default

CREATE TABLE IF NOT EXISTS public.default_card_backgrounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'color' CHECK (type IN ('color', 'gradient', 'image')),
  color TEXT,
  gradient_start TEXT,
  gradient_end TEXT,
  gradient_direction TEXT DEFAULT 'to-br',
  image_url TEXT,
  text_color TEXT DEFAULT '#ffffff',
  category TEXT DEFAULT 'general', -- general, birthday, christmas, love, etc.
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Insert default backgrounds
INSERT INTO public.default_card_backgrounds (name, type, color, text_color, category, sort_order) VALUES
  ('Azul Clássico', 'color', '#1e3a5f', '#ffffff', 'general', 1),
  ('Verde Esmeralda', 'color', '#047857', '#ffffff', 'general', 2),
  ('Roxo Elegante', 'color', '#6d28d9', '#ffffff', 'general', 3),
  ('Rosa Vibrante', 'color', '#db2777', '#ffffff', 'general', 4),
  ('Laranja Quente', 'color', '#ea580c', '#ffffff', 'general', 5),
  ('Dourado', 'color', '#b45309', '#ffffff', 'general', 6),
  ('Preto Premium', 'color', '#0f172a', '#ffffff', 'general', 7),
  ('Vermelho Intenso', 'color', '#dc2626', '#ffffff', 'general', 8)
ON CONFLICT DO NOTHING;

INSERT INTO public.default_card_backgrounds (name, type, gradient_start, gradient_end, gradient_direction, text_color, category, sort_order) VALUES
  ('Oceano', 'gradient', '#0ea5e9', '#6366f1', 'to-br', '#ffffff', 'general', 10),
  ('Pôr do Sol', 'gradient', '#f97316', '#ec4899', 'to-br', '#ffffff', 'general', 11),
  ('Aurora', 'gradient', '#8b5cf6', '#ec4899', 'to-r', '#ffffff', 'general', 12),
  ('Floresta', 'gradient', '#059669', '#0d9488', 'to-br', '#ffffff', 'general', 13),
  ('Noite', 'gradient', '#1e293b', '#475569', 'to-br', '#ffffff', 'general', 14),
  ('Amor', 'gradient', '#ec4899', '#f43f5e', 'to-r', '#ffffff', 'love', 15),
  ('Natal', 'gradient', '#dc2626', '#15803d', 'to-br', '#ffffff', 'christmas', 16),
  ('Aniversário', 'gradient', '#8b5cf6', '#f59e0b', 'to-r', '#ffffff', 'birthday', 17)
ON CONFLICT DO NOTHING;

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE public.custom_card_backgrounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.default_card_backgrounds ENABLE ROW LEVEL SECURITY;

-- Custom backgrounds: business owners can manage their own
CREATE POLICY "Business owners can manage custom backgrounds"
  ON public.custom_card_backgrounds FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- Default backgrounds: everyone can read
CREATE POLICY "Anyone can view default backgrounds"
  ON public.default_card_backgrounds FOR SELECT TO authenticated
  USING (is_active = true);

CREATE POLICY "Anon can view default backgrounds"
  ON public.default_card_backgrounds FOR SELECT TO anon
  USING (is_active = true);

-- ============================================
-- GRANTS
-- ============================================

GRANT SELECT, INSERT, UPDATE, DELETE ON public.custom_card_backgrounds TO authenticated;
GRANT SELECT ON public.default_card_backgrounds TO authenticated;
GRANT SELECT ON public.default_card_backgrounds TO anon;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON COLUMN public.businesses.custom_cards_enabled IS 'Whether this business allows customers to create custom gift cards';
COMMENT ON COLUMN public.businesses.custom_cards_min_amount_cents IS 'Minimum amount for custom gift cards in cents';
COMMENT ON COLUMN public.businesses.custom_cards_max_amount_cents IS 'Maximum amount for custom gift cards in cents';
COMMENT ON COLUMN public.businesses.custom_cards_preset_amounts IS 'Array of preset amounts in cents for quick selection';
COMMENT ON COLUMN public.gift_cards.is_custom IS 'Whether this gift card was customized by the buyer';
COMMENT ON COLUMN public.gift_cards.custom_title IS 'Custom headline/title set by the buyer';
COMMENT ON TABLE public.custom_card_backgrounds IS 'Business-specific background presets for custom cards';
COMMENT ON TABLE public.default_card_backgrounds IS 'System-wide default backgrounds available to all businesses';
