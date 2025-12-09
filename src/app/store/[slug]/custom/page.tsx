// ============================================
// MIMOZ - Custom Gift Card Builder Page
// ============================================

import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Gift } from 'lucide-react';
import { CustomCardBuilder } from './components/CustomCardBuilder';
import Footer from '@/components/ui/footer';

interface CustomPageProps {
  params: Promise<{ slug: string }>;
}

async function getBusinessData(slug: string) {
  const supabase = await createClient();

  const { data: business, error } = await supabase
    .from('businesses')
    .select(`
      id, name, slug, primary_color, secondary_color, gift_card_color,
      custom_cards_enabled,
      custom_cards_min_amount_cents,
      custom_cards_max_amount_cents,
      custom_cards_preset_amounts,
      custom_cards_allow_custom_amount,
      custom_cards_section_title,
      custom_cards_section_subtitle
    `)
    .eq('slug', slug)
    .single();

  if (error || !business) {
    return null;
  }

  return business;
}

async function getBackgrounds(businessId: string) {
  const supabase = await createClient();

  // Get default backgrounds
  const { data: defaultBgs } = await supabase
    .from('default_card_backgrounds')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');

  // Get business-specific backgrounds
  const { data: businessBgs } = await supabase
    .from('custom_card_backgrounds')
    .select('*')
    .eq('business_id', businessId)
    .eq('is_active', true)
    .order('sort_order');

  return {
    default: defaultBgs || [],
    business: businessBgs || [],
  };
}

export default async function CustomCardPage({ params }: CustomPageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  
  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  
  const business = await getBusinessData(slug);

  if (!business) {
    notFound();
  }

  // Check if custom cards are enabled
  if (!business.custom_cards_enabled) {
    redirect(`/store/${slug}`);
  }

  // Get user profile if authenticated
  let userProfile = null;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .single();
    userProfile = profile;
  }

  const backgrounds = await getBackgrounds(business.id);

  const primaryColor = business.primary_color || '#1e3a5f';
  const secondaryColor = business.secondary_color || '#2563eb';

  // Custom card settings with defaults
  const customSettings = {
    minAmount: business.custom_cards_min_amount_cents || 1000,
    maxAmount: business.custom_cards_max_amount_cents || 100000,
    presetAmounts: business.custom_cards_preset_amounts || [2500, 5000, 10000, 15000, 20000, 50000],
    allowCustomAmount: business.custom_cards_allow_custom_amount ?? true,
    sectionTitle: business.custom_cards_section_title || 'Crie seu Vale-Presente Personalizado',
    sectionSubtitle: business.custom_cards_section_subtitle || 'Personalize com sua mensagem especial',
  };

  const returnUrl = `/store/${slug}/custom`;
  const isAuthenticated = !!user;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href={`/store/${slug}`}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Voltar</span>
            </Link>
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: primaryColor }}
              >
                <Gift className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">{business.name}</h1>
                <p className="text-sm text-slate-500">Vale-Presente Personalizado</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Title */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              {customSettings.sectionTitle}
            </h2>
            <p className="text-lg text-slate-600">
              {customSettings.sectionSubtitle}
            </p>
          </div>

          {/* Builder Component */}
          <CustomCardBuilder
            businessId={business.id}
            businessName={business.name}
            businessSlug={business.slug}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            defaultCardColor={business.gift_card_color || primaryColor}
            backgrounds={backgrounds}
            settings={customSettings}
            isAuthenticated={isAuthenticated}
            userName={userProfile?.full_name ?? null}
            userEmail={user?.email ?? null}
            returnUrl={returnUrl}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
