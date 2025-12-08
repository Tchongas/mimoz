// ============================================
// MIMOZ - Test PDF API (Development Only)
// ============================================
// GET /api/test/pdf - Test PDF generation

import { NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { GiftCardPDF } from '@/lib/pdf';

export async function GET() {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }
  
  const testData = {
    code: 'TEST-1234-5678',
    amount: 10000, // R$ 100,00
    amountFormatted: 'R$ 100,00',
    expiresAt: '31/12/2025',
    businessName: 'Café Teste',
    businessSlug: 'cafe-teste',
    templateName: 'Vale-Presente Padrão',
    cardColor: '#1e3a5f',
    recipientName: 'Destinatário Teste',
    purchaserName: 'Comprador Teste',
    message: 'Feliz aniversário! Aproveite seu presente.',
  };
  
  console.log('[Test PDF] Starting test...');
  
  try {
    const pdfBuffer = await renderToBuffer(
      <GiftCardPDF data={testData} />
    );
    
    console.log('[Test PDF] Generated successfully, size:', pdfBuffer.length, 'bytes');
    
    const uint8Array = new Uint8Array(pdfBuffer);
    
    return new NextResponse(uint8Array, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="test-gift-card.pdf"',
      },
    });
  } catch (error) {
    console.error('[Test PDF] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({
      success: false,
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}
