// ============================================
// MIMOZ - Landing Page
// ============================================

import { redirect } from 'next/navigation';
import { getSessionUser, getRoleDashboard } from '@/lib/auth';
import {
  LandingHeader,
  LandingHero,
  LandingFeatures,
  LandingSteps,
  LandingCTA,
  LandingFooter,
} from '@/components/landing';

export default async function LandingPage() {
  // If user is logged in, redirect to their dashboard
  const user = await getSessionUser();
  if (user) {
    redirect(getRoleDashboard(user.role));
  }

  return (
    <div className="min-h-screen bg-white">
      <LandingHeader />
      <LandingHero />
      <LandingFeatures />
      <LandingSteps />
      <LandingCTA />
      <LandingFooter />
    </div>
  );
}
