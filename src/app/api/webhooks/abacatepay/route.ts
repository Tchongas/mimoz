// ============================================
// MIMOZ - AbacatePay Webhook Handler
// ============================================
// Handles payment notifications from AbacatePay
//
// Webhook URL: /api/webhooks/abacatepay?webhookSecret=xxx
// Events handled:
// - billing.paid: Payment completed, create gift card
//
// Configure this URL in your AbacatePay dashboard

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { 
  parseWebhookEvent, 
  verifyWebhookSecret, 
  verifyWebhookSignature,
  type BillingPaidEvent,
  type BillingPaidEventData,
} from '@/lib/payments';
import { createPaymentAuditLog } from '@/lib/services/audit-log';
import { sendGiftCardEmails, type GiftCardEmailData } from '@/lib/email';
import { formatCurrency } from '@/lib/utils';

/**
 * POST /api/webhooks/abacatepay
 * Receives webhook events from AbacatePay
 */
export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text();
    
    // Verify webhook authenticity
    // Method 1: URL secret (simpler)
    const webhookSecret = request.nextUrl.searchParams.get('webhookSecret');
    if (webhookSecret) {
      if (!verifyWebhookSecret(webhookSecret)) {
        console.error('[Webhook] Invalid webhook secret');
        return NextResponse.json(
          { error: 'Invalid webhook secret' },
          { status: 401 }
        );
      }
    } else {
      // Method 2: HMAC signature (more secure)
      const signature = request.headers.get('x-webhook-signature');
      if (signature && !verifyWebhookSignature(rawBody, signature)) {
        console.error('[Webhook] Invalid signature');
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        );
      }
    }

    // Parse the event
    const event = parseWebhookEvent(rawBody);
    
    console.log('[Webhook] Received event:', {
      id: event.id,
      type: event.event,
      devMode: event.devMode,
    });

    // Handle different event types
    switch (event.event) {
      case 'billing.paid':
        await handleBillingPaid(event as BillingPaidEvent);
        break;
      
      case 'withdraw.done':
      case 'withdraw.failed':
        // Log withdrawal events but no action needed for gift cards
        console.log('[Webhook] Withdrawal event:', event.event);
        break;
      
      default:
        console.log('[Webhook] Unhandled event type:', event.event);
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Webhook] Error processing webhook:', error);
    // Return 200 anyway to prevent retries for parsing errors
    // AbacatePay will retry on 4xx/5xx errors
    return NextResponse.json(
      { error: 'Webhook processing failed', received: true },
      { status: 200 }
    );
  }
}

/**
 * Handle billing.paid event
 * Creates the gift card after successful payment
 */
async function handleBillingPaid(event: BillingPaidEvent) {
  const { payment, pixQrCode } = event.data as BillingPaidEventData;
  
  console.log('[Webhook] Processing billing.paid:', {
    amount: payment.amount,
    fee: payment.fee,
    method: payment.method,
    pixId: pixQrCode?.id,
  });

  // We need to get the billing details to find our order
  // The pixQrCode.id can be used to look up the billing
  // Or we can use the externalId we set when creating the billing
  
  // For now, we'll need to look up the pending order by the billing ID
  // This requires us to store the billing ID when creating the checkout
  
  const supabase = await createClient();

  // Find the pending gift card order by the AbacatePay billing ID
  // We store this in the gift_cards table when creating the checkout
  const { data: pendingCard, error: findError } = await supabase
    .from('gift_cards')
    .select('*, gift_card_templates(*)')
    .eq('payment_provider_id', pixQrCode?.id || '')
    .eq('status', 'PENDING')
    .single();

  if (findError || !pendingCard) {
    // Try to find by looking at recent pending cards
    // This is a fallback if we don't have the exact ID match
    console.warn('[Webhook] Could not find pending card by payment_provider_id:', pixQrCode?.id);
    
    // Log for debugging - in production you'd want better tracking
    console.log('[Webhook] Payment received but no matching order found. Amount:', payment.amount);
    return;
  }

  const now = new Date().toISOString();

  // Activate the gift card
  const { error: updateError } = await supabase
    .from('gift_cards')
    .update({
      status: 'ACTIVE',
      payment_status: 'COMPLETED',
      payment_method: payment.method.toLowerCase(),
      payment_fee_cents: payment.fee,
      payment_completed_at: now,
      activated_at: now,
    })
    .eq('id', pendingCard.id);

  if (updateError) {
    console.error('[Webhook] Failed to activate gift card:', updateError);
    throw updateError;
  }

  // Log payment completed
  await createPaymentAuditLog({
    giftCardId: pendingCard.id,
    businessId: pendingCard.business_id,
    userId: pendingCard.purchaser_user_id,
    eventType: 'PAYMENT_COMPLETED',
    paymentMethod: payment.method as 'PIX' | 'CARD',
    paymentProviderId: pixQrCode?.id,
    amountCents: payment.amount,
    feeCents: payment.fee,
    previousStatus: 'PENDING',
    newStatus: 'ACTIVE',
  });

  // Log card activation
  await createPaymentAuditLog({
    giftCardId: pendingCard.id,
    businessId: pendingCard.business_id,
    userId: pendingCard.purchaser_user_id,
    eventType: 'CARD_ACTIVATED',
    amountCents: pendingCard.amount_cents,
    newStatus: 'ACTIVE',
  });

  console.log('[Webhook] Gift card activated:', {
    id: pendingCard.id,
    code: pendingCard.code,
    amount: pendingCard.amount_cents,
  });

  // Send confirmation emails
  await sendGiftCardNotifications(pendingCard, supabase);
}

/**
 * Send email notifications for activated gift card
 */
async function sendGiftCardNotifications(giftCard: any, supabase: any) {
  try {
    // Get business info
    const { data: business } = await supabase
      .from('businesses')
      .select('name, slug, gift_card_color')
      .eq('id', giftCard.business_id)
      .single();

    // Get purchaser info
    const { data: purchaser } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', giftCard.purchaser_user_id)
      .single();

    if (!business || !purchaser) {
      console.error('[Webhook] Missing business or purchaser info for email');
      return;
    }

    // Get template info for card color
    const template = giftCard.gift_card_templates;
    const cardColor = template?.card_color || business.gift_card_color || '#1e3a5f';

    // Format expiration date
    const expiresAt = new Date(giftCard.expires_at).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    // Build email data
    const emailData: GiftCardEmailData = {
      code: giftCard.code,
      amount: giftCard.amount_cents,
      amountFormatted: formatCurrency(giftCard.amount_cents),
      expiresAt,
      validDays: template?.valid_days || 365,
      businessName: business.name,
      businessSlug: business.slug,
      templateName: template?.name || 'Vale-Presente',
      cardColor,
      recipientName: giftCard.recipient_name,
      recipientEmail: giftCard.recipient_email,
      purchaserName: purchaser.full_name || purchaser.email.split('@')[0],
      purchaserEmail: purchaser.email,
      message: giftCard.recipient_message || undefined,
    };

    // Send emails
    const results = await sendGiftCardEmails(emailData);
    
    console.log('[Webhook] Email results:', {
      purchaser: results.purchaser.success ? 'sent' : results.purchaser.error,
      recipient: results.recipient ? (results.recipient.success ? 'sent' : results.recipient.error) : 'same as purchaser',
    });
  } catch (error) {
    // Don't throw - email failure shouldn't fail the webhook
    console.error('[Webhook] Failed to send emails:', error);
  }
}

/**
 * GET /api/webhooks/abacatepay
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    gateway: 'AbacatePay',
    timestamp: new Date().toISOString(),
  });
}
