// ============================================
// MIMOZ - Admin Edit Gift Card Template Page
// ============================================

import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { ArrowLeft, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { AdminTemplateForm } from '../../new/admin-template-form';
import { DeleteTemplateButton } from './delete-template-button';

interface PageProps {
  params: Promise<{ id: string; templateId: string }>;
}

async function getBusiness(id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('businesses')
    .select('id, name, slug, gift_card_color')
    .eq('id', id)
    .single();
  return data;
}

async function getTemplate(templateId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('gift_card_templates')
    .select('*')
    .eq('id', templateId)
    .single();
  return data;
}

export default async function AdminEditTemplatePage({ params }: PageProps) {
  const { id, templateId } = await params;
  const [business, template] = await Promise.all([
    getBusiness(id),
    getTemplate(templateId),
  ]);

  if (!business || !template) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/admin/businesses/${id}/cards`}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Editar Modelo</h1>
            <p className="text-slate-500">{business.name} - {template.name}</p>
          </div>
        </div>
        <DeleteTemplateButton 
          templateId={template.id} 
          templateName={template.name}
          returnUrl={`/admin/businesses/${id}/cards`}
        />
      </div>

      {/* Form */}
      <AdminTemplateForm 
        businessId={business.id} 
        businessGiftCardColor={business.gift_card_color}
        returnUrl={`/admin/businesses/${id}/cards`}
        template={template}
      />
    </div>
  );
}
