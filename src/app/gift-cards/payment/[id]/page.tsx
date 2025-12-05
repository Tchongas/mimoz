// ============================================
// MIMOZ - Gift Card Payment Page
// ============================================
// Shows payment options (PIX or Card) for a pending gift card

import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Gift, CreditCard, QrCode, Shield, Clock, CheckCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { PaymentOptions } from './payment-options';

interface PaymentPageProps {
  params: Promise<{ id: string }>;
}

async function getGiftCardData(id: string, userId: string) {
  const supabase = await createClient();

  const { data: giftCard } = await supabase
    .from('gift_cards')
    .select(`
      *,
      business:businesses(id, name, slug, primary_color, secondary_color),
      template:gift_card_templates(id, name, description, valid_days)
    `)
    .eq('id', id)
    .eq('purchaser_user_id', userId)
    .single();

  return giftCard;
}

export default async function PaymentPage({ params }: PaymentPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect(`/auth/login?redirectTo=/gift-cards/payment/${id}`);
  }

  const giftCard = await getGiftCardData(id, user.id);

  if (!giftCard) {
    notFound();
  }

  // If already paid, redirect to success
  if (giftCard.status === 'ACTIVE' || giftCard.payment_status === 'COMPLETED') {
    redirect(`/gift-cards/success/${id}`);
  }

  // If not pending, show error
  if (giftCard.status !== 'PENDING') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gift className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">
            Vale-presente indisponível
          </h1>
          <p className="text-slate-600 mb-6">
            Este vale-presente não está mais disponível para pagamento.
          </p>
          <Link
            href={`/store/${giftCard.business.slug}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar à loja
          </Link>
        </div>
      </div>
    );
  }

  const business = giftCard.business;
  const template = giftCard.template;
  const primaryColor = business.primary_color || '#1e3a5f';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href={`/store/${business.slug}`}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: primaryColor }}
              >
                <Gift className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">{business.name}</h1>
                <p className="text-sm text-slate-500">Pagamento</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Resumo do pedido</h2>
            
            {/* Gift Card Preview */}
            <div 
              className="rounded-2xl p-6 text-white mb-6 relative overflow-hidden"
              style={{ backgroundColor: primaryColor }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
              
              <div className="relative">
                <p className="text-white/60 text-sm">Vale-Presente</p>
                <h3 className="text-xl font-bold mt-1">{business.name}</h3>
                
                <div className="mt-6">
                  <p className="text-3xl font-bold">
                    {formatCurrency(giftCard.amount_cents)}
                  </p>
                  {template && (
                    <p className="text-white/60 text-sm mt-1">{template.name}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Order Details */}
            <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-200">
              <div className="p-4 flex justify-between">
                <span className="text-slate-600">Destinatário</span>
                <span className="font-medium text-slate-900">{giftCard.recipient_name}</span>
              </div>
              <div className="p-4 flex justify-between">
                <span className="text-slate-600">Email</span>
                <span className="font-medium text-slate-900">{giftCard.recipient_email}</span>
              </div>
              <div className="p-4 flex justify-between">
                <span className="text-slate-600">Validade</span>
                <span className="font-medium text-slate-900">
                  {template?.valid_days || 365} dias
                </span>
              </div>
              <div className="p-4 flex justify-between bg-slate-50">
                <span className="font-medium text-slate-900">Total</span>
                <span className="font-bold text-slate-900 text-lg">
                  {formatCurrency(giftCard.amount_cents)}
                </span>
              </div>
            </div>

            {/* Security Badge */}
            <div className="mt-6 flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
              <Shield className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-900">Pagamento seguro</p>
                <p className="text-xs text-green-700">Seus dados estão protegidos</p>
              </div>
            </div>
          </div>

          {/* Payment Options */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Forma de pagamento</h2>
            
            <PaymentOptions 
              giftCardId={giftCard.id}
              giftCardCode={giftCard.code}
              businessSlug={business.slug}
              amount={giftCard.amount_cents}
              accentColor={primaryColor}
            />

            {/* Payment Info */}
            <div className="mt-6 space-y-3">
              <div className="flex items-start gap-3 text-sm text-slate-600">
                <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p>PIX: aprovação instantânea. Cartão: pode levar alguns minutos.</p>
              </div>
              <div className="flex items-start gap-3 text-sm text-slate-600">
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p>Após o pagamento, o vale-presente será ativado automaticamente.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-100 border-t border-slate-200 py-8 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-xs">
            Powered by Mimoz
          </p>
        </div>
      </footer>
    </div>
  );
}
