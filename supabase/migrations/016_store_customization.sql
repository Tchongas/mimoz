-- ============================================
-- MIMOZ - Store Customization Migration
-- ============================================
-- Adds comprehensive store customization fields to businesses table
-- Inspired by professional ticket/store platforms

-- ============================================
-- HEADER CUSTOMIZATION
-- ============================================
ALTER TABLE public.businesses 
ADD COLUMN IF NOT EXISTS header_bg_color TEXT DEFAULT '#ffffff',
ADD COLUMN IF NOT EXISTS header_text_color TEXT DEFAULT '#1e293b',
ADD COLUMN IF NOT EXISTS header_style TEXT DEFAULT 'solid' CHECK (header_style IN ('solid', 'transparent', 'gradient')),
ADD COLUMN IF NOT EXISTS show_header_contact BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS logo_link_url TEXT;

-- ============================================
-- HERO SECTION CUSTOMIZATION
-- ============================================
ALTER TABLE public.businesses 
ADD COLUMN IF NOT EXISTS hero_title TEXT,
ADD COLUMN IF NOT EXISTS hero_subtitle TEXT,
ADD COLUMN IF NOT EXISTS hero_bg_type TEXT DEFAULT 'color' CHECK (hero_bg_type IN ('color', 'gradient', 'image')),
ADD COLUMN IF NOT EXISTS hero_bg_color TEXT DEFAULT '#1e3a5f',
ADD COLUMN IF NOT EXISTS hero_bg_gradient_start TEXT DEFAULT '#1e3a5f',
ADD COLUMN IF NOT EXISTS hero_bg_gradient_end TEXT DEFAULT '#3b82f6',
ADD COLUMN IF NOT EXISTS hero_bg_image_url TEXT,
ADD COLUMN IF NOT EXISTS hero_text_color TEXT DEFAULT '#ffffff',
ADD COLUMN IF NOT EXISTS hero_overlay_opacity INTEGER DEFAULT 50 CHECK (hero_overlay_opacity >= 0 AND hero_overlay_opacity <= 100),
ADD COLUMN IF NOT EXISTS hero_cta_text TEXT DEFAULT 'Comprar Agora',
ADD COLUMN IF NOT EXISTS hero_cta_color TEXT DEFAULT '#2563eb',
ADD COLUMN IF NOT EXISTS show_hero_section BOOLEAN DEFAULT true;

-- ============================================
-- PRODUCTS SECTION CUSTOMIZATION
-- ============================================
ALTER TABLE public.businesses 
ADD COLUMN IF NOT EXISTS products_title TEXT DEFAULT 'Escolha seu Vale-Presente',
ADD COLUMN IF NOT EXISTS products_bg_color TEXT DEFAULT '#ffffff',
ADD COLUMN IF NOT EXISTS products_layout TEXT DEFAULT 'grid' CHECK (products_layout IN ('grid', 'list', 'carousel')),
ADD COLUMN IF NOT EXISTS products_columns INTEGER DEFAULT 3 CHECK (products_columns >= 1 AND products_columns <= 4),
ADD COLUMN IF NOT EXISTS show_product_description BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS card_style TEXT DEFAULT 'elevated' CHECK (card_style IN ('elevated', 'flat', 'bordered'));

-- ============================================
-- FEATURES/BENEFITS SECTION
-- ============================================
ALTER TABLE public.businesses 
ADD COLUMN IF NOT EXISTS show_features_section BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS features_title TEXT DEFAULT 'Por que escolher nossos vale-presentes?',
ADD COLUMN IF NOT EXISTS features_bg_color TEXT DEFAULT '#f8fafc',
ADD COLUMN IF NOT EXISTS feature_1_icon TEXT DEFAULT 'gift',
ADD COLUMN IF NOT EXISTS feature_1_title TEXT DEFAULT 'Presente Perfeito',
ADD COLUMN IF NOT EXISTS feature_1_description TEXT DEFAULT 'Ideal para qualquer ocasião especial',
ADD COLUMN IF NOT EXISTS feature_2_icon TEXT DEFAULT 'clock',
ADD COLUMN IF NOT EXISTS feature_2_title TEXT DEFAULT 'Entrega Instantânea',
ADD COLUMN IF NOT EXISTS feature_2_description TEXT DEFAULT 'Receba por email imediatamente',
ADD COLUMN IF NOT EXISTS feature_3_icon TEXT DEFAULT 'shield',
ADD COLUMN IF NOT EXISTS feature_3_title TEXT DEFAULT '100% Seguro',
ADD COLUMN IF NOT EXISTS feature_3_description TEXT DEFAULT 'Pagamento seguro via PIX';

-- ============================================
-- TESTIMONIALS SECTION
-- ============================================
ALTER TABLE public.businesses 
ADD COLUMN IF NOT EXISTS show_testimonials_section BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS testimonials_title TEXT DEFAULT 'O que nossos clientes dizem',
ADD COLUMN IF NOT EXISTS testimonials_bg_color TEXT DEFAULT '#ffffff';

