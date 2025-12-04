-- ============================================
-- MIMOZ - Gift Cards System Migration
-- ============================================

-- ============================================
-- GIFT CARD TEMPLATES
-- ============================================
-- Templates define the types of gift cards a business sells

CREATE TABLE IF NOT EXISTS public.gift_card_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
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
-- Individual gift cards created after purchase

CREATE TABLE IF NOT EXISTS public.gift_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
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
CREATE INDEX IF NOT EXISTS idx_gift_cards_purchaser_email ON public.gift_cards(purchaser_email);

-- ============================================
-- ORDERS
-- ============================================
-- Payment transactions

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
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
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session ON public.orders(stripe_checkout_session_id);

-- ============================================
-- REDEMPTIONS
-- ============================================
-- Track partial/full redemptions

CREATE TABLE IF NOT EXISTS public.redemptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gift_card_id UUID NOT NULL REFERENCES public.gift_cards(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  cashier_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  balance_before INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  notes TEXT,
  redeemed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_redemptions_gift_card_id ON public.redemptions(gift_card_id);
CREATE INDEX IF NOT EXISTS idx_redemptions_business_id ON public.redemptions(business_id);
CREATE INDEX IF NOT EXISTS idx_redemptions_cashier_id ON public.redemptions(cashier_id);

-- ============================================
-- TRIGGERS
-- ============================================

-- Updated at trigger for templates
DROP TRIGGER IF EXISTS on_gift_card_templates_updated ON public.gift_card_templates;
CREATE TRIGGER on_gift_card_templates_updated
  BEFORE UPDATE ON public.gift_card_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- FUNCTIONS
-- ============================================

-- Generate unique gift card code
CREATE OR REPLACE FUNCTION public.generate_gift_card_code()
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate code: MIMO-XXXX-XXXX (alphanumeric, uppercase)
    new_code := 'MIMO-' || 
      UPPER(SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 4)) || '-' ||
      UPPER(SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 5 FOR 4));
    
    -- Check if code exists
    SELECT EXISTS(SELECT 1 FROM public.gift_cards WHERE code = new_code) INTO code_exists;
    
    -- Exit loop if unique
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE public.gift_card_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.redemptions ENABLE ROW LEVEL SECURITY;

-- Gift Card Templates Policies
CREATE POLICY "Admins can manage all templates"
  ON public.gift_card_templates FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Business owners can manage own templates"
  ON public.gift_card_templates FOR ALL TO authenticated
  USING (business_id = public.get_user_business_id(auth.uid()))
  WITH CHECK (business_id = public.get_user_business_id(auth.uid()));

CREATE POLICY "Public can view active templates"
  ON public.gift_card_templates FOR SELECT TO anon
  USING (is_active = true);

-- Gift Cards Policies
CREATE POLICY "Admins can manage all gift cards"
  ON public.gift_cards FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Business users can view own business cards"
  ON public.gift_cards FOR SELECT TO authenticated
  USING (business_id = public.get_user_business_id(auth.uid()));

-- Orders Policies
CREATE POLICY "Admins can manage all orders"
  ON public.orders FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Business owners can view own orders"
  ON public.orders FOR SELECT TO authenticated
  USING (business_id = public.get_user_business_id(auth.uid()));

-- Redemptions Policies
CREATE POLICY "Admins can manage all redemptions"
  ON public.redemptions FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Business users can view own redemptions"
  ON public.redemptions FOR SELECT TO authenticated
  USING (business_id = public.get_user_business_id(auth.uid()));

CREATE POLICY "Cashiers can insert redemptions"
  ON public.redemptions FOR INSERT TO authenticated
  WITH CHECK (business_id = public.get_user_business_id(auth.uid()));
