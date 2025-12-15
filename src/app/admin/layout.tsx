// ============================================
// Tapresente - Admin Layout
// ============================================

import { requireRole } from '@/lib/auth';
import { DashboardLayout } from '@/components/dashboard';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole(['ADMIN']);

  return (
    <DashboardLayout user={user}>
      {children}
    </DashboardLayout>
  );
}
