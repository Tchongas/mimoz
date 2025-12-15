// ============================================
// Tapresente - Cashier History Page
// ============================================

import { requireBusiness } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { History, CheckCircle } from 'lucide-react';
import type { CodeValidation } from '@/types';

async function getAllValidations(cashierId: string, businessId: string): Promise<CodeValidation[]> {
  const supabase = await createClient();
  
  const { data } = await supabase
    .from('code_validations')
    .select('*')
    .eq('cashier_id', cashierId)
    .eq('business_id', businessId)
    .order('validated_at', { ascending: false });

  return (data as CodeValidation[]) || [];
}

export default async function CashierHistoryPage() {
  const user = await requireBusiness();
  const validations = await getAllValidations(user.id, user.businessId);

  // Group validations by date
  const groupedValidations = validations.reduce((acc, validation) => {
    const date = new Date(validation.validated_at).toLocaleDateString('pt-BR');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(validation);
    return acc;
  }, {} as Record<string, typeof validations>);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Histórico</h1>
        <p className="text-slate-500">Todas as suas validações</p>
      </div>

      {/* Summary */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total de Validações</p>
              <p className="text-2xl font-bold text-slate-900">{validations.length}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <History className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Validations by Date */}
      {Object.keys(groupedValidations).length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <History className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-1">
              Nenhuma validação encontrada
            </h3>
            <p className="text-slate-500">
              Suas validações aparecerão aqui
            </p>
          </CardContent>
        </Card>
      ) : (
        Object.entries(groupedValidations).map(([date, dateValidations]) => (
          <Card key={date}>
            <CardHeader>
              <CardTitle className="text-base">{date}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-200">
                {dateValidations.map((validation) => (
                  <div
                    key={validation.id}
                    className="flex items-center justify-between px-6 py-4 hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <code className="text-sm font-mono text-slate-900">
                          {validation.code}
                        </code>
                        <p className="text-xs text-slate-500">
                          {new Date(validation.validated_at).toLocaleTimeString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-green-600 font-medium">
                      Validado
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
