// ============================================
// MIMOZ - Store Checkout API
// ============================================
// POST - Create checkout session and redirect to payment
//
// Flow:
// 1. Validate request and template
// 2. Generate unique gift card code
// 3. Create pending gift card in database
// 4. Create AbacatePay billing (payment link)
// 5. Return payment URL for redirect
// 6. Webhook handles activation after payment

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { createBilling, isDevMode } from '@/lib/payments';

const checkoutSchema = z.object({
  // businessId is UUID in businesses table
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
      purchaserName,
      purchaserEmail,
      recipientName,
      recipientEmail,
      recipientMessage,
    } = validation.data;

    const supabase = await createClient();

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
    const storeUrl = `${baseUrl}/store/${business.slug}`;
    const successUrl = `${baseUrl}/store/${business.slug}/success`;

    // Check if AbacatePay is configured
    const usePaymentGateway = !!process.env.ABACATEPAY_API_KEY;

    if (usePaymentGateway) {
      // ========================================
      // PRODUCTION FLOW: Create pending card and payment link
      // ========================================
      
      // Create pending gift card (will be activated by webhook)
      const { data: giftCard, error: giftCardError } = await supabase
        .from('gift_cards')
        .insert({
          business_id: businessId,
          template_id: templateId,
          code: code!,
          amount_cents: template.amount_cents,
          balance_cents: template.amount_cents,
          status: 'PENDING', // Will be activated by webhook
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

      try {
        // Create AbacatePay billing
        const billing = await createBilling({
          frequency: 'ONE_TIME',
          methods: ['PIX'],
          products: [{
            externalId: giftCard.id,
            name: `Vale-Presente ${business.name} - ${template.name}`,
            description: template.description || undefined,
            quantity: 1,
            price: template.amount_cents,
          }],
          completionUrl: `${successUrl}?code=${encodeURIComponent(giftCard.code)}`,
          returnUrl: storeUrl,
          customer: {
            email: purchaserEmail,
            name: purchaserName,
          },
          externalId: giftCard.id,
          metadata: {
            giftCardId: giftCard.id,
            giftCardCode: giftCard.code,
            businessId,
            templateId,
            recipientEmail,
            recipientName,
          },
        });

        // Update gift card with payment provider ID for webhook matching
        await supabase
          .from('gift_cards')
          .update({ payment_provider_id: billing.id })
          .eq('id', giftCard.id);

        console.log('[Checkout] Created billing:', {
          billingId: billing.id,
          giftCardId: giftCard.id,
          amount: template.amount_cents,
          devMode: billing.devMode,
        });

        // Return payment URL for redirect
        return NextResponse.json({
          success: true,
          checkoutUrl: billing.url,
          billingId: billing.id,
          devMode: billing.devMode,
        });

      } catch (paymentError) {
        // If payment creation fails, delete the pending gift card
        console.error('Error creating payment:', paymentError);
        await supabase.from('gift_cards').delete().eq('id', giftCard.id);
        
        return NextResponse.json(
          { error: 'Erro ao criar pagamento. Tente novamente.' },
          { status: 500 }
        );
      }

    } else {
      // ========================================
      // DEV/TEST FLOW: Create active card directly (no payment)
      // ========================================
      console.warn('[Checkout] ABACATEPAY_API_KEY not set, creating card without payment');

      const { data: giftCard, error: giftCardError } = await supabase
        .from('gift_cards')
        .insert({
          business_id: businessId,
          template_id: templateId,
          code: code!,
          amount_cents: template.amount_cents,
          balance_cents: template.amount_cents,
          status: 'ACTIVE', // Active immediately for testing
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
          { 
            error: 'Erro ao criar vale-presente',
            details: process.env.NODE_ENV === 'development' ? giftCardError.message : undefined,
          },
          { status: 500 }
        );
      }

      // Return success with code (no payment redirect)
      return NextResponse.json({
        success: true,
        giftCardCode: giftCard.code,
        giftCardId: giftCard.id,
        devMode: true,
      });
    }

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
