// ============================================
// Tapresente - Mercado Pago Webhook Handler
// ============================================
// Receives payment notifications from Mercado Pago
//
// Webhook types:
// - payment: Payment status changed
// - merchant_order: Order status changed (not used for Checkout Pro)
//
// Flow:
// 1. Receive notification
// 2. Fetch payment details from Mercado Pago API
// 3. Find gift card by external_reference
// 4. Update gift card status based on payment status
// 5. Send confirmation emails if payment approved

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { 
  getPayment, 
  isPaymentApproved, 
  isPaymentRejected,
  parseWebhookBody,
} from '@/lib/payments';
import { sendGiftCardEmails } from '@/lib/email/resend';
import { formatCurrency, formatDate } from '@/lib/utils';

export async function POST(request: NextRequest) {
  console.log('[MercadoPago Webhook] Received notification');

  try {
    // Parse the notification body
    const body = await request.json();
    console.log('[MercadoPago Webhook] Body:', JSON.stringify(body, null, 2));

    // Mercado Pago sends different notification types
    // We only care about "payment" notifications
    const notificationType = body.type || body.topic;
    
    if (notificationType !== 'payment') {
      console.log(`[MercadoPago Webhook] Ignoring notification type: ${notificationType}`);
      return NextResponse.json({ received: true, ignored: true });
    }

    // Get payment ID from notification
    // Format can be: { data: { id: "123" } } or { id: "123" }
    const paymentId = body.data?.id || body.id;
    
    if (!paymentId) {
      console.error('[MercadoPago Webhook] No payment ID in notification');
      return NextResponse.json({ error: 'No payment ID' }, { status: 400 });
    }

    console.log(`[MercadoPago Webhook] Processing payment: ${paymentId}`);

    // Fetch payment details from Mercado Pago API
    const payment = await getPayment(paymentId);
    console.log('[MercadoPago Webhook] Payment details:', {
      id: payment.id,
      status: payment.status,
      statusDetail: payment.statusDetail,
      externalReference: payment.externalReference,
      amount: payment.transactionAmount,
    });

    // Get gift card ID from external reference
    const giftCardId = payment.externalReference;
    
    if (!giftCardId) {
      console.error('[MercadoPago Webhook] No external reference in payment');
      return NextResponse.json({ error: 'No external reference' }, { status: 400 });
    }

    // Get Supabase client
    const supabase = await createClient();

    // Find the gift card
    const { data: giftCard, error: fetchError } = await supabase
      .from('gift_cards')
      .select(`
        *,
        businesses(name, slug, gift_card_color),
        gift_card_templates(name, card_color)
      `)
      .eq('id', giftCardId)
      .single();

    if (fetchError || !giftCard) {
      console.error('[MercadoPago Webhook] Gift card not found:', giftCardId);
      return NextResponse.json({ error: 'Gift card not found' }, { status: 404 });
    }

    console.log(`[MercadoPago Webhook] Found gift card: ${giftCard.code}, current status: ${giftCard.status}`);

    // Process based on payment status
    if (isPaymentApproved(payment.status)) {
      // Payment approved - activate the gift card
      if (giftCard.status === 'PENDING') {
        console.log('[MercadoPago Webhook] Activating gift card...');

        const { error: updateError } = await supabase
          .from('gift_cards')
          .update({
            status: 'ACTIVE',
            payment_status: 'PAID',
            payment_provider_id: String(payment.id),
            payment_method: payment.paymentTypeId?.toUpperCase() || null,
            payment_fee_cents: Math.round(payment.feeAmount * 100),
            payment_completed_at: payment.dateApproved || new Date().toISOString(),
          })
          .eq('id', giftCardId);

        if (updateError) {
          console.error('[MercadoPago Webhook] Failed to update gift card:', updateError);
          return NextResponse.json({ error: 'Failed to update gift card' }, { status: 500 });
        }

        console.log('[MercadoPago Webhook] Gift card activated!');

        // Send confirmation emails
        try {
          const business = giftCard.businesses as { name: string; slug: string; gift_card_color?: string };
          const template = giftCard.gift_card_templates as { name: string; card_color?: string } | null;
          
          const emailData = {
            code: giftCard.code,
            amount: giftCard.amount_cents,
            amountFormatted: formatCurrency(giftCard.amount_cents),
            expiresAt: formatDate(giftCard.expires_at),
            validDays: 365,
            businessName: business.name,
            businessSlug: business.slug,
            templateName: template?.name || giftCard.custom_title || 'Vale-Presente',
            cardColor: template?.card_color || giftCard.custom_bg_color || business.gift_card_color || '#1e3a5f',
            recipientName: giftCard.recipient_name,
            recipientEmail: giftCard.recipient_email,
            purchaserName: giftCard.purchaser_name,
            purchaserEmail: giftCard.purchaser_email,
            message: giftCard.recipient_message || undefined,
          };

          console.log('[MercadoPago Webhook] Sending confirmation emails...');
          const emailResult = await sendGiftCardEmails(emailData);
          console.log('[MercadoPago Webhook] Email results:', {
            purchaser: emailResult.purchaser.success ? 'sent' : emailResult.purchaser.error,
            recipient: emailResult.recipient ? (emailResult.recipient.success ? 'sent' : emailResult.recipient.error) : 'same as purchaser',
          });
        } catch (emailError) {
          console.error('[MercadoPago Webhook] Email error (non-fatal):', emailError);
        }

        return NextResponse.json({ 
          success: true, 
          action: 'activated',
          giftCardCode: giftCard.code,
        });
      } else {
        console.log(`[MercadoPago Webhook] Gift card already ${giftCard.status}, skipping`);
        return NextResponse.json({ success: true, action: 'already_processed' });
      }

    } else if (isPaymentRejected(payment.status)) {
      // Payment rejected - mark as failed
      console.log(`[MercadoPago Webhook] Payment rejected: ${payment.statusDetail}`);

      if (giftCard.status === 'PENDING') {
        await supabase
          .from('gift_cards')
          .update({
            payment_status: 'FAILED',
            payment_provider_id: String(payment.id),
          })
          .eq('id', giftCardId);
      }

      return NextResponse.json({ 
        success: true, 
        action: 'rejected',
        reason: payment.statusDetail,
      });

    } else {
      // Payment still pending
      console.log(`[MercadoPago Webhook] Payment pending: ${payment.status}`);
      return NextResponse.json({ 
        success: true, 
        action: 'pending',
        status: payment.status,
      });
    }

  } catch (error) {
    console.error('[MercadoPago Webhook] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Mercado Pago may also send GET requests to verify the endpoint
export async function GET() {
  return NextResponse.json({ status: 'ok' });
}
