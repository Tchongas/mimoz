-- ============================================
-- MIMOZ - Payment Audit Logs Migration
-- ============================================
-- Adds comprehensive audit logging for payments and redemptions
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. PAYMENT AUDIT LOGS TABLE
-- ============================================
-- Tracks all payment-related events for gift cards

CREATE TABLE IF NOT EXISTS public.payment_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_card_id UUID NOT NULL REFERENCES public.gift_cards(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Event details
  event_type TEXT NOT NULL CHECK (event_type IN (
    'PAYMENT_INITIATED',
    'PAYMENT_PENDING',
    'PAYMENT_COMPLETED',
    'PAYMENT_FAILED',
    'PAYMENT_REFUNDED',
    'CARD_ACTIVATED',
    'CARD_EXPIRED',
    'CARD_CANCELLED'
  )),
  
  -- Payment details
  payment_method TEXT CHECK (payment_method IN ('PIX', 'CARD', NULL)),
  payment_provider TEXT DEFAULT 'abacatepay',
  payment_provider_id TEXT,
  amount_cents INTEGER,
  fee_cents INTEGER,
  
  -- Status tracking
  previous_status TEXT,
  new_status TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_payment_audit_logs_gift_card_id ON public.payment_audit_logs(gift_card_id);
CREATE INDEX IF NOT EXISTS idx_payment_audit_logs_business_id ON public.payment_audit_logs(business_id);
CREATE INDEX IF NOT EXISTS idx_payment_audit_logs_user_id ON public.payment_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_audit_logs_event_type ON public.payment_audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_payment_audit_logs_created_at ON public.payment_audit_logs(created_at DESC);

-- ============================================
-- 2. REDEMPTION AUDIT LOGS TABLE
-- ============================================
-- Enhanced logging for redemptions (extends existing redemptions table)

CREATE TABLE IF NOT EXISTS public.redemption_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  redemption_id UUID REFERENCES public.redemptions(id) ON DELETE SET NULL,
  gift_card_id UUID NOT NULL REFERENCES public.gift_cards(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  cashier_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Redemption details
  amount_cents INTEGER NOT NULL,
  balance_before INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  
  -- Gift card owner info (for audit trail)
  card_owner_name TEXT,
  card_owner_email TEXT,
  
  -- Event type
  event_type TEXT NOT NULL DEFAULT 'REDEMPTION' CHECK (event_type IN (
    'REDEMPTION',
    'PARTIAL_REDEMPTION',
    'FULL_REDEMPTION',
    'REDEMPTION_REVERSED'
  )),
  
  -- Metadata
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_redemption_audit_logs_gift_card_id ON public.redemption_audit_logs(gift_card_id);
CREATE INDEX IF NOT EXISTS idx_redemption_audit_logs_business_id ON public.redemption_audit_logs(business_id);
CREATE INDEX IF NOT EXISTS idx_redemption_audit_logs_cashier_id ON public.redemption_audit_logs(cashier_id);
CREATE INDEX IF NOT EXISTS idx_redemption_audit_logs_created_at ON public.redemption_audit_logs(created_at DESC);

-- ============================================
-- 3. ADD PAYMENT TRACKING TO GIFT_CARDS
-- ============================================
-- Additional columns for payment tracking

ALTER TABLE gift_cards
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED')),
ADD COLUMN IF NOT EXISTS payment_completed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS activated_at TIMESTAMPTZ;

-- ============================================
-- 4. ENABLE RLS
-- ============================================

ALTER TABLE public.payment_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.redemption_audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. RLS POLICIES
-- ============================================

-- Payment audit logs - only admins and business staff can view
CREATE POLICY "Business staff can view payment logs"
  ON public.payment_audit_logs
  FOR SELECT
  TO authenticated
  USING (
    business_id IN (
      SELECT business_id FROM profiles WHERE id = auth.uid() AND business_id IS NOT NULL
    )
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );

-- Payment audit logs - system can insert (via service role)
CREATE POLICY "System can insert payment logs"
  ON public.payment_audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Redemption audit logs - business staff can view their business logs
CREATE POLICY "Business staff can view redemption logs"
  ON public.redemption_audit_logs
  FOR SELECT
  TO authenticated
  USING (
    business_id IN (
      SELECT business_id FROM profiles WHERE id = auth.uid() AND business_id IS NOT NULL
    )
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );

-- Redemption audit logs - cashiers can insert
CREATE POLICY "Cashiers can insert redemption logs"
  ON public.redemption_audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    business_id IN (
      SELECT business_id FROM profiles WHERE id = auth.uid() AND business_id IS NOT NULL
    )
  );

-- ============================================
-- 6. GRANTS
-- ============================================

GRANT SELECT, INSERT ON public.payment_audit_logs TO authenticated;
GRANT SELECT, INSERT ON public.redemption_audit_logs TO authenticated;

-- ============================================
-- 7. COMMENTS
-- ============================================

COMMENT ON TABLE public.payment_audit_logs IS 'Audit trail for all payment-related events';
COMMENT ON TABLE public.redemption_audit_logs IS 'Audit trail for all redemption events';
COMMENT ON COLUMN gift_cards.payment_status IS 'Current payment status: PENDING, PROCESSING, COMPLETED, FAILED, REFUNDED';
COMMENT ON COLUMN gift_cards.payment_completed_at IS 'Timestamp when payment was completed';
COMMENT ON COLUMN gift_cards.activated_at IS 'Timestamp when gift card was activated after payment';

SELECT 'Payment audit logs migration applied!' AS status;
