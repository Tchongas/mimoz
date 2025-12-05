// ============================================
// MIMOZ - Cashier Redemption Logs Page
// ============================================
// View all redemption history

import { requireBusiness } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { History, TrendingUp, Calendar, Download, Filter } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { LogsFilter } from './logs-filter';

interface LogsPageProps {
  searchParams: Promise<{
    startDate?: string;
    endDate?: string;
    page?: string;
  }>;
}

async function getRedemptionLogs(
  businessId: string, 
  cashierId: string,
  options?: {
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }
) {
  const supabase = await createClient();
  const limit = options?.limit || 50;
  const page = options?.page || 1;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('redemptions')
    .select(`
      *,
      gift_cards(code, recipient_name, purchaser_name)
    `, { count: 'exact' })
    .eq('business_id', businessId)
    .eq('cashier_id', cashierId)
    .order('redeemed_at', { ascending: false });

  if (options?.startDate) {
    query = query.gte('redeemed_at', options.startDate);
  }

  if (options?.endDate) {
    query = query.lte('redeemed_at', options.endDate + 'T23:59:59');
  }

  query = query.range(offset, offset + limit - 1);

  const { data, count, error } = await query;

  if (error) {
    console.error('Error fetching redemption logs:', error);
    return { data: [], count: 0 };
  }

  return { data: data || [], count: count || 0 };
}

async function getStats(businessId: string, cashierId: string, startDate?: string, endDate?: string) {
  const supabase = await createClient();

  let query = supabase
    .from('redemptions')
    .select('amount_cents')
    .eq('business_id', businessId)
    .eq('cashier_id', cashierId);

  if (startDate) {
    query = query.gte('redeemed_at', startDate);
  }

  if (endDate) {
    query = query.lte('redeemed_at', endDate + 'T23:59:59');
  }

  const { data } = await query;

  const count = data?.length || 0;
  const totalAmount = data?.reduce((sum, r) => sum + r.amount_cents, 0) || 0;

  return { count, totalAmount };
}

export default async function CashierLogsPage({ searchParams }: LogsPageProps) {
  const user = await requireBusiness();
  const params = await searchParams;
  
  const page = parseInt(params.page || '1');
  const { data: logs, count } = await getRedemptionLogs(user.businessId, user.id, {
    startDate: params.startDate,
    endDate: params.endDate,
    page,
    limit: 50,
  });

  const stats = await getStats(user.businessId, user.id, params.startDate, params.endDate);
  const totalPages = Math.ceil(count / 50);

  // Group logs by date
  const groupedLogs = logs.reduce((acc, log) => {
    const date = new Date(log.redeemed_at).toLocaleDateString('pt-BR');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(log);
    return acc;
  }, {} as Record<string, typeof logs>);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Histórico de Resgates</h1>
          <p className="text-slate-500">Todos os seus resgates realizados</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <LogsFilter 
            startDate={params.startDate}
            endDate={params.endDate}
          />
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total de Resgates</p>
                <p className="text-2xl font-bold text-slate-900">{stats.count}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <History className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Valor Total Resgatado</p>
                <p className="text-2xl font-bold text-slate-900">
                  {formatCurrency(stats.totalAmount)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Resgates ({count})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {logs.length === 0 ? (
            <div className="p-8 text-center">
              <History className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-1">
                Nenhum resgate encontrado
              </h3>
              <p className="text-slate-500">
                {params.startDate || params.endDate 
                  ? 'Tente ajustar os filtros de data'
                  : 'Seus resgates aparecerão aqui'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Data/Hora
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Código
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Saldo Após
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        {new Date(log.redeemed_at).toLocaleString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <code className="px-2 py-1 bg-slate-100 rounded text-sm text-slate-700">
                          {log.gift_cards?.code}
                        </code>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {log.gift_cards?.recipient_name || log.gift_cards?.purchaser_name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-green-600">
                        - {formatCurrency(log.amount_cents)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-slate-600">
                        {formatCurrency(log.balance_after)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
              <p className="text-sm text-slate-600">
                Página {page} de {totalPages}
              </p>
              <div className="flex gap-2">
                {page > 1 && (
                  <a
                    href={`/cashier/logs?page=${page - 1}${params.startDate ? `&startDate=${params.startDate}` : ''}${params.endDate ? `&endDate=${params.endDate}` : ''}`}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium text-slate-700"
                  >
                    Anterior
                  </a>
                )}
                {page < totalPages && (
                  <a
                    href={`/cashier/logs?page=${page + 1}${params.startDate ? `&startDate=${params.startDate}` : ''}${params.endDate ? `&endDate=${params.endDate}` : ''}`}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium text-slate-700"
                  >
                    Próxima
                  </a>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
