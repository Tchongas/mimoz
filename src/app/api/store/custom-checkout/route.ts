// ============================================
// Tapresente - Custom Gift Card Checkout API
// ============================================
// POST - Create checkout for custom (user-designed) gift cards
//
// REQUIRES AUTHENTICATION - user must be logged in
//
// Flow (with Mercado Pago):
// 1. Verify user is authenticated
// 2. Validate custom card data (amount within limits, etc.)
// 3. Generate unique gift card code
// 4. Create PENDING gift card with custom design
// 5. Create Mercado Pago preference
// 6. Return checkout URL for redirect
// 7. Webhook activates card after payment
//
// Flow (without Mercado Pago - dev mode):
// 1-4. Same as above
// 5. Create ACTIVE gift card directly
// 6. Send confirmation emails
// 7. Return success URL

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isMercadoPagoConfigured, createPreference } from '@/lib/payments';
import { sendGiftCardEmails } from '@/lib/email/resend';
import { formatCurrency, formatDate } from '@/lib/utils';
import { z } from 'zod';

const customCheckoutSchema = z.object({
  businessId: z.string().uuid(),
  amountCents: z.number().int().positive(),
  customTitle: z.string().max(100).optional().nullable(),
  customEmoji: z.string().max(10).optional().nullable(),
  bgType: z.enum(['color', 'gradient', 'image']).default('color'),
  bgColor: z.string().optional().nullable(),
  bgGradientStart: z.string().optional().nullable(),
  bgGradientEnd: z.string().optional().nullable(),
  bgImageUrl: z.string().url().optional().nullable(),
  textColor: z.string().default('#ffffff'),
  recipientName: z.string().min(2, 'Nome do destinatário é obrigatório'),
  recipientEmail: z.string().email('Email inválido'),
  recipientMessage: z.string().max(500).optional().nullable(),
});

