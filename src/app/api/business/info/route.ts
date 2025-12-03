// ============================================
// MIMOZ - Business Info API
// ============================================
// GET /api/business/info - Get current user's business info

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSessionUser } from '@/lib/auth';
import { hasAnyRole } from '@/lib/rbac';

export async function GET() {
  try {
    const user = await getSessionUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Only admin and business_owner can access business info
    if (!hasAnyRole(user, ['ADMIN', 'BUSINESS_OWNER'])) {
      return NextResponse.json(
        { error: 'Acesso não autorizado' },
        { status: 403 }
      );
    }

    if (!user.businessId) {
      return NextResponse.json(
        { error: 'Usuário não está vinculado a uma empresa' },
        { status: 404 }
      );
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', user.businessId)
      .single();

    if (error) {
      console.error('Error fetching business:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar empresa' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Empresa não encontrada' },
        { status: 404 }
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
