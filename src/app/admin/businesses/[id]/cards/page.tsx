// ============================================
// MIMOZ - Admin Business Gift Cards Page
// ============================================

import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui';
import { ArrowLeft, Plus, Gift, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/utils';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getBusiness(id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('businesses')
    .select('id, name, slug')
    .eq('id', id)
    .single();
  return data;
}

async function getTemplates(businessId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('gift_card_templates')
    .select('*')
    .eq('business_id', businessId)
    .order('amount_cents', { ascending: true });
  return data || [];
}

async function getGiftCards(businessId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('gift_cards')
    .select('*')
    .eq('business_id', businessId)
    .order('purchased_at', { ascending: false })
    .limit(50);
  return data || [];
}

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-800',
  REDEEMED: 'bg-slate-100 text-slate-800',
  EXPIRED: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-orange-100 text-orange-800',
};

const statusLabels: Record<string, string> = {
  ACTIVE: 'Ativo',
  REDEEMED: 'Utilizado',
  EXPIRED: 'Expirado',
  CANCELLED: 'Cancelado',
};

export default async function AdminBusinessCardsPage({ params }: PageProps) {
  const { id } = await params;
  const business = await getBusiness(id);

  if (!business) {
    notFound();
  }

  const [templates, giftCards] = await Promise.all([
    getTemplates(id),
    getGiftCards(id),
  ]);

  const stats = {
    totalTemplates: templates.length,
    activeTemplates: templates.filter(t => t.is_active).length,
    totalCards: giftCards.length,
    activeCards: giftCards.filter(c => c.status === 'ACTIVE').length,
    totalRevenue: giftCards.reduce((sum, c) => sum + c.amount_cents, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/admin/businesses/${id}`}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Vale-Presentes</h1>
            <p className="text-slate-500">{business.name}</p>
          </div>
        </div>
        <Link
          href={`/admin/businesses/${id}/cards/new`}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Modelo
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Modelos</p>
            <p className="text-2xl font-bold text-slate-900">{stats.totalTemplates}</p>
            <p className="text-xs text-slate-500">{stats.activeTemplates} ativos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Cartões Vendidos</p>
            <p className="text-2xl font-bold text-slate-900">{stats.totalCards}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Cartões Ativos</p>
            <p className="text-2xl font-bold text-emerald-600">{stats.activeCards}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Receita Total</p>
            <p className="text-2xl font-bold text-emerald-600">{formatCurrency(stats.totalRevenue)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Templates Section */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Modelos de Vale-Presente
        </h2>
        
        {templates.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Gift className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Nenhum modelo criado ainda</p>
              <Link
                href={`/admin/businesses/${id}/cards/new`}
                className="inline-flex items-center gap-2 mt-4 text-blue-600 hover:text-blue-700"
              >
                <Plus className="w-4 h-4" />
                Criar primeiro modelo
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Link
                key={template.id}
                href={`/admin/businesses/${id}/cards/template/${template.id}`}
                className="block"
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-slate-900">{template.name}</h3>
                      <span className={template.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'}>
                        {template.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900 mb-2">
                      {formatCurrency(template.amount_cents)}
                    </p>
                    {template.description && (
                      <p className="text-sm text-slate-500 line-clamp-2">{template.description}</p>
                    )}
                    <p className="text-xs text-slate-400 mt-2">
                      Validade: {template.valid_days} dias
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Gift Cards Section */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Gift className="w-5 h-5" />
          Cartões Vendidos (Últimos 50)
        </h2>

        {giftCards.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Gift className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Nenhum cartão vendido ainda</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-slate-600">Código</th>
                    <th className="text-left p-4 text-sm font-medium text-slate-600">Valor</th>
                    <th className="text-left p-4 text-sm font-medium text-slate-600">Saldo</th>
                    <th className="text-left p-4 text-sm font-medium text-slate-600">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-slate-600">Destinatário</th>
                    <th className="text-left p-4 text-sm font-medium text-slate-600">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {giftCards.map((card) => (
                    <tr key={card.id} className="hover:bg-slate-50">
                      <td className="p-4">
                        <Link
                          href={`/admin/businesses/${id}/cards/${card.id}`}
                          className="font-mono text-sm text-blue-600 hover:text-blue-700"
                        >
                          {card.code}
                        </Link>
                      </td>
                      <td className="p-4 font-medium">{formatCurrency(card.amount_cents)}</td>
                      <td className="p-4">
                        <span className={card.balance_cents < card.amount_cents ? 'text-orange-600' : ''}>
                          {formatCurrency(card.balance_cents)}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={statusColors[card.status]}>
                          {statusLabels[card.status]}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-slate-600">
                        {card.recipient_name || card.purchaser_name || '-'}
                      </td>
                      <td className="p-4 text-sm text-slate-500">
                        {formatDate(card.purchased_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
