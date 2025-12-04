// ============================================
// MIMOZ - Business Template API (Single)
// ============================================
// GET - Get single template
// PATCH - Update template
// DELETE - Delete template

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSessionUser } from '@/lib/auth';
import { isBusinessOwner, isAdmin } from '@/lib/rbac';
import { z } from 'zod';

const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().nullable().optional(),
  amountCents: z.number().int().positive().optional(),
  validDays: z.number().int().min(1).max(3650).optional(),
  isActive: z.boolean().optional(),
  cardColor: z.string().regex(hexColorRegex, 'Cor inválida').nullable().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('gift_card_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Modelo não encontrado' },
        { status: 404 }
      );
    }

    // Check access
    if (data.business_id !== user.businessId && !isAdmin(user)) {
      return NextResponse.json(
        { error: 'Acesso não autorizado' },
        { status: 403 }
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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const body = await request.json();
    const validation = updateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check template exists and user has access
    const { data: existing } = await supabase
      .from('gift_card_templates')
      .select('business_id')
      .eq('id', id)
      .single();

    if (!existing) {
      return NextResponse.json(
        { error: 'Modelo não encontrado' },
        { status: 404 }
      );
    }

    if (existing.business_id !== user.businessId && !isAdmin(user)) {
      return NextResponse.json(
        { error: 'Acesso não autorizado' },
        { status: 403 }
      );
    }

    const { name, description, amountCents, validDays, isActive, cardColor } = validation.data;

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (amountCents !== undefined) updateData.amount_cents = amountCents;
    if (validDays !== undefined) updateData.valid_days = validDays;
    if (isActive !== undefined) updateData.is_active = isActive;
    if (cardColor !== undefined) updateData.card_color = cardColor;

    const { data, error } = await supabase
      .from('gift_card_templates')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating template:', error);
      return NextResponse.json(
        { error: 'Erro ao atualizar modelo' },
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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const supabase = await createClient();

    // Check template exists and user has access
    const { data: existing } = await supabase
      .from('gift_card_templates')
      .select('business_id')
      .eq('id', id)
      .single();

    if (!existing) {
      return NextResponse.json(
        { error: 'Modelo não encontrado' },
        { status: 404 }
      );
    }

    if (existing.business_id !== user.businessId && !isAdmin(user)) {
      return NextResponse.json(
        { error: 'Acesso não autorizado' },
        { status: 403 }
      );
    }

    const { error } = await supabase
      .from('gift_card_templates')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting template:', error);
      return NextResponse.json(
        { error: 'Erro ao excluir modelo' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
