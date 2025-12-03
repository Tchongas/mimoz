// ============================================
// MIMOZ - Cashier Layout
// ============================================

import { requireRole, requireBusiness } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { DashboardLayout } from '@/components/dashboard';

export default async function CashierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole(['ADMIN', 'BUSINESS_OWNER', 'CASHIER']);
  await requireBusiness();

  // Get business name
  let businessName: string | undefined;
  if (user.businessId) {
    const supabase = await createClient();
    const { data: business } = await supabase
      .from('businesses')
      .select('name')
      .eq('id', user.businessId)
      .single();
    businessName = business?.name;
  }

  return (
    <DashboardLayout user={user} businessName={businessName}>
      {children}
    </DashboardLayout>
  );
}
