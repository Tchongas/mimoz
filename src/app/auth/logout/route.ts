// ============================================
// MIMOZ - Logout Route
// ============================================
// Handles user logout - POST only to prevent prefetch issues

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// IMPORTANT: Only POST should trigger logout
// GET requests (like Next.js prefetch) should NOT log users out
export async function GET(request: Request) {
  // Redirect to home without logging out - this prevents prefetch from logging out
  const { origin } = new URL(request.url);
  return NextResponse.redirect(`${origin}/`);
}

export async function POST(request: Request) {
  const { origin } = new URL(request.url);
  const supabase = await createClient();
  
  await supabase.auth.signOut();
  
  return NextResponse.redirect(`${origin}/auth/login`);
}
