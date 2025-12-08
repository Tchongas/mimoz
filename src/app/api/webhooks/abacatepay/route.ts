// ============================================
// MIMOZ - AbacatePay Webhook Handler
// ============================================
// Handles payment notifications from AbacatePay
// Used for logging and sending confirmation emails
//
// Note: Gift cards are created as ACTIVE at checkout since
// AbacatePay only redirects to completionUrl after payment confirmation.
//
// Webhook URL: /api/webhooks/abacatepay?webhookSecret=xxx

import { NextRequest, NextResponse } from 'next/server';
import { 
  parseWebhookEvent, 
  verifyWebhookSecret, 
  verifyWebhookSignature,
  type BillingPaidEvent,
  type BillingPaidEventData,
} from '@/lib/payments';

/**
 * POST /api/webhooks/abacatepay
 * Receives webhook events from AbacatePay (for logging purposes)
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    
    // Verify webhook authenticity
    const webhookSecret = request.nextUrl.searchParams.get('webhookSecret');
    if (webhookSecret) {
      if (!verifyWebhookSecret(webhookSecret)) {
        console.error('[Webhook] Invalid webhook secret');
        return NextResponse.json({ error: 'Invalid webhook secret' }, { status: 401 });
      }
    } else {
      const signature = request.headers.get('x-webhook-signature');
      if (signature && !verifyWebhookSignature(rawBody, signature)) {
        console.error('[Webhook] Invalid signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const event = parseWebhookEvent(rawBody);
    
    console.log('[Webhook] Received event:', {
      id: event.id,
      type: event.event,
      devMode: event.devMode,
    });

    // Log payment events for audit trail
    if (event.event === 'billing.paid') {
      const { payment, billing } = (event as BillingPaidEvent).data as BillingPaidEventData;
      console.log('[Webhook] Payment confirmed:', {
        amount: payment.amount,
        fee: payment.fee,
        method: payment.method,
        billingId: billing?.id,
        externalId: billing?.products?.[0]?.externalId,
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Webhook] Error:', error);
    return NextResponse.json({ error: 'Webhook processing failed', received: true }, { status: 200 });
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
