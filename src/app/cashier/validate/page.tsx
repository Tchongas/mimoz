// ============================================
// MIMOZ - Cashier Validation Page
// ============================================
// Enter/scan gift card code and view details

import { requireBusiness } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { ValidateCodeForm } from './validate-code-form';
import { QrCode, History, TrendingUp, Clock } from 'lucide-react';

async function getRecentRedemptions(cashierId: string, businessId: string) {
  const supabase = await createClient();
  
  const { data } = await supabase
    .from('redemptions')
    .select(`
      *,
      gift_cards(code, recipient_name)
    `)
    .eq('cashier_id', cashierId)
    .eq('business_id', businessId)
    .order('redeemed_at', { ascending: false })
    .limit(5);

  return data || [];
}

async function getTodayStats(cashierId: string, businessId: string) {
  const supabase = await createClient();
  const today = new Date().toISOString().split('T')[0];
  
  const { data } = await supabase
    .from('redemptions')
    .select('amount_cents')
    .eq('cashier_id', cashierId)
    .eq('business_id', businessId)
    .gte('redeemed_at', today);

  const count = data?.length || 0;
  const totalAmount = data?.reduce((sum, r) => sum + r.amount_cents, 0) || 0;

  return { count, totalAmount };
}

export default async function CashierValidatePage() {
  const user = await requireBusiness();
  const recentRedemptions = await getRecentRedemptions(user.id, user.businessId);
  const todayStats = await getTodayStats(user.id, user.businessId);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Validar Vale-Presente</h1>
        <p className="text-slate-500">Digite ou escaneie o código para validar e resgatar</p>
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
                <QrCode className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Resgatado</p>
                <p className="text-xl font-bold text-slate-900">
                  R$ {(todayStats.totalAmount / 100).toFixed(2)}
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
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            Inserir Código
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ValidateCodeForm businessId={user.businessId} />
        </CardContent>
      </Card>

      {/* Recent Redemptions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Resgates Recentes
            </CardTitle>
            <a 
              href="/cashier/logs" 
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Ver todos →
            </a>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {recentRedemptions.length === 0 ? (
            <div className="p-8 text-center">
              <History className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-1">
                Nenhum resgate ainda
              </h3>
              <p className="text-slate-500">
                Seus resgates aparecerão aqui
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {recentRedemptions.map((redemption) => (
                <div
                  key={redemption.id}
                  className="flex items-center justify-between px-6 py-4 hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <code className="text-sm font-mono text-slate-900">
                        {redemption.gift_cards?.code}
                      </code>
                      <p className="text-xs text-slate-500">
                        {redemption.gift_cards?.recipient_name || 'Cliente'} • {new Date(redemption.redeemed_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">
                      - R$ {(redemption.amount_cents / 100).toFixed(2)}
                    </p>
                    <p className="text-xs text-slate-500">
                      Saldo: R$ {(redemption.balance_after / 100).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
