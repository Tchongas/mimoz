// ============================================
// MIMOZ - Admin Users API
// ============================================
// GET /api/admin/users - List all users (admin only)
// PATCH /api/admin/users - Update user role/business (admin only)

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSessionUser } from '@/lib/auth';
import { isAdmin } from '@/lib/rbac';
import { z } from 'zod';

// Validation schema for updating a user
const updateUserSchema = z.object({
  userId: z.string().uuid('ID de usuário inválido'),
  role: z.enum(['ADMIN', 'BUSINESS_OWNER', 'CASHIER']).optional(),
  businessId: z.string().uuid('ID de empresa inválido').nullable().optional(),
});

// Validation schema for creating a user
const createUserSchema = z.object({
  email: z.string().email('Email inválido'),
  fullName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').nullable().optional(),
  role: z.enum(['ADMIN', 'BUSINESS_OWNER', 'CASHIER']),
  businessId: z.string().uuid('ID de empresa inválido').nullable().optional(),
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
      .from('profiles')
      .select(`
        *,
        business:businesses(id, name, slug)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar usuários' },
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

export async function PATCH(request: Request) {
  try {
    const user = await getSessionUser();
    
    if (!user || !isAdmin(user)) {
      return NextResponse.json(
        { error: 'Acesso não autorizado' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = updateUserSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { userId, role, businessId } = validation.data;

    // Build update object
    const updateData: Record<string, unknown> = {};
    if (role !== undefined) updateData.role = role;
    if (businessId !== undefined) updateData.business_id = businessId;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'Nenhum campo para atualizar' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user:', error);
      return NextResponse.json(
        { error: 'Erro ao atualizar usuário' },
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
    const validation = createUserSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, fullName, role, businessId } = validation.data;

    // Validate business requirement for non-admin roles
    if (role !== 'ADMIN' && !businessId) {
      return NextResponse.json(
        { error: 'Empresa é obrigatória para este tipo de usuário' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check if user already exists in profiles (already logged in before)
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'Este usuário já existe no sistema' },
        { status: 409 }
      );
    }

    // Check if invite already exists
    const { data: existingInvite } = await supabase
      .from('user_invites')
      .select('id')
      .eq('email', email)
      .single();

    if (existingInvite) {
      return NextResponse.json(
        { error: 'Já existe um convite pendente para este email' },
        { status: 409 }
      );
    }

    // Create invite (user will get role/business on first login)
    const { data, error } = await supabase
      .from('user_invites')
      .insert({
        email,
        full_name: fullName,
        role,
        business_id: businessId,
        invited_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating invite:', error);
      return NextResponse.json(
        { error: 'Erro ao criar convite' },
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
