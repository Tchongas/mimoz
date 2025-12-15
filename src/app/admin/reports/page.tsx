// ============================================
// Tapresente - Admin Reports Page
// ============================================

import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import { 
  BarChart3, 
  Building2, 
  Gift, 
  DollarSign,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

interface BusinessStats {
  id: string;
  name: string;
  slug: string;
  totalSales: number;
  totalRevenue: number;
  todaySales: number;
  todayRevenue: number;
  weekSales: number;
  weekRevenue: number;
  monthSales: number;
  monthRevenue: number;
  trend: number; // percentage change from last week
}

async function getReportsData() {
  const supabase = await createClient();
  
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const twoWeeksAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString();
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  // Get all businesses
  const { data: businesses } = await supabase
    .from('businesses')
    .select('id, name, slug')
    .order('name');

  if (!businesses) return { businesses: [], totals: null };

  // Get stats for each business
  const businessStats: BusinessStats[] = await Promise.all(
    businesses.map(async (business) => {
      const [total, todayCards, week, prevWeek, month] = await Promise.all([
        // Total sales (only completed)
        supabase
          .from('gift_cards')
          .select('id, amount_cents')
          .eq('business_id', business.id)
          .in('status', ['ACTIVE', 'REDEEMED']),
        // Today
        supabase
          .from('gift_cards')
          .select('id, amount_cents')
          .eq('business_id', business.id)
          .in('status', ['ACTIVE', 'REDEEMED'])
          .gte('purchased_at', todayStr),
        // This week
        supabase
          .from('gift_cards')
          .select('id, amount_cents')
          .eq('business_id', business.id)
          .in('status', ['ACTIVE', 'REDEEMED'])
          .gte('purchased_at', weekAgo),
        // Previous week (for trend)
        supabase
          .from('gift_cards')
          .select('id, amount_cents')
          .eq('business_id', business.id)
          .in('status', ['ACTIVE', 'REDEEMED'])
          .gte('purchased_at', twoWeeksAgo)
          .lt('purchased_at', weekAgo),
        // This month
        supabase
          .from('gift_cards')
          .select('id, amount_cents')
          .eq('business_id', business.id)
          .in('status', ['ACTIVE', 'REDEEMED'])
          .gte('purchased_at', monthAgo),
      ]);

      const totalCards = total.data || [];
      const todayData = todayCards.data || [];
      const weekData = week.data || [];
      const prevWeekData = prevWeek.data || [];
      const monthData = month.data || [];

      const weekRevenue = weekData.reduce((sum, c) => sum + (c.amount_cents || 0), 0);
      const prevWeekRevenue = prevWeekData.reduce((sum, c) => sum + (c.amount_cents || 0), 0);
      const trend = prevWeekRevenue > 0 
        ? Math.round(((weekRevenue - prevWeekRevenue) / prevWeekRevenue) * 100)
        : weekRevenue > 0 ? 100 : 0;

      return {
        id: business.id,
        name: business.name,
        slug: business.slug,
        totalSales: totalCards.length,
        totalRevenue: totalCards.reduce((sum, c) => sum + (c.amount_cents || 0), 0),
        todaySales: todayData.length,
        todayRevenue: todayData.reduce((sum, c) => sum + (c.amount_cents || 0), 0),
        weekSales: weekData.length,
        weekRevenue,
        monthSales: monthData.length,
        monthRevenue: monthData.reduce((sum, c) => sum + (c.amount_cents || 0), 0),
        trend,
      };
    })
  );

  // Calculate totals
  const totals = {
    businesses: businesses.length,
    totalSales: businessStats.reduce((sum, b) => sum + b.totalSales, 0),
    totalRevenue: businessStats.reduce((sum, b) => sum + b.totalRevenue, 0),
    todaySales: businessStats.reduce((sum, b) => sum + b.todaySales, 0),
    todayRevenue: businessStats.reduce((sum, b) => sum + b.todayRevenue, 0),
    weekSales: businessStats.reduce((sum, b) => sum + b.weekSales, 0),
    weekRevenue: businessStats.reduce((sum, b) => sum + b.weekRevenue, 0),
    monthSales: businessStats.reduce((sum, b) => sum + b.monthSales, 0),
    monthRevenue: businessStats.reduce((sum, b) => sum + b.monthRevenue, 0),
  };

  // Sort by week revenue (most active first)
  businessStats.sort((a, b) => b.weekRevenue - a.weekRevenue);

  return { businesses: businessStats, totals };
}

export default async function AdminReportsPage() {
  const { businesses, totals } = await getReportsData();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Relatórios</h1>
        <p className="text-slate-500">Visão geral de todas as empresas</p>
      </div>

      {/* Summary Stats */}
      {totals && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Building2 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase">Empresas</p>
                  <p className="text-2xl font-bold text-slate-900">{totals.businesses}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100">
                  <Gift className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase">Vendas Hoje</p>
                  <p className="text-2xl font-bold text-slate-900">{totals.todaySales}</p>
                  <p className="text-xs text-emerald-600">{formatCurrency(totals.todayRevenue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase">Esta Semana</p>
                  <p className="text-2xl font-bold text-slate-900">{totals.weekSales}</p>
                  <p className="text-xs text-emerald-600">{formatCurrency(totals.weekRevenue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-100">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase">Receita Total</p>
                  <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totals.totalRevenue)}</p>
                  <p className="text-xs text-slate-500">{totals.totalSales} vendas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Business Performance Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-slate-600" />
            <CardTitle>Performance por Empresa</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {businesses.length === 0 ? (
            <div className="p-8 text-center">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Nenhuma empresa cadastrada</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Empresa
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Hoje
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Semana
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Mês
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Tendência
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {businesses.map((business, index) => (
                    <tr key={business.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{business.name}</p>
                            <p className="text-xs text-slate-500">/{business.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div>
                          <span className={`text-lg font-semibold ${business.todaySales > 0 ? 'text-green-600' : 'text-slate-400'}`}>
                            {business.todaySales}
                          </span>
                          {business.todayRevenue > 0 && (
                            <p className="text-xs text-emerald-600">{formatCurrency(business.todayRevenue)}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div>
                          <span className="text-lg font-semibold text-slate-900">
                            {business.weekSales}
                          </span>
                          {business.weekRevenue > 0 && (
                            <p className="text-xs text-emerald-600">{formatCurrency(business.weekRevenue)}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div>
                          <span className="text-lg font-semibold text-slate-700">
                            {business.monthSales}
                          </span>
                          {business.monthRevenue > 0 && (
                            <p className="text-xs text-emerald-600">{formatCurrency(business.monthRevenue)}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div>
                          <span className="text-slate-600">{business.totalSales}</span>
                          <p className="text-xs text-emerald-600 font-medium">{formatCurrency(business.totalRevenue)}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {business.trend > 0 ? (
                            <>
                              <ArrowUpRight className="w-4 h-4 text-green-500" />
                              <span className="text-sm font-medium text-green-600">
                                +{business.trend}%
                              </span>
                            </>
                          ) : business.trend < 0 ? (
                            <>
                              <ArrowDownRight className="w-4 h-4 text-red-500" />
                              <span className="text-sm font-medium text-red-600">
                                {business.trend}%
                              </span>
                            </>
                          ) : (
                            <span className="text-sm text-slate-400">—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                {/* Totals Footer */}
                <tfoot className="bg-slate-100 border-t-2 border-slate-300">
                  <tr>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      Total ({businesses.length} empresas)
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="font-bold text-green-600">{totals?.todaySales}</span>
                      <p className="text-xs text-emerald-600">{formatCurrency(totals?.todayRevenue || 0)}</p>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="font-bold text-slate-900">{totals?.weekSales}</span>
                      <p className="text-xs text-emerald-600">{formatCurrency(totals?.weekRevenue || 0)}</p>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="font-bold text-slate-700">{totals?.monthSales}</span>
                      <p className="text-xs text-emerald-600">{formatCurrency(totals?.monthRevenue || 0)}</p>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="font-bold text-slate-600">{totals?.totalSales}</span>
                      <p className="text-xs text-emerald-600 font-medium">{formatCurrency(totals?.totalRevenue || 0)}</p>
                    </td>
                    <td className="px-4 py-4 text-center">
                      —
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
