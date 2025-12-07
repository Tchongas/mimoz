// ============================================
// MIMOZ - Public Store Page
// ============================================

import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Gift, ShoppingBag, Mail, Phone, Globe, User } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { LoginButton } from '@/app/auth/login/login-button';
import Footer from '@/components/ui/footer';

interface StorePageProps {
  params: Promise<{ slug: string }>;
}

interface Business {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  gift_card_color: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  website: string | null;
}

interface GiftCardTemplate {
  id: string;
  name: string;
  description: string | null;
  amount_cents: number;
  image_url: string | null;
  card_color: string | null;
}

// Default colors
const DEFAULT_COLORS = {
  primary: '#1e3a5f',
  secondary: '#2563eb',
  giftCard: '#1e3a5f',
};

async function getStoreData(slug: string) {
  const supabase = await createClient();

  // Get business by slug with customization fields
  const { data: business, error: bizError } = await supabase
    .from('businesses')
    .select('id, name, slug, description, logo_url, primary_color, secondary_color, gift_card_color, contact_email, contact_phone, website')
    .eq('slug', slug)
    .single();

  if (bizError || !business) {
    return null;
  }

  // Get active gift card templates
  const { data: templates } = await supabase
    .from('gift_card_templates')
    .select('id, name, description, amount_cents, image_url, card_color')
    .eq('business_id', business.id)
    .eq('is_active', true)
    .order('amount_cents', { ascending: true });

  return {
    business,
    templates: templates || [],
  };
}

export default async function StorePage({ params }: StorePageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  
  const data = await getStoreData(slug);

  if (!data) {
    notFound();
  }

  const { business, templates } = data;

  // Get colors with fallbacks
  const primaryColor = business.primary_color || DEFAULT_COLORS.primary;
  const secondaryColor = business.secondary_color || DEFAULT_COLORS.secondary;
  const giftCardColor = business.gift_card_color || DEFAULT_COLORS.giftCard;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {business.logo_url ? (
                <img 
                  src={business.logo_url} 
                  alt={business.name} 
                  className="w-10 h-10 rounded-lg object-cover"
                />
              ) : (
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Gift className="w-5 h-5 text-white" />
                </div>
              )}
              <h1 className="text-xl font-bold text-slate-900">{business.name}</h1>
            </div>
            {/* Right side - Contact + Account */}
            <div className="flex items-center gap-4">
              {/* Contact Links */}
              <div className="hidden sm:flex items-center gap-4 text-sm text-slate-500">
                {business.contact_email && (
                  <a href={`mailto:${business.contact_email}`} className="flex items-center gap-1 hover:text-slate-700">
                    <Mail className="w-4 h-4" />
                    <span className="hidden md:inline">{business.contact_email}</span>
                  </a>
                )}
                {business.website && (
                  <a href={business.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-slate-700">
                    <Globe className="w-4 h-4" />
                  </a>
                )}
              </div>
              
              {/* Account Link */}
              {user ? (
                <Link
                  href="/account"
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Minha Conta</span>
                </Link>
              ) : (
                <Link
                  href={`/auth/login?redirect=/store/${slug}`}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white rounded-lg transition-colors"
                  style={{ backgroundColor: primaryColor }}
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Entrar</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="text-white py-16" style={{ backgroundColor: primaryColor }}>
          <div className="max-w-6xl mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-4">
              Presenteie quem você ama
            </h2>
            <p className="text-xl opacity-80 max-w-2xl mx-auto">
              {business.description || `Escolha o valor perfeito e envie um vale-presente digital instantaneamente. Válido em qualquer unidade ${business.name}.`}
            </p>
          </div>
        </section>

        {/* Gift Cards Grid */}
        <section className="py-12">
          <div className="max-w-6xl mx-auto px-4">
            <h3 className="text-2xl font-bold text-slate-900 mb-8 text-center">
              Escolha seu Vale-Presente
            </h3>

            {templates.length === 0 ? (
              <div className="text-center py-16">
                <Gift className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h4 className="text-xl font-medium text-slate-900 mb-2">
                  Em breve!
                </h4>
                <p className="text-slate-500">
                  Estamos preparando nossos vale-presentes. Volte em breve!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template) => (
                  <Link
                    key={template.id}
                    href={`/store/${slug}/buy/${template.id}`}
                    className="group"
                  >
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all duration-200 hover:shadow-xl hover:border-slate-300 hover:-translate-y-1">
                      {/* Card Image/Gradient */}
                      <div 
                        className="h-40 flex items-center justify-center relative"
                        style={{ backgroundColor: template.card_color || giftCardColor }}
                      >
                        <div className="text-center">
                          <p className="text-4xl font-bold text-white">
                            {formatCurrency(template.amount_cents)}
                          </p>
                          <p className="text-white/60 text-sm mt-1">Vale-Presente</p>
                        </div>
                        {/* Decorative elements */}
                        <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full" />
                        <div className="absolute bottom-4 left-4 w-12 h-12 bg-white/10 rounded-full" />
                      </div>

                      {/* Card Content */}
                      <div className="p-6">
                        <h4 className="text-lg font-semibold text-slate-900 mb-2">
                          {template.name}
                        </h4>
                        {template.description && (
                          <p className="text-slate-500 text-sm mb-4 line-clamp-2">
                            {template.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-slate-900">
                            {formatCurrency(template.amount_cents)}
                          </span>
                          <span 
                            className="inline-flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
                            style={{ backgroundColor: secondaryColor }}
                          >
                            <ShoppingBag className="w-4 h-4" />
                            Comprar
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer/>
    </div>
  );
}
