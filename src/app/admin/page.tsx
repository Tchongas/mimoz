// ============================================
// MIMOZ - Admin Dashboard Home
// ============================================

import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Building2, Users, Gift, DollarSign, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

async function getStats() {
  const supabase = await createClient();
  
  const today = new Date().toISOString().split('T')[0];
  
  const [businessesResult, usersResult, giftCardsResult, todayGiftCardsResult] = await Promise.all([
    supabase.from('businesses').select('id', { count: 'exact', head: true }),
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('gift_cards').select('id, amount_cents'),
    supabase
      .from('gift_cards')
      .select('id, amount_cents')
      .gte('purchased_at', today),
  ]);

  const allCards = giftCardsResult.data || [];
  const todayCards = todayGiftCardsResult.data || [];
  
  return {
    totalBusinesses: businessesResult.count || 0,
    totalUsers: usersResult.count || 0,
    totalSales: allCards.length,
    totalRevenue: allCards.reduce((sum, card) => sum + (card.amount_cents || 0), 0),
    todaySales: todayCards.length,
    todayRevenue: todayCards.reduce((sum, card) => sum + (card.amount_cents || 0), 0),
  };
}

export default async function AdminDashboardPage() {
  const stats = await getStats();

  const statCards = [
    {
      title: 'Total de Empresas',
      value: stats.totalBusinesses.toString(),
      icon: Building2,
      color: 'bg-blue-500',
    },
    {
      title: 'Total de Usuários',
      value: stats.totalUsers.toString(),
      icon: Users,
      color: 'bg-green-500',
    },
    {
      title: 'Vale-Presentes Vendidos',
      value: stats.totalSales.toString(),
      icon: Gift,
      color: 'bg-purple-500',
    },
    {
      title: 'Receita Total',
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      color: 'bg-emerald-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500">Visão geral do sistema</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">{stat.title}</p>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <a
              href="/admin/businesses"
              className="p-4 border border-slate-200 rounded-lg hover:border-slate-300 hover:bg-slate-50 transition-colors"
            >
              <Building2 className="w-8 h-8 text-blue-500 mb-2" />
              <h3 className="font-medium text-slate-900">Gerenciar Empresas</h3>
              <p className="text-sm text-slate-500">Criar e editar empresas</p>
            </a>
            
            <a
              href="/admin/users"
              className="p-4 border border-slate-200 rounded-lg hover:border-slate-300 hover:bg-slate-50 transition-colors"
            >
              <Users className="w-8 h-8 text-green-500 mb-2" />
              <h3 className="font-medium text-slate-900">Gerenciar Usuários</h3>
              <p className="text-sm text-slate-500">Atribuir funções e empresas</p>
            </a>
            
            <a
              href="/admin/reports"
              className="p-4 border border-slate-200 rounded-lg hover:border-slate-300 hover:bg-slate-50 transition-colors"
            >
              <TrendingUp className="w-8 h-8 text-purple-500 mb-2" />
              <h3 className="font-medium text-slate-900">Relatórios</h3>
              <p className="text-sm text-slate-500">Visualizar métricas</p>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
