// ============================================
// MIMOZ - Business Templates API
// ============================================
// GET - List templates for current business
// POST - Create new template

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSessionUser } from '@/lib/auth';
import { isBusinessOwner, isAdmin } from '@/lib/rbac';
import { z } from 'zod';

const templateSchema = z.object({
  businessId: z.string().uuid(),
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  description: z.string().nullable().optional(),
  amountCents: z.number().int().positive('Valor deve ser positivo'),
  validDays: z.number().int().min(1).max(3650).default(365),
  isActive: z.boolean().default(true),
});

export async function GET() {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    if (!isBusinessOwner(user) && !isAdmin(user)) {
      return NextResponse.json(
        { error: 'Acesso não autorizado' },
        { status: 403 }
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('gift_card_templates')
      .select('*')
      .eq('business_id', user.businessId)
      .order('amount_cents', { ascending: true });

    if (error) {
      console.error('Error fetching templates:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar modelos' },
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

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    if (!isBusinessOwner(user) && !isAdmin(user)) {
      return NextResponse.json(
        { error: 'Acesso não autorizado' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = templateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { businessId, name, description, amountCents, validDays, isActive } = validation.data;

    // Verify user has access to this business
    if (user.businessId !== businessId && !isAdmin(user)) {
      return NextResponse.json(
        { error: 'Acesso não autorizado a esta empresa' },
        { status: 403 }
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('gift_card_templates')
      .insert({
        business_id: businessId,
        name,
        description,
        amount_cents: amountCents,
        valid_days: validDays,
        is_active: isActive,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating template:', error);
      return NextResponse.json(
        { error: 'Erro ao criar modelo' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
