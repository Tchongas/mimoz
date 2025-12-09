// ============================================
// MIMOZ - AbacatePay Webhook Handler
// ============================================
// Handles payment notifications from AbacatePay
// Sends confirmation emails when payment is confirmed
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
import { createClient } from '@/lib/supabase/server';
import { sendGiftCardEmails } from '@/lib/email/resend';
import { formatCurrency, formatDate } from '@/lib/utils';

/**
 * POST /api/webhooks/abacatepay
 * Receives webhook events from AbacatePay and sends confirmation emails
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

    // Handle payment confirmation
    if (event.event === 'billing.paid') {
      const { payment, billing } = (event as BillingPaidEvent).data as BillingPaidEventData;
      const giftCardId = billing?.products?.[0]?.externalId;
      
      console.log('[Webhook] Payment confirmed:', {
        amount: payment.amount,
        fee: payment.fee,
        method: payment.method,
        billingId: billing?.id,
        giftCardId,
      });

      // Activate the gift card and send confirmation emails
      if (giftCardId) {
        await activateGiftCard(giftCardId);
        await sendConfirmationEmails(giftCardId);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Webhook] Error:', error);
    return NextResponse.json({ error: 'Webhook processing failed', received: true }, { status: 200 });
  }
}

/**
 * Activate a gift card after payment is confirmed
 */
async function activateGiftCard(giftCardId: string) {
  try {
    const supabase = await createClient();
    
    // Update gift card status to ACTIVE
    const { data, error } = await supabase
      .from('gift_cards')
      .update({
        status: 'ACTIVE',
        payment_status: 'COMPLETED',
      })
      .eq('id', giftCardId)
      .eq('status', 'PENDING') // Only activate if still pending (idempotency)
      .select()
      .single();
    
    if (error) {
      console.error('[Webhook] Error activating gift card:', giftCardId, error);
      return false;
    }
    
    if (data) {
      console.log('[Webhook] Gift card activated:', giftCardId);
      return true;
    } else {
      console.log('[Webhook] Gift card already active or not found:', giftCardId);
      return false;
    }
  } catch (error) {
    console.error('[Webhook] Error activating gift card:', error);
    return false;
  }
}

/**
 * Fetch gift card data and send confirmation emails
 */
async function sendConfirmationEmails(giftCardId: string) {
  try {
    const supabase = await createClient();
    
    // Fetch gift card with related data
    const { data: giftCard, error } = await supabase
      .from('gift_cards')
      .select(`
        *,
        template:gift_card_templates(name, card_color),
        business:businesses(name, slug, gift_card_color)
      `)
      .eq('id', giftCardId)
      .single();
    
    if (error || !giftCard) {
      console.error('[Webhook] Gift card not found:', giftCardId, error);
      return;
    }
    
    // Prepare email data
    const cardColor = giftCard.is_custom 
      ? (giftCard.custom_bg_color || giftCard.business?.gift_card_color || '#1e3a5f')
      : (giftCard.template?.card_color || giftCard.business?.gift_card_color || '#1e3a5f');
    
    const templateName = giftCard.is_custom 
      ? (giftCard.custom_title || 'Vale-Presente Personalizado')
      : (giftCard.template?.name || 'Vale-Presente');
    
    const emailData = {
      code: giftCard.code,
      amount: giftCard.amount_cents,
      amountFormatted: formatCurrency(giftCard.amount_cents),
      expiresAt: formatDate(giftCard.expires_at),
      validDays: Math.ceil((new Date(giftCard.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      businessName: giftCard.business?.name || 'Loja',
      businessSlug: giftCard.business?.slug || '',
      templateName,
      cardColor,
      recipientName: giftCard.recipient_name || giftCard.purchaser_name || 'Cliente',
      recipientEmail: giftCard.recipient_email || giftCard.purchaser_email,
      purchaserName: giftCard.purchaser_name || 'Cliente',
      purchaserEmail: giftCard.purchaser_email,
      message: giftCard.recipient_message || undefined,
    };
    
    console.log('[Webhook] Sending confirmation emails for gift card:', giftCardId);
    
    const result = await sendGiftCardEmails(emailData);
    
    console.log('[Webhook] Email results:', {
      purchaser: result.purchaser.success ? 'sent' : result.purchaser.error,
      recipient: result.recipient ? (result.recipient.success ? 'sent' : result.recipient.error) : 'same as purchaser',
    });
    
  } catch (error) {
    console.error('[Webhook] Error sending emails:', error);
    // Don't throw - we don't want to fail the webhook because of email issues
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
