// ============================================
// MIMOZ - Admin Edit Business Page
// ============================================

import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { BusinessForm } from '@/components/forms';
import { ArrowLeft, Gift } from 'lucide-react';
import Link from 'next/link';
import type { Business } from '@/types';
import { DeleteBusinessButton } from './delete-button';
import { formatCurrency } from '@/lib/utils';

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
  
  const [usersResult, templatesResult, giftCardsResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', id),
    supabase
      .from('gift_card_templates')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', id),
    supabase
      .from('gift_cards')
      .select('id, amount_cents, status')
      .eq('business_id', id),
  ]);

  const giftCards = giftCardsResult.data || [];
  const totalRevenue = giftCards.reduce((sum, card) => sum + (card.amount_cents || 0), 0);
  const activeCards = giftCards.filter(card => card.status === 'ACTIVE').length;

  return {
    totalUsers: usersResult.count || 0,
    totalTemplates: templatesResult.count || 0,
    totalGiftCards: giftCards.length,
    activeCards,
    totalRevenue,
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Modelos</p>
            <p className="text-2xl font-bold text-slate-900">{stats.totalTemplates}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Vendas</p>
            <p className="text-2xl font-bold text-slate-900">{stats.totalGiftCards}</p>
            <p className="text-xs text-slate-500">{stats.activeCards} ativos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Usuários</p>
            <p className="text-2xl font-bold text-slate-900">{stats.totalUsers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Receita Total</p>
            <p className="text-2xl font-bold text-emerald-600">{formatCurrency(stats.totalRevenue)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <Link
          href={`/admin/businesses/${id}/cards`}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Gift className="w-4 h-4" />
          Gerenciar Vale-Presentes
        </Link>
        <Link
          href={`/store/${business.slug}`}
          target="_blank"
          className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
        >
          Ver Loja
        </Link>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>Dados da Empresa</CardTitle>
        </CardHeader>
        <CardContent>
          <BusinessForm business={business} mode="edit" showCustomization />
        </CardContent>
      </Card>
    </div>
  );
}
