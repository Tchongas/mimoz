import { NextRequest, NextResponse } from 'next/server';
import {
  getMercadoPagoPayment,
  verifyMercadoPagoWebhookSignature,
} from '@/lib/payments';
import { createServiceClient } from '@/lib/supabase/server';
import { sendGiftCardEmails } from '@/lib/email/resend';
import { formatCurrency, formatDate } from '@/lib/utils';

async function sendConfirmationEmails(giftCardId: string) {
  try {
    const supabase = createServiceClient();

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
      console.error('[MercadoPagoWebhook] Gift card not found:', giftCardId, error);
      return;
    }

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

    const result = await sendGiftCardEmails(emailData);

    console.log('[MercadoPagoWebhook] Email results:', {
      purchaser: result.purchaser.success ? 'sent' : result.purchaser.error,
      recipient: result.recipient ? (result.recipient.success ? 'sent' : result.recipient.error) : 'same as purchaser',
    });
  } catch (error) {
    console.error('[MercadoPagoWebhook] Error sending emails:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();

    const xSignature = request.headers.get('x-signature');
    const xRequestId = request.headers.get('x-request-id');

    const dataIdFromQuery = request.nextUrl.searchParams.get('data.id');

    const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
    if (secret && xSignature && xRequestId && dataIdFromQuery) {
      const isValid = verifyMercadoPagoWebhookSignature({
        secret,
        xSignature,
        xRequestId,
        dataId: dataIdFromQuery,
      });

      if (!isValid) {
        console.error('[MercadoPagoWebhook] Invalid signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    } else if (secret) {
      console.warn('[MercadoPagoWebhook] Signature headers/query missing; cannot verify');
    }

    const payload = JSON.parse(rawBody) as {
      type?: string;
      topic?: string;
      action?: string;
      data?: { id?: string | number };
    };

    const type = payload.type || payload.topic;
    const dataId = payload.data?.id;
    if (!type || !dataId) {
      return NextResponse.json({ received: true });
    }

    const supabase = createServiceClient();

    if (type !== 'payment') {
      return NextResponse.json({ received: true });
    }

    const paymentId = String(dataId);
    const payment = await getMercadoPagoPayment(paymentId);

    const giftCardId = payment.external_reference;
    if (!giftCardId) {
      console.warn('[MercadoPagoWebhook] No external_reference on payment', paymentId);
      return NextResponse.json({ received: true });
    }

    if (payment.status === 'approved') {
      const feeBRL = (payment.fee_details || []).reduce((sum, f) => sum + (f.amount || 0), 0);
      const feeCents = Math.round(feeBRL * 100);

      const { data, error } = await supabase
        .from('gift_cards')
        .update({
          status: 'ACTIVE',
          payment_status: 'COMPLETED',
          payment_completed_at: new Date().toISOString(),
          activated_at: new Date().toISOString(),
          payment_fee_cents: feeCents || null,
          payment_provider_id: String(paymentId),
        })
        .eq('id', giftCardId)
        .eq('status', 'PENDING')
        .select('id')
        .single();

      if (error) {
        console.error('[MercadoPagoWebhook] Error activating gift card:', giftCardId, error);
      } else {
        console.log('[MercadoPagoWebhook] Gift card activated:', data?.id);
        if (data?.id) {
          await sendConfirmationEmails(data.id);
        }
      }
    } else if (payment.status === 'rejected' || payment.status === 'cancelled') {
      await supabase
        .from('gift_cards')
        .update({
          payment_status: 'FAILED',
        })
        .eq('id', giftCardId)
        .eq('status', 'PENDING');
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[MercadoPagoWebhook] Error:', error);
    return NextResponse.json({ error: 'Webhook processing failed', received: true }, { status: 200 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    gateway: 'MercadoPago',
    timestamp: new Date().toISOString(),
  });
}
