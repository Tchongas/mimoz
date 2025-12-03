// ============================================
// MIMOZ - Home Page (Redirects to Dashboard)
// ============================================
// This page redirects authenticated users to their dashboard
// The middleware handles the actual redirect logic

import { redirect } from 'next/navigation';
import { getSessionUser, getRoleDashboard } from '@/lib/auth';

export default async function Home() {
  const user = await getSessionUser();
  
  if (user) {
    // Redirect to role-based dashboard
    redirect(getRoleDashboard(user.role));
  }
  
  // Redirect unauthenticated users to login
  redirect('/auth/login');
}
