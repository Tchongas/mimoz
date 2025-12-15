// ============================================
// Tapresente - Admin New User Page
// ============================================

import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { CreateUserForm } from '@/components/forms';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

async function getBusinesses() {
  const supabase = await createClient();
  
  const { data } = await supabase
    .from('businesses')
    .select('id, name, slug')
    .order('name');

  return data || [];
}

export default async function AdminNewUserPage() {
  const businesses = await getBusinesses();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/users"
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Novo Usuário</h1>
          <p className="text-slate-500">Cadastre um novo usuário no sistema</p>
        </div>
      </div>

      {/* Form Card */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Dados do Usuário</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateUserForm businesses={businesses} />
        </CardContent>
      </Card>
    </div>
  );
}
