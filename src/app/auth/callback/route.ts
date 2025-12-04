// ============================================
// MIMOZ - OAuth Callback Route
// ============================================
// Handles the OAuth callback from Google

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getRoleDashboard } from '@/lib/auth';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const redirectTo = searchParams.get('redirect');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error, errorDescription);
    return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`);
  }

  if (code) {
    const supabase = await createClient();
    
    // Exchange code for session
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (exchangeError) {
      console.error('Code exchange error:', exchangeError);
      return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`);
    }

    // Get user and their role
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`);
    }

    // Get user's profile to determine redirect
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, business_id')
      .eq('id', user.id)
      .single();

    // If no profile exists yet, it will be created by the trigger
    // Default role is now CUSTOMER for new signups
    const role = profile?.role || 'CUSTOMER';
    const businessId = profile?.business_id;

    // Check if business-related roles need a business assigned
    // ADMIN and CUSTOMER don't need a business
    if (role !== 'ADMIN' && role !== 'CUSTOMER' && !businessId) {
      return NextResponse.redirect(`${origin}/auth/no-business`);
    }

    // Redirect to requested page or role-based dashboard
    const destination = redirectTo || getRoleDashboard(role);
    return NextResponse.redirect(`${origin}${destination}`);
  }

  // No code provided
  return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`);
}
