// ============================================
// Tapresente - Business Settings API
// ============================================
// PATCH /api/business/settings - Update business settings

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSessionUser } from '@/lib/auth';
import { hasAnyRole } from '@/lib/rbac';
import { z } from 'zod';

// Hex color validation regex
const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

// Validation schema
const updateSettingsSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').optional(),
  // Customization fields
  description: z.string().nullable().optional(),
  primary_color: z.string().regex(hexColorRegex, 'Cor inválida').optional(),
  secondary_color: z.string().regex(hexColorRegex, 'Cor inválida').optional(),
  gift_card_color: z.string().regex(hexColorRegex, 'Cor inválida').optional(),
  contact_email: z.string().email('Email inválido').nullable().optional(),
  contact_phone: z.string().nullable().optional(),
  website: z.string().url('URL inválida').nullable().optional(),
});

export async function PATCH(request: Request) {
  try {
    const user = await getSessionUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Only admin and business_owner can update settings
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

    const body = await request.json();
    const validation = updateSettingsSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { 
      name,
      description,
      primary_color,
      secondary_color,
      gift_card_color,
      contact_email,
      contact_phone,
      website,
    } = validation.data;

    // Build update object
    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (primary_color !== undefined) updateData.primary_color = primary_color;
    if (secondary_color !== undefined) updateData.secondary_color = secondary_color;
    if (gift_card_color !== undefined) updateData.gift_card_color = gift_card_color;
    if (contact_email !== undefined) updateData.contact_email = contact_email;
    if (contact_phone !== undefined) updateData.contact_phone = contact_phone;
    if (website !== undefined) updateData.website = website;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'Nenhum campo para atualizar' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('businesses')
      .update(updateData)
      .eq('id', user.businessId)
      .select()
      .single();

    if (error) {
      console.error('Error updating business:', error);
      return NextResponse.json(
        { error: 'Erro ao atualizar configurações' },
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
