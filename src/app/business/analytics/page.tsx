// ============================================
// MIMOZ - Business Analytics Page
// ============================================

import { requireBusiness } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { BarChart3, TrendingUp, Calendar, Clock, Users, QrCode } from 'lucide-react';

async function getAnalyticsData(businessId: string) {
  const supabase = await createClient();
  
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // Get various stats in parallel
  const [
    totalValidations,
    todayValidations,
    weekValidations,
    monthValidations,
    totalUsers,
    recentValidations,
    topCashiers,
  ] = await Promise.all([
    // Total validations
    supabase
      .from('code_validations')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', businessId),
    // Today's validations
    supabase
      .from('code_validations')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .gte('validated_at', todayStr),
    // Week validations
    supabase
      .from('code_validations')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .gte('validated_at', weekAgo),
    // Month validations
    supabase
      .from('code_validations')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .gte('validated_at', monthAgo),
    // Total users
    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', businessId),
    // Recent validations for chart
    supabase
      .from('code_validations')
      .select('validated_at')
      .eq('business_id', businessId)
      .gte('validated_at', weekAgo)
      .order('validated_at', { ascending: true }),
    // Top cashiers
    supabase
      .from('code_validations')
      .select('cashier_id, cashier:profiles(full_name, email)')
      .eq('business_id', businessId)
      .gte('validated_at', monthAgo),
  ]);

  // Process daily validations for the week
  const dailyData: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];
    dailyData[dateStr] = 0;
  }
  
  recentValidations.data?.forEach((v) => {
    const dateStr = v.validated_at.split('T')[0];
    if (dailyData[dateStr] !== undefined) {
      dailyData[dateStr]++;
    }
  });

  // Process top cashiers
  const cashierCounts: Record<string, { name: string; count: number }> = {};
  topCashiers.data?.forEach((v) => {
    const cashier = v.cashier as { full_name?: string; email?: string } | null;
    const name = cashier?.full_name || cashier?.email || 'Desconhecido';
    if (!cashierCounts[v.cashier_id]) {
      cashierCounts[v.cashier_id] = { name, count: 0 };
    }
    cashierCounts[v.cashier_id].count++;
  });

  const topCashiersList = Object.values(cashierCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    total: totalValidations.count || 0,
    today: todayValidations.count || 0,
    week: weekValidations.count || 0,
    month: monthValidations.count || 0,
    users: totalUsers.count || 0,
    dailyData,
    topCashiers: topCashiersList,
  };
}

export default async function BusinessAnalyticsPage() {
  const user = await requireBusiness();
  const analytics = await getAnalyticsData(user.businessId);

  // Calculate week-over-week growth
  const avgDaily = analytics.week / 7;
  const maxDaily = Math.max(...Object.values(analytics.dailyData));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
        <p className="text-slate-500">Métricas e relatórios da sua empresa</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-500">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Hoje</p>
                <p className="text-2xl font-bold text-slate-900">{analytics.today}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-500">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Esta Semana</p>
                <p className="text-2xl font-bold text-slate-900">{analytics.week}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-500">
                <QrCode className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Este Mês</p>
                <p className="text-2xl font-bold text-slate-900">{analytics.month}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-amber-500">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Operadores</p>
                <p className="text-2xl font-bold text-slate-900">{analytics.users}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Validações - Últimos 7 dias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analytics.dailyData).map(([date, count]) => {
                const dayName = new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short' });
                const percentage = maxDaily > 0 ? (count / maxDaily) * 100 : 0;
                return (
                  <div key={date} className="flex items-center gap-3">
                    <span className="w-12 text-sm text-slate-500 capitalize">{dayName}</span>
                    <div className="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-8 text-sm font-medium text-slate-700 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-200">
              <p className="text-sm text-slate-500">
                Média diária: <span className="font-medium text-slate-700">{avgDaily.toFixed(1)}</span> validações
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Top Cashiers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Top Operadores - Último mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.topCashiers.length === 0 ? (
              <div className="p-8 text-center">
                <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">Nenhuma validação no período</p>
              </div>
            ) : (
              <div className="space-y-3">
                {analytics.topCashiers.map((cashier, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{cashier.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">{cashier.count}</p>
                      <p className="text-xs text-slate-500">validações</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-100 rounded-lg">
              <QrCode className="w-6 h-6 text-slate-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total de Validações (Histórico)</p>
              <p className="text-3xl font-bold text-slate-900">{analytics.total}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
