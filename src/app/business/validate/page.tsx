// ============================================
// Tapresente - Business Owner Code Validation Page
// ============================================
// Allows business owners to validate and redeem gift cards

import { requireBusiness } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { CodeValidationForm } from '@/app/cashier/code-validation-form';
import { CheckCircle, DollarSign, Clock, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

async function getRecentRedemptions(businessId: string) {
  const supabase = await createClient();
  
  const { data } = await supabase
    .from('redemptions')
    .select(`
      *,
      gift_cards(code, recipient_name),
      cashier:profiles(full_name, email)
    `)
    .eq('business_id', businessId)
    .order('redeemed_at', { ascending: false })
    .limit(10);

  return data || [];
}

async function getTodayStats(businessId: string) {
  const supabase = await createClient();
  const today = new Date().toISOString().split('T')[0];
  
  const { data } = await supabase
    .from('redemptions')
    .select('amount_cents')
    .eq('business_id', businessId)
    .gte('redeemed_at', today);

  const count = data?.length || 0;
  const totalAmount = data?.reduce((sum, r) => sum + r.amount_cents, 0) || 0;

  return { count, totalAmount };
}

export default async function BusinessValidatePage() {
  const user = await requireBusiness();
  const recentRedemptions = await getRecentRedemptions(user.businessId);
  const todayStats = await getTodayStats(user.businessId);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Validar Vale-Presente</h1>
        <p className="text-slate-500">Digite o código para validar e descontar créditos</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Resgates Hoje</p>
                <p className="text-xl font-bold text-slate-900">{todayStats.count}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Descontado</p>
                <p className="text-xl font-bold text-slate-900">
                  {formatCurrency(todayStats.totalAmount)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Último Resgate</p>
                <p className="text-xl font-bold text-slate-900">
                  {recentRedemptions[0] 
                    ? new Date(recentRedemptions[0].redeemed_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                    : '-'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Validation Form */}
      <Card>
        <CardHeader>
          <CardTitle>Inserir Código</CardTitle>
        </CardHeader>
        <CardContent>
          <CodeValidationForm businessId={user.businessId} />
        </CardContent>
      </Card>

      {/* Recent Redemptions */}
      <Card>
        <CardHeader>
          <CardTitle>Resgates Recentes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {recentRedemptions.length === 0 ? (
            <div className="p-8 text-center">
              <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-1">
                Nenhum resgate ainda
              </h3>
              <p className="text-slate-500">
                Os resgates aparecerão aqui
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
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Operador
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Data/Hora
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
                  {recentRedemptions.map((redemption) => (
                    <tr key={redemption.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <code className="px-2 py-1 bg-slate-100 rounded text-sm text-slate-700">
                          {redemption.gift_cards?.code}
                        </code>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {redemption.gift_cards?.recipient_name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {(redemption.cashier as { full_name?: string; email?: string })?.full_name || 
                         (redemption.cashier as { full_name?: string; email?: string })?.email || 
                         '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {new Date(redemption.redeemed_at).toLocaleString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-green-600">
                        - {formatCurrency(redemption.amount_cents)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-slate-600">
                        {formatCurrency(redemption.balance_after)}
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
