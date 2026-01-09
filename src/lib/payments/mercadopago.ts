import crypto from 'crypto';

export type MercadoPagoPaymentMethod = 'PIX' | 'CARD' | 'AUTO';

type MercadoPagoOrderStatus =
  | 'created'
  | 'processing'
  | 'action_required'
  | 'processed'
  | 'approved'
  | 'rejected'
  | 'cancelled'
  | 'expired';

type MercadoPagoOrderPaymentStatus =
  | 'approved'
  | 'pending'
  | 'in_process'
  | 'rejected'
  | 'cancelled'
  | 'refunded'
  | 'charged_back'
  | 'action_required';

interface MercadoPagoOrder {
  id: string;
  status?: MercadoPagoOrderStatus;
  status_detail?: string;
  external_reference?: string;
  total_amount?: string | number;
  transactions?: {
    payments?: Array<{
      id: string;
      status?: MercadoPagoOrderPaymentStatus;
      status_detail?: string;
      amount?: string | number;
      payment_method?: {
        id?: string;
        type?: string;
        ticket_url?: string;
        qr_code?: string;
        qr_code_base64?: string;
      };
    }>;
  };
}

interface MercadoPagoPreferenceItem {
  id: string;
  title: string;
  description?: string;
  quantity: number;
  unit_price: number;
  currency_id: 'BRL';
}

interface MercadoPagoCreatePreferenceRequest {
  items: MercadoPagoPreferenceItem[];
  external_reference: string;
  back_urls: {
    success: string;
    pending: string;
    failure: string;
  };
  notification_url?: string;
  payment_methods?: {
    excluded_payment_methods?: Array<{ id: string }>;
    excluded_payment_types?: Array<{ id: string }>;
    installments?: number;
    default_installments?: number;
  };
  auto_return?: 'approved' | 'all';
}

interface MercadoPagoCreatePreferenceResponse {
  id: string;
  init_point: string;
  sandbox_init_point?: string;
}

type MercadoPagoPaymentStatus = 'approved' | 'pending' | 'in_process' | 'rejected' | 'cancelled' | 'refunded' | 'charged_back';

interface MercadoPagoPayment {
  id: number;
  status: MercadoPagoPaymentStatus;
  status_detail?: string;
  payment_type_id?: string;
  external_reference?: string;
  transaction_amount?: number;
  fee_details?: Array<{ amount: number; type?: string }>; // amount is in BRL
}

const MERCADOPAGO_API_URL = 'https://api.mercadopago.com';

function getAccessToken(): string {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) {
    throw new Error('MERCADOPAGO_ACCESS_TOKEN environment variable is not set');
  }
  return token;
}

export function isMercadoPagoConfigured(): boolean {
  return !!process.env.MERCADOPAGO_ACCESS_TOKEN;
}

