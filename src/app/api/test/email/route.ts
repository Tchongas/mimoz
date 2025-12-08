// ============================================
// MIMOZ - Test Email API (Development Only)
// ============================================
// GET /api/test/email - Test email sending

import { NextResponse } from 'next/server';
import { sendGiftCardPurchasedEmail } from '@/lib/email';

export async function GET() {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }
  
  const testData = {
    code: 'TEST-1234-5678',
    amount: 10000, // R$ 100,00
    amountFormatted: 'R$ 100,00',
    expiresAt: '31 de dezembro de 2025',
    validDays: 365,
    businessName: 'Café Teste',
    businessSlug: 'cafe-teste',
    templateName: 'Vale-Presente Padrão',
    cardColor: '#1e3a5f',
    recipientName: 'Destinatário Teste',
    recipientEmail: 'test@example.com', // This will be replaced
    purchaserName: 'Comprador Teste',
    purchaserEmail: 'test@example.com', // This will be replaced
  };
  
  console.log('[Test Email] Starting test...');
  console.log('[Test Email] API Key present:', !!process.env.RESEND_API_KEY);
  console.log('[Test Email] From Email:', process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev');
  
  const result = await sendGiftCardPurchasedEmail(testData);
  
  console.log('[Test Email] Result:', result);
  
  return NextResponse.json({
    success: result.success,
    messageId: result.messageId,
    error: result.error,
    config: {
      apiKeyPresent: !!process.env.RESEND_API_KEY,
      fromEmail: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev (test)',
    }
  });
}
