// ============================================
// Tapresente - Admin Businesses API
// ============================================
// GET /api/admin/businesses - List all businesses (admin only)
// POST /api/admin/businesses - Create new business (admin only)

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSessionUser } from '@/lib/auth';
import { isAdmin } from '@/lib/rbac';
import { slugify } from '@/lib/utils';
import { z } from 'zod';

// Validation schema for creating a business
const createBusinessSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  slug: z.string().optional(),
});

export async function GET() {
  try {
    const user = await getSessionUser();
    
    if (!user || !isAdmin(user)) {
      return NextResponse.json(
        { error: 'Acesso não autorizado' },
        { status: 403 }
      );
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching businesses:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar empresas' },
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
    
    if (!user || !isAdmin(user)) {
      return NextResponse.json(
        { error: 'Acesso não autorizado' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = createBusinessSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, slug: providedSlug } = validation.data;
    const slug = providedSlug || slugify(name);

    const supabase = await createClient();
    
    // Check if slug already exists
    const { data: existing } = await supabase
      .from('businesses')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Já existe uma empresa com este slug' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('businesses')
      .insert({ name, slug })
      .select()
      .single();

    if (error) {
      console.error('Error creating business:', error);
      return NextResponse.json(
        { error: 'Erro ao criar empresa' },
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
