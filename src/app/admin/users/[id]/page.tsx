// ============================================
// MIMOZ - Admin Edit User Page
// ============================================

import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { UserForm } from '@/components/forms';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { Profile, Business } from '@/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getUser(id: string): Promise<Profile | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

async function getBusinesses(): Promise<Business[]> {
  const supabase = await createClient();
  
  const { data } = await supabase
    .from('businesses')
    .select('*')
    .order('name');

  return data || [];
}

async function getUserStats(id: string) {
  const supabase = await createClient();
  
  const { count } = await supabase
    .from('code_validations')
    .select('id', { count: 'exact', head: true })
    .eq('cashier_id', id);

  return {
    totalValidations: count || 0,
  };
}

export default async function AdminEditUserPage({ params }: PageProps) {
  const { id } = await params;
  const [user, businesses, stats] = await Promise.all([
    getUser(id),
    getBusinesses(),
    getUserStats(id),
  ]);

  if (!user) {
    notFound();
  }

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
          <h1 className="text-2xl font-bold text-slate-900">
            {user.full_name || user.email}
          </h1>
          <p className="text-slate-500">Editar informações do usuário</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Validações Realizadas</p>
            <p className="text-2xl font-bold text-slate-900">{stats.totalValidations}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Membro desde</p>
            <p className="text-2xl font-bold text-slate-900">
              {new Date(user.created_at).toLocaleDateString('pt-BR')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Form Card */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Dados do Usuário</CardTitle>
        </CardHeader>
        <CardContent>
          <UserForm user={user} businesses={businesses} />
        </CardContent>
      </Card>
    </div>
  );
}
