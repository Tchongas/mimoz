// ============================================
// MIMOZ - OAuth Callback Route
// ============================================
// Handles the OAuth callback from Google
// 
// Role-based redirects:
// - ADMIN → /admin
// - BUSINESS_OWNER → /business (requires business_id)
// - CASHIER → /cashier (requires business_id)
// - CUSTOMER → /account (no business needed)

import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getRoleDashboard } from '@/lib/auth';
import type { Role } from '@/types';

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
    const cookieStore = await cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );
    
    // Exchange code for session - this sets the cookies
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (exchangeError) {
      console.error('Code exchange error:', exchangeError);
      return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`);
    }

    // Get user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`);
    }

    // Get user's profile to determine redirect
    // Retry a few times in case trigger hasn't run yet
    let profile = null;
    for (let i = 0; i < 3; i++) {
      const { data } = await supabase
        .from('profiles')
        .select('role, business_id')
        .eq('id', user.id)
        .single();
      
      if (data) {
        profile = data;
        break;
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    // Determine role
    // - If profile exists, use its role
    // - If no profile yet (trigger delay), default to CUSTOMER
    const role: Role = (profile?.role as Role) || 'CUSTOMER';
    const businessId = profile?.business_id;

    // Roles that require a business assignment
    const businessRequiredRoles: Role[] = ['BUSINESS_OWNER', 'CASHIER'];
    
    if (businessRequiredRoles.includes(role) && !businessId) {
      // Staff member without business assignment
      return NextResponse.redirect(`${origin}/auth/no-business`);
    }

    // If there's a redirect URL (e.g., from store purchase flow), use it
    if (redirectTo) {
      return NextResponse.redirect(`${origin}${redirectTo}`);
    }

    // Otherwise, redirect to role-based dashboard
    const destination = getRoleDashboard(role);
    return NextResponse.redirect(`${origin}${destination}`);
  }

  // No code provided
  return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`);
}
