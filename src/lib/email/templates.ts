// ============================================
// MIMOZ - Email Templates
// ============================================
// HTML email templates for gift card notifications

import type { GiftCardEmailData } from './types';

// Base styles for emails
const baseStyles = `
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
  .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
  .card { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
  .header { padding: 32px; text-align: center; }
  .content { padding: 32px; }
  .footer { padding: 24px 32px; background: #f1f5f9; text-align: center; font-size: 12px; color: #64748b; }
  h1 { margin: 0 0 8px; font-size: 24px; color: #0f172a; }
  h2 { margin: 0 0 16px; font-size: 20px; color: #0f172a; }
  p { margin: 0 0 16px; color: #475569; line-height: 1.6; }
  .gift-card { border-radius: 12px; padding: 32px; color: white; text-align: center; margin: 24px 0; position: relative; overflow: hidden; }
  .gift-card::before { content: ''; position: absolute; top: -20px; right: -20px; width: 100px; height: 100px; background: rgba(255,255,255,0.1); border-radius: 50%; }
  .gift-card::after { content: ''; position: absolute; bottom: -15px; left: -15px; width: 60px; height: 60px; background: rgba(255,255,255,0.1); border-radius: 50%; }
  .gift-card-label { font-size: 12px; opacity: 0.7; text-transform: uppercase; letter-spacing: 1px; }
  .gift-card-amount { font-size: 48px; font-weight: bold; margin: 16px 0; }
  .gift-card-code { background: rgba(255,255,255,0.2); padding: 12px 24px; border-radius: 8px; font-family: monospace; font-size: 24px; letter-spacing: 2px; display: inline-block; margin-top: 16px; }
  .message-box { background: #f8fafc; border-left: 4px solid; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0; }
  .message-box p { margin: 0; font-style: italic; }
  .info-grid { display: grid; gap: 16px; margin: 24px 0; }
  .info-item { background: #f8fafc; padding: 16px; border-radius: 8px; }
  .info-label { font-size: 12px; color: #64748b; margin-bottom: 4px; }
  .info-value { font-weight: 600; color: #0f172a; }
  .button { display: inline-block; padding: 14px 28px; background: #0f172a; color: white !important; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 16px; }
  .divider { height: 1px; background: #e2e8f0; margin: 24px 0; }
`;

// ============================================
// GIFT CARD PURCHASED - Sent to purchaser
// ============================================
export function giftCardPurchasedEmail(data: GiftCardEmailData): string {
  const isGift = data.recipientEmail !== data.purchaserEmail;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Compra Confirmada - ${data.businessName}</title>
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header" style="background: ${data.cardColor}; color: white;">
        <h1>🎉 Compra Confirmada!</h1>
        <p style="color: rgba(255,255,255,0.8); margin: 0;">Seu vale-presente está pronto</p>
      </div>
      
      <div class="content">
        <p>Olá <strong>${data.purchaserName}</strong>,</p>
        <p>Sua compra foi realizada com sucesso! ${isGift ? `O vale-presente será enviado para <strong>${data.recipientName}</strong>.` : 'Confira os detalhes abaixo:'}</p>
        
        <div class="gift-card" style="background: ${data.cardColor};">
          <div class="gift-card-label">Vale-Presente ${data.businessName}</div>
          <div class="gift-card-amount">${data.amountFormatted}</div>
          <div class="gift-card-code">${data.code}</div>
        </div>
        
        ${data.message ? `
        <div class="message-box" style="border-color: ${data.cardColor};">
          <p>"${data.message}"</p>
        </div>
        ` : ''}
        
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Destinatário</div>
            <div class="info-value">${data.recipientName} (${data.recipientEmail})</div>
          </div>
          <div class="info-item">
            <div class="info-label">Válido até</div>
            <div class="info-value">${data.expiresAt}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Estabelecimento</div>
            <div class="info-value">${data.businessName}</div>
          </div>
        </div>
        
        <div class="divider"></div>
        
        <h2>Como usar</h2>
        <p>1. Apresente o código <strong>${data.code}</strong> no caixa</p>
        <p>2. O operador irá validar e aplicar o desconto</p>
        <p>3. Se sobrar saldo, ele fica disponível para próximas compras</p>
        
        <center>
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://mimoz.com.br'}/account" class="button">
            Ver meus vale-presentes
          </a>
        </center>
      </div>
      
      <div class="footer">
        <p>Este email foi enviado por ${data.businessName} através da plataforma Mimoz.</p>
        <p>© ${new Date().getFullYear()} Mimoz - Plataforma de Vale-Presentes</p>
      </div>
    </div>
  </div>
</body>
</html>
`;
}

// ============================================
// GIFT CARD RECEIVED - Sent to recipient
// ============================================
export function giftCardReceivedEmail(data: GiftCardEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Você recebeu um presente! - ${data.businessName}</title>
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header" style="background: ${data.cardColor}; color: white;">
        <h1>🎁 Você recebeu um presente!</h1>
        <p style="color: rgba(255,255,255,0.8); margin: 0;">${data.purchaserName} enviou um vale-presente para você</p>
      </div>
      
      <div class="content">
        <p>Olá <strong>${data.recipientName}</strong>,</p>
        <p><strong>${data.purchaserName}</strong> enviou um vale-presente de <strong>${data.businessName}</strong> para você!</p>
        
        <div class="gift-card" style="background: ${data.cardColor};">
          <div class="gift-card-label">Vale-Presente ${data.businessName}</div>
          <div class="gift-card-amount">${data.amountFormatted}</div>
          <div class="gift-card-code">${data.code}</div>
        </div>
        
        ${data.message ? `
        <div class="message-box" style="border-color: ${data.cardColor};">
          <p style="color: ${data.cardColor};">"${data.message}"</p>
          <p style="font-size: 12px; color: #64748b; margin-top: 8px; font-style: normal;">— ${data.purchaserName}</p>
        </div>
        ` : ''}
        
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Valor</div>
            <div class="info-value">${data.amountFormatted}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Válido até</div>
            <div class="info-value">${data.expiresAt}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Onde usar</div>
            <div class="info-value">${data.businessName}</div>
          </div>
        </div>
        
        <div class="divider"></div>
        
        <h2>Como usar seu vale-presente</h2>
        <p>1. Vá até qualquer unidade <strong>${data.businessName}</strong></p>
        <p>2. Apresente o código <strong>${data.code}</strong> no caixa</p>
        <p>3. O valor será descontado da sua compra</p>
        <p>4. Se sobrar saldo, ele fica disponível para próximas compras</p>
        
        <center>
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://mimoz.com.br'}/store/${data.businessSlug}" class="button" style="background: ${data.cardColor};">
            Ver loja ${data.businessName}
          </a>
        </center>
      </div>
      
      <div class="footer">
        <p>Este vale-presente foi enviado por ${data.purchaserName} através de ${data.businessName}.</p>
        <p>© ${new Date().getFullYear()} Mimoz - Plataforma de Vale-Presentes</p>
      </div>
    </div>
  </div>
</body>
</html>
`;
}

