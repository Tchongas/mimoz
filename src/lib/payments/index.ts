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
