// ============================================
// Supabase Middleware Client
// ============================================
// Use this client in Next.js middleware

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, {
              ...options,
              // Ensure cookies work across the entire site
              path: '/',
            })
          );
        },
      },
    }
  );

  // IMPORTANT: Avoid calling getUser() on every request as it validates with
  // Supabase servers and can cause session issues. Use getSession() first.
  
  // Debug: Check what cookies we have
  const allCookies = request.cookies.getAll();
  const authCookies = allCookies.filter(c => c.name.includes('auth') || c.name.includes('sb-'));
  if (authCookies.length === 0) {
    console.log('[Supabase Middleware] No auth cookies found. Total cookies:', allCookies.length);
  }
  
  // First try to get session from cookies (no server validation)
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError) {
    console.log('[Supabase Middleware] getSession error:', sessionError.message);
  }
  
  // If we have a session, use the user from it
  // Only call getUser() if we need to validate (which refreshes the token)
  let user = session?.user ?? null;
  
  // If session exists but is close to expiring, refresh it
  if (session?.expires_at) {
    const expiresAt = session.expires_at * 1000; // Convert to ms
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    
    // If session expires in less than 5 minutes, refresh it
    if (expiresAt - now < fiveMinutes) {
      const { data: { user: refreshedUser }, error: refreshError } = await supabase.auth.getUser();
      if (refreshError) {
        console.log('[Supabase Middleware] Token refresh error:', refreshError.message);
      } else if (refreshedUser) {
        user = refreshedUser;
      }
    }
  }

  return { user, supabase, response: supabaseResponse };
}
