// ============================================
// MIMOZ - Business Store Customization Page
// ============================================

import { requireBusiness } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CopyButton } from '@/components/ui';
import { StoreCustomizationForm } from '@/components/forms';
import { Store, ExternalLink, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';

async function getBusiness(businessId: string) {
  const supabase = await createClient();
  
  const { data } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', businessId)
    .single();

  return data;
}

export default async function BusinessStorePage() {
  const user = await requireBusiness();
  const business = await getBusiness(user.businessId);

  if (!business) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500">Empresa não encontrada</p>
      </div>
    );
  }

  const storeUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://mimoz.com.br'}/store/${business.slug}`;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Personalizar Loja</h1>
          <p className="text-slate-500">Configure a aparência da sua loja virtual</p>
        </div>
        <Link
          href={`/store/${business.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Ver Loja
        </Link>
      </div>

      {/* Store Link */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="w-5 h-5" />
            Link da Loja
          </CardTitle>
          <CardDescription>Compartilhe este link com seus clientes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 p-4 bg-slate-50 rounded-lg">
            <code className="flex-1 text-sm text-slate-700 truncate">
              {storeUrl}
            </code>
            <CopyButton text={storeUrl} />
          </div>
        </CardContent>
      </Card>

      {/* Store Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="w-5 h-5" />
            Pré-visualização
          </CardTitle>
          <CardDescription>Veja como sua loja aparece para os clientes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <iframe
              src={`/store/${business.slug}`}
              className="w-full h-[400px]"
              title="Store Preview"
            />
          </div>
          <p className="mt-2 text-sm text-slate-500">
            As alterações serão refletidas após salvar as configurações.
          </p>
        </CardContent>
      </Card>

      {/* Customization Form */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações de Aparência</CardTitle>
          <CardDescription>
            Personalize cores, textos, seções e muito mais
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StoreCustomizationForm business={business} />
        </CardContent>
      </Card>
    </div>
  );
}
