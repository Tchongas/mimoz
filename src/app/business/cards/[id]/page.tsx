// ============================================
// Tapresente - Edit Gift Card Template Page
// ============================================

import { requireBusiness } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { TemplateForm } from '../template-form';

interface EditTemplatePageProps {
  params: Promise<{ id: string }>;
}

async function getTemplate(id: string, businessId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('gift_card_templates')
    .select('*')
    .eq('id', id)
    .eq('business_id', businessId)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

export default async function EditTemplatePage({ params }: EditTemplatePageProps) {
  const user = await requireBusiness();
  const { id } = await params;
  
  const template = await getTemplate(id, user.businessId);

  if (!template) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/business/cards"
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Editar Modelo</h1>
          <p className="text-slate-500">{template.name}</p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl">
        <TemplateForm 
          businessId={user.businessId} 
          template={{
            id: template.id,
            name: template.name,
            description: template.description,
            amount_cents: template.amount_cents,
            valid_days: template.valid_days,
            is_active: template.is_active,
            card_color: template.card_color,
          }}
        />
      </div>
    </div>
  );
}
