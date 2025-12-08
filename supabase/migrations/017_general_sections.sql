-- ============================================
-- MIMOZ - General Sections Migration
-- ============================================
-- Adds flexible, general-purpose sections to the store page
-- Sections can be used for: About, Services, Intro, Benefits, etc.

-- ============================================
-- HEADER/FOOTER VISIBILITY
-- ============================================
ALTER TABLE public.businesses 
ADD COLUMN IF NOT EXISTS show_header BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS show_footer BOOLEAN DEFAULT true;

-- ============================================
-- HERO CTA URL (can link anywhere)
-- ============================================
ALTER TABLE public.businesses 
ADD COLUMN IF NOT EXISTS hero_cta_url TEXT;

-- ============================================
-- SECTION 1 (Above Products - Intro/About)
-- ============================================
ALTER TABLE public.businesses 
ADD COLUMN IF NOT EXISTS section1_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS section1_title TEXT,
ADD COLUMN IF NOT EXISTS section1_subtitle TEXT,
ADD COLUMN IF NOT EXISTS section1_content TEXT,
ADD COLUMN IF NOT EXISTS section1_bg_color TEXT DEFAULT '#ffffff',
ADD COLUMN IF NOT EXISTS section1_text_color TEXT DEFAULT '#1e293b',
ADD COLUMN IF NOT EXISTS section1_layout TEXT DEFAULT 'centered' CHECK (section1_layout IN ('centered', 'left', 'right', 'split')),
ADD COLUMN IF NOT EXISTS section1_image_url TEXT,
ADD COLUMN IF NOT EXISTS section1_cta_text TEXT,
ADD COLUMN IF NOT EXISTS section1_cta_url TEXT,
ADD COLUMN IF NOT EXISTS section1_cta_color TEXT DEFAULT '#2563eb';

-- ============================================
-- SECTION 2 (Below Products - Benefits/Features)
-- ============================================
-- Repurpose features section to be more general
ALTER TABLE public.businesses 
DROP COLUMN IF EXISTS features_title,
DROP COLUMN IF EXISTS show_features_section;

ALTER TABLE public.businesses 
ADD COLUMN IF NOT EXISTS section2_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS section2_type TEXT DEFAULT 'features' CHECK (section2_type IN ('features', 'text', 'cards', 'stats')),
ADD COLUMN IF NOT EXISTS section2_title TEXT DEFAULT 'Por que nos escolher?',
ADD COLUMN IF NOT EXISTS section2_subtitle TEXT,
ADD COLUMN IF NOT EXISTS section2_bg_color TEXT DEFAULT '#f8fafc',
ADD COLUMN IF NOT EXISTS section2_text_color TEXT DEFAULT '#1e293b';

-- Rename feature columns to be more generic (item1, item2, item3)
-- Keep existing columns but add new generic ones
ALTER TABLE public.businesses 
ADD COLUMN IF NOT EXISTS section2_item1_icon TEXT DEFAULT 'star',
ADD COLUMN IF NOT EXISTS section2_item1_title TEXT DEFAULT 'Qualidade',
ADD COLUMN IF NOT EXISTS section2_item1_description TEXT DEFAULT 'Produtos e serviços de alta qualidade',
ADD COLUMN IF NOT EXISTS section2_item2_icon TEXT DEFAULT 'clock',
ADD COLUMN IF NOT EXISTS section2_item2_title TEXT DEFAULT 'Agilidade',
ADD COLUMN IF NOT EXISTS section2_item2_description TEXT DEFAULT 'Atendimento rápido e eficiente',
ADD COLUMN IF NOT EXISTS section2_item3_icon TEXT DEFAULT 'shield',
ADD COLUMN IF NOT EXISTS section2_item3_title TEXT DEFAULT 'Segurança',
ADD COLUMN IF NOT EXISTS section2_item3_description TEXT DEFAULT 'Sua satisfação é nossa prioridade',
ADD COLUMN IF NOT EXISTS section2_item4_icon TEXT,
ADD COLUMN IF NOT EXISTS section2_item4_title TEXT,
ADD COLUMN IF NOT EXISTS section2_item4_description TEXT;

-- ============================================
-- SECTION 3 (Additional Content Section)
-- ============================================
ALTER TABLE public.businesses 
ADD COLUMN IF NOT EXISTS section3_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS section3_type TEXT DEFAULT 'text' CHECK (section3_type IN ('features', 'text', 'cards', 'gallery', 'cta')),
ADD COLUMN IF NOT EXISTS section3_title TEXT,
ADD COLUMN IF NOT EXISTS section3_subtitle TEXT,
ADD COLUMN IF NOT EXISTS section3_content TEXT,
ADD COLUMN IF NOT EXISTS section3_bg_color TEXT DEFAULT '#ffffff',
ADD COLUMN IF NOT EXISTS section3_text_color TEXT DEFAULT '#1e293b',
ADD COLUMN IF NOT EXISTS section3_image_url TEXT,
ADD COLUMN IF NOT EXISTS section3_cta_text TEXT,
ADD COLUMN IF NOT EXISTS section3_cta_url TEXT;

-- ============================================
-- PRODUCTS SECTION RENAME (More Generic)
-- ============================================
-- Add alternative title for products section
ALTER TABLE public.businesses 
ADD COLUMN IF NOT EXISTS products_subtitle TEXT,
ADD COLUMN IF NOT EXISTS products_section_enabled BOOLEAN DEFAULT true;

-- ============================================
-- CTA BANNER SECTION (Call to Action)
-- ============================================
ALTER TABLE public.businesses 
ADD COLUMN IF NOT EXISTS cta_banner_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS cta_banner_title TEXT,
ADD COLUMN IF NOT EXISTS cta_banner_subtitle TEXT,
ADD COLUMN IF NOT EXISTS cta_banner_button_text TEXT DEFAULT 'Saiba Mais',
ADD COLUMN IF NOT EXISTS cta_banner_button_url TEXT,
ADD COLUMN IF NOT EXISTS cta_banner_bg_color TEXT DEFAULT '#1e3a5f',
ADD COLUMN IF NOT EXISTS cta_banner_text_color TEXT DEFAULT '#ffffff';

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON COLUMN public.businesses.section1_enabled IS 'Enable intro/about section above products';
COMMENT ON COLUMN public.businesses.section1_layout IS 'Section layout: centered, left-aligned, right-aligned, or split with image';
COMMENT ON COLUMN public.businesses.section2_type IS 'Section type: features grid, text block, cards, or stats';
COMMENT ON COLUMN public.businesses.section3_type IS 'Section type: features, text, cards, gallery, or CTA';
COMMENT ON COLUMN public.businesses.cta_banner_enabled IS 'Enable call-to-action banner section';
