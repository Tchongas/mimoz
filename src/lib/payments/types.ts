// ============================================
// MIMOZ - Payment Gateway Types
// ============================================
// Abstract types for payment gateway integration
// Designed to be gateway-agnostic for easy swapping

/**
 * Payment methods supported by the gateway
 */
export type PaymentMethod = 'PIX' | 'CARD';

/**
 * Billing frequency types
 */
export type BillingFrequency = 'ONE_TIME' | 'MULTIPLE_PAYMENTS';

/**
 * Billing status from the payment gateway
 */
export type BillingStatus = 'PENDING' | 'EXPIRED' | 'CANCELLED' | 'PAID' | 'REFUNDED';

/**
 * Product item for billing
 */
export interface BillingProduct {
  /** External ID from your system (e.g., gift card template ID) */
  externalId: string;
  /** Product name displayed to customer */
  name: string;
  /** Product description (optional) */
  description?: string;
  /** Quantity of items */
  quantity: number;
  /** Price in cents (BRL) */
  price: number;
}

/**
 * Customer metadata for billing
 */
export interface CustomerMetadata {
  /** Customer email (required) */
  email: string;
  /** Customer name (optional) */
  name?: string;
  /** Customer phone (required by AbacatePay) */
  cellphone: string;
  /** Customer tax ID - CPF or CNPJ (optional) */
  taxId?: string;
}

/**
 * Customer data from the gateway
 */
export interface Customer {
  /** Gateway customer ID */
  id: string;
  /** Customer metadata */
  metadata: CustomerMetadata;
}

/**
 * Request to create a billing/checkout
 */
export interface CreateBillingRequest {
  /** Billing frequency - ONE_TIME for gift cards */
  frequency: BillingFrequency;
  /** Payment methods to accept */
  methods: PaymentMethod[];
  /** Products being purchased */
  products: BillingProduct[];
  /** URL to redirect after payment completion */
  completionUrl: string;
  /** URL to redirect if user clicks "back" */
  returnUrl: string;
  /** Customer data - will be created if doesn't exist */
  customer: CustomerMetadata;
  /** Your external ID for this billing (optional) */
  externalId?: string;
  /** Additional metadata (optional) */
  metadata?: Record<string, unknown>;
}

/**
 * Billing response from the gateway
 */
export interface Billing {
  /** Gateway billing ID */
  id: string;
  /** Billing frequency */
  frequency: BillingFrequency;
  /** Payment URL to redirect customer */
  url: string;
  /** Current billing status */
  status: BillingStatus;
  /** Whether this is a dev/test billing */
  devMode: boolean;
  /** Payment methods available */
  methods: PaymentMethod[];
  /** Products in this billing */
  products: Array<{
    id: string;
    externalId: string;
    quantity: number;
    name?: string;
    price?: number;
  }>;
  /** Customer who made the payment */
  customer: Customer;
  /** Billing metadata */
  metadata: {
    fee?: number;
    returnUrl?: string;
    completionUrl?: string;
  };
  /** Total amount in cents */
  amount?: number;
  /** Created timestamp */
  createdAt: string;
  /** Updated timestamp */
  updatedAt: string;
}

/**
 * Webhook event types
 */
export type WebhookEventType = 'billing.paid' | 'withdraw.done' | 'withdraw.failed';

/**
 * Base webhook event structure
 */
export interface WebhookEvent<T = unknown> {
  /** Event log ID */
  id: string;
  /** Event type */
  event: WebhookEventType;
  /** Whether this is a dev/test event */
  devMode: boolean;
  /** Event data */
  data: T;
}

/**
 * Payment data in billing.paid webhook
 */
export interface BillingPaidPayment {
  /** Amount paid in cents */
  amount: number;
  /** Platform fee in cents */
  fee: number;
  /** Payment method used */
  method: PaymentMethod;
}

/**
 * PIX QR Code data in billing.paid webhook
 */
export interface BillingPaidPixQrCode {
  /** Amount in cents */
  amount: number;
  /** PIX charge ID */
  id: string;
  /** Payment kind */
  kind: 'PIX';
  /** Payment status */
  status: 'PAID';
}

/**
 * billing.paid webhook event data
 */
export interface BillingPaidEventData {
  payment: BillingPaidPayment;
  pixQrCode?: BillingPaidPixQrCode;
  /** The billing object (may be included) */
  billing?: Billing;
}

/**
 * billing.paid webhook event
 */
export type BillingPaidEvent = WebhookEvent<BillingPaidEventData>;

/**
 * Gateway API response wrapper
 * AbacatePay returns { data, error } format
 */
export interface GatewayResponse<T> {
  data: T | null;
  error: string | null;
}

/**
 * Payment gateway interface
 * Implement this interface to add a new payment gateway
 */
export interface PaymentGateway {
  /** Gateway name for logging */
  readonly name: string;
  
  /**
   * Create a new billing/checkout session
   */
  createBilling(request: CreateBillingRequest): Promise<Billing>;
  
  /**
   * Get billing by ID
   */
  getBilling(billingId: string): Promise<Billing | null>;
  
  /**
   * List all billings (with optional filters)
   */
  listBillings(filters?: { status?: BillingStatus }): Promise<Billing[]>;
  
  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(rawBody: string, signature: string): boolean;
  
  /**
   * Parse webhook event
   */
  parseWebhookEvent(rawBody: string): WebhookEvent;
}
