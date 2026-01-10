// ============================================
// Tapresente - Mercado Pago Checkout Pro
// ============================================
// Integration with Mercado Pago Checkout Pro for payment processing
//
// Environment variables:
// - MERCADOPAGO_ACCESS_TOKEN: Your Mercado Pago access token (required)
//
// Flow:
// 1. Create preference with items and URLs
// 2. Redirect user to init_point URL
// 3. After payment, webhook receives notification
// 4. Verify payment status and activate gift card

import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';

// ============================================
// Configuration
// ============================================

const ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;

/**
 * Check if Mercado Pago is configured
 */
export function isMercadoPagoConfigured(): boolean {
  return !!ACCESS_TOKEN;
}

/**
 * Get configured Mercado Pago client
 */
function getClient(): MercadoPagoConfig {
  if (!ACCESS_TOKEN) {
    throw new Error('MERCADOPAGO_ACCESS_TOKEN not configured');
  }
  return new MercadoPagoConfig({
    accessToken: ACCESS_TOKEN,
    options: { timeout: 10000 },
  });
}

// ============================================
// Types
// ============================================

export interface CreatePreferenceParams {
  /** Title shown in checkout */
  title: string;
  /** Description (optional) */
  description?: string;
  /** Amount in cents (will be converted to decimal) */
  amountCents: number;
  /** External reference (gift card ID) */
  externalReference: string;
  /** URL to redirect after successful payment */
  successUrl: string;
  /** URL to redirect for pending payment */
  pendingUrl: string;
  /** URL to redirect after failed payment */
  failureUrl: string;
  /** Webhook URL for payment notifications */
  notificationUrl?: string;
  /** Payer email (optional) */
  payerEmail?: string;
}

export interface PreferenceResponse {
  /** Preference ID */
  id: string;
  /** URL to redirect user for payment (production) */
  initPoint: string;
  /** URL for sandbox testing */
  sandboxInitPoint: string;
}

export interface PaymentInfo {
  /** Payment ID */
  id: number;
  /** Payment status: approved, pending, rejected, etc */
  status: string;
  /** Status detail */
  statusDetail: string;
  /** External reference (gift card ID) */
  externalReference: string | null;
  /** Payment method ID */
  paymentMethodId: string;
  /** Payment type: credit_card, debit_card, ticket, etc */
  paymentTypeId: string;
  /** Transaction amount */
  transactionAmount: number;
  /** Fee charged by Mercado Pago */
  feeAmount: number;
  /** Net amount received */
  netReceivedAmount: number;
  /** Date approved */
  dateApproved: string | null;
  /** Payer email */
  payerEmail: string | null;
}

// ============================================
// Preference (Checkout Pro)
// ============================================

/**
 * Create a Checkout Pro preference
 * Returns URLs to redirect the user for payment
 */
export async function createPreference(params: CreatePreferenceParams): Promise<PreferenceResponse> {
  const client = getClient();
  const preference = new Preference(client);

  // Convert cents to decimal (Mercado Pago uses decimal format)
  const unitPrice = params.amountCents / 100;

  const response = await preference.create({
    body: {
      items: [
        {
          id: params.externalReference,
          title: params.title,
          description: params.description || params.title,
          quantity: 1,
          unit_price: unitPrice,
          currency_id: 'BRL',
        },
      ],
      back_urls: {
        success: params.successUrl,
        pending: params.pendingUrl,
        failure: params.failureUrl,
      },
      auto_return: 'approved',
      external_reference: params.externalReference,
      notification_url: params.notificationUrl,
      payer: params.payerEmail ? { email: params.payerEmail } : undefined,
      statement_descriptor: 'TAPRESENTE',
      expires: true,
      expiration_date_from: new Date().toISOString(),
      expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    },
  });

  if (!response.id || !response.init_point) {
    console.error('[MercadoPago] Invalid preference response:', response);
    throw new Error('Failed to create Mercado Pago preference');
  }

  return {
    id: response.id,
    initPoint: response.init_point,
    sandboxInitPoint: response.sandbox_init_point || response.init_point,
  };
}

// ============================================
// Payment Verification
// ============================================

/**
 * Get payment information by ID
 * Used to verify payment status from webhook
 */
export async function getPayment(paymentId: string | number): Promise<PaymentInfo> {
  const client = getClient();
  const payment = new Payment(client);

  const response = await payment.get({ id: Number(paymentId) });

  if (!response.id) {
    throw new Error(`Payment ${paymentId} not found`);
  }

  return {
    id: response.id,
    status: response.status || 'unknown',
    statusDetail: response.status_detail || '',
    externalReference: response.external_reference || null,
    paymentMethodId: response.payment_method_id || '',
    paymentTypeId: response.payment_type_id || '',
    transactionAmount: response.transaction_amount || 0,
    feeAmount: response.fee_details?.reduce((sum, fee) => sum + (fee.amount || 0), 0) || 0,
    netReceivedAmount: response.transaction_details?.net_received_amount || 0,
    dateApproved: response.date_approved || null,
    payerEmail: response.payer?.email || null,
  };
}

/**
 * Check if a payment status indicates success
 */
export function isPaymentApproved(status: string): boolean {
  return status === 'approved';
}

/**
 * Check if a payment is still pending
 */
export function isPaymentPending(status: string): boolean {
  return status === 'pending' || status === 'in_process' || status === 'authorized';
}

/**
 * Check if a payment was rejected
 */
export function isPaymentRejected(status: string): boolean {
  return status === 'rejected' || status === 'cancelled' || status === 'refunded' || status === 'charged_back';
}

// ============================================
// Webhook Signature Verification
// ============================================

/**
 * Verify webhook signature from Mercado Pago
 * Mercado Pago sends x-signature header with format: ts=xxx,v1=xxx
 * 
 * For now, we'll validate by fetching the payment directly
 * which is the recommended approach for Checkout Pro
 */
export function parseWebhookHeaders(headers: Headers): { 
  signature: string | null; 
  requestId: string | null;
} {
  return {
    signature: headers.get('x-signature'),
    requestId: headers.get('x-request-id'),
  };
}

/**
 * Parse webhook notification body
 */
export interface WebhookNotification {
  id: number;
  live_mode: boolean;
  type: string;
  date_created: string;
  user_id: number;
  api_version: string;
  action: string;
  data: {
    id: string;
  };
}

export function parseWebhookBody(body: unknown): WebhookNotification | null {
  if (!body || typeof body !== 'object') return null;
  
  const notification = body as WebhookNotification;
  
  if (!notification.type || !notification.data?.id) {
    return null;
  }
  
  return notification;
}
