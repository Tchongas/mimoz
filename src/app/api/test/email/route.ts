// ============================================
// MIMOZ - Test Email API (Development Only)
// ============================================
// GET /api/test/email - Test if Resend is configured correctly
// POST /api/test/email - Send a test email

import { NextRequest, NextResponse } from 'next/server';

const RESEND_API_URL = 'https://api.resend.com/emails';

export async function GET() {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  
  return NextResponse.json({
    configured: !!apiKey,
    apiKeyPrefix: apiKey ? `${apiKey.substring(0, 8)}...` : null,
    fromEmail: fromEmail || 'onboarding@resend.dev (default)',
    note: apiKey 
      ? 'Resend is configured. POST to this endpoint with { "to": "your@email.com" } to send a test email.'
      : 'RESEND_API_KEY is not set. Add it to your .env.local file.',
  });
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json(
      { error: 'RESEND_API_KEY not configured' },
      { status: 500 }
    );
  }
  
  try {
    const body = await request.json();
    const toEmail = body.to;
    
    if (!toEmail) {
      return NextResponse.json(
        { error: 'Missing "to" email address in request body' },
        { status: 400 }
      );
    }
    
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    
    console.log('[TestEmail] Sending test email to:', toEmail);
    
    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `Mimoz Test <${fromEmail}>`,
        to: toEmail,
        subject: '✅ Teste de Email - Mimoz',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #1e3a5f;">🎉 Email funcionando!</h1>
            <p>Este é um email de teste do sistema Mimoz.</p>
            <p>Se você está vendo isso, significa que o Resend está configurado corretamente.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="color: #666; font-size: 12px;">
              Enviado em: ${new Date().toLocaleString('pt-BR')}<br/>
              From: ${fromEmail}
            </p>
          </div>
        `,
      }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('[TestEmail] Resend error:', data);
      return NextResponse.json({
        success: false,
        error: data.message || data.error?.message || 'Failed to send',
        details: data,
      }, { status: response.status });
    }
    
    console.log('[TestEmail] Email sent successfully:', data.id);
    
    return NextResponse.json({
      success: true,
      messageId: data.id,
      to: toEmail,
      from: fromEmail,
    });
    
  } catch (error) {
    console.error('[TestEmail] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
