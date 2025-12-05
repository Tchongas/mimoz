// ============================================
// MIMOZ - Store Checkout API
// ============================================
// POST - Create checkout session and redirect to payment
//
// REQUIRES AUTHENTICATION - user must be logged in
//
// Flow:
// 1. Verify user is authenticated
// 2. Validate request and template
// 3. Generate unique gift card code
// 4. Create pending gift card linked to user
// 5. Create AbacatePay billing (payment link)
// 6. Return payment URL for redirect
// 7. Webhook handles activation after payment

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const checkoutSchema = z.object({
  // businessId is UUID in businesses table
  businessId: z.string().uuid(),
  templateId: z.string().uuid(),
  // Recipient info - only required if isGift is true
  recipientName: z.string().optional().default(''),
  recipientEmail: z.string().optional().default(''),
  recipientMessage: z.string().nullable().optional(),
  isGift: z.boolean().default(false),
}).refine((data) => {
  // If it's a gift, require recipient name and email
  if (data.isGift) {
    return data.recipientName && data.recipientName.length >= 2 && 
           data.recipientEmail && data.recipientEmail.includes('@');
  }
  return true;
}, {
  message: 'Nome e email do destinatário são obrigatórios para presentes',
  path: ['recipientEmail'],
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

/**
 * Get base URL for redirects
 */
function getBaseUrl(request: NextRequest): string {
  const host = request.headers.get('host') || 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  return `${protocol}://${host}`;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // ========================================
    // 1. REQUIRE AUTHENTICATION
    // ========================================
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Você precisa estar logado para fazer uma compra', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    // Get user profile for name
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .single();

    const purchaserName = profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Cliente';
    const purchaserEmail = user.email!;

    // ========================================
    // 2. VALIDATE REQUEST
    // ========================================
    const body = await request.json();
    const validation = checkoutSchema.safeParse(body);

    if (!validation.success) {
      console.error('[Checkout] Validation failed:', validation.error.issues);
      return NextResponse.json(
        { 
          error: validation.error.issues[0].message,
          field: validation.error.issues[0].path.join('.'),
        },
        { status: 400 }
      );
    }

    const {
      businessId,
      templateId,
      recipientName,
      recipientEmail,
      recipientMessage,
      isGift,
    } = validation.data;

    // If not a gift, recipient is the purchaser
    const finalRecipientName = isGift ? recipientName : purchaserName;
    const finalRecipientEmail = isGift ? recipientEmail : purchaserEmail;

    // Get template and business info
    const { data: template, error: templateError } = await supabase
      .from('gift_card_templates')
      .select('*, businesses(name, slug)')
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

    const business = template.businesses as { name: string; slug: string };

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

    // Build URLs for payment flow
    const baseUrl = getBaseUrl(request);

    // ========================================
    // CREATE PENDING GIFT CARD
    // ========================================
    // Card is created in PENDING status and will be activated after payment
    
    const { data: giftCard, error: giftCardError } = await supabase
      .from('gift_cards')
      .insert({
        business_id: businessId,
        template_id: templateId,
        code: code!,
        amount_cents: template.amount_cents,
        original_amount_cents: template.amount_cents,
        balance_cents: template.amount_cents,
        status: 'PENDING',
        payment_status: 'PENDING',
        purchaser_user_id: user.id,
        purchaser_email: purchaserEmail,
        purchaser_name: purchaserName,
        recipient_email: finalRecipientEmail,
        recipient_name: finalRecipientName,
        recipient_message: recipientMessage || null,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (giftCardError) {
      console.error('Error creating gift card:', giftCardError);
      return NextResponse.json(
        { 
          error: 'Erro ao criar vale-presente',
          details: process.env.NODE_ENV === 'development' ? giftCardError.message : undefined,
        },
        { status: 500 }
      );
    }

    console.log('[Checkout] Created pending gift card:', {
      giftCardId: giftCard.id,
      code: giftCard.code,
      amount: template.amount_cents,
    });

    // Redirect to our payment page where user chooses PIX or Card
    const paymentPageUrl = `${baseUrl}/gift-cards/payment/${giftCard.id}`;

    return NextResponse.json({
      success: true,
      paymentPageUrl,
      giftCardId: giftCard.id,
      giftCardCode: giftCard.code,
    });

  } catch (error) {
    console.error('Checkout error:', error);
    // Include more details in dev mode
    const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor';
    return NextResponse.json(
      { 
        error: process.env.NODE_ENV === 'development' ? errorMessage : 'Erro interno do servidor',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}