-- ============================================
-- FOOTER CUSTOMIZATION
-- ============================================
ALTER TABLE public.businesses 
ADD COLUMN IF NOT EXISTS footer_bg_color TEXT DEFAULT '#1e293b',
ADD COLUMN IF NOT EXISTS footer_text_color TEXT DEFAULT '#94a3b8',
ADD COLUMN IF NOT EXISTS footer_text TEXT,
ADD COLUMN IF NOT EXISTS show_footer_contact BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS show_footer_social BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS social_facebook TEXT,
ADD COLUMN IF NOT EXISTS social_instagram TEXT,
ADD COLUMN IF NOT EXISTS social_whatsapp TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;

-- ============================================
-- GENERAL STORE SETTINGS
-- ============================================
ALTER TABLE public.businesses 
ADD COLUMN IF NOT EXISTS page_bg_color TEXT DEFAULT '#f8fafc',
ADD COLUMN IF NOT EXISTS font_family TEXT DEFAULT 'Inter' CHECK (font_family IN ('Inter', 'Poppins', 'Roboto', 'Open Sans', 'Lato', 'Montserrat')),
ADD COLUMN IF NOT EXISTS border_radius TEXT DEFAULT 'rounded' CHECK (border_radius IN ('none', 'small', 'rounded', 'large', 'full')),
ADD COLUMN IF NOT EXISTS favicon_url TEXT,
ADD COLUMN IF NOT EXISTS og_image_url TEXT,
ADD COLUMN IF NOT EXISTS meta_title TEXT,
ADD COLUMN IF NOT EXISTS meta_description TEXT;

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================
COMMENT ON COLUMN public.businesses.header_bg_color IS 'Header background color';
COMMENT ON COLUMN public.businesses.header_text_color IS 'Header text/icon color';
COMMENT ON COLUMN public.businesses.header_style IS 'Header style: solid, transparent, or gradient';
COMMENT ON COLUMN public.businesses.show_header_contact IS 'Show contact info in header';
COMMENT ON COLUMN public.businesses.logo_link_url IS 'URL to redirect when clicking logo';

COMMENT ON COLUMN public.businesses.hero_title IS 'Hero section main title';
COMMENT ON COLUMN public.businesses.hero_subtitle IS 'Hero section subtitle/description';
COMMENT ON COLUMN public.businesses.hero_bg_type IS 'Hero background type: color, gradient, or image';
COMMENT ON COLUMN public.businesses.hero_bg_color IS 'Hero solid background color';
COMMENT ON COLUMN public.businesses.hero_bg_gradient_start IS 'Hero gradient start color';
COMMENT ON COLUMN public.businesses.hero_bg_gradient_end IS 'Hero gradient end color';
COMMENT ON COLUMN public.businesses.hero_bg_image_url IS 'Hero background image URL';
COMMENT ON COLUMN public.businesses.hero_text_color IS 'Hero text color';
COMMENT ON COLUMN public.businesses.hero_overlay_opacity IS 'Hero image overlay opacity (0-100)';
COMMENT ON COLUMN public.businesses.hero_cta_text IS 'Hero call-to-action button text';
COMMENT ON COLUMN public.businesses.hero_cta_color IS 'Hero CTA button color';
COMMENT ON COLUMN public.businesses.show_hero_section IS 'Show/hide hero section';

COMMENT ON COLUMN public.businesses.products_title IS 'Products section title';
COMMENT ON COLUMN public.businesses.products_bg_color IS 'Products section background color';
COMMENT ON COLUMN public.businesses.products_layout IS 'Products display layout: grid, list, or carousel';
COMMENT ON COLUMN public.businesses.products_columns IS 'Number of columns in grid layout (1-4)';
COMMENT ON COLUMN public.businesses.show_product_description IS 'Show product descriptions';
COMMENT ON COLUMN public.businesses.card_style IS 'Product card style: elevated, flat, or bordered';

COMMENT ON COLUMN public.businesses.show_features_section IS 'Show/hide features section';
COMMENT ON COLUMN public.businesses.features_title IS 'Features section title';
COMMENT ON COLUMN public.businesses.features_bg_color IS 'Features section background color';

COMMENT ON COLUMN public.businesses.show_testimonials_section IS 'Show/hide testimonials section';
COMMENT ON COLUMN public.businesses.testimonials_title IS 'Testimonials section title';

COMMENT ON COLUMN public.businesses.footer_bg_color IS 'Footer background color';
COMMENT ON COLUMN public.businesses.footer_text_color IS 'Footer text color';
COMMENT ON COLUMN public.businesses.footer_text IS 'Custom footer text';
COMMENT ON COLUMN public.businesses.show_footer_contact IS 'Show contact info in footer';
COMMENT ON COLUMN public.businesses.show_footer_social IS 'Show social links in footer';

COMMENT ON COLUMN public.businesses.page_bg_color IS 'Page background color';
COMMENT ON COLUMN public.businesses.font_family IS 'Store font family';
COMMENT ON COLUMN public.businesses.border_radius IS 'Border radius style for cards/buttons';
COMMENT ON COLUMN public.businesses.favicon_url IS 'Store favicon URL';
COMMENT ON COLUMN public.businesses.og_image_url IS 'Open Graph image for social sharing';
COMMENT ON COLUMN public.businesses.meta_title IS 'SEO meta title';
COMMENT ON COLUMN public.businesses.meta_description IS 'SEO meta description';
