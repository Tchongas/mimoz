// ============================================
// Tapresente - Business Gift Card Templates Page
// ============================================

import { requireBusiness } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Gift, Plus, ExternalLink, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

interface GiftCardTemplate {
  id: string;
  name: string;
  description: string | null;
  amount_cents: number;
  is_active: boolean;
  valid_days: number;
  created_at: string;
}

async function getTemplates(businessId: string): Promise<GiftCardTemplate[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('gift_card_templates')
    .select('*')
    .eq('business_id', businessId)
    .order('amount_cents', { ascending: true });

  if (error) {
    console.error('Error fetching templates:', error);
    return [];
  }

  return data || [];
}

async function getStats(businessId: string) {
  const supabase = await createClient();

  const [totalCardsResult, activeCardsResult, allCardsResult] = await Promise.all([
    supabase
      .from('gift_cards')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .in('status', ['ACTIVE', 'REDEEMED']),
    supabase
      .from('gift_cards')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .eq('status', 'ACTIVE'),
    supabase
      .from('gift_cards')
      .select('amount_cents')
      .eq('business_id', businessId)
      .in('status', ['ACTIVE', 'REDEEMED']),
  ]);

  const revenue = (allCardsResult.data || []).reduce((sum, c) => sum + (c.amount_cents || 0), 0);

  return {
    totalCards: totalCardsResult.count || 0,
    activeCards: activeCardsResult.count || 0,
    revenue,
  };
}

export default async function BusinessCardsPage() {
  const user = await requireBusiness();
  const [templates, stats] = await Promise.all([
    getTemplates(user.businessId),
    getStats(user.businessId),
  ]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Vale-Presentes</h1>
          <p className="text-slate-500">Gerencie seus modelos de vale-presente</p>
        </div>
        <Link
          href="/business/cards/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Modelo
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Gift className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">Vendidos</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalCards}</p>
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
                <p className="text-xs text-slate-500 uppercase">Ativos</p>
                <p className="text-2xl font-bold text-slate-900">{stats.activeCards}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <Gift className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">Receita</p>
                <p className="text-2xl font-bold text-slate-900">{formatCurrency(stats.revenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Templates List */}
      <Card>
        <CardHeader>
          <CardTitle>Modelos de Vale-Presente</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {templates.length === 0 ? (
            <div className="p-8 text-center">
              <Gift className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-1">
                Nenhum modelo criado
              </h3>
              <p className="text-slate-500 mb-4">
                Crie seu primeiro modelo de vale-presente
              </p>
              <Link
                href="/business/cards/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Criar Modelo
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Modelo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Validade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {templates.map((template) => (
                    <tr key={template.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="font-medium text-slate-900">{template.name}</p>
                          {template.description && (
                            <p className="text-sm text-slate-500 truncate max-w-xs">
                              {template.description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-lg font-semibold text-slate-900">
                          {formatCurrency(template.amount_cents)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {template.valid_days} dias
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {template.is_active ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            <Eye className="w-3 h-3" />
                            Ativo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                            <EyeOff className="w-3 h-3" />
                            Inativo
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Link
                          href={`/business/cards/${template.id}`}
                          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors inline-block"
                          title="Editar"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
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
