-- ============================================
-- MIMOZ - Template Customization Migration
-- ============================================
-- Adds per-template customization fields

-- Add card_color to gift_card_templates
-- This allows each template to have its own color, overriding business default
ALTER TABLE gift_card_templates
ADD COLUMN IF NOT EXISTS card_color TEXT DEFAULT NULL;

-- Add image_url for future template images
-- (column may already exist from initial migration)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'gift_card_templates' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE gift_card_templates ADD COLUMN image_url TEXT DEFAULT NULL;
  END IF;
END $$;

-- Comment on columns
COMMENT ON COLUMN gift_card_templates.card_color IS 'Custom color for this template (hex). Overrides business gift_card_color.';
COMMENT ON COLUMN gift_card_templates.image_url IS 'Custom image URL for this template.';
