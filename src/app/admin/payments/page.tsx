// ============================================
// MIMOZ - Admin Payments Page
// ============================================
// Shows earnings per business for payout management

import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import { 
  Wallet, 
  Building2, 
  TrendingUp, 
  Calendar,
  CheckCircle2,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import Link from 'next/link';

interface BusinessEarnings {
  id: string;
  name: string;
  slug: string;
  totalSales: number;
  totalRevenue: number;
  platformFees: number;
  netEarnings: number;
  pendingPayout: number;
  lastSaleDate: string | null;
}

// Platform fee percentage (e.g., 5%)
const PLATFORM_FEE_PERCENT = 5;

async function getBusinessEarnings(): Promise<BusinessEarnings[]> {
  const supabase = await createClient();
  
  // Get all businesses
  const { data: businesses } = await supabase
    .from('businesses')
    .select('id, name, slug')
    .order('name');
  
  if (!businesses) return [];
  
  // Get gift card sales for each business
  const earningsPromises = businesses.map(async (business) => {
    const { data: giftCards } = await supabase
      .from('gift_cards')
      .select('id, amount_cents, payment_fee_cents, purchased_at, status')
      .eq('business_id', business.id)
      .in('status', ['ACTIVE', 'REDEEMED']);
    
    const cards = giftCards || [];
    const totalSales = cards.length;
    const totalRevenue = cards.reduce((sum, card) => sum + (card.amount_cents || 0), 0);
    
    // Calculate platform fees (what Mimoz takes)
    const platformFees = Math.round(totalRevenue * (PLATFORM_FEE_PERCENT / 100));
    
    // Payment gateway fees (already deducted by AbacatePay)
    const gatewayFees = cards.reduce((sum, card) => sum + (card.payment_fee_cents || 0), 0);
    
    // Net earnings for the business
    const netEarnings = totalRevenue - platformFees - gatewayFees;
    
    // For now, pending payout = net earnings (no payout tracking yet)
    const pendingPayout = netEarnings;
    
    // Last sale date
    const sortedCards = [...cards].sort((a, b) => 
      new Date(b.purchased_at).getTime() - new Date(a.purchased_at).getTime()
    );
    const lastSaleDate = sortedCards[0]?.purchased_at || null;
    
    return {
      id: business.id,
      name: business.name,
      slug: business.slug,
      totalSales,
      totalRevenue,
      platformFees,
      netEarnings,
      pendingPayout,
      lastSaleDate,
    };
  });
  
  const earnings = await Promise.all(earningsPromises);
  
  // Sort by pending payout (highest first)
  return earnings.sort((a, b) => b.pendingPayout - a.pendingPayout);
}

async function getTotals(earnings: BusinessEarnings[]) {
  return {
    totalRevenue: earnings.reduce((sum, e) => sum + e.totalRevenue, 0),
    totalPlatformFees: earnings.reduce((sum, e) => sum + e.platformFees, 0),
    totalPendingPayouts: earnings.reduce((sum, e) => sum + e.pendingPayout, 0),
    totalSales: earnings.reduce((sum, e) => sum + e.totalSales, 0),
  };
}

export default async function AdminPaymentsPage() {
  const earnings = await getBusinessEarnings();
  const totals = await getTotals(earnings);
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Pagamentos</h1>
        <p className="text-slate-500 mt-1">
          Gerencie os pagamentos para as empresas parceiras
        </p>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Receita Total</p>
                <p className="text-2xl font-bold text-slate-900">
                  {formatCurrency(totals.totalRevenue)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Wallet className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Taxa Mimoz ({PLATFORM_FEE_PERCENT}%)</p>
                <p className="text-2xl font-bold text-slate-900">
                  {formatCurrency(totals.totalPlatformFees)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-xl">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Pendente de Pagamento</p>
                <p className="text-2xl font-bold text-slate-900">
                  {formatCurrency(totals.totalPendingPayouts)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Building2 className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total de Vendas</p>
                <p className="text-2xl font-bold text-slate-900">
                  {totals.totalSales}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Business Earnings Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Ganhos por Empresa
          </CardTitle>
        </CardHeader>
        <CardContent>
          {earnings.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Wallet className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma venda registrada ainda</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">
                      Empresa
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">
                      Vendas
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">
                      Receita Bruta
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">
                      Taxa Mimoz
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">
                      A Pagar
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">
                      Última Venda
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {earnings.map((business) => (
                    <tr 
                      key={business.id} 
                      className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-slate-900">{business.name}</p>
                          <p className="text-sm text-slate-500">{business.slug}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="font-medium text-slate-900">
                          {business.totalSales}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="font-medium text-slate-900">
                          {formatCurrency(business.totalRevenue)}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="text-slate-600">
                          {formatCurrency(business.platformFees)}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className={`font-bold ${business.pendingPayout > 0 ? 'text-green-600' : 'text-slate-400'}`}>
                          {formatCurrency(business.pendingPayout)}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="text-sm text-slate-500">
                          {business.lastSaleDate 
                            ? new Date(business.lastSaleDate).toLocaleDateString('pt-BR')
                            : '-'
                          }
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Link
                          href={`/admin/businesses/${business.id}`}
                          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                        >
                          Ver
                          <ArrowUpRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 font-medium">
                    <td className="py-4 px-4 text-slate-900">Total</td>
                    <td className="py-4 px-4 text-right text-slate-900">
                      {totals.totalSales}
                    </td>
                    <td className="py-4 px-4 text-right text-slate-900">
                      {formatCurrency(totals.totalRevenue)}
                    </td>
                    <td className="py-4 px-4 text-right text-slate-900">
                      {formatCurrency(totals.totalPlatformFees)}
                    </td>
                    <td className="py-4 px-4 text-right text-green-600 font-bold">
                      {formatCurrency(totals.totalPendingPayouts)}
                    </td>
                    <td className="py-4 px-4"></td>
                    <td className="py-4 px-4"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Info Box */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="p-2 bg-blue-100 rounded-lg h-fit">
              <Wallet className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-blue-900">Como funciona o pagamento</h3>
              <ul className="mt-2 space-y-1 text-sm text-blue-800">
                <li>• A taxa Mimoz de {PLATFORM_FEE_PERCENT}% é calculada sobre cada venda</li>
                <li>• As taxas do gateway de pagamento (AbacatePay) já são descontadas automaticamente</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
