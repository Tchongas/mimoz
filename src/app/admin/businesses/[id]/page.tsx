// ============================================
// MIMOZ - Admin Edit Business Page
// ============================================

import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { BusinessForm } from '@/components/forms';
import { ArrowLeft, Trash2 } from 'lucide-react';
import Link from 'next/link';
import type { Business } from '@/types';
import { DeleteBusinessButton } from './delete-button';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getBusiness(id: string): Promise<Business | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

async function getBusinessStats(id: string) {
  const supabase = await createClient();
  
  const [usersResult, validationsResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', id),
    supabase
      .from('code_validations')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', id),
  ]);

  return {
    totalUsers: usersResult.count || 0,
    totalValidations: validationsResult.count || 0,
  };
}

export default async function AdminEditBusinessPage({ params }: PageProps) {
  const { id } = await params;
  const business = await getBusiness(id);

  if (!business) {
    notFound();
  }

  const stats = await getBusinessStats(id);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/businesses"
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{business.name}</h1>
            <p className="text-slate-500">Editar informações da empresa</p>
          </div>
        </div>
        <DeleteBusinessButton businessId={business.id} businessName={business.name} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Usuários</p>
            <p className="text-2xl font-bold text-slate-900">{stats.totalUsers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Validações</p>
            <p className="text-2xl font-bold text-slate-900">{stats.totalValidations}</p>
          </CardContent>
        </Card>
      </div>

      {/* Form Card */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Dados da Empresa</CardTitle>
        </CardHeader>
        <CardContent>
          <BusinessForm business={business} mode="edit" />
        </CardContent>
      </Card>
    </div>
  );
}
