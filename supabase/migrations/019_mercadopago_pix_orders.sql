-- ============================================
-- MIMOZ - Mercado Pago PIX (Orders API) Fields
-- ============================================
-- Stores PIX artifacts (QR code, copy/paste code, ticket URL) for Transparent Checkout

ALTER TABLE gift_cards
ADD COLUMN IF NOT EXISTS mp_order_id TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS mp_payment_id TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS mp_pix_ticket_url TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS mp_pix_qr_code TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS mp_pix_qr_code_base64 TEXT DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_gift_cards_mp_order_id
ON gift_cards(mp_order_id)
WHERE mp_order_id IS NOT NULL;
