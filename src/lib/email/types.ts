// ============================================
// Tapresente - Email Types
// ============================================

export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface GiftCardEmailData {
  // Gift card info
  code: string;
  amount: number; // in cents
  amountFormatted: string;
  expiresAt: string;
  validDays: number;
  
  // Business info
  businessName: string;
  businessSlug: string;
  
  // Template info
  templateName: string;
  cardColor: string;
  
  // Recipient info
  recipientName: string;
  recipientEmail: string;
  
  // Purchaser info
  purchaserName: string;
  purchaserEmail: string;
  
  // Optional message
  message?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export type EmailTemplate = 
  | 'gift-card-purchased'      // Sent to purchaser
  | 'gift-card-received'       // Sent to recipient (when different from purchaser)
  | 'gift-card-redeemed'       // Sent when gift card is used
  | 'gift-card-expiring';      // Reminder before expiration