// Generate unique gift card code
function generateGiftCardCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
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

    // Get user profile
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
    const validation = customCheckoutSchema.safeParse(body);

    if (!validation.success) {
      console.error('[CustomCheckout] Validation failed:', validation.error.issues);
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
      amountCents,
      customTitle,
      bgType,
      bgColor,
      bgGradientStart,
      bgGradientEnd,
      bgImageUrl,
      textColor,
      recipientName,
      recipientEmail,
      recipientMessage,
    } = validation.data;

    // ========================================
    // 3. VERIFY BUSINESS AND CUSTOM CARD SETTINGS
    // ========================================
    const { data: business, error: bizError } = await supabase
      .from('businesses')
      .select(`
        id, name, slug,
        custom_cards_enabled,
        custom_cards_min_amount_cents,
        custom_cards_max_amount_cents
      `)
      .eq('id', businessId)
      .single();

    if (bizError || !business) {
      return NextResponse.json(
        { error: 'Empresa não encontrada' },
        { status: 404 }
      );
    }

    if (!business.custom_cards_enabled) {
      return NextResponse.json(
        { error: 'Esta empresa não aceita vale-presentes personalizados' },
        { status: 400 }
      );
    }

    // Validate amount within limits
    const minAmount = business.custom_cards_min_amount_cents || 1000;
    const maxAmount = business.custom_cards_max_amount_cents || 100000;

    if (amountCents < minAmount) {
      return NextResponse.json(
        { error: `Valor mínimo é R$ ${(minAmount / 100).toFixed(2)}` },
        { status: 400 }
      );
    }

    if (amountCents > maxAmount) {
      return NextResponse.json(
        { error: `Valor máximo é R$ ${(maxAmount / 100).toFixed(2)}` },
        { status: 400 }
      );
    }

    // ========================================
    // 4. GENERATE UNIQUE CODE
    // ========================================
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

    // Calculate expiration (365 days default for custom cards)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 365);

    // Determine background color for display
    const displayBgColor = bgType === 'color' ? (bgColor || '#1e3a5f') : (bgGradientStart || '#1e3a5f');

    // Build URLs
    const baseUrl = getBaseUrl(request);
    const successUrl = `${baseUrl}/store/${business.slug}/success`;

    // Check if Mercado Pago is configured
    const useMercadoPago = isMercadoPagoConfigured();

    // Custom card fields for both flows
    const customCardFields = {
      is_custom: true,
      custom_title: customTitle || null,
      custom_bg_type: bgType,
      custom_bg_color: bgColor || null,
      custom_bg_gradient_start: bgGradientStart || null,
      custom_bg_gradient_end: bgGradientEnd || null,
      custom_bg_image_url: bgImageUrl || null,
      custom_text_color: textColor,
    };

    if (useMercadoPago) {
      // ========================================
      // PRODUCTION: Create PENDING card, redirect to Mercado Pago
      // ========================================
      console.log('[CustomCheckout] Creating PENDING gift card for Mercado Pago checkout');

      const { data: giftCard, error: giftCardError } = await supabase
        .from('gift_cards')
        .insert({
          business_id: businessId,
          template_id: null,
          code: code!,
          amount_cents: amountCents,
          original_amount_cents: amountCents,
          balance_cents: amountCents,
          status: 'PENDING',
          payment_status: 'PENDING',
          purchaser_user_id: user.id,
          purchaser_email: purchaserEmail,
          purchaser_name: purchaserName,
          recipient_email: recipientEmail,
          recipient_name: recipientName,
          recipient_message: recipientMessage || null,
          expires_at: expiresAt.toISOString(),
          ...customCardFields,
        })
        .select()
        .single();

      if (giftCardError) {
        console.error('[CustomCheckout] Error creating gift card:', giftCardError);
        return NextResponse.json(
          { error: 'Erro ao criar vale-presente' },
          { status: 500 }
        );
      }

      try {
        // Create Mercado Pago preference
        const preference = await createPreference({
          title: `Vale-Presente Personalizado ${business.name}`,
          description: customTitle || `Vale-presente de ${formatCurrency(amountCents)}`,
          amountCents: amountCents,
          externalReference: giftCard.id,
          successUrl: `${successUrl}?code=${encodeURIComponent(giftCard.code)}`,
          pendingUrl: `${successUrl}?code=${encodeURIComponent(giftCard.code)}&status=pending`,
          failureUrl: `${baseUrl}/store/${business.slug}/custom?error=payment_failed`,
          notificationUrl: `${baseUrl}/api/webhooks/mercadopago`,
          payerEmail: purchaserEmail,
        });

        console.log('[CustomCheckout] Mercado Pago preference created:', preference.id);

        // Update gift card with preference ID
        await supabase
          .from('gift_cards')
          .update({ payment_provider_id: preference.id })
          .eq('id', giftCard.id);

        return NextResponse.json({
          success: true,
          giftCardId: giftCard.id,
          checkoutUrl: preference.initPoint,
        });

      } catch (paymentError) {
        console.error('[CustomCheckout] Mercado Pago error:', paymentError);
        // Delete the pending gift card if payment creation fails
        await supabase.from('gift_cards').delete().eq('id', giftCard.id);
        
        return NextResponse.json(
          { error: 'Erro ao criar sessão de pagamento. Tente novamente.' },
          { status: 500 }
        );
      }

    } else {
      // ========================================
      // DEV MODE: Create ACTIVE card directly (no payment)
      // ========================================
      console.log('[CustomCheckout] DEV MODE - Creating ACTIVE gift card without payment');

      const { data: giftCard, error: giftCardError } = await supabase
        .from('gift_cards')
        .insert({
          business_id: businessId,
          template_id: null,
          code: code!,
          amount_cents: amountCents,
          original_amount_cents: amountCents,
          balance_cents: amountCents,
          status: 'ACTIVE',
          purchaser_user_id: user.id,
          purchaser_email: purchaserEmail,
          purchaser_name: purchaserName,
          recipient_email: recipientEmail,
          recipient_name: recipientName,
          recipient_message: recipientMessage || null,
          expires_at: expiresAt.toISOString(),
          ...customCardFields,
        })
        .select()
        .single();

      if (giftCardError) {
        console.error('[CustomCheckout] Error creating gift card:', giftCardError);
        return NextResponse.json(
          { error: 'Erro ao criar vale-presente' },
          { status: 500 }
        );
      }

      // Send confirmation emails in dev mode
      try {
        const emailData = {
          code: giftCard.code,
          amount: amountCents,
          amountFormatted: formatCurrency(amountCents),
          expiresAt: formatDate(expiresAt.toISOString()),
          validDays: 365,
          businessName: business.name,
          businessSlug: business.slug,
          templateName: customTitle || 'Vale-Presente Personalizado',
          cardColor: displayBgColor,
          recipientName,
          recipientEmail,
          purchaserName,
          purchaserEmail,
          message: recipientMessage || undefined,
        };
        
        console.log('[CustomCheckout] Sending confirmation emails (dev mode)');
        const emailResult = await sendGiftCardEmails(emailData);
        console.log('[CustomCheckout] Email results:', {
          purchaser: emailResult.purchaser.success ? 'sent' : emailResult.purchaser.error,
          recipient: emailResult.recipient ? (emailResult.recipient.success ? 'sent' : emailResult.recipient.error) : 'same as purchaser',
        });
      } catch (emailError) {
        console.error('[CustomCheckout] Email error (non-fatal):', emailError);
      }

      return NextResponse.json({
        success: true,
        giftCardCode: giftCard.code,
        giftCardId: giftCard.id,
        redirectUrl: `${successUrl}?code=${encodeURIComponent(giftCard.code)}`,
        devMode: true,
      });
    }

  } catch (error) {
    console.error('Custom checkout error:', error);
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
