// ============================================
// MIMOZ - Business Analytics Page (Placeholder)
// ============================================

import { requireBusiness } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui';
import { BarChart3, TrendingUp, Calendar, Clock } from 'lucide-react';

export default async function BusinessAnalyticsPage() {
  await requireBusiness();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
        <p className="text-slate-500">Métricas e relatórios da sua empresa</p>
      </div>

      {/* Coming Soon */}
      <Card>
        <CardContent className="p-12 text-center">
          <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <BarChart3 className="w-10 h-10 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Em Breve
          </h2>
          <p className="text-slate-500 max-w-md mx-auto mb-8">
            Estamos trabalhando em relatórios detalhados e métricas avançadas para ajudar você a entender melhor o desempenho da sua empresa.
          </p>

          {/* Preview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="p-4 bg-slate-50 rounded-lg">
              <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <h3 className="font-medium text-slate-900">Tendências</h3>
              <p className="text-sm text-slate-500">Análise de crescimento</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <Calendar className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <h3 className="font-medium text-slate-900">Períodos</h3>
              <p className="text-sm text-slate-500">Comparativos mensais</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <Clock className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <h3 className="font-medium text-slate-900">Horários</h3>
              <p className="text-sm text-slate-500">Picos de atividade</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
