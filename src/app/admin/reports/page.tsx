// ============================================
// MIMOZ - Admin Reports Page
// ============================================

import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { formatDate } from '@/lib/utils';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Building2, 
  Users, 
  QrCode,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

interface BusinessStats {
  id: string;
  name: string;
  slug: string;
  totalValidations: number;
  todayValidations: number;
  weekValidations: number;
  monthValidations: number;
  userCount: number;
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
      const [total, today, week, prevWeek, month, users] = await Promise.all([
        // Total validations
        supabase
          .from('code_validations')
          .select('id', { count: 'exact', head: true })
          .eq('business_id', business.id),
        // Today
        supabase
          .from('code_validations')
          .select('id', { count: 'exact', head: true })
          .eq('business_id', business.id)
          .gte('validated_at', todayStr),
        // This week
        supabase
          .from('code_validations')
          .select('id', { count: 'exact', head: true })
          .eq('business_id', business.id)
          .gte('validated_at', weekAgo),
        // Previous week (for trend)
        supabase
          .from('code_validations')
          .select('id', { count: 'exact', head: true })
          .eq('business_id', business.id)
          .gte('validated_at', twoWeeksAgo)
          .lt('validated_at', weekAgo),
        // This month
        supabase
          .from('code_validations')
          .select('id', { count: 'exact', head: true })
          .eq('business_id', business.id)
          .gte('validated_at', monthAgo),
        // User count
        supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('business_id', business.id),
      ]);

      const weekCount = week.count || 0;
      const prevWeekCount = prevWeek.count || 0;
      const trend = prevWeekCount > 0 
        ? Math.round(((weekCount - prevWeekCount) / prevWeekCount) * 100)
        : weekCount > 0 ? 100 : 0;

      return {
        id: business.id,
        name: business.name,
        slug: business.slug,
        totalValidations: total.count || 0,
        todayValidations: today.count || 0,
        weekValidations: weekCount,
        monthValidations: month.count || 0,
        userCount: users.count || 0,
        trend,
      };
    })
  );

  // Calculate totals
  const totals = {
    businesses: businesses.length,
    totalValidations: businessStats.reduce((sum, b) => sum + b.totalValidations, 0),
    todayValidations: businessStats.reduce((sum, b) => sum + b.todayValidations, 0),
    weekValidations: businessStats.reduce((sum, b) => sum + b.weekValidations, 0),
    monthValidations: businessStats.reduce((sum, b) => sum + b.monthValidations, 0),
    totalUsers: businessStats.reduce((sum, b) => sum + b.userCount, 0),
  };

  // Sort by week validations (most active first)
  businessStats.sort((a, b) => b.weekValidations - a.weekValidations);

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
                  <QrCode className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase">Hoje</p>
                  <p className="text-2xl font-bold text-slate-900">{totals.todayValidations}</p>
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
                  <p className="text-2xl font-bold text-slate-900">{totals.weekValidations}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-100">
                  <Users className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase">Usuários</p>
                  <p className="text-2xl font-bold text-slate-900">{totals.totalUsers}</p>
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
                    <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Usuários
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
                        <span className={`text-lg font-semibold ${business.todayValidations > 0 ? 'text-green-600' : 'text-slate-400'}`}>
                          {business.todayValidations}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-lg font-semibold text-slate-900">
                          {business.weekValidations}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-lg font-semibold text-slate-700">
                          {business.monthValidations}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-slate-600">
                          {business.totalValidations}
                        </span>
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
                      <td className="px-4 py-4 text-center">
                        <span className="inline-flex items-center gap-1 text-slate-600">
                          <Users className="w-3 h-3" />
                          {business.userCount}
                        </span>
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
                    <td className="px-4 py-4 text-center font-bold text-green-600">
                      {totals?.todayValidations}
                    </td>
                    <td className="px-4 py-4 text-center font-bold text-slate-900">
                      {totals?.weekValidations}
                    </td>
                    <td className="px-4 py-4 text-center font-bold text-slate-700">
                      {totals?.monthValidations}
                    </td>
                    <td className="px-4 py-4 text-center font-bold text-slate-600">
                      {totals?.totalValidations}
                    </td>
                    <td className="px-4 py-4 text-center">
                      —
                    </td>
                    <td className="px-4 py-4 text-center font-bold text-slate-600">
                      {totals?.totalUsers}
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
