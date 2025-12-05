// ============================================
// MIMOZ - AbacatePay Payment Gateway Client
// ============================================
// Brazilian payment gateway integration via PIX
// Docs: https://docs.abacatepay.com/
//
// Environment variables required:
// - ABACATEPAY_API_KEY: Your API key from AbacatePay dashboard
// - ABACATEPAY_WEBHOOK_SECRET: Secret for webhook URL validation (optional)
//
// The API automatically detects dev mode based on the API key used.

import crypto from 'crypto';
import type {
  PaymentGateway,
  CreateBillingRequest,
  Billing,
  BillingStatus,
  WebhookEvent,
  GatewayResponse,
} from './types';

// ============================================
// Configuration
// ============================================

const ABACATEPAY_API_URL = 'https://api.abacatepay.com/v1';

// Public HMAC key for webhook signature verification
// This is a public key provided by AbacatePay for HMAC verification
const ABACATEPAY_PUBLIC_KEY = 't9dXRhHHo3yDEj5pVDYz0frf7q6bMKyMRmxxCPIPp3RCplBfXRxqlC6ZpiWmOqj4L63qEaeUOtrCI8P0VMUgo6iIga2ri9ogaHFs0WIIywSMg0q7RmBfybe1E5XJcfC4IW3alNqym0tXoAKkzvfEjZxV6bE0oG2zJrNNYmUCKZyV0KZ3JS8Votf9EAWWYdiDkMkpbMdPggfh1EqHlVkMiTady6jOR3hyzGEHrIz2Ret0xHKMbiqkr9HS1JhNHDX9';

/**
 * Get the API key from environment
 * @throws Error if API key is not configured
 */
function getApiKey(): string {
  const apiKey = process.env.ABACATEPAY_API_KEY;
  if (!apiKey) {
    throw new Error('ABACATEPAY_API_KEY environment variable is not set');
  }
  return apiKey;
}

/**
 * Get the webhook secret from environment (optional)
 */
function getWebhookSecret(): string | null {
  return process.env.ABACATEPAY_WEBHOOK_SECRET || null;
}

// ============================================
// HTTP Client Helpers
// ============================================

interface RequestOptions {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  path: string;
  body?: unknown;
}

/**
 * Make an authenticated request to AbacatePay API
 */