// ============================================
// GIFT CARD REDEEMED - Sent when used
// ============================================
export function giftCardRedeemedEmail(data: GiftCardEmailData & { 
  redeemedAmount: number;
  redeemedAmountFormatted: string;
  remainingBalance: number;
  remainingBalanceFormatted: string;
}): string {
  const hasBalance = data.remainingBalance > 0;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vale-presente utilizado - ${data.businessName}</title>
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header" style="background: ${data.cardColor}; color: white;">
        <h1>✅ Vale-presente utilizado</h1>
        <p style="color: rgba(255,255,255,0.8); margin: 0;">Seu vale-presente foi usado em ${data.businessName}</p>
      </div>
      
      <div class="content">
        <p>Olá <strong>${data.recipientName}</strong>,</p>
        <p>Seu vale-presente foi utilizado com sucesso!</p>
        
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Valor utilizado</div>
            <div class="info-value" style="color: #dc2626;">${data.redeemedAmountFormatted}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Saldo restante</div>
            <div class="info-value" style="color: ${hasBalance ? '#16a34a' : '#64748b'};">
              ${hasBalance ? data.remainingBalanceFormatted : 'Esgotado'}
            </div>
          </div>
          <div class="info-item">
            <div class="info-label">Código</div>
            <div class="info-value" style="font-family: monospace;">${data.code}</div>
          </div>
        </div>
        
        ${hasBalance ? `
        <div class="message-box" style="border-color: #16a34a; background: #f0fdf4;">
          <p style="color: #166534; font-style: normal;">
            💰 Você ainda tem <strong>${data.remainingBalanceFormatted}</strong> de saldo disponível!
          </p>
        </div>
        ` : ''}
        
        <center>
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://mimoz.com.br'}/account" class="button">
            Ver meus vale-presentes
          </a>
        </center>
      </div>
      
      <div class="footer">
        <p>Transação realizada em ${data.businessName}.</p>
        <p>© ${new Date().getFullYear()} Mimoz - Plataforma de Vale-Presentes</p>
      </div>
    </div>
  </div>
</body>
</html>
`;
}

// ============================================
// Plain text versions for email clients that don't support HTML
// ============================================
export function giftCardPurchasedText(data: GiftCardEmailData): string {
  const isGift = data.recipientEmail !== data.purchaserEmail;
  
  return `
🎉 COMPRA CONFIRMADA - ${data.businessName}

Olá ${data.purchaserName},

Sua compra foi realizada com sucesso!${isGift ? ` O vale-presente será enviado para ${data.recipientName}.` : ''}

═══════════════════════════════════
VALE-PRESENTE: ${data.amountFormatted}
CÓDIGO: ${data.code}
═══════════════════════════════════

${data.message ? `Mensagem: "${data.message}"\n` : ''}
Destinatário: ${data.recipientName} (${data.recipientEmail})
Válido até: ${data.expiresAt}
Estabelecimento: ${data.businessName}

COMO USAR:
1. Apresente o código ${data.code} no caixa
2. O operador irá validar e aplicar o desconto
3. Se sobrar saldo, ele fica disponível para próximas compras

---
Este email foi enviado por ${data.businessName} através da plataforma Mimoz.
`;
}

export function giftCardReceivedText(data: GiftCardEmailData): string {
  return `
🎁 VOCÊ RECEBEU UM PRESENTE!

Olá ${data.recipientName},

${data.purchaserName} enviou um vale-presente de ${data.businessName} para você!

═══════════════════════════════════
VALE-PRESENTE: ${data.amountFormatted}
CÓDIGO: ${data.code}
═══════════════════════════════════

${data.message ? `Mensagem de ${data.purchaserName}:\n"${data.message}"\n` : ''}
Válido até: ${data.expiresAt}
Onde usar: ${data.businessName}

COMO USAR:
1. Vá até qualquer unidade ${data.businessName}
2. Apresente o código ${data.code} no caixa
3. O valor será descontado da sua compra

---
Este vale-presente foi enviado por ${data.purchaserName} através de ${data.businessName}.
`;
}
