-- ============================================
-- MIMOZ - Business Customization Migration
-- ============================================
-- Adds branding/customization fields to businesses table

-- Add customization columns to businesses
ALTER TABLE public.businesses 
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#1e3a5f',
ADD COLUMN IF NOT EXISTS secondary_color TEXT DEFAULT '#2563eb',
ADD COLUMN IF NOT EXISTS gift_card_color TEXT DEFAULT '#1e3a5f',
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS contact_email TEXT,
ADD COLUMN IF NOT EXISTS contact_phone TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS website TEXT;

-- Comments for documentation
COMMENT ON COLUMN public.businesses.logo_url IS 'Business logo URL';
COMMENT ON COLUMN public.businesses.primary_color IS 'Main brand color for store header/footer (hex)';
COMMENT ON COLUMN public.businesses.secondary_color IS 'Accent color for buttons/links (hex)';
COMMENT ON COLUMN public.businesses.gift_card_color IS 'Background color for gift card display (hex)';
COMMENT ON COLUMN public.businesses.description IS 'Business description shown on store page';
COMMENT ON COLUMN public.businesses.contact_email IS 'Public contact email';
COMMENT ON COLUMN public.businesses.contact_phone IS 'Public contact phone';
COMMENT ON COLUMN public.businesses.address IS 'Business address';
COMMENT ON COLUMN public.businesses.website IS 'Business website URL';
