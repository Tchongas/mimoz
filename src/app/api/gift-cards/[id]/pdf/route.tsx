// ============================================
// MIMOZ - Gift Card PDF Download API
// ============================================
// GET /api/gift-cards/[id]/pdf - Generate and download gift card PDF

// Force Node.js runtime - @react-pdf/renderer doesn't work in Edge
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { GiftCardPDF } from '@/lib/pdf';
import { formatCurrency, formatDate } from '@/lib/utils';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  console.log('[PDF] Request received');
  
  try {
    const { id } = await params;
    console.log('[PDF] Gift card ID:', id);
    
    const supabase = await createClient();
    
    // Get gift card with related data
    const { data: giftCard, error } = await supabase
      .from('gift_cards')
      .select(`
        *,
        template:gift_card_templates(
          name,
          card_color
        ),
        business:businesses(
          name,
          slug,
          gift_card_color
        )
      `)
      .eq('id', id)
      .single();
    
    if (error || !giftCard) {
      return NextResponse.json(
        { error: 'Vale-presente não encontrado' },
        { status: 404 }
      );
    }
    
    // Verify access - either the owner or admin can download
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }
    
    // Check if user is owner, purchaser, or admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, business_id, email')
      .eq('id', user.id)
      .single();
    
    const userEmail = profile?.email || user.email;
    const isRecipient = giftCard.recipient_email === userEmail;
    const isPurchaser = giftCard.purchaser_email === userEmail;
    const isAdmin = profile?.role === 'ADMIN';
    const isBusinessOwner = profile?.role === 'BUSINESS_OWNER' && profile?.business_id === giftCard.business_id;
    
    // Security: If purchaser bought for someone else, they should NOT have access to the PDF
    // Only the recipient, admin, or business owner can download
    const isPurchaserButGiftForOther = isPurchaser && giftCard.recipient_email && giftCard.recipient_email !== userEmail;
    
    if (isPurchaserButGiftForOther) {
      return NextResponse.json(
        { error: 'O código do vale-presente está disponível apenas para o destinatário' },
        { status: 403 }
      );
    }
    
    if (!isRecipient && !isPurchaser && !isAdmin && !isBusinessOwner) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      );
    }
    
    // Prepare PDF data
    // For custom cards, use custom colors; otherwise use template/business colors
    const cardColor = giftCard.is_custom 
      ? (giftCard.custom_bg_color || giftCard.business?.gift_card_color || '#1e3a5f')
      : (giftCard.template?.card_color || giftCard.business?.gift_card_color || '#1e3a5f');
    
    const pdfData = {
      code: giftCard.code,
      amount: giftCard.amount_cents,
      amountFormatted: formatCurrency(giftCard.amount_cents),
      expiresAt: formatDate(giftCard.expires_at),
      businessName: giftCard.business?.name || 'Mimoz',
      businessSlug: giftCard.business?.slug || '',
      templateName: giftCard.template?.name || 'Vale-Presente',
      cardColor,
      recipientName: giftCard.recipient_name,
      purchaserName: giftCard.purchaser_name,
      message: giftCard.recipient_message,
      // Custom card fields
      isCustom: giftCard.is_custom || false,
      customTitle: giftCard.custom_title,
      customEmoji: giftCard.custom_emoji,
      customBgType: giftCard.custom_bg_type,
      customBgGradientStart: giftCard.custom_bg_gradient_start,
      customBgGradientEnd: giftCard.custom_bg_gradient_end,
      customTextColor: giftCard.custom_text_color,
    };
    
    // Generate PDF
    console.log('[PDF] Generating PDF for:', pdfData.code);
    
    const pdfBuffer = await renderToBuffer(
      <GiftCardPDF data={pdfData} />
    );
    
    console.log('[PDF] PDF generated, size:', pdfBuffer.length, 'bytes');
    
    // Return PDF as download
    const filename = `vale-presente-${giftCard.code}.pdf`;
    
    // Convert Buffer to Uint8Array for NextResponse compatibility
    const uint8Array = new Uint8Array(pdfBuffer);
    
    return new NextResponse(uint8Array, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (error) {
    console.error('[PDF] Generation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : '';
    console.error('[PDF] Error details:', errorMessage);
    console.error('[PDF] Stack:', errorStack);
    
    return NextResponse.json(
      { error: 'Erro ao gerar PDF', details: errorMessage },
      { status: 500 }
    );
  }
}
