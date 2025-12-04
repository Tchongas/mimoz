// ============================================
// MIMOZ - Admin Business API (Single)
// ============================================
// GET /api/admin/businesses/[id] - Get single business
// PATCH /api/admin/businesses/[id] - Update business
// DELETE /api/admin/businesses/[id] - Delete business

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSessionUser } from '@/lib/auth';
import { isAdmin } from '@/lib/rbac';
import { slugify } from '@/lib/utils';
import { z } from 'zod';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// Hex color validation regex
const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

// Validation schema for updating a business
const updateBusinessSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').optional(),
  slug: z.string().min(2, 'Slug deve ter pelo menos 2 caracteres').optional(),
  // Customization fields
  description: z.string().nullable().optional(),
  primary_color: z.string().regex(hexColorRegex, 'Cor inválida').optional(),
  secondary_color: z.string().regex(hexColorRegex, 'Cor inválida').optional(),
  gift_card_color: z.string().regex(hexColorRegex, 'Cor inválida').optional(),
  contact_email: z.string().email('Email inválido').nullable().optional(),
  contact_phone: z.string().nullable().optional(),
  website: z.string().url('URL inválida').nullable().optional(),
  logo_url: z.string().url('URL inválida').nullable().optional(),
});

export async function GET(request: Request, context: RouteContext) {
  try {
    const user = await getSessionUser();
    
    if (!user || !isAdmin(user)) {
      return NextResponse.json(
        { error: 'Acesso não autorizado' },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
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

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const user = await getSessionUser();
    
    if (!user || !isAdmin(user)) {
      return NextResponse.json(
        { error: 'Acesso não autorizado' },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const body = await request.json();
    const validation = updateBusinessSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { 
      name, 
      slug: providedSlug,
      description,
      primary_color,
      secondary_color,
      gift_card_color,
      contact_email,
      contact_phone,
      website,
      logo_url,
    } = validation.data;
    const supabase = await createClient();

    // Build update object
    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (providedSlug !== undefined) updateData.slug = slugify(providedSlug);
    if (description !== undefined) updateData.description = description;
    if (primary_color !== undefined) updateData.primary_color = primary_color;
    if (secondary_color !== undefined) updateData.secondary_color = secondary_color;
    if (gift_card_color !== undefined) updateData.gift_card_color = gift_card_color;
    if (contact_email !== undefined) updateData.contact_email = contact_email;
    if (contact_phone !== undefined) updateData.contact_phone = contact_phone;
    if (website !== undefined) updateData.website = website;
    if (logo_url !== undefined) updateData.logo_url = logo_url;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'Nenhum campo para atualizar' },
        { status: 400 }
      );
    }

    // Check if slug already exists (if changing slug)
    if (updateData.slug) {
      const { data: existing } = await supabase
        .from('businesses')
        .select('id')
        .eq('slug', updateData.slug)
        .neq('id', id)
        .single();

      if (existing) {
        return NextResponse.json(
          { error: 'Já existe uma empresa com este slug' },
          { status: 400 }
        );
      }
    }

    const { data, error } = await supabase
      .from('businesses')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating business:', error);
      return NextResponse.json(
        { error: 'Erro ao atualizar empresa' },
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

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const user = await getSessionUser();
    
    if (!user || !isAdmin(user)) {
      return NextResponse.json(
        { error: 'Acesso não autorizado' },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const supabase = await createClient();

    // Check if business has users
    const { count: userCount } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', id);

    if (userCount && userCount > 0) {
      return NextResponse.json(
        { error: `Não é possível excluir: ${userCount} usuário(s) vinculado(s)` },
        { status: 400 }
      );
    }

    // Check if business has validations
    const { count: validationCount } = await supabase
      .from('code_validations')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', id);

    if (validationCount && validationCount > 0) {
      return NextResponse.json(
        { error: `Não é possível excluir: ${validationCount} validação(ões) registrada(s)` },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('businesses')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting business:', error);
      return NextResponse.json(
        { error: 'Erro ao excluir empresa' },
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
