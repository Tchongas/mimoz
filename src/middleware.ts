// ============================================
// MIMOZ - Next.js Middleware
// ============================================
// Handles authentication and role-based route protection

import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

// Routes that don't require authentication (or handle auth themselves)
const PUBLIC_ROUTES = [
  '/auth/login',
  '/auth/callback',
  '/auth/error',
  '/auth/no-business',
  '/setup', // Setup page when not configured
  '/store', // Public store pages
  '/api',   // API routes handle their own auth
];

// Routes that require specific roles
const ROLE_ROUTES: Record<string, string[]> = {
  '/admin': ['ADMIN'],
  '/business': ['ADMIN', 'BUSINESS_OWNER'],
  '/cashier': ['ADMIN', 'BUSINESS_OWNER', 'CASHIER'],
  '/account': ['CUSTOMER', 'ADMIN'], // Customer account pages
};

// Role to dashboard mapping
const ROLE_DASHBOARDS: Record<string, string> = {
  ADMIN: '/admin',
  BUSINESS_OWNER: '/business',
  CASHIER: '/cashier',
  CUSTOMER: '/account',
};

// Roles that require a business_id
const BUSINESS_REQUIRED_ROLES = ['BUSINESS_OWNER', 'CASHIER'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if Supabase is configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    // Allow setup page and static assets
    if (pathname === '/setup' || pathname.startsWith('/_next')) {
      return NextResponse.next();
    }
    // Redirect to setup page
    return NextResponse.redirect(new URL('/setup', request.url));
  }

  // Update session and get user - wrapped in try/catch
  let sessionResult;
  try {
    sessionResult = await updateSession(request);
  } catch (error) {
    console.error('Middleware session error:', error);
    // On error, redirect to error page
    if (!pathname.startsWith('/auth/error')) {
      return NextResponse.redirect(new URL('/auth/error?error=session_error', request.url));
    }
    return NextResponse.next();
  }

  const { user, supabase, response } = sessionResult;

  // Allow public routes
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    // If user is logged in and trying to access login, redirect to dashboard
    if (pathname === '/auth/login' && user) {
      // Get user's role from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      const role = profile?.role || 'CUSTOMER';
      const dashboard = ROLE_DASHBOARDS[role] || '/account';
      
      return NextResponse.redirect(new URL(dashboard, request.url));
    }
    return response;
  }

  // Redirect unauthenticated users to login
  if (!user) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Get user's role from profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, business_id')
    .eq('id', user.id)
    .single();

  if (!profile) {
    // Profile not found - redirect to error page
    return NextResponse.redirect(new URL('/auth/error?error=no_profile', request.url));
  }

  const userRole = profile.role;
  const userBusinessId = profile.business_id;

  // Check if user needs a business assigned (only for BUSINESS_OWNER and CASHIER)
  if (BUSINESS_REQUIRED_ROLES.includes(userRole) && !userBusinessId) {
    if (!pathname.startsWith('/auth/no-business')) {
      return NextResponse.redirect(new URL('/auth/no-business', request.url));
    }
    return response;
  }

  // Check role-based access for protected routes
  for (const [routePrefix, allowedRoles] of Object.entries(ROLE_ROUTES)) {
    if (pathname.startsWith(routePrefix)) {
      if (!allowedRoles.includes(userRole)) {
        // Redirect to user's appropriate dashboard
        const dashboard = ROLE_DASHBOARDS[userRole] || '/cashier';
        return NextResponse.redirect(new URL(dashboard, request.url));
      }
      break;
    }
  }

  // Root path redirect based on role
  if (pathname === '/') {
    const dashboard = ROLE_DASHBOARDS[userRole] || '/account';
    return NextResponse.redirect(new URL(dashboard, request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
