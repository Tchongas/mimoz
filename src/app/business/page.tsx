// ============================================
// Tapresente - Business Owner Dashboard Home
// ============================================

import { requireBusiness } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { QrCode, Users, TrendingUp, Calendar } from 'lucide-react';

async function getBusinessStats(businessId: string) {
  const supabase = await createClient();
  
  const today = new Date().toISOString().split('T')[0];
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [usersResult, totalValidationsResult, todayValidationsResult, weekValidationsResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', businessId),
    supabase
      .from('code_validations')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', businessId),
    supabase
      .from('code_validations')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .gte('validated_at', today),
    supabase
      .from('code_validations')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .gte('validated_at', weekAgo),
  ]);

  return {
    totalUsers: usersResult.count || 0,
    totalValidations: totalValidationsResult.count || 0,
    todayValidations: todayValidationsResult.count || 0,
    weekValidations: weekValidationsResult.count || 0,
  };
}

async function getRecentValidations(businessId: string) {
  const supabase = await createClient();
  
  const { data } = await supabase
    .from('code_validations')
    .select(`
      id,
      code,
      validated_at,
      cashier:profiles(full_name, email)
    `)
    .eq('business_id', businessId)
    .order('validated_at', { ascending: false })
    .limit(5);

  return data || [];
}

export default async function BusinessDashboardPage() {
  const user = await requireBusiness();
  const stats = await getBusinessStats(user.businessId);
  const recentValidations = await getRecentValidations(user.businessId);

  const statCards = [
    {
      title: 'Validações Hoje',
      value: stats.todayValidations,
      icon: Calendar,
      color: 'bg-blue-500',
    },
    {
      title: 'Validações na Semana',
      value: stats.weekValidations,
      icon: TrendingUp,
      color: 'bg-green-500',
    },
    {
      title: 'Total de Validações',
      value: stats.totalValidations,
      icon: QrCode,
      color: 'bg-purple-500',
    },
    {
      title: 'Operadores',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-amber-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Visão Geral</h1>
        <p className="text-slate-500">Acompanhe o desempenho da sua empresa</p>
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

      {/* Recent Validations */}
      <Card>
        <CardHeader>
          <CardTitle>Validações Recentes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {recentValidations.length === 0 ? (
            <div className="p-8 text-center">
              <QrCode className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-1">
                Nenhuma validação ainda
              </h3>
              <p className="text-slate-500">
                As validações aparecerão aqui
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Código
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Operador
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Data/Hora
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {recentValidations.map((validation) => (
                    <tr key={validation.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <code className="px-2 py-1 bg-slate-100 rounded text-sm text-slate-700">
                          {validation.code}
                        </code>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                        {(validation.cashier as { full_name?: string; email?: string })?.full_name || 
                         (validation.cashier as { full_name?: string; email?: string })?.email || 
                         'Desconhecido'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {new Date(validation.validated_at).toLocaleString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
