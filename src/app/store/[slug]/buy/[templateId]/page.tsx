// ============================================
// MIMOZ - Gift Card Purchase Page
// ============================================
// Requires authentication - form will redirect to login if needed

import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { PageHeader } from './components/PageHeader';
import { GiftCardPreviewSection } from './components/GiftCardPreviewSection';
import { PurchaseSection } from './components/PurchaseSection';
import Footer from '@/components/ui/footer';

interface BuyPageProps {
  params: Promise<{ slug: string; templateId: string }>;
}

// Default colors
const DEFAULT_COLORS = {
  primary: '#1e3a5f',
  secondary: '#2563eb',
  giftCard: '#1e3a5f',
};

async function getTemplateData(slug: string, templateId: string) {
  const supabase = await createClient();

  // Get business by slug with customization fields
  const { data: business } = await supabase
    .from('businesses')
    .select('id, name, slug, primary_color, secondary_color, gift_card_color')
    .eq('slug', slug)
    .single();

  if (!business) return null;

  // Get template
  const { data: template } = await supabase
    .from('gift_card_templates')
    .select('*')
    .eq('id', templateId)
    .eq('business_id', business.id)
    .eq('is_active', true)
    .single();

  if (!template) return null;

  return { business, template };
}

export default async function BuyPage({ params }: BuyPageProps) {
  const { slug, templateId } = await params;
  const supabase = await createClient();
  
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  
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
  
  const data = await getTemplateData(slug, templateId);

  if (!data) {
    notFound();
  }

  const { business, template } = data;

  // Get colors with fallbacks - template color overrides business default
  const primaryColor = business.primary_color || DEFAULT_COLORS.primary;
  const secondaryColor = business.secondary_color || DEFAULT_COLORS.secondary;
  const giftCardColor = template.card_color || business.gift_card_color || DEFAULT_COLORS.giftCard;
  
  // Build return URL for login redirect
  const returnUrl = `/store/${slug}/buy/${templateId}`;
  const isAuthenticated = !!user;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
      {/* Header */}
      <PageHeader
        slug={slug}
        businessName={business.name}
        primaryColor={primaryColor}
      />

      {/* Content */}
      <main className="flex-1 max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Card Preview */}
          <GiftCardPreviewSection
            businessName={business.name}
            amountCents={template.amount_cents}
            templateName={template.name}
            description={template.description}
            validDays={template.valid_days}
            giftCardColor={giftCardColor}
          />

          {/* Purchase Form */}
          <PurchaseSection
            isAuthenticated={isAuthenticated}
            userName={userProfile?.full_name ?? null}
            userEmail={user?.email ?? null}
            businessId={business.id}
            businessSlug={business.slug}
            templateId={template.id}
            amountCents={template.amount_cents}
            accentColor={secondaryColor}
            returnUrl={returnUrl}
          />
        </div>
      </main>

      {/* Footer */}
      <Footer/>
    </div>
  );
}
