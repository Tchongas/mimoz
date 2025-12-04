// ============================================
// MIMOZ - My Purchases Page
// ============================================
// Shows all gift cards purchased by the user

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Gift, Calendar, Store, ExternalLink } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

// Status badge colors
const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendente' },
  ACTIVE: { bg: 'bg-green-100', text: 'text-green-800', label: 'Ativo' },
  REDEEMED: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Resgatado' },
  EXPIRED: { bg: 'bg-slate-100', text: 'text-slate-800', label: 'Expirado' },
  CANCELLED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelado' },
};

export default async function MyPurchasesPage() {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/auth/login');
  }
  
  // Get user's purchased gift cards
  const { data: giftCards, error } = await supabase
    .from('gift_cards')
    .select(`
      id,
      code,
      amount_cents,
      balance_cents,
      status,
      recipient_name,
      recipient_email,
      purchased_at,
      expires_at,
      gift_card_templates (
        name,
        businesses (
          name,
          slug
        )
      )
    `)
    .eq('purchaser_user_id', user.id)
    .order('purchased_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching gift cards:', error);
  }
  
  const purchases = giftCards || [];
  
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Minhas Compras</h1>
        <p className="text-slate-500 mt-1">
          Veja todos os vale-presentes que você comprou
        </p>
      </div>
      
      {purchases.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gift className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-lg font-medium text-slate-900 mb-2">
            Nenhuma compra ainda
          </h2>
          <p className="text-slate-500 mb-6">
            Você ainda não comprou nenhum vale-presente.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Store className="w-4 h-4" />
            Explorar lojas
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {purchases.map((card) => {
            const template = card.gift_card_templates as unknown as { name: string; businesses: { name: string; slug: string } } | null;
            const business = template?.businesses;
            const status = statusColors[card.status] || statusColors.ACTIVE;
            const expiresAt = new Date(card.expires_at);
            const isExpired = expiresAt < new Date() && card.status === 'ACTIVE';
            
            return (
              <div
                key={card.id}
                className="bg-white rounded-xl border border-slate-200 p-6 hover:border-slate-300 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  {/* Card Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Gift className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {business?.name || 'Vale-Presente'}
                        </h3>
                        <p className="text-sm text-slate-500">
                          {template?.name || 'Gift Card'}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                            {isExpired ? 'Expirado' : status.label}
                          </span>
                          {card.recipient_name && card.recipient_email !== user.email && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              Presente
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Recipient info if gift */}
                    {card.recipient_name && card.recipient_email !== user.email && (
                      <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                        <p className="text-sm text-slate-600">
                          <span className="font-medium">Para:</span> {card.recipient_name}
                        </p>
                        <p className="text-sm text-slate-500">{card.recipient_email}</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Value and Code */}
                  <div className="text-right">
                    <p className="text-2xl font-bold text-slate-900">
                      {formatCurrency(card.amount_cents)}
                    </p>
                    {card.balance_cents !== card.amount_cents && (
                      <p className="text-sm text-slate-500">
                        Saldo: {formatCurrency(card.balance_cents)}
                      </p>
                    )}
                    <div className="mt-2 p-2 bg-slate-100 rounded-lg">
                      <p className="text-xs text-slate-500 mb-1">Código</p>
                      <p className="font-mono font-bold text-slate-900">{card.code}</p>
                    </div>
                  </div>
                </div>
                
                {/* Footer */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Comprado em {new Date(card.purchased_at).toLocaleDateString('pt-BR')}
                    </span>
                    <span>
                      Válido até {expiresAt.toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  {business?.slug && (
                    <Link
                      href={`/store/${business.slug}`}
                      className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                    >
                      Ver loja
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
