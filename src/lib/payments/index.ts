// ============================================
// Tapresente - Payment Module
// ============================================
// Central exports for payment functionality

export {
  isMercadoPagoConfigured,
  createPreference,
  getPayment,
  isPaymentApproved,
  isPaymentPending,
  isPaymentRejected,
  parseWebhookHeaders,
  parseWebhookBody,
  type CreatePreferenceParams,
  type PreferenceResponse,
  type PaymentInfo,
  type WebhookNotification,
} from './mercadopago';
