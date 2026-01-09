// ============================================
// Tapresente - Payment Gateway Module
// ============================================
// Central export for payment gateway functionality
//
// Usage:
// ```ts
// import { paymentGateway, createBilling } from '@/lib/payments';
// ```

// Export types
export * from './types';

// Export Mercado Pago client functions
export {
  createMercadoPagoPreference,
  getMercadoPagoPayment,
  verifyMercadoPagoWebhookSignature,
  isMercadoPagoConfigured,
  type MercadoPagoPaymentMethod,
} from './mercadopago';

// Export AbacatePay client functions
export {
  createBilling,
  getBilling,
  listBillings,
  createCustomer,
  listCustomers,
  verifyWebhookSignature,
  verifyWebhookSecret,
  parseWebhookEvent,
  isDevMode,
  formatBRL,
  buildWebhookUrl,
  abacatePayGateway,
} from './abacatepay';

// Export the default gateway
// To swap gateways, change this import
import { abacatePayGateway } from './abacatepay';
export const paymentGateway = abacatePayGateway;

export type PaymentProviderId = 'mercadopago' | 'abacatepay';

export async function createCheckoutSession(params: {
  provider: PaymentProviderId;
  paymentMethod: 'PIX' | 'CARD';
  title: string;
  description?: string;
  amountCents: number;
  giftCardId: string;
  successUrl: string;
  pendingUrl: string;
  failureUrl: string;
  notificationUrl?: string;
}): Promise<{ id: string; url: string; provider: PaymentProviderId }> {
  if (params.provider === 'mercadopago') {
    const { createMercadoPagoPreference } = await import('./mercadopago');
    const preference = await createMercadoPagoPreference({
      title: params.title,
      description: params.description,
      amountCents: params.amountCents,
      giftCardId: params.giftCardId,
      successUrl: params.successUrl,
      pendingUrl: params.pendingUrl,
      failureUrl: params.failureUrl,
      notificationUrl: params.notificationUrl,
      paymentMethod: params.paymentMethod,
    });
    return { id: preference.id, url: preference.url, provider: 'mercadopago' };
  }

  const { createBilling } = await import('./abacatepay');
  const billing = await createBilling({
    frequency: 'ONE_TIME',
    methods: [params.paymentMethod],
    products: [
      {
        externalId: params.giftCardId,
        name: params.title,
        description: params.description,
        quantity: 1,
        price: params.amountCents,
      },
    ],
    completionUrl: params.successUrl,
    returnUrl: params.pendingUrl,
    externalId: params.giftCardId,
    metadata: {
      giftCardId: params.giftCardId,
    },
  });
  return { id: billing.id, url: billing.url, provider: 'abacatepay' };
}
