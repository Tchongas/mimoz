// ============================================
// MIMOZ - Gift Card Activation Success Page
// ============================================
// Shows confirmation after successful payment

import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Gift, Mail, Calendar, ArrowRight, Copy, Share2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { CopyCodeButton } from './copy-code-button';
import { ShareButton } from './share-button';

interface SuccessPageProps {
  params: Promise<{ id: string }>;
}

async function getGiftCardData(id: string) {
  const supabase = await createClient();

  const { data: giftCard } = await supabase
    .from('gift_cards')
    .select(`
      *,
      business:businesses(id, name, slug, primary_color),
      template:gift_card_templates(id, name, description)
    `)
    .eq('id', id)
    .single();

  return giftCard;
}

export default async function SuccessPage({ params }: SuccessPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Check authentication (optional - allow viewing if they have the link)
  const { data: { user } } = await supabase.auth.getUser();

  const giftCard = await getGiftCardData(id);

  if (!giftCard) {
    notFound();
  }

  // If still pending, redirect to payment
  if (giftCard.status === 'PENDING' && giftCard.purchaser_user_id === user?.id) {
    redirect(`/gift-cards/payment/${id}`);
  }

  const business = giftCard.business;
  const primaryColor = business.primary_color || '#1e3a5f';
  const isOwner = user?.id === giftCard.purchaser_user_id;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: primaryColor }}
            >
              <Gift className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">{business.name}</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-12">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-once">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            Vale-presente ativado!
          </h2>
          <p className="text-slate-600">
            {isOwner 
              ? 'Seu pagamento foi confirmado e o vale-presente está pronto para uso.'
              : 'Este vale-presente está pronto para uso.'}
          </p>
        </div>

        {/* Gift Card Display */}
        <div 
          className="rounded-2xl p-8 text-white mb-8 relative overflow-hidden shadow-xl"
          style={{ backgroundColor: primaryColor }}
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-white/60 text-sm">Vale-Presente</p>
                <h3 className="text-2xl font-bold mt-1">{business.name}</h3>
              </div>
              <div className="px-3 py-1 bg-green-500 rounded-full text-sm font-medium">
                Ativo
              </div>
            </div>
            
            <div className="text-center py-6">
              <p className="text-5xl font-bold mb-2">
                {formatCurrency(giftCard.balance_cents)}
              </p>
              <p className="text-white/60">Saldo disponível</p>
            </div>

            <div className="bg-white/10 rounded-xl p-4 mt-4">
              <p className="text-white/60 text-xs uppercase tracking-wider mb-2">Código</p>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-mono font-bold tracking-wider">
                  {giftCard.code}
                </p>
                <CopyCodeButton code={giftCard.code} />
              </div>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-3 mb-2">
              <Mail className="w-5 h-5 text-slate-400" />
              <span className="text-sm text-slate-500">Destinatário</span>
            </div>
            <p className="font-medium text-slate-900">{giftCard.recipient_name}</p>
            <p className="text-sm text-slate-600">{giftCard.recipient_email}</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-5 h-5 text-slate-400" />
              <span className="text-sm text-slate-500">Válido até</span>
            </div>
            <p className="font-medium text-slate-900">
              {new Date(giftCard.expires_at).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>

        {giftCard.recipient_message && (
          <div className="bg-blue-50 rounded-xl border border-blue-100 p-4 mb-8">
            <p className="text-sm text-blue-700 mb-1">Mensagem:</p>
            <p className="text-blue-900 italic">"{giftCard.recipient_message}"</p>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-slate-50 rounded-xl p-6 mb-8">
          <h4 className="font-medium text-slate-900 mb-3">Como usar</h4>
          <ol className="text-slate-600 text-sm space-y-2">
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">1</span>
              <span>Apresente o código no caixa de qualquer unidade {business.name}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">2</span>
              <span>O operador irá validar e aplicar o desconto na sua compra</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">3</span>
              <span>Se o valor da compra for menor, o saldo restante fica disponível</span>
            </li>
          </ol>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <ShareButton 
            code={giftCard.code} 
            businessName={business.name}
            amount={giftCard.balance_cents}
          />
          <Link
            href={`/store/${business.slug}`}
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
          >
            Comprar outro
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* View My Gift Cards */}
        {isOwner && (
          <div className="mt-6 text-center">
            <Link
              href="/account/gift-cards"
              className="text-sm text-slate-600 hover:text-slate-900 underline"
            >
              Ver meus vale-presentes
            </Link>
          </div>
        )}
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
