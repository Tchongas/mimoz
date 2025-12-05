// ============================================
// MIMOZ - Code Redemption API
// ============================================
// POST /api/codes/redeem - Redeem (use) a gift card

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSessionUser } from '@/lib/auth';
import { hasPermission, canAccessBusiness, PERMISSIONS } from '@/lib/rbac';
import { createRedemptionAuditLog } from '@/lib/services/audit-log';
import { z } from 'zod';

const redeemSchema = z.object({
  giftCardId: z.string().uuid('ID do vale-presente inválido'),
  amountCents: z.number().int().positive('Valor deve ser positivo'),
  businessId: z.string().uuid('ID de empresa inválido'),
  notes: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    if (!hasPermission(user, PERMISSIONS.CODES_VALIDATE)) {
      return NextResponse.json(
        { error: 'Sem permissão para resgatar códigos' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = redeemSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { giftCardId, amountCents, businessId, notes } = validation.data;

    if (!canAccessBusiness(user, businessId)) {
      return NextResponse.json(
        { error: 'Sem acesso a esta empresa' },
        { status: 403 }
      );
    }

    const supabase = await createClient();

    // Get the gift card
    const { data: giftCard, error: lookupError } = await supabase
      .from('gift_cards')
      .select('*')
      .eq('id', giftCardId)
      .eq('business_id', businessId)
      .single();

    if (lookupError || !giftCard) {
      return NextResponse.json(
        { error: 'Vale-presente não encontrado' },
        { status: 404 }
      );
    }

    // Validate status
    if (giftCard.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: `Vale-presente não está ativo (status: ${giftCard.status})` },
        { status: 400 }
      );
    }

    // Check expiration
    if (new Date(giftCard.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Vale-presente expirado' },
        { status: 400 }
      );
    }

    // Check balance
    if (amountCents > giftCard.balance_cents) {
      return NextResponse.json(
        { error: `Saldo insuficiente. Disponível: R$ ${(giftCard.balance_cents / 100).toFixed(2)}` },
        { status: 400 }
      );
    }

    const balanceBefore = giftCard.balance_cents;
    const balanceAfter = balanceBefore - amountCents;
    const newStatus = balanceAfter === 0 ? 'REDEEMED' : 'ACTIVE';

    // Create redemption record
    const { data: redemption, error: redemptionError } = await supabase
      .from('redemptions')
      .insert({
        gift_card_id: giftCardId,
        business_id: businessId,
        cashier_id: user.id,
        amount_cents: amountCents,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        notes: notes || null,
      })
      .select()
      .single();

    if (redemptionError) {
      console.error('Error creating redemption:', redemptionError);
      return NextResponse.json(
        { error: 'Erro ao registrar resgate' },
        { status: 500 }
      );
    }

    // Create audit log
    await createRedemptionAuditLog({
      redemptionId: redemption.id,
      giftCardId,
      businessId,
      cashierId: user.id,
      amountCents,
      balanceBefore,
      balanceAfter,
      cardOwnerName: giftCard.recipient_name || giftCard.purchaser_name,
      cardOwnerEmail: giftCard.recipient_email || giftCard.purchaser_email,
      eventType: 'REDEMPTION',
      notes: notes || null,
    });

    // Update gift card balance
    const updateData: Record<string, unknown> = {
      balance_cents: balanceAfter,
      status: newStatus,
    };

    if (newStatus === 'REDEEMED') {
      updateData.redeemed_at = new Date().toISOString();
    }

    const { error: updateError } = await supabase
      .from('gift_cards')
      .update(updateData)
      .eq('id', giftCardId);

    if (updateError) {
      console.error('Error updating gift card:', updateError);
      return NextResponse.json(
        { error: 'Erro ao atualizar saldo' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: newStatus === 'REDEEMED' 
        ? 'Vale-presente totalmente utilizado' 
        : 'Resgate realizado com sucesso',
      redemption: {
        amount_cents: amountCents,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        new_status: newStatus,
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
