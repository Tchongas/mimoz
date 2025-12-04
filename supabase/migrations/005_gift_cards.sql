-- ============================================
-- MIMOZ - Gift Cards System Migration
-- ============================================
-- NOTE: Adjust business_id type (UUID or BIGINT) to match your businesses table.
-- This version uses BIGINT. Change to UUID if needed.

-- ============================================
-- GIFT CARD TEMPLATES
-- ============================================

CREATE TABLE IF NOT EXISTS public.gift_card_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id BIGINT NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  valid_days INTEGER DEFAULT 365,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_gift_card_templates_business_id ON public.gift_card_templates(business_id);
CREATE INDEX IF NOT EXISTS idx_gift_card_templates_active ON public.gift_card_templates(business_id, is_active);

-- ============================================
-- GIFT CARDS (Purchased)
-- ============================================

CREATE TABLE IF NOT EXISTS public.gift_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id BIGINT NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  template_id UUID REFERENCES public.gift_card_templates(id) ON DELETE SET NULL,
  code TEXT UNIQUE NOT NULL,
  amount_cents INTEGER NOT NULL,
  balance_cents INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'REDEEMED', 'EXPIRED', 'CANCELLED')),
  purchaser_email TEXT NOT NULL,
  purchaser_name TEXT,
  recipient_email TEXT,
  recipient_name TEXT,
  recipient_message TEXT,
  purchased_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  redeemed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_gift_cards_business_id ON public.gift_cards(business_id);
CREATE INDEX IF NOT EXISTS idx_gift_cards_code ON public.gift_cards(code);
CREATE INDEX IF NOT EXISTS idx_gift_cards_status ON public.gift_cards(status);

-- ============================================
-- ORDERS
-- ============================================

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id BIGINT NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  gift_card_id UUID REFERENCES public.gift_cards(id) ON DELETE SET NULL,
  stripe_checkout_session_id TEXT,
  stripe_payment_intent_id TEXT,
  amount_cents INTEGER NOT NULL,
  platform_fee_cents INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID', 'FAILED', 'REFUNDED')),
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  paid_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_orders_business_id ON public.orders(business_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);

-- ============================================
-- REDEMPTIONS
-- ============================================

CREATE TABLE IF NOT EXISTS public.redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_card_id UUID NOT NULL REFERENCES public.gift_cards(id) ON DELETE CASCADE,
  business_id BIGINT NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  cashier_id UUID NOT NULL,
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  balance_before INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  notes TEXT,
  redeemed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_redemptions_gift_card_id ON public.redemptions(gift_card_id);
CREATE INDEX IF NOT EXISTS idx_redemptions_business_id ON public.redemptions(business_id);

-- ============================================
-- ENABLE RLS
-- ============================================

ALTER TABLE public.gift_card_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.redemptions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES (Simple version without helper functions)
-- ============================================

-- Allow authenticated users full access (API will handle authorization)
CREATE POLICY "Authenticated users can manage templates"
  ON public.gift_card_templates FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can manage gift cards"
  ON public.gift_cards FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can manage orders"
  ON public.orders FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can manage redemptions"
  ON public.redemptions FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- Public can view active templates (for store pages)
CREATE POLICY "Public can view active templates"
  ON public.gift_card_templates FOR SELECT TO anon
  USING (is_active = true);

-- Public can view businesses (for store pages)
CREATE POLICY "Public can view businesses"
  ON public.businesses FOR SELECT TO anon
  USING (true);

-- ============================================
-- GRANTS
-- ============================================

GRANT SELECT, INSERT, UPDATE, DELETE ON public.gift_card_templates TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gift_cards TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.redemptions TO authenticated;

GRANT SELECT ON public.gift_card_templates TO anon;
GRANT SELECT ON public.businesses TO anon;
