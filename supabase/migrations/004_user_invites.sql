-- ============================================
-- MIMOZ - User Invites Migration
-- ============================================
-- Pre-register users before they login
-- When user logs in for the first time, they get their assigned role/business

-- ============================================
-- USER_INVITES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.user_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'CASHIER' CHECK (role IN ('ADMIN', 'BUSINESS_OWNER', 'CASHIER')),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_user_invites_email ON public.user_invites(email);

-- ============================================
-- UPDATE handle_new_user FUNCTION
-- ============================================
-- Checks for pending invite when user signs up

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  invite_record RECORD;
BEGIN
  -- Check for pending invite by email
  SELECT * INTO invite_record
  FROM public.user_invites
  WHERE LOWER(email) = LOWER(NEW.email)
  LIMIT 1;

  IF invite_record IS NOT NULL THEN
    -- Create profile with pre-assigned role and business
    INSERT INTO public.profiles (id, email, full_name, avatar_url, role, business_id)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', invite_record.full_name),
      NEW.raw_user_meta_data->>'avatar_url',
      invite_record.role,
      invite_record.business_id
    );
    
    -- Delete the used invite
    DELETE FROM public.user_invites WHERE id = invite_record.id;
  ELSE
    -- No invite found - create with default CASHIER role (no business)
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
      NEW.id,
      NEW.email,
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'avatar_url'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE public.user_invites ENABLE ROW LEVEL SECURITY;

-- Only admins can manage invites
CREATE POLICY "Admins can manage invites"
  ON public.user_invites
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));
