// ============================================
// MIMOZ - Cashier Redemption Page
// ============================================
// Redeem credits from a gift card

import { requireBusiness } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { ArrowLeft, CreditCard, User, Calendar, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { RedeemForm } from './redeem-form';

interface RedeemPageProps {
  params: Promise<{ id: string }>;
}

async function getGiftCardData(id: string, businessId: string) {
  const supabase = await createClient();

  const { data: giftCard } = await supabase
    .from('gift_cards')
    .select('*')
    .eq('id', id)
    .eq('business_id', businessId)
    .single();

  return giftCard;
}

export default async function RedeemPage({ params }: RedeemPageProps) {
  const { id } = await params;
  const user = await requireBusiness();
  
  const giftCard = await getGiftCardData(id, user.businessId);

  if (!giftCard) {
    notFound();
  }

  // Check if card can be redeemed
  const isExpired = new Date(giftCard.expires_at) < new Date();
  const isPending = giftCard.status === 'PENDING';
  const isRedeemed = giftCard.status === 'REDEEMED';
  const isCancelled = giftCard.status === 'CANCELLED';
  const hasNoBalance = giftCard.balance_cents === 0;

  const canRedeem = !isExpired && !isPending && !isRedeemed && !isCancelled && !hasNoBalance;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/cashier/validate"
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Resgatar Créditos</h1>
          <p className="text-slate-500">Vale-presente: {giftCard.code}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Informações do Vale-Presente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Code */}
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-sm text-slate-500">Código</p>
              <p className="text-2xl font-mono font-bold text-slate-900">{giftCard.code}</p>
            </div>

            {/* Balance */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4">
              <p className="text-sm text-slate-600">Saldo Disponível</p>
              <p className="text-4xl font-bold text-green-600">
                {formatCurrency(giftCard.balance_cents)}
              </p>
              {giftCard.original_amount_cents && giftCard.original_amount_cents !== giftCard.balance_cents && (
                <p className="text-sm text-slate-500 mt-1">
                  Valor original: {formatCurrency(giftCard.original_amount_cents)}
                </p>
              )}
            </div>

            {/* Owner */}
            <div className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-xl">
              <User className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-sm text-slate-500">Titular</p>
                <p className="font-medium text-slate-900">
                  {giftCard.recipient_name || giftCard.purchaser_name || 'Não informado'}
                </p>
                {giftCard.recipient_email && (
                  <p className="text-sm text-slate-500">{giftCard.recipient_email}</p>
                )}
              </div>
            </div>

            {/* Expiration */}
            <div className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-xl">
              <Calendar className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-sm text-slate-500">Válido até</p>
                <p className={`font-medium ${isExpired ? 'text-red-600' : 'text-slate-900'}`}>
                  {new Date(giftCard.expires_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Redemption Form */}
        <Card>
          <CardHeader>
            <CardTitle>Valor a Resgatar</CardTitle>
          </CardHeader>
          <CardContent>
            {canRedeem ? (
              <RedeemForm 
                giftCardId={giftCard.id}
                giftCardCode={giftCard.code}
                businessId={user.businessId}
                maxAmount={giftCard.balance_cents}
                recipientName={giftCard.recipient_name || giftCard.purchaser_name}
              />
            ) : (
              <div className="space-y-4">
                {isPending && (
                  <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                    <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-yellow-700">Pagamento Pendente</p>
                      <p className="text-sm text-yellow-600 mt-1">
                        Este vale-presente ainda não foi pago e não pode ser resgatado.
                      </p>
                    </div>
                  </div>
                )}

                {isExpired && (
                  <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-red-700">Vale-Presente Expirado</p>
                      <p className="text-sm text-red-600 mt-1">
                        Este vale-presente expirou e não pode mais ser utilizado.
                      </p>
                    </div>
                  </div>
                )}

                {(isRedeemed || hasNoBalance) && (
                  <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <AlertTriangle className="w-6 h-6 text-slate-600 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-slate-700">Saldo Esgotado</p>
                      <p className="text-sm text-slate-600 mt-1">
                        Este vale-presente já foi totalmente utilizado.
                      </p>
                    </div>
                  </div>
                )}

                {isCancelled && (
                  <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-red-700">Vale-Presente Cancelado</p>
                      <p className="text-sm text-red-600 mt-1">
                        Este vale-presente foi cancelado e não pode ser utilizado.
                      </p>
                    </div>
                  </div>
                )}

                <Link
                  href="/cashier/validate"
                  className="block w-full text-center py-3 px-6 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
                >
                  Voltar para Validação
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
