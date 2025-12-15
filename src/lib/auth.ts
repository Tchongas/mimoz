// ============================================
// Tapresente - Authentication Utilities
// ============================================
// Server-side auth helpers for session and user management

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Profile, Role, SessionUser } from '@/types';

// ============================================
// GET USER
// ============================================
// Returns the authenticated Supabase user or null

export async function getUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return null;
  }
  
  return user;
}

// ============================================
// GET USER PROFILE
// ============================================
// Returns the user's profile from the profiles table

export async function getUserProfile(): Promise<Profile | null> {
  const user = await getUser();
  
  if (!user) {
    return null;
  }
  
  const supabase = await createClient();
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  
  if (error || !profile) {
    return null;
  }
  
  return profile as Profile;
}

// ============================================
// GET SESSION USER
// ============================================
// Returns a simplified user object with role and business info

export async function getSessionUser(): Promise<SessionUser | null> {
  const profile = await getUserProfile();
  
  if (!profile) {
    return null;
  }
  
  return {
    id: profile.id,
    email: profile.email,
    role: profile.role,
    businessId: profile.business_id,
    fullName: profile.full_name,
    avatarUrl: profile.avatar_url,
  };
}

// ============================================
// GET USER ROLE
// ============================================
// Returns the user's role or null if not authenticated

export async function getUserRole(): Promise<Role | null> {
  const profile = await getUserProfile();
  return profile?.role ?? null;
}

// ============================================
// GET USER BUSINESS
// ============================================
// Returns the user's business_id or null

export async function getUserBusiness(): Promise<string | null> {
  const profile = await getUserProfile();
  return profile?.business_id ?? null;
}

// ============================================
// REQUIRE AUTH
// ============================================
// Redirects to login if not authenticated

export async function requireAuth(): Promise<SessionUser> {
  const sessionUser = await getSessionUser();
  
  if (!sessionUser) {
    redirect('/auth/login');
  }
  
  return sessionUser;
}

// ============================================
// REQUIRE ROLE
// ============================================
// Redirects if user doesn't have required role

export async function requireRole(allowedRoles: Role[]): Promise<SessionUser> {
  const sessionUser = await requireAuth();
  
  if (!allowedRoles.includes(sessionUser.role)) {
    // Redirect to appropriate dashboard based on role
    redirect(getRoleDashboard(sessionUser.role));
  }
  
  return sessionUser;
}

// ============================================
// REQUIRE BUSINESS
// ============================================
// Ensures user has a business assigned (for BUSINESS_OWNER and CASHIER)

export async function requireBusiness(): Promise<SessionUser & { businessId: string }> {
  const sessionUser = await requireAuth();
  
  if (sessionUser.role === 'ADMIN') {
    // Admins don't need a business
    return sessionUser as SessionUser & { businessId: string };
  }
  
  if (!sessionUser.businessId) {
    // User needs to be assigned to a business
    redirect('/auth/no-business');
  }
  
  return sessionUser as SessionUser & { businessId: string };
}

// ============================================
// GET ROLE DASHBOARD
// ============================================
// Returns the dashboard path for a given role

export function getRoleDashboard(role: Role): string {
  switch (role) {
    case 'ADMIN':
      return '/admin';
    case 'BUSINESS_OWNER':
      return '/business';
    case 'CASHIER':
      return '/cashier';
    case 'CUSTOMER':
      return '/account';
    default:
      return '/auth/login';
  }
}

// ============================================
// CHECK AUTH STATUS
// ============================================
// Returns auth status without redirecting

export async function checkAuthStatus(): Promise<{
  isAuthenticated: boolean;
  user: SessionUser | null;
}> {
  const sessionUser = await getSessionUser();
  
  return {
    isAuthenticated: !!sessionUser,
    user: sessionUser,
  };
}
