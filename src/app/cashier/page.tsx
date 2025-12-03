// ============================================
// MIMOZ - Cashier Code Validation Page
// ============================================

import { requireBusiness } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { CodeValidationForm } from './code-validation-form';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

async function getRecentValidations(cashierId: string, businessId: string) {
  const supabase = await createClient();
  
  const { data } = await supabase
    .from('code_validations')
    .select('*')
    .eq('cashier_id', cashierId)
    .eq('business_id', businessId)
    .order('validated_at', { ascending: false })
    .limit(10);

  return data || [];
}

async function getTodayStats(cashierId: string, businessId: string) {
  const supabase = await createClient();
  const today = new Date().toISOString().split('T')[0];
  
  const { count } = await supabase
    .from('code_validations')
    .select('id', { count: 'exact', head: true })
    .eq('cashier_id', cashierId)
    .eq('business_id', businessId)
    .gte('validated_at', today);

  return count || 0;
}

export default async function CashierPage() {
  const user = await requireBusiness();
  const recentValidations = await getRecentValidations(user.id, user.businessId);
  const todayCount = await getTodayStats(user.id, user.businessId);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Validar Código</h1>
        <p className="text-slate-500">Digite o código do gift card para validar</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Validações Hoje</p>
                <p className="text-xl font-bold text-slate-900">{todayCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Última Validação</p>
                <p className="text-xl font-bold text-slate-900">
                  {recentValidations[0] 
                    ? new Date(recentValidations[0].validated_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                    : '-'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <XCircle className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Histórico</p>
                <p className="text-xl font-bold text-slate-900">{recentValidations.length}+</p>
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

      {/* Recent Validations */}
      <Card>
        <CardHeader>
          <CardTitle>Minhas Validações Recentes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {recentValidations.length === 0 ? (
            <div className="p-8 text-center">
              <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-1">
                Nenhuma validação ainda
              </h3>
              <p className="text-slate-500">
                Suas validações aparecerão aqui
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
                      Data/Hora
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Status
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {new Date(validation.validated_at).toLocaleString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          <CheckCircle className="w-3 h-3" />
                          Validado
                        </span>
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
