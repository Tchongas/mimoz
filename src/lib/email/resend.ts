// ============================================
// Tapresente - Resend Email Client
// ============================================
// Email sending using Resend API

import type { SendEmailResult, GiftCardEmailData } from './types';
import {
  giftCardPurchasedEmail,
  giftCardPurchasedText,
  giftCardReceivedEmail,
  giftCardReceivedText,
  giftCardRedeemedEmail,
} from './templates';

const RESEND_API_URL = 'https://api.resend.com/emails';

interface ResendEmailPayload {
  from: string;
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  reply_to?: string;
}

// ============================================
// SEND EMAIL VIA RESEND
// ============================================
async function sendEmail(payload: ResendEmailPayload): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  
  if (!apiKey) {
    console.warn('[Email] RESEND_API_KEY not configured, skipping email');
    return { success: false, error: 'Email not configured' };
  }
  
  console.log('[Email] Sending email to:', payload.to);
  console.log('[Email] From:', payload.from);
  console.log('[Email] Subject:', payload.subject);
  
  try {
    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('[Email] Resend API error:', JSON.stringify(data, null, 2));
      console.error('[Email] Response status:', response.status);
      return { 
        success: false, 
        error: data.message || data.error?.message || 'Failed to send email' 
      };
    }
    
    console.log('[Email] Sent successfully:', data.id);
    return { success: true, messageId: data.id };
  } catch (error) {
    console.error('[Email] Send error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// ============================================
// GET SENDER ADDRESS
// ============================================
function getSenderAddress(businessName: string): string {
  // Use configured sender or Resend's test domain for development
  // IMPORTANT: For production, you MUST verify your domain in Resend dashboard
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  
  if (fromEmail) {
    // Custom verified domain configured
    return `${businessName} via Tapresente <${fromEmail}>`;
  }
  
  // Use Resend's test domain (works without domain verification)
  // This only delivers to the email address of the Resend account owner
  return `Tapresente <onboarding@resend.dev>`;
}

// ============================================
// SEND GIFT CARD PURCHASED EMAIL
// ============================================
export async function sendGiftCardPurchasedEmail(
  data: GiftCardEmailData
): Promise<SendEmailResult> {
  return sendEmail({
    from: getSenderAddress(data.businessName),
    to: data.purchaserEmail,
    subject: `✅ Compra confirmada - Vale-presente ${data.businessName}`,
    html: giftCardPurchasedEmail(data),
    text: giftCardPurchasedText(data),
  });
}

// ============================================
// SEND GIFT CARD RECEIVED EMAIL
// ============================================
export async function sendGiftCardReceivedEmail(
  data: GiftCardEmailData
): Promise<SendEmailResult> {
  return sendEmail({
    from: getSenderAddress(data.businessName),
    to: data.recipientEmail,
    subject: `🎁 ${data.purchaserName} enviou um presente para você!`,
    html: giftCardReceivedEmail(data),
    text: giftCardReceivedText(data),
  });
}

// ============================================
// SEND GIFT CARD REDEEMED EMAIL
// ============================================
export async function sendGiftCardRedeemedEmail(
  data: GiftCardEmailData & {
    redeemedAmount: number;
    redeemedAmountFormatted: string;
    remainingBalance: number;
    remainingBalanceFormatted: string;
  }
): Promise<SendEmailResult> {
  const hasBalance = data.remainingBalance > 0;
  const subject = hasBalance
    ? `💳 Vale-presente usado - Saldo: ${data.remainingBalanceFormatted}`
    : `💳 Vale-presente utilizado - ${data.businessName}`;
  
  return sendEmail({
    from: getSenderAddress(data.businessName),
    to: data.recipientEmail,
    subject,
    html: giftCardRedeemedEmail(data),
  });
}

// ============================================
// SEND BOTH EMAILS (PURCHASER + RECIPIENT)
// ============================================
export async function sendGiftCardEmails(
  data: GiftCardEmailData
): Promise<{ purchaser: SendEmailResult; recipient?: SendEmailResult }> {
  // Always send to purchaser
  const purchaserResult = await sendGiftCardPurchasedEmail(data);
  
  // If recipient is different, send them the "received" email
  const isGift = data.recipientEmail.toLowerCase() !== data.purchaserEmail.toLowerCase();
  
  if (isGift) {
    const recipientResult = await sendGiftCardReceivedEmail(data);
    return { purchaser: purchaserResult, recipient: recipientResult };
  }
  
  return { purchaser: purchaserResult };
}
