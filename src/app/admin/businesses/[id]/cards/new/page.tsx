// ============================================
// Tapresente - Admin New Gift Card Template Page
// ============================================

import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { AdminTemplateForm } from './admin-template-form';

interface PageProps {
  params: Promise<{ id: string }>;
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

export default async function AdminNewTemplatePage({ params }: PageProps) {
  const { id } = await params;
  const business = await getBusiness(id);

  if (!business) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/admin/businesses/${id}/cards`}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Novo Modelo</h1>
          <p className="text-slate-500">{business.name}</p>
        </div>
      </div>

      {/* Form */}
      <AdminTemplateForm 
        businessId={business.id} 
        businessGiftCardColor={business.gift_card_color}
        returnUrl={`/admin/businesses/${id}/cards`}
      />
    </div>
  );
}
