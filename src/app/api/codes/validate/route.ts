// ============================================
// Tapresente - Code Validation API
// ============================================
// POST /api/codes/validate - Lookup a gift card code and return details

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSessionUser } from '@/lib/auth';
import { hasPermission, canAccessBusiness, PERMISSIONS } from '@/lib/rbac';
import { z } from 'zod';

// Validation schema
const validateCodeSchema = z.object({
  code: z.string().min(1, 'Código é obrigatório'),
  businessId: z.string().uuid('ID de empresa inválido'),
});

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Check if user has permission to validate codes
    if (!hasPermission(user, PERMISSIONS.CODES_VALIDATE)) {
      return NextResponse.json(
        { error: 'Sem permissão para validar códigos' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = validateCodeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { code, businessId } = validation.data;

    // Verify user can access this business
    if (!canAccessBusiness(user, businessId)) {
      return NextResponse.json(
        { error: 'Sem acesso a esta empresa' },
        { status: 403 }
      );
    }

    const supabase = await createClient();

    // Look up the gift card
    const { data: giftCard, error: lookupError } = await supabase
      .from('gift_cards')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('business_id', businessId)
      .single();

    if (lookupError || !giftCard) {
      return NextResponse.json(
        { error: 'Código não encontrado', valid: false },
        { status: 404 }
      );
    }

    // Check status - only ACTIVE cards can be redeemed
    if (giftCard.status === 'REDEEMED') {
      return NextResponse.json({
        valid: false,
        error: 'Este vale-presente já foi totalmente utilizado',
        giftCard: {
          code: giftCard.code,
          status: giftCard.status,
          amount_cents: giftCard.amount_cents,
          balance_cents: 0,
        },
      });
    }

    if (giftCard.status === 'EXPIRED' || new Date(giftCard.expires_at) < new Date()) {
      return NextResponse.json({
        valid: false,
        error: 'Este vale-presente expirou',
        giftCard: {
          code: giftCard.code,
          status: 'EXPIRED',
          expires_at: giftCard.expires_at,
        },
      });
    }

    if (giftCard.status === 'CANCELLED') {
      return NextResponse.json({
        valid: false,
        error: 'Este vale-presente foi cancelado',
        giftCard: {
          code: giftCard.code,
          status: giftCard.status,
        },
      });
    }
    
    // Final check - must be ACTIVE
    if (giftCard.status !== 'ACTIVE') {
      return NextResponse.json({
        valid: false,
        error: `Vale-presente não está ativo (status: ${giftCard.status})`,
        giftCard: {
          code: giftCard.code,
          status: giftCard.status,
        },
      });
    }

    // Log the validation lookup
    await supabase
      .from('code_validations')
      .insert({
        code: code.toUpperCase(),
        business_id: businessId,
        cashier_id: user.id,
        gift_card_id: giftCard.id,
      });

    return NextResponse.json({
      valid: true,
      message: 'Código válido',
      giftCard: {
        id: giftCard.id,
        code: giftCard.code,
        status: giftCard.status,
        payment_status: giftCard.payment_status,
        amount_cents: giftCard.amount_cents,
        original_amount_cents: giftCard.original_amount_cents,
        balance_cents: giftCard.balance_cents,
        recipient_name: giftCard.recipient_name,
        recipient_email: giftCard.recipient_email,
        purchaser_name: giftCard.purchaser_name,
        expires_at: giftCard.expires_at,
      },
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// GET /api/codes/validate - Get validation history
export async function GET(request: Request) {
  try {
    const user = await getSessionUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    if (!hasPermission(user, PERMISSIONS.CODES_READ)) {
      return NextResponse.json(
        { error: 'Sem permissão para ver validações' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');
    const limit = parseInt(searchParams.get('limit') || '50');

    const supabase = await createClient();
    let query = supabase
      .from('code_validations')
      .select(`
        *,
        cashier:profiles(id, full_name, email)
      `)
      .order('validated_at', { ascending: false })
      .limit(limit);

    // Filter by business if provided and user has access
    if (businessId) {
      if (!canAccessBusiness(user, businessId)) {
        return NextResponse.json(
          { error: 'Sem acesso a esta empresa' },
          { status: 403 }
        );
      }
      query = query.eq('business_id', businessId);
    } else if (user.businessId) {
      // Default to user's business
      query = query.eq('business_id', user.businessId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching validations:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar validações' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
