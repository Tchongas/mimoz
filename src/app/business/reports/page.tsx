// ============================================
// Tapresente - Business Reports Page
// ============================================

import { requireBusiness } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { BarChart3, TrendingUp, Calendar, DollarSign, Gift } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

async function getSalesData(businessId: string) {
  const supabase = await createClient();
  
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const twoWeeksAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString();
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  // Get sales stats in parallel
  const [
    totalSales,
    todaySales,
    weekSales,
    prevWeekSales,
    monthSales,
    recentSales,
  ] = await Promise.all([
    // Total sales
    supabase
      .from('gift_cards')
      .select('id, amount_cents')
      .eq('business_id', businessId)
      .in('status', ['ACTIVE', 'REDEEMED']),
    // Today's sales
    supabase
      .from('gift_cards')
      .select('id, amount_cents')
      .eq('business_id', businessId)
      .in('status', ['ACTIVE', 'REDEEMED'])
      .gte('purchased_at', todayStr),
    // This week sales
    supabase
      .from('gift_cards')
      .select('id, amount_cents')
      .eq('business_id', businessId)
      .in('status', ['ACTIVE', 'REDEEMED'])
      .gte('purchased_at', weekAgo),
    // Previous week sales (for trend)
    supabase
      .from('gift_cards')
      .select('id, amount_cents')
      .eq('business_id', businessId)
      .in('status', ['ACTIVE', 'REDEEMED'])
      .gte('purchased_at', twoWeeksAgo)
      .lt('purchased_at', weekAgo),
    // This month sales
    supabase
      .from('gift_cards')
      .select('id, amount_cents')
      .eq('business_id', businessId)
      .in('status', ['ACTIVE', 'REDEEMED'])
      .gte('purchased_at', monthAgo),
    // Recent sales for chart (last 7 days)
    supabase
      .from('gift_cards')
      .select('purchased_at, amount_cents')
      .eq('business_id', businessId)
      .in('status', ['ACTIVE', 'REDEEMED'])
      .gte('purchased_at', weekAgo)
      .order('purchased_at', { ascending: true }),
  ]);

  const totalData = totalSales.data || [];
  const todayData = todaySales.data || [];
  const weekData = weekSales.data || [];
  const prevWeekData = prevWeekSales.data || [];
  const monthData = monthSales.data || [];

  // Calculate revenues
  const totalRevenue = totalData.reduce((sum, c) => sum + (c.amount_cents || 0), 0);
  const todayRevenue = todayData.reduce((sum, c) => sum + (c.amount_cents || 0), 0);
  const weekRevenue = weekData.reduce((sum, c) => sum + (c.amount_cents || 0), 0);
  const prevWeekRevenue = prevWeekData.reduce((sum, c) => sum + (c.amount_cents || 0), 0);
  const monthRevenue = monthData.reduce((sum, c) => sum + (c.amount_cents || 0), 0);

  // Calculate trend
  const trend = prevWeekRevenue > 0 
    ? Math.round(((weekRevenue - prevWeekRevenue) / prevWeekRevenue) * 100)
    : weekRevenue > 0 ? 100 : 0;

  // Process daily sales for the week
  const dailyData: Record<string, { count: number; revenue: number }> = {};
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];
    dailyData[dateStr] = { count: 0, revenue: 0 };
  }
  
  recentSales.data?.forEach((sale) => {
    const dateStr = sale.purchased_at?.split('T')[0];
    if (dateStr && dailyData[dateStr] !== undefined) {
      dailyData[dateStr].count++;
      dailyData[dateStr].revenue += sale.amount_cents || 0;
    }
  });

  return {
    totalCount: totalData.length,
    totalRevenue,
    todayCount: todayData.length,
    todayRevenue,
    weekCount: weekData.length,
    weekRevenue,
    monthCount: monthData.length,
    monthRevenue,
    trend,
    dailyData,
  };
}

export default async function BusinessReportsPage() {
  const user = await requireBusiness();
  const sales = await getSalesData(user.businessId);

  // Calculate max for chart scaling
  const maxDailyRevenue = Math.max(...Object.values(sales.dailyData).map(d => d.revenue));
  const avgDailyRevenue = sales.weekRevenue / 7;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Relatórios</h1>
        <p className="text-slate-500">Vendas e receita da sua empresa</p>
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
                <p className="text-sm text-slate-500">Vendas Hoje</p>
                <p className="text-2xl font-bold text-slate-900">{sales.todayCount}</p>
                <p className="text-sm text-emerald-600">{formatCurrency(sales.todayRevenue)}</p>
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
                <p className="text-2xl font-bold text-slate-900">{sales.weekCount}</p>
                <p className="text-sm text-emerald-600">{formatCurrency(sales.weekRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-500">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Este Mês</p>
                <p className="text-2xl font-bold text-slate-900">{sales.monthCount}</p>
                <p className="text-sm text-emerald-600">{formatCurrency(sales.monthRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-emerald-500">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Receita Total</p>
                <p className="text-2xl font-bold text-emerald-600">{formatCurrency(sales.totalRevenue)}</p>
                <p className="text-sm text-slate-500">{sales.totalCount} vendas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Sales Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Vendas - Últimos 7 dias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(sales.dailyData).map(([date, data]) => {
                const dayName = new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short' });
                const percentage = maxDailyRevenue > 0 ? (data.revenue / maxDailyRevenue) * 100 : 0;
                return (
                  <div key={date} className="flex items-center gap-3">
                    <span className="w-12 text-sm text-slate-500 capitalize">{dayName}</span>
                    <div className="flex-1 h-8 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all flex items-center justify-end pr-2"
                        style={{ width: `${Math.max(percentage, 5)}%` }}
                      >
                        {data.count > 0 && (
                          <span className="text-xs text-white font-medium">{data.count}</span>
                        )}
                      </div>
                    </div>
                    <span className="w-20 text-sm font-medium text-emerald-600 text-right">
                      {formatCurrency(data.revenue)}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-200">
              <p className="text-sm text-slate-500">
                Média diária: <span className="font-medium text-emerald-600">{formatCurrency(avgDailyRevenue)}</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Week Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Tendência Semanal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className={`text-6xl font-bold mb-2 ${
                sales.trend > 0 ? 'text-green-600' : 
                sales.trend < 0 ? 'text-red-600' : 'text-slate-400'
              }`}>
                {sales.trend > 0 ? '+' : ''}{sales.trend}%
              </div>
              <p className="text-slate-500">
                {sales.trend > 0 ? 'Crescimento' : sales.trend < 0 ? 'Queda' : 'Sem variação'} em relação à semana anterior
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
              <div className="text-center">
                <p className="text-sm text-slate-500">Semana Atual</p>
                <p className="text-xl font-bold text-slate-900">{formatCurrency(sales.weekRevenue)}</p>
                <p className="text-xs text-slate-500">{sales.weekCount} vendas</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-slate-500">Semana Anterior</p>
                <p className="text-xl font-bold text-slate-900">
                  {formatCurrency(sales.weekRevenue - (sales.weekRevenue * sales.trend / 100) / (1 + sales.trend / 100))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Receita Total (Histórico)</p>
              <p className="text-3xl font-bold text-emerald-600">{formatCurrency(sales.totalRevenue)}</p>
              <p className="text-sm text-slate-500">{sales.totalCount} vale-presentes vendidos</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
