// ============================================
// MIMOZ - Admin New Business Page
// ============================================

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { BusinessForm } from '@/components/forms';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminNewBusinessPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/businesses"
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Nova Empresa</h1>
          <p className="text-slate-500">Cadastre uma nova empresa no sistema</p>
        </div>
      </div>

      {/* Form Card */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Dados da Empresa</CardTitle>
        </CardHeader>
        <CardContent>
          <BusinessForm mode="create" />
        </CardContent>
      </Card>
    </div>
  );
}
