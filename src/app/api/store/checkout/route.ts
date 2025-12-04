// ============================================
// MIMOZ - Store Checkout API
// ============================================
// POST - Create checkout session and gift card

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const checkoutSchema = z.object({
  businessId: z.string().uuid(),
  templateId: z.string().uuid(),
  purchaserName: z.string().min(2, 'Nome é obrigatório'),
  purchaserEmail: z.string().email('Email inválido'),
  recipientName: z.string().min(2, 'Nome do destinatário é obrigatório'),
  recipientEmail: z.string().email('Email do destinatário inválido'),
  recipientMessage: z.string().nullable().optional(),
});

// Generate unique gift card code
function generateGiftCardCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars (0,O,1,I)
  let code = 'MIMO-';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  code += '-';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = checkoutSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const {
      businessId,
      templateId,
      purchaserName,
      purchaserEmail,
      recipientName,
      recipientEmail,
      recipientMessage,
    } = validation.data;

    const supabase = await createClient();

    // Get template to verify it exists and is active
    const { data: template, error: templateError } = await supabase
      .from('gift_card_templates')
      .select('*')
      .eq('id', templateId)
      .eq('business_id', businessId)
      .eq('is_active', true)
      .single();

    if (templateError || !template) {
      return NextResponse.json(
        { error: 'Vale-presente não encontrado ou indisponível' },
        { status: 404 }
      );
    }

    // Generate unique code
    let code: string;
    let codeExists = true;
    let attempts = 0;

    while (codeExists && attempts < 10) {
      code = generateGiftCardCode();
      const { data: existing } = await supabase
        .from('gift_cards')
        .select('id')
        .eq('code', code)
        .single();
      
      codeExists = !!existing;
      attempts++;
    }

    if (codeExists) {
      return NextResponse.json(
        { error: 'Erro ao gerar código. Tente novamente.' },
        { status: 500 }
      );
    }

    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (template.valid_days || 365));

    // For now, create the gift card directly (without Stripe)
    // TODO: Integrate Stripe Checkout and create card only after payment
    const { data: giftCard, error: giftCardError } = await supabase
      .from('gift_cards')
      .insert({
        business_id: businessId,
        template_id: templateId,
        code: code!,
        amount_cents: template.amount_cents,
        balance_cents: template.amount_cents,
        status: 'ACTIVE',
        purchaser_email: purchaserEmail,
        purchaser_name: purchaserName,
        recipient_email: recipientEmail,
        recipient_name: recipientName,
        recipient_message: recipientMessage || null,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (giftCardError) {
      console.error('Error creating gift card:', giftCardError);
      return NextResponse.json(
        { error: 'Erro ao criar vale-presente' },
        { status: 500 }
      );
    }

    // Create order record
    const { error: orderError } = await supabase
      .from('orders')
      .insert({
        business_id: businessId,
        gift_card_id: giftCard.id,
        amount_cents: template.amount_cents,
        status: 'PAID', // For testing - normally would be PENDING until Stripe confirms
        customer_email: purchaserEmail,
        customer_name: purchaserName,
        paid_at: new Date().toISOString(),
      });

    if (orderError) {
      console.error('Error creating order:', orderError);
      // Don't fail the request, gift card was created
    }

    // TODO: Send emails to purchaser and recipient

    return NextResponse.json({
      success: true,
      giftCardCode: giftCard.code,
      giftCardId: giftCard.id,
    });

  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