async function request<T>(options: RequestOptions): Promise<GatewayResponse<T>> {
  const { method, path, body } = options;
  const apiKey = getApiKey();

  try {
    const response = await fetch(`${ABACATEPAY_API_URL}${path}`, {
      method,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[AbacatePay] API error:', {
        status: response.status,
        path,
        error: data,
      });
      return {
        data: null,
        error: data.error || data.message || `HTTP ${response.status}`,
      };
    }

    // AbacatePay returns { data, error } format
    if ('data' in data && 'error' in data) {
      return data as GatewayResponse<T>;
    }

    // Some endpoints return data directly
    return { data: data as T, error: null };
  } catch (error) {
    console.error('[AbacatePay] Request failed:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================
// Billing Operations
// ============================================

/**
 * Create a new billing (payment link)
 * 
 * @example
 * ```ts
 * const billing = await createBilling({
 *   frequency: 'ONE_TIME',
 *   methods: ['PIX'],
 *   products: [{
 *     externalId: 'gift-card-123',
 *     name: 'Vale-Presente R$50',
 *     quantity: 1,
 *     price: 5000, // R$50.00 in cents
 *   }],
 *   completionUrl: 'https://mysite.com/success',
 *   returnUrl: 'https://mysite.com/store',
 *   customer: { email: 'customer@email.com' },
 * });
 * ```
 */
export async function createBilling(req: CreateBillingRequest): Promise<Billing> {
  const response = await request<Billing>({
    method: 'POST',
    path: '/billing/create',
    body: {
      frequency: req.frequency,
      methods: req.methods,
      products: req.products.map(p => ({
        externalId: p.externalId,
        name: p.name,
        description: p.description,
        quantity: p.quantity,
        price: p.price,
      })),
      returnUrl: req.returnUrl,
      completionUrl: req.completionUrl,
      // Customer is optional - if not passed, AbacatePay collects info on checkout
      ...(req.customer && {
        customer: {
          email: req.customer.email,
          name: req.customer.name,
          cellphone: req.customer.cellphone,
          taxId: req.customer.taxId,
        },
      }),
      ...(req.customerId && { customerId: req.customerId }),
      externalId: req.externalId,
      metadata: req.metadata,
    },
  });

  if (response.error || !response.data) {
    throw new Error(`Failed to create billing: ${response.error}`);
  }

  return response.data;
}

/**
 * Get a billing by ID
 * 
 * @example
 * ```ts
 * const billing = await getBilling('bill_abc123');
 * if (billing?.status === 'PAID') {
 *   // Process the payment
 * }
 * ```
 */
export async function getBilling(billingId: string): Promise<Billing | null> {
  const response = await request<Billing>({
    method: 'GET',
    path: `/billing/get?id=${encodeURIComponent(billingId)}`,
  });

  return response.data;
}

/**
 * List all billings with optional status filter
 * 
 * @example
 * ```ts
 * const paidBillings = await listBillings({ status: 'PAID' });
 * ```
 */
export async function listBillings(filters?: { status?: BillingStatus }): Promise<Billing[]> {
  let path = '/billing/list';
  if (filters?.status) {
    path += `?status=${encodeURIComponent(filters.status)}`;
  }

  const response = await request<{ billings: Billing[] }>({
    method: 'GET',
    path,
  });

  // Handle different response formats
  if (response.data) {
    if (Array.isArray(response.data)) {
      return response.data;
    }
    if ('billings' in response.data) {
      return response.data.billings;
    }
  }

  return [];
}

// ============================================
// Customer Operations
// ============================================

/**
 * Create a new customer
 * Note: Customers are also created automatically when creating a billing
 */
export async function createCustomer(metadata: {
  email: string;
  name?: string;
  cellphone?: string;
  taxId?: string;
}): Promise<{ id: string; metadata: typeof metadata } | null> {
  const response = await request<{ id: string; metadata: typeof metadata }>({
    method: 'POST',
    path: '/customer/create',
    body: { metadata },
  });

  return response.data;
}

/**
 * List all customers
 */
export async function listCustomers(): Promise<Array<{ id: string; metadata: Record<string, string> }>> {
  const response = await request<{ customers: Array<{ id: string; metadata: Record<string, string> }> }>({
    method: 'GET',
    path: '/customer/list',
  });

  if (response.data) {
    if (Array.isArray(response.data)) {
      return response.data;
    }
    if ('customers' in response.data) {
      return response.data.customers;
    }
  }

  return [];
}

// ============================================
// Webhook Verification
// ============================================

/**
 * Verify webhook signature using HMAC
 * AbacatePay sends signature in X-Webhook-Signature header
 * 
 * @param rawBody - The raw request body as string
 * @param signatureFromHeader - The signature from X-Webhook-Signature header
 * @returns true if signature is valid
 * 
 * @example
 * ```ts
 * const isValid = verifyWebhookSignature(rawBody, req.headers['x-webhook-signature']);
 * if (!isValid) {
 *   return res.status(401).json({ error: 'Invalid signature' });
 * }
 * ```
 */
export function verifyWebhookSignature(rawBody: string, signatureFromHeader: string): boolean {
  try {
    const bodyBuffer = Buffer.from(rawBody, 'utf8');
    const expectedSig = crypto
      .createHmac('sha256', ABACATEPAY_PUBLIC_KEY)
      .update(bodyBuffer)
      .digest('base64');

    const A = Buffer.from(expectedSig);
    const B = Buffer.from(signatureFromHeader);

    return A.length === B.length && crypto.timingSafeEqual(A, B);
  } catch (error) {
    console.error('[AbacatePay] Signature verification failed:', error);
    return false;
  }
}

/**
 * Verify webhook using URL secret (simpler method)
 * The secret is passed as a query parameter in the webhook URL
 * 
 * @param secretFromQuery - The secret from ?webhookSecret= query param
 * @returns true if secret matches
 */
export function verifyWebhookSecret(secretFromQuery: string): boolean {
  const expectedSecret = getWebhookSecret();
  if (!expectedSecret) {
    console.warn('[AbacatePay] ABACATEPAY_WEBHOOK_SECRET not configured');
    return false;
  }
  return secretFromQuery === expectedSecret;
}

/**
 * Parse webhook event from raw body
 * 
 * @example
 * ```ts
 * const event = parseWebhookEvent(rawBody);
 * if (event.event === 'billing.paid') {
 *   const { payment, pixQrCode } = event.data;
 *   // Process payment...
 * }
 * ```
 */
export function parseWebhookEvent(rawBody: string): WebhookEvent {
  return JSON.parse(rawBody) as WebhookEvent;
}

// ============================================
// Payment Gateway Interface Implementation
// ============================================

/**
 * AbacatePay gateway instance implementing PaymentGateway interface
 * Use this for dependency injection and easier testing/swapping
 */
export const abacatePayGateway: PaymentGateway = {
  name: 'AbacatePay',
  createBilling,
  getBilling,
  listBillings,
  verifyWebhookSignature,
  parseWebhookEvent,
};

// ============================================
// Utility Functions
// ============================================

/**
 * Check if we're in dev mode based on API key
 * Dev keys typically start with a specific prefix
 */
export function isDevMode(): boolean {
  const apiKey = process.env.ABACATEPAY_API_KEY || '';
  // AbacatePay dev keys detection (adjust based on actual key format)
  return apiKey.includes('_dev_') || apiKey.includes('_test_') || apiKey.startsWith('sk_test_');
}

/**
 * Format amount from cents to BRL display string
 */
export function formatBRL(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100);
}

/**
 * Build the webhook URL with optional secret
 * 
 * @example
 * ```ts
 * const webhookUrl = buildWebhookUrl('https://mysite.com/api/webhooks/abacatepay');
 * // Returns: https://mysite.com/api/webhooks/abacatepay?webhookSecret=xxx
 * ```
 */
export function buildWebhookUrl(baseUrl: string): string {
  const secret = getWebhookSecret();
  if (secret) {
    const url = new URL(baseUrl);
    url.searchParams.set('webhookSecret', secret);
    return url.toString();
  }
  return baseUrl;
}

// Default export for convenience
export default abacatePayGateway;
