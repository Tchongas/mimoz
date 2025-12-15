// ============================================
// Tapresente - New Gift Card Template Page
// ============================================

import { requireBusiness } from '@/lib/auth';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { TemplateForm } from '../template-form';

export default async function NewTemplatePage() {
  const user = await requireBusiness();

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
          <h1 className="text-2xl font-bold text-slate-900">Novo Modelo</h1>
          <p className="text-slate-500">Crie um novo modelo de vale-presente</p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl">
        <TemplateForm businessId={user.businessId} />
      </div>
    </div>
  );
}
