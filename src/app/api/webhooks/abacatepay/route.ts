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
  verifyWebhookSignature,
  verifyWebhookSecret,
  parseWebhookEvent,
  getBilling,
} from '@/lib/payments';
import type { BillingPaidEvent, BillingPaidEventData } from '@/lib/payments';

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

  // Activate the gift card
  const { error: updateError } = await supabase
    .from('gift_cards')
    .update({
      status: 'ACTIVE',
      payment_method: payment.method.toLowerCase(),
      payment_fee_cents: payment.fee,
    })
    .eq('id', pendingCard.id);

  if (updateError) {
    console.error('[Webhook] Failed to activate gift card:', updateError);
    throw updateError;
  }

  console.log('[Webhook] Gift card activated:', {
    id: pendingCard.id,
    code: pendingCard.code,
    amount: pendingCard.amount_cents,
  });

  // TODO: Send confirmation emails
  // - Email to purchaser with receipt
  // - Email to recipient with gift card code
  // This will be implemented in Phase 7 (Email Delivery)
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
