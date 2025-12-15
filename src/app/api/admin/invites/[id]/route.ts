// ============================================
// Tapresente - Admin Invites API (Single)
// ============================================
// DELETE /api/admin/invites/[id] - Delete an invite

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSessionUser } from '@/lib/auth';
import { isAdmin } from '@/lib/rbac';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    
    if (!user || !isAdmin(user)) {
      return NextResponse.json(
        { error: 'Acesso não autorizado' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const supabase = await createClient();

    const { error } = await supabase
      .from('user_invites')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting invite:', error);
      return NextResponse.json(
        { error: 'Erro ao excluir convite' },
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
