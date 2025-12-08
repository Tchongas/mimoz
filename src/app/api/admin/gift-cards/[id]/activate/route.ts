// ============================================
// MIMOZ - Admin Gift Card Activation API
// ============================================
// POST /api/admin/gift-cards/[id]/activate - Manually activate a pending gift card

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSessionUser } from '@/lib/auth';
import { isAdmin } from '@/lib/rbac';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getSessionUser();
    
    if (!user || !isAdmin(user)) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const supabase = await createClient();

    // Get the gift card
    const { data: giftCard, error: findError } = await supabase
      .from('gift_cards')
      .select('*')
      .eq('id', id)
      .single();

    if (findError || !giftCard) {
      return NextResponse.json(
        { error: 'Vale-presente não encontrado' },
        { status: 404 }
      );
    }

    if (giftCard.status !== 'PENDING') {
      return NextResponse.json(
        { error: `Vale-presente não está pendente (status: ${giftCard.status})` },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    // Activate the gift card
    const { error: updateError } = await supabase
      .from('gift_cards')
      .update({
        status: 'ACTIVE',
        payment_status: 'COMPLETED',
        payment_completed_at: now,
        activated_at: now,
      })
      .eq('id', id);

    if (updateError) {
      console.error('Error activating gift card:', updateError);
      return NextResponse.json(
        { error: 'Erro ao ativar vale-presente' },
        { status: 500 }
      );
    }

    console.log('[Admin] Gift card manually activated:', {
      id,
      code: giftCard.code,
      activatedBy: user.id,
    });

    return NextResponse.json({
      success: true,
      message: 'Vale-presente ativado com sucesso',
      giftCard: {
        id,
        code: giftCard.code,
        status: 'ACTIVE',
      },
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
