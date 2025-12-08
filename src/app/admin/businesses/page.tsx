// ============================================
// MIMOZ - Admin Businesses Page
// ============================================

import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import { Building2, Plus, ExternalLink, Gift } from 'lucide-react';
import Link from 'next/link';

interface BusinessWithStats {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  totalSales: number;
  totalRevenue: number;
}

async function getBusinessesWithStats(): Promise<BusinessWithStats[]> {
  const supabase = await createClient();
  
  const { data: businesses, error } = await supabase
    .from('businesses')
    .select('id, name, slug, created_at')
    .order('created_at', { ascending: false });

  if (error || !businesses) {
    console.error('Error fetching businesses:', error);
    return [];
  }

  // Get sales stats for each business
  const businessesWithStats = await Promise.all(
    businesses.map(async (business) => {
      const { data: giftCards } = await supabase
        .from('gift_cards')
        .select('id, amount_cents')
        .eq('business_id', business.id)
        .in('status', ['ACTIVE', 'REDEEMED']);
      
      const cards = giftCards || [];
      return {
        ...business,
        totalSales: cards.length,
        totalRevenue: cards.reduce((sum, c) => sum + (c.amount_cents || 0), 0),
      };
    })
  );

  return businessesWithStats;
}

export default async function AdminBusinessesPage() {
  const businesses = await getBusinessesWithStats();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Empresas</h1>
          <p className="text-slate-500">Gerencie as empresas cadastradas</p>
        </div>
        <Link
          href="/admin/businesses/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova Empresa
        </Link>
      </div>

      {/* Businesses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Empresas</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {businesses.length === 0 ? (
            <div className="p-8 text-center">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-1">
                Nenhuma empresa cadastrada
              </h3>
              <p className="text-slate-500 mb-4">
                Comece criando sua primeira empresa
              </p>
              <Link
                href="/admin/businesses/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Nova Empresa
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Empresa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Slug
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Vendas
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Receita
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {businesses.map((business) => (
                    <tr key={business.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{business.name}</p>
                            <p className="text-sm text-slate-500">{business.id.slice(0, 8)}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <code className="px-2 py-1 bg-slate-100 rounded text-sm text-slate-700">
                          {business.slug}
                        </code>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Gift className="w-4 h-4 text-slate-400" />
                          <span className="font-medium text-slate-900">{business.totalSales}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="font-medium text-emerald-600">
                          {formatCurrency(business.totalRevenue)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/businesses/${business.id}/cards`}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Vale-Presentes"
                          >
                            <Gift className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/businesses/${business.id}`}
                            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
