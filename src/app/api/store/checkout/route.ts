// ============================================
// Tapresente - Store Checkout API
// ============================================
// POST - Create checkout session for gift card purchase
//
// REQUIRES AUTHENTICATION - user must be logged in
//
// Flow (with Mercado Pago):
// 1. Verify user is authenticated
// 2. Validate request and template
// 3. Generate unique gift card code
// 4. Create PENDING gift card
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

const checkoutSchema = z.object({
  businessId: z.string().uuid(),
  templateId: z.string().uuid(),
  recipientName: z.string().optional().default(''),
  recipientEmail: z.string().optional().default(''),
  recipientMessage: z.string().nullable().optional(),
  isGift: z.boolean().default(false),
}).refine((data) => {
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
      .select('*, businesses(name, slug, gift_card_color)')
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

    // Build URLs
    const baseUrl = getBaseUrl(request);
    const successUrl = `${baseUrl}/store/${business.slug}/success`;

    // Check if Mercado Pago is configured
    const useMercadoPago = isMercadoPagoConfigured();

    if (useMercadoPago) {
      // ========================================
      // PRODUCTION: Create PENDING card, redirect to Mercado Pago
      // ========================================
      console.log('[Checkout] Creating PENDING gift card for Mercado Pago checkout');

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
        console.error('[Checkout] Error creating gift card:', giftCardError);
        return NextResponse.json(
          { error: 'Erro ao criar vale-presente' },
          { status: 500 }
        );
      }

      try {
        // Create Mercado Pago preference
        const preference = await createPreference({
          title: `Vale-Presente ${business.name} - ${template.name}`,
          description: template.description || `Vale-presente de ${formatCurrency(template.amount_cents)}`,
          amountCents: template.amount_cents,
          externalReference: giftCard.id,
          successUrl: `${successUrl}?code=${encodeURIComponent(giftCard.code)}`,
          pendingUrl: `${successUrl}?code=${encodeURIComponent(giftCard.code)}&status=pending`,
          failureUrl: `${baseUrl}/store/${business.slug}?error=payment_failed`,
          notificationUrl: `${baseUrl}/api/webhooks/mercadopago`,
          payerEmail: purchaserEmail,
        });

        console.log('[Checkout] Mercado Pago preference created:', preference.id);

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
        console.error('[Checkout] Mercado Pago error:', paymentError);
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
      console.log('[Checkout] DEV MODE - Creating ACTIVE gift card without payment');

      const { data: giftCard, error: giftCardError } = await supabase
        .from('gift_cards')
        .insert({
          business_id: businessId,
          template_id: templateId,
          code: code!,
          amount_cents: template.amount_cents,
          original_amount_cents: template.amount_cents,
          balance_cents: template.amount_cents,
          status: 'ACTIVE',
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
        console.error('[Checkout] Error creating gift card:', giftCardError);
        return NextResponse.json(
          { error: 'Erro ao criar vale-presente' },
          { status: 500 }
        );
      }

      // Send confirmation emails in dev mode
      try {
        const emailData = {
          code: giftCard.code,
          amount: template.amount_cents,
          amountFormatted: formatCurrency(template.amount_cents),
          expiresAt: formatDate(expiresAt.toISOString()),
          validDays: template.valid_days || 365,
          businessName: business.name,
          businessSlug: business.slug,
          templateName: template.name,
          cardColor: template.card_color || (business as { gift_card_color?: string }).gift_card_color || '#1e3a5f',
          recipientName: finalRecipientName,
          recipientEmail: finalRecipientEmail,
          purchaserName,
          purchaserEmail,
          message: recipientMessage || undefined,
        };
        
        console.log('[Checkout] Sending confirmation emails (dev mode)');
        const emailResult = await sendGiftCardEmails(emailData);
        console.log('[Checkout] Email results:', {
          purchaser: emailResult.purchaser.success ? 'sent' : emailResult.purchaser.error,
          recipient: emailResult.recipient ? (emailResult.recipient.success ? 'sent' : emailResult.recipient.error) : 'same as purchaser',
        });
      } catch (emailError) {
        console.error('[Checkout] Email error (non-fatal):', emailError);
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
