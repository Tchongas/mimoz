// ============================================
// MIMOZ - Process Payment API
// ============================================
// POST - Process payment for a pending gift card

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { createBilling } from '@/lib/payments';
import { createPaymentAuditLog } from '@/lib/services/audit-log';

const processPaymentSchema = z.object({
  giftCardId: z.string().uuid(),
  paymentMethod: z.enum(['PIX', 'CARD']),
});

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

    // Require authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Você precisa estar logado', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    // Validate request
    const body = await request.json();
    const validation = processPaymentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { giftCardId, paymentMethod } = validation.data;

    // Get the gift card
    const { data: giftCard, error: giftCardError } = await supabase
      .from('gift_cards')
      .select(`
        *,
        business:businesses(id, name, slug),
        template:gift_card_templates(id, name, description)
      `)
      .eq('id', giftCardId)
      .eq('purchaser_user_id', user.id)
      .single();

    if (giftCardError || !giftCard) {
      return NextResponse.json(
        { error: 'Vale-presente não encontrado' },
        { status: 404 }
      );
    }

    // Verify gift card is pending
    if (giftCard.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Este vale-presente já foi processado' },
        { status: 400 }
      );
    }

    const business = giftCard.business;
    const template = giftCard.template;

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .single();

    const purchaserName = profile?.full_name || user.email?.split('@')[0] || 'Cliente';
    const purchaserEmail = user.email!;

    // Build URLs
    const baseUrl = getBaseUrl(request);
    const successUrl = `${baseUrl}/gift-cards/success/${giftCardId}`;
    const returnUrl = `${baseUrl}/gift-cards/payment/${giftCardId}`;

    // Check if AbacatePay is configured
    const usePaymentGateway = !!process.env.ABACATEPAY_API_KEY;

    // Log payment initiation
    await createPaymentAuditLog({
      giftCardId,
      businessId: giftCard.business_id,
      userId: user.id,
      eventType: 'PAYMENT_INITIATED',
      paymentMethod,
      amountCents: giftCard.amount_cents,
      previousStatus: giftCard.status,
      newStatus: 'PENDING',
      metadata: {
        paymentGateway: usePaymentGateway ? 'abacatepay' : 'dev_mode',
      },
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      userAgent: request.headers.get('user-agent'),
    });

    if (usePaymentGateway) {
      // Create AbacatePay billing
      try {
        const billing = await createBilling({
          frequency: 'ONE_TIME',
          methods: [paymentMethod],
          products: [{
            externalId: giftCard.id,
            name: `Vale-Presente ${business.name}${template ? ` - ${template.name}` : ''}`,
            description: template?.description || undefined,
            quantity: 1,
            price: giftCard.amount_cents,
          }],
          completionUrl: successUrl,
          returnUrl: returnUrl,
          customer: {
            email: purchaserEmail,
            name: purchaserName,
          },
          externalId: giftCard.id,
          metadata: {
            giftCardId: giftCard.id,
            giftCardCode: giftCard.code,
            businessId: giftCard.business_id,
            paymentMethod,
          },
        });

        // Update gift card with payment info
        await supabase
          .from('gift_cards')
          .update({ 
            payment_provider_id: billing.id,
            payment_method: paymentMethod.toLowerCase(),
            payment_status: 'PROCESSING',
          })
          .eq('id', giftCardId);

        // Log payment pending
        await createPaymentAuditLog({
          giftCardId,
          businessId: giftCard.business_id,
          userId: user.id,
          eventType: 'PAYMENT_PENDING',
          paymentMethod,
          paymentProviderId: billing.id,
          amountCents: giftCard.amount_cents,
          previousStatus: 'PENDING',
          newStatus: 'PROCESSING',
        });

        return NextResponse.json({
          success: true,
          paymentUrl: billing.url,
          billingId: billing.id,
        });

      } catch (paymentError) {
        console.error('Error creating payment:', paymentError);
        
        // Log payment failure
        await createPaymentAuditLog({
          giftCardId,
          businessId: giftCard.business_id,
          userId: user.id,
          eventType: 'PAYMENT_FAILED',
          paymentMethod,
          amountCents: giftCard.amount_cents,
          metadata: {
            error: paymentError instanceof Error ? paymentError.message : 'Unknown error',
          },
        });

        return NextResponse.json(
          { error: 'Erro ao criar pagamento. Tente novamente.' },
          { status: 500 }
        );
      }
    } else {
      // Dev mode - activate card directly
      console.warn('[ProcessPayment] Dev mode - activating card without payment');

      const now = new Date().toISOString();

      await supabase
        .from('gift_cards')
        .update({
          status: 'ACTIVE',
          payment_status: 'COMPLETED',
          payment_method: paymentMethod.toLowerCase(),
          payment_completed_at: now,
          activated_at: now,
        })
        .eq('id', giftCardId);

      // Log payment completed (dev mode)
      await createPaymentAuditLog({
        giftCardId,
        businessId: giftCard.business_id,
        userId: user.id,
        eventType: 'PAYMENT_COMPLETED',
        paymentMethod,
        amountCents: giftCard.amount_cents,
        previousStatus: 'PENDING',
        newStatus: 'ACTIVE',
        metadata: { devMode: true },
      });

      // Log card activation
      await createPaymentAuditLog({
        giftCardId,
        businessId: giftCard.business_id,
        userId: user.id,
        eventType: 'CARD_ACTIVATED',
        amountCents: giftCard.amount_cents,
        newStatus: 'ACTIVE',
        metadata: { devMode: true },
      });

      return NextResponse.json({
        success: true,
        devMode: true,
        giftCardCode: giftCard.code,
      });
    }

  } catch (error) {
    console.error('Process payment error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
