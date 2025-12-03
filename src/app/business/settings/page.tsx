// ============================================
// MIMOZ - Business Settings Page
// ============================================

import { requireBusiness } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CopyButton } from '@/components/ui';
import { BusinessSettingsForm } from '@/components/forms';
import { Building2, Link as LinkIcon, Users } from 'lucide-react';

async function getBusiness(businessId: string) {
  const supabase = await createClient();
  
  const { data } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', businessId)
    .single();

  return data;
}

async function getTeamMembers(businessId: string) {
  const supabase = await createClient();
  
  const { data, count } = await supabase
    .from('profiles')
    .select('id, full_name, email, role', { count: 'exact' })
    .eq('business_id', businessId)
    .order('role');

  return { members: data || [], count: count || 0 };
}

const roleLabels: Record<string, string> = {
  ADMIN: 'Administrador',
  BUSINESS_OWNER: 'Proprietário',
  CASHIER: 'Operador',
};

export default async function BusinessSettingsPage() {
  const user = await requireBusiness();
  const [business, team] = await Promise.all([
    getBusiness(user.businessId),
    getTeamMembers(user.businessId),
  ]);

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
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Configurações</h1>
        <p className="text-slate-500">Gerencie as configurações da sua empresa</p>
      </div>

      {/* Business Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informações da Empresa</CardTitle>
          <CardDescription>Dados básicos da sua empresa</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{business.name}</h3>
                <p className="text-sm text-slate-500">ID: {business.id}</p>
              </div>
            </div>

            <BusinessSettingsForm business={business} />
          </div>
        </CardContent>
      </Card>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <CardTitle>Equipe</CardTitle>
          <CardDescription>{team.count} membro(s) na equipe</CardDescription>
        </CardHeader>
        <CardContent>
          {team.members.length === 0 ? (
            <div className="p-4 text-center text-slate-500">
              <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p>Nenhum membro na equipe</p>
            </div>
          ) : (
            <div className="space-y-3">
              {team.members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">
                      {member.full_name || 'Sem nome'}
                    </p>
                    <p className="text-sm text-slate-500">{member.email}</p>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium bg-slate-200 text-slate-700 rounded-full">
                    {roleLabels[member.role] || member.role}
                  </span>
                </div>
              ))}
            </div>
          )}
          <p className="mt-4 text-sm text-slate-500">
            Para adicionar ou remover membros, contate o administrador.
          </p>
        </CardContent>
      </Card>

      {/* Store Link */}
      <Card>
        <CardHeader>
          <CardTitle>Link da Loja</CardTitle>
          <CardDescription>Compartilhe este link com seus clientes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 p-4 bg-slate-50 rounded-lg">
            <LinkIcon className="w-5 h-5 text-slate-400" />
            <code className="flex-1 text-sm text-slate-700 truncate">
              {storeUrl}
            </code>
            <CopyButton text={storeUrl} />
          </div>
          <p className="mt-2 text-sm text-slate-500">
            Este link estará disponível quando a página da loja for implementada.
          </p>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Zona de Perigo</CardTitle>
          <CardDescription>Ações irreversíveis</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 mb-4">
            Entre em contato com o administrador para solicitar alterações críticas na sua conta.
          </p>
          <a
            href="mailto:suporte@mimoz.com.br"
            className="inline-flex items-center px-4 py-2 border border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors"
          >
            Contatar Suporte
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
