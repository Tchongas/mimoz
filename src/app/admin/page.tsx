// ============================================
// MIMOZ - Admin Dashboard Home
// ============================================

import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Building2, Users, QrCode, TrendingUp } from 'lucide-react';

async function getStats() {
  const supabase = await createClient();
  
  const [businessesResult, usersResult, validationsResult, todayValidationsResult] = await Promise.all([
    supabase.from('businesses').select('id', { count: 'exact', head: true }),
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('code_validations').select('id', { count: 'exact', head: true }),
    supabase
      .from('code_validations')
      .select('id', { count: 'exact', head: true })
      .gte('validated_at', new Date().toISOString().split('T')[0]),
  ]);

  return {
    totalBusinesses: businessesResult.count || 0,
    totalUsers: usersResult.count || 0,
    totalValidations: validationsResult.count || 0,
    todayValidations: todayValidationsResult.count || 0,
  };
}

export default async function AdminDashboardPage() {
  const stats = await getStats();

  const statCards = [
    {
      title: 'Total de Empresas',
      value: stats.totalBusinesses,
      icon: Building2,
      color: 'bg-blue-500',
    },
    {
      title: 'Total de Usuários',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-green-500',
    },
    {
      title: 'Validações Totais',
      value: stats.totalValidations,
      icon: QrCode,
      color: 'bg-purple-500',
    },
    {
      title: 'Validações Hoje',
      value: stats.todayValidations,
      icon: TrendingUp,
      color: 'bg-amber-500',
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
