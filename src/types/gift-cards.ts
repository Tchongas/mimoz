// ============================================
// MIMOZ - Gift Card Types
// ============================================

export type GiftCardStatus = 'PENDING' | 'ACTIVE' | 'REDEEMED' | 'EXPIRED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
export type PaymentMethod = 'PIX' | 'CARD';
export type CustomBgType = 'color' | 'gradient' | 'image';

export interface GiftCard {
  id: string;
  business_id: string;
  template_id: string | null;
  code: string;
  amount_cents: number;
  original_amount_cents: number;
  balance_cents: number;
  status: GiftCardStatus;
  payment_status: PaymentStatus;
  payment_provider_id: string | null;
  payment_method: PaymentMethod | null;
  payment_fee_cents: number | null;
  payment_completed_at: string | null;
  activated_at: string | null;
  purchaser_user_id: string | null;
  purchaser_email: string;
  purchaser_name: string | null;
  recipient_email: string | null;
  recipient_name: string | null;
  recipient_message: string | null;
  purchased_at: string;
  expires_at: string;
  redeemed_at: string | null;
  // Custom card fields
  is_custom: boolean;
  custom_title: string | null;
  custom_bg_type: CustomBgType | null;
  custom_bg_color: string | null;
  custom_bg_gradient_start: string | null;
  custom_bg_gradient_end: string | null;
  custom_bg_image_url: string | null;
  custom_text_color: string | null;
}

export interface GiftCardTemplate {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  amount_cents: number;
  image_url: string | null;
  card_color: string | null;
  is_active: boolean;
  valid_days: number;
  created_at: string;
  updated_at: string;
}

export interface GiftCardWithBusiness extends GiftCard {
  business: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface GiftCardWithTemplate extends GiftCard {
  gift_card_templates: GiftCardTemplate | null;
}

// Redemption types
export interface Redemption {
  id: string;
  gift_card_id: string;
  business_id: string;
  cashier_id: string;
  amount_cents: number;
  balance_before: number;
  balance_after: number;
  notes: string | null;
  redeemed_at: string;
}

export interface RedemptionWithCashier extends Redemption {
  cashier: {
    id: string;
    full_name: string | null;
    email: string;
  };
}

export interface RedemptionWithGiftCard extends Redemption {
  gift_card: GiftCard;
}

// Audit log types
export type PaymentEventType = 
  | 'PAYMENT_INITIATED'
  | 'PAYMENT_PENDING'
  | 'PAYMENT_COMPLETED'
  | 'PAYMENT_FAILED'
  | 'PAYMENT_REFUNDED'
  | 'CARD_ACTIVATED'
  | 'CARD_EXPIRED'
  | 'CARD_CANCELLED';

export type RedemptionEventType = 
  | 'REDEMPTION'
  | 'PARTIAL_REDEMPTION'
  | 'FULL_REDEMPTION'
  | 'REDEMPTION_REVERSED';

export interface PaymentAuditLog {
  id: string;
  gift_card_id: string;
  business_id: string;
  user_id: string | null;
  event_type: PaymentEventType;
  payment_method: PaymentMethod | null;
  payment_provider: string;
  payment_provider_id: string | null;
  amount_cents: number | null;
  fee_cents: number | null;
  previous_status: string | null;
  new_status: string | null;
  metadata: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface RedemptionAuditLog {
  id: string;
  redemption_id: string | null;
  gift_card_id: string;
  business_id: string;
  cashier_id: string;
  amount_cents: number;
  balance_before: number;
  balance_after: number;
  card_owner_name: string | null;
  card_owner_email: string | null;
  event_type: RedemptionEventType;
  notes: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

// API Response types
export interface ValidateCodeResponse {
  valid: boolean;
  error?: string;
  message?: string;
  giftCard?: {
    id: string;
    code: string;
    status: GiftCardStatus;
    payment_status?: PaymentStatus;
    amount_cents: number;
    original_amount_cents?: number;
    balance_cents: number;
    recipient_name: string | null;
    recipient_email: string | null;
    purchaser_name: string | null;
    expires_at: string;
  };
}

export interface RedeemResponse {
  success: boolean;
  error?: string;
  message?: string;
  redemption?: {
    id: string;
    amount_cents: number;
    balance_before: number;
    balance_after: number;
    new_status: GiftCardStatus;
  };
}

export interface CheckoutResponse {
  success: boolean;
  error?: string;
  checkoutUrl?: string;
  paymentPageUrl?: string;
  giftCardId?: string;
  giftCardCode?: string;
  billingId?: string;
  devMode?: boolean;
}

// ============================================
// Custom Gift Card Types
// ============================================

export interface CardBackground {
  id: string;
  name: string;
  type: CustomBgType;
  color: string | null;
  gradient_start: string | null;
  gradient_end: string | null;
  gradient_direction: string | null;
  image_url: string | null;
  text_color: string;
  category?: string;
  is_active: boolean;
  sort_order: number;
}

export interface CustomCardSettings {
  enabled: boolean;
  min_amount_cents: number;
  max_amount_cents: number;
  preset_amounts: number[];
  allow_custom_amount: boolean;
  section_title: string;
  section_subtitle: string;
}

export interface CustomCardData {
  amount_cents: number;
  title: string;
  message: string;
  bg_type: CustomBgType;
  bg_color: string | null;
  bg_gradient_start: string | null;
  bg_gradient_end: string | null;
  bg_image_url: string | null;
  text_color: string;
  recipient_name: string;
  recipient_email: string;
}
