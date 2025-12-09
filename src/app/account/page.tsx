// ============================================
// MIMOZ - My Gift Cards Page
// ============================================
// Shows gift cards purchased by the user AND received as gifts

import { createClient } from '@/lib/supabase/server';
import { ShoppingBag, Inbox } from 'lucide-react';
import { GiftCardWithModal } from './gift-card-modal';
import { AccountHeader } from './components/AccountHeader';
import { EmptyState } from './components/EmptyState';

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
  // Note: We fetch all cards but will mask the code for gifts sent to others (security)
  const { data: purchasedCards, error: purchasedError } = await supabase
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
      is_custom,
      custom_title,
      custom_bg_type,
      custom_bg_color,
      custom_bg_gradient_start,
      custom_bg_gradient_end,
      custom_text_color,
      business_id,
      businesses (
        name,
        slug
      ),
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
  
  // Security: Mask codes for gift cards sent to others
  // The purchaser should NOT see the code if they bought it for someone else
  const securePurchasedCards = (purchasedCards || []).map(card => {
    const isGiftForOther = card.recipient_email && card.recipient_email !== userEmail;
    return {
      ...card,
      code: isGiftForOther ? null : card.code, // Hide code if it's a gift for someone else
      is_gift_for_other: isGiftForOther,
    };
  });
  
  if (purchasedError) {
    console.error('[Account] Error fetching purchased cards:', purchasedError);
  }
  
  // Get gift cards received (where recipient_email matches user's email)
  const { data: receivedCards, error: receivedError } = await supabase
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
      is_custom,
      custom_title,
      custom_bg_type,
      custom_bg_color,
      custom_bg_gradient_start,
      custom_bg_gradient_end,
      custom_text_color,
      business_id,
      businesses (
        name,
        slug
      ),
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
  
  if (receivedError) {
    console.error('[Account] Error fetching received cards:', receivedError);
  }
  
  const purchases = securePurchasedCards;
  const received = receivedCards || [];
  
  const hasNoCards = purchases.length === 0 && received.length === 0;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AccountHeader totalPurchased={purchases.length} totalReceived={received.length} />
        
        {hasNoCards ? (
          <EmptyState />
        ) : (
          <div className="space-y-10">
            {/* Received Gift Cards */}
            {received.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-purple-100 rounded-xl">
                    <Inbox className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Presentes Recebidos</h2>
                    <p className="text-sm text-slate-500">{received.length} {received.length === 1 ? 'vale-presente' : 'vale-presentes'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {received.map((card) => (
                    <GiftCardWithModal key={card.id} card={card} userEmail={userEmail} type="received" />
                  ))}
                </div>
              </section>
            )}
            
            {/* Purchased Gift Cards */}
            {purchases.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-emerald-100 rounded-xl">
                    <ShoppingBag className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Minhas Compras</h2>
                    <p className="text-sm text-slate-500">{purchases.length} {purchases.length === 1 ? 'vale-presente' : 'vale-presentes'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {purchases.map((card) => (
                    <GiftCardWithModal key={card.id} card={card} userEmail={userEmail} type="purchased" />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
