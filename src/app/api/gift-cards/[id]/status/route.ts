// ============================================
// Tapresente - Gift Card Status API
// ============================================
// GET /api/gift-cards/[id]/status - Check gift card payment status

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: giftCard, error } = await supabase
      .from('gift_cards')
      .select('id, status, payment_status')
      .eq('id', id)
      .single();

    if (error || !giftCard) {
      return NextResponse.json(
        { error: 'Gift card not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: giftCard.id,
      status: giftCard.status,
      paymentStatus: giftCard.payment_status,
    });
  } catch (error) {
    console.error('[GiftCardStatus] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
