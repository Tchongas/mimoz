// ============================================
// MIMOZ - My Gift Cards Page
// ============================================
// Shows gift cards purchased by the user AND received as gifts

import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Gift, Store, ShoppingBag, Inbox } from 'lucide-react';
import { GiftCardWithModal } from './gift-card-modal';

export default async function MyGiftCardsPage() {
  const supabase = await createClient();
  
  // Get current user - middleware already handles auth redirect
  const { data: { user } } = await supabase.auth.getUser();
  
  // User is guaranteed by middleware, but handle edge case gracefully
  if (!user) {
    return null;
  }
  
  // Get user's profile for email
  const { data: profile } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', user.id)
    .single();
  
  const userEmail = profile?.email || user.email;
  
  // Get gift cards purchased by user
  const { data: purchasedCards } = await supabase
    .from('gift_cards')
    .select(`
      id,
      code,
      amount_cents,
      balance_cents,
      status,
      recipient_name,
      recipient_email,
      recipient_message,
      purchaser_user_id,
      purchased_at,
      expires_at,
      gift_card_templates (
        name,
        card_color,
        businesses (
          name,
          slug
        )
      )
    `)
    .eq('purchaser_user_id', user.id)
    .order('purchased_at', { ascending: false });
  
  // Get gift cards received (where recipient_email matches user's email)
  const { data: receivedCards } = await supabase
    .from('gift_cards')
    .select(`
      id,
      code,
      amount_cents,
      balance_cents,
      status,
      recipient_name,
      recipient_email,
      recipient_message,
      purchaser_name,
      purchaser_user_id,
      purchased_at,
      expires_at,
      gift_card_templates (
        name,
        card_color,
        businesses (
          name,
          slug
        )
      )
    `)
    .eq('recipient_email', userEmail)
    .neq('purchaser_user_id', user.id) // Exclude self-purchases
    .order('purchased_at', { ascending: false });
  
  const purchases = purchasedCards || [];
  const received = receivedCards || [];
  
  const hasNoCards = purchases.length === 0 && received.length === 0;
  
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Meus Vale-Presentes</h1>
        <p className="text-slate-500 mt-1">
          Vale-presentes que você comprou ou recebeu
        </p>
      </div>
      
      {hasNoCards ? (
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
        <div className="space-y-8">
          {/* Received Gift Cards */}
          {received.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Inbox className="w-5 h-5" />
                Recebidos ({received.length})
              </h2>
              <div className="space-y-4">
                {received.map((card) => (
                  <GiftCardWithModal key={card.id} card={card} userEmail={userEmail} type="received" />
                ))}
              </div>
            </section>
          )}
          
          {/* Purchased Gift Cards */}
          {purchases.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                Comprados ({purchases.length})
              </h2>
              <div className="space-y-4">
                {purchases.map((card) => (
                  <GiftCardWithModal key={card.id} card={card} userEmail={userEmail} type="purchased" />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