async function mpRequest<T>(
  path: string,
  options: { method: 'GET' | 'POST'; body?: unknown; headers?: Record<string, string> }
): Promise<T> {
  const token = getAccessToken();

  const response = await fetch(`${MERCADOPAGO_API_URL}${path}`, {
    method: options.method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data?.message || data?.error || `HTTP ${response.status}`;
    throw new Error(message);
  }

  return data as T;
}

export async function createMercadoPagoPixOrder(params: {
  amountCents: number;
  giftCardId: string;
  payerEmail: string;
  processingMode?: 'automatic' | 'manual';
}): Promise<{
  orderId: string;
  paymentId: string | null;
  ticketUrl: string | null;
  qrCode: string | null;
  qrCodeBase64: string | null;
}> {
  const amountBRL = (Math.round(params.amountCents) / 100).toFixed(2);

  const body = {
    type: 'online',
    total_amount: amountBRL,
    external_reference: params.giftCardId,
    processing_mode: params.processingMode || 'automatic',
    transactions: {
      payments: [
        {
          amount: amountBRL,
          payment_method: {
            id: 'pix',
            type: 'bank_transfer',
          },
        },
      ],
    },
    payer: {
      email: params.payerEmail,
    },
  };

  const idempotencyKey = crypto.randomUUID();

  const order = await mpRequest<MercadoPagoOrder>('/v1/orders', {
    method: 'POST',
    body,
    headers: {
      'X-Idempotency-Key': idempotencyKey,
    },
  });

  const payment = order.transactions?.payments?.[0];

  return {
    orderId: order.id,
    paymentId: payment?.id || null,
    ticketUrl: payment?.payment_method?.ticket_url || null,
    qrCode: payment?.payment_method?.qr_code || null,
    qrCodeBase64: payment?.payment_method?.qr_code_base64 || null,
  };
}

export async function getMercadoPagoOrder(orderId: string): Promise<MercadoPagoOrder> {
  return mpRequest<MercadoPagoOrder>(`/v1/orders/${encodeURIComponent(orderId)}`, { method: 'GET' });
}

function paymentMethodsFor(method: MercadoPagoPaymentMethod): MercadoPagoCreatePreferenceRequest['payment_methods'] {
  // Notes:
  // - `account_money` cannot be excluded via excluded_payment_methods in Preferences.
  // - Excluding the payment type `wallet_purchase` is allowed and helps avoid balance-only flows.
  if (method === 'AUTO') {
    return undefined;
  }

  if (method === 'PIX') {
    return {
      excluded_payment_types: [
        { id: 'wallet_purchase' },
        { id: 'credit_card' },
        { id: 'debit_card' },
        { id: 'prepaid_card' },
        { id: 'ticket' },
        { id: 'atm' },
      ],
    };
  }

  return {
    excluded_payment_types: [
      { id: 'wallet_purchase' },
      { id: 'bank_transfer' },
      { id: 'ticket' },
      { id: 'atm' },
    ],
  };
}

export async function createMercadoPagoPreference(params: {
  title: string;
  description?: string;
  amountCents: number;
  giftCardId: string;
  successUrl: string;
  pendingUrl: string;
  failureUrl: string;
  notificationUrl?: string;
  paymentMethod: MercadoPagoPaymentMethod;
}): Promise<{ id: string; url: string }> {
  const amountBRL = Math.round(params.amountCents) / 100;

  const body: MercadoPagoCreatePreferenceRequest = {
    items: [
      {
        id: params.giftCardId,
        title: params.title,
        description: params.description,
        quantity: 1,
        unit_price: amountBRL,
        currency_id: 'BRL',
      },
    ],
    external_reference: params.giftCardId,
    back_urls: {
      success: params.successUrl,
      pending: params.pendingUrl,
      failure: params.failureUrl,
    },
    auto_return: 'approved',
    payment_methods: paymentMethodsFor(params.paymentMethod),
    ...(params.notificationUrl ? { notification_url: params.notificationUrl } : {}),
  };

  const preference = await mpRequest<MercadoPagoCreatePreferenceResponse>('/checkout/preferences', {
    method: 'POST',
    body,
  });

  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  const isTestToken = !!token && token.startsWith('TEST-');
  const url = isTestToken && preference.sandbox_init_point ? preference.sandbox_init_point : preference.init_point;

  return {
    id: preference.id,
    url,
  };
}

export async function getMercadoPagoPayment(paymentId: string): Promise<MercadoPagoPayment> {
  return mpRequest<MercadoPagoPayment>(`/v1/payments/${encodeURIComponent(paymentId)}`, { method: 'GET' });
}

export function verifyMercadoPagoWebhookSignature(params: {
  secret: string;
  xSignature: string;
  xRequestId: string;
  dataId: string;
}): boolean {
  try {
    const parts = params.xSignature.split(',');
    let ts: string | undefined;
    let v1: string | undefined;

    for (const part of parts) {
      const [k, v] = part.split('=', 2);
      if (!k || !v) continue;
      const key = k.trim();
      const value = v.trim();
      if (key === 'ts') ts = value;
      if (key === 'v1') v1 = value;
    }

    if (!ts || !v1) return false;

    const dataId = /[a-z]/i.test(params.dataId) ? params.dataId.toLowerCase() : params.dataId;
    const manifest = `id:${dataId};request-id:${params.xRequestId};ts:${ts};`;

    const expected = crypto.createHmac('sha256', params.secret).update(manifest).digest('hex');

    const A = Buffer.from(expected, 'utf8');
    const B = Buffer.from(v1, 'utf8');
    return A.length === B.length && crypto.timingSafeEqual(A, B);
  } catch {
    return false;
  }
}
