// ============================================
// MIMOZ - Audit Log Service
// ============================================
// Centralized service for creating audit logs

import { createClient } from '@/lib/supabase/server';
import type { PaymentEventType, RedemptionEventType, PaymentMethod } from '@/types';

interface CreatePaymentLogParams {
  giftCardId: string;
  businessId: string;
  userId?: string | null;
  eventType: PaymentEventType;
  paymentMethod?: PaymentMethod | null;
  paymentProviderId?: string | null;
  amountCents?: number | null;
  feeCents?: number | null;
  previousStatus?: string | null;
  newStatus?: string | null;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
}

interface CreateRedemptionLogParams {
  redemptionId?: string | null;
  giftCardId: string;
  businessId: string;
  cashierId: string;
  amountCents: number;
  balanceBefore: number;
  balanceAfter: number;
  cardOwnerName?: string | null;
  cardOwnerEmail?: string | null;
  eventType: RedemptionEventType;
  notes?: string | null;
  metadata?: Record<string, unknown>;
}

/**
 * Create a payment audit log entry
 */
export async function createPaymentAuditLog(params: CreatePaymentLogParams): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('payment_audit_logs')
    .insert({
      gift_card_id: params.giftCardId,
      business_id: params.businessId,
      user_id: params.userId || null,
      event_type: params.eventType,
      payment_method: params.paymentMethod || null,
      payment_provider_id: params.paymentProviderId || null,
      amount_cents: params.amountCents || null,
      fee_cents: params.feeCents || null,
      previous_status: params.previousStatus || null,
      new_status: params.newStatus || null,
      metadata: params.metadata || {},
      ip_address: params.ipAddress || null,
      user_agent: params.userAgent || null,
    });

  if (error) {
    console.error('[AuditLog] Failed to create payment audit log:', error);
    // Don't throw - audit logs should not break the main flow
  }
}

/**
 * Create a redemption audit log entry
 */
export async function createRedemptionAuditLog(params: CreateRedemptionLogParams): Promise<void> {
  const supabase = await createClient();

  // Determine event type based on balance
  let eventType = params.eventType;
  if (eventType === 'REDEMPTION') {
    eventType = params.balanceAfter === 0 ? 'FULL_REDEMPTION' : 'PARTIAL_REDEMPTION';
  }

  const { error } = await supabase
    .from('redemption_audit_logs')
    .insert({
      redemption_id: params.redemptionId || null,
      gift_card_id: params.giftCardId,
      business_id: params.businessId,
      cashier_id: params.cashierId,
      amount_cents: params.amountCents,
      balance_before: params.balanceBefore,
      balance_after: params.balanceAfter,
      card_owner_name: params.cardOwnerName || null,
      card_owner_email: params.cardOwnerEmail || null,
      event_type: eventType,
      notes: params.notes || null,
      metadata: params.metadata || {},
    });

  if (error) {
    console.error('[AuditLog] Failed to create redemption audit log:', error);
    // Don't throw - audit logs should not break the main flow
  }
}

/**
 * Get payment audit logs for a gift card
 */
export async function getPaymentAuditLogs(giftCardId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('payment_audit_logs')
    .select('*')
    .eq('gift_card_id', giftCardId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[AuditLog] Failed to get payment audit logs:', error);
    return [];
  }

  return data || [];
}

/**
 * Get redemption audit logs for a business
 */
export async function getRedemptionAuditLogs(businessId: string, options?: {
  limit?: number;
  offset?: number;
  cashierId?: string;
  startDate?: string;
  endDate?: string;
}) {
  const supabase = await createClient();

  let query = supabase
    .from('redemption_audit_logs')
    .select(`
      *,
      gift_cards!inner(code, recipient_name),
      profiles!redemption_audit_logs_cashier_id_fkey(full_name, email)
    `)
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });

  if (options?.cashierId) {
    query = query.eq('cashier_id', options.cashierId);
  }

  if (options?.startDate) {
    query = query.gte('created_at', options.startDate);
  }

  if (options?.endDate) {
    query = query.lte('created_at', options.endDate);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[AuditLog] Failed to get redemption audit logs:', error);
    return [];
  }

  return data || [];
}
