// ============================================
// MIMOZ - Code Validation API
// ============================================
// POST /api/codes/validate - Validate a gift card code

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

    // Check if code was already validated (optional - depends on business logic)
    // For now, we allow multiple validations of the same code
    // Uncomment below to prevent duplicate validations:
    /*
    const { data: existing } = await supabase
      .from('code_validations')
      .select('id')
      .eq('code', code)
      .eq('business_id', businessId)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Este código já foi validado' },
        { status: 400 }
      );
    }
    */

    // Insert validation record
    const { data, error } = await supabase
      .from('code_validations')
      .insert({
        code: code.toUpperCase(),
        business_id: businessId,
        cashier_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error validating code:', error);
      return NextResponse.json(
        { error: 'Erro ao validar código' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Código validado com sucesso',
      data,
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
