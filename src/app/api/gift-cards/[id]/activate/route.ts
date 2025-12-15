// ============================================
// Tapresente - Gift Card Activation API (Debug/Admin)
// ============================================
// POST /api/gift-cards/[id]/activate - Manually activate a gift card

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createServiceClient();

    // First, check current status
    const { data: currentCard, error: fetchError } = await supabase
      .from('gift_cards')
      .select('id, code, status, payment_status')
      .eq('id', id)
      .single();

    if (fetchError || !currentCard) {
      return NextResponse.json({
        success: false,
        error: 'Gift card not found',
        details: fetchError,
      }, { status: 404 });
    }

    console.log('[Activate] Current card status:', currentCard);

    if (currentCard.status === 'ACTIVE') {
      return NextResponse.json({
        success: true,
        message: 'Card is already active',
        card: currentCard,
      });
    }

    // Activate the card
    const { data: updatedCard, error: updateError } = await supabase
      .from('gift_cards')
      .update({
        status: 'ACTIVE',
        payment_status: 'COMPLETED',
      })
      .eq('id', id)
      .select('id, code, status, payment_status')
      .single();

    if (updateError) {
      console.error('[Activate] Update error:', updateError);
      return NextResponse.json({
        success: false,
        error: 'Failed to activate card',
        details: updateError,
      }, { status: 500 });
    }

    console.log('[Activate] Card activated:', updatedCard);

    return NextResponse.json({
      success: true,
      message: 'Card activated successfully',
      before: currentCard,
      after: updatedCard,
    });

  } catch (error) {
    console.error('[Activate] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

// GET to check status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createServiceClient();

    const { data: card, error } = await supabase
      .from('gift_cards')
      .select('id, code, status, payment_status, purchaser_user_id, purchaser_email')
      .eq('id', id)
      .single();

    if (error || !card) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(card);
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
