// ============================================
// Tapresente - Professional Landing Page Store
// ============================================

import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { 
  Gift, 
  ShoppingBag, 
  Mail, 
  Phone, 
  Globe, 
  User,
  Clock,
  Shield,
  Star,
  Heart,
  Zap,
  Check,
  Award,
  Sparkles,
  Target,
  Truck,
  Facebook,
  Instagram,
  MessageCircle,
  ChevronRight,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { CustomCardShowcase } from './components/CustomCardShowcase';

interface StorePageProps {
  params: Promise<{ slug: string }>;
}

interface GiftCardTemplate {
  id: string;
  name: string;
  description: string | null;
  amount_cents: number;
  image_url: string | null;
  card_color: string | null;
}

// Default values
const DEFAULTS = {
  headerBgColor: '#ffffff',
  headerTextColor: '#1e293b',
  heroBgColor: '#1e3a5f',
  heroTextColor: '#ffffff',
  heroCtaColor: '#2563eb',
  sectionBgColor: '#ffffff',
  sectionTextColor: '#1e293b',
  footerBgColor: '#1e293b',
  footerTextColor: '#94a3b8',
  pageBgColor: '#f8fafc',
  giftCardColor: '#1e3a5f',
  secondaryColor: '#2563eb',
};

// Icon mapping
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  gift: Gift,
  clock: Clock,
  shield: Shield,
  star: Star,
  heart: Heart,
  zap: Zap,
  check: Check,
  award: Award,
  sparkles: Sparkles,
  target: Target,
  truck: Truck,
};

// Border radius mapping
const RADIUS_MAP: Record<string, string> = {
  none: 'rounded-none',
  small: 'rounded',
  rounded: 'rounded-xl',
  large: 'rounded-2xl',
  full: 'rounded-3xl',
};

async function getStoreData(slug: string) {
  const supabase = await createClient();

  const { data: business, error: bizError } = await supabase
    .from('businesses')
    .select('*')
    .eq('slug', slug)
    .single();

  if (bizError || !business) {
    return null;
  }

  const { data: templates } = await supabase
    .from('gift_card_templates')
    .select('id, name, description, amount_cents, image_url, card_color')
    .eq('business_id', business.id)
    .eq('is_active', true)
    .order('amount_cents', { ascending: true });

  return { business, templates: templates || [] };
}

export default async function StorePage({ params }: StorePageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const data = await getStoreData(slug);

  if (!data) {
    notFound();
  }

  const { business, templates } = data;

  // ========== CUSTOMIZATION VALUES ==========
  // Header
  const headerBgColor = business.header_bg_color || DEFAULTS.headerBgColor;
  const headerTextColor = business.header_text_color || DEFAULTS.headerTextColor;
  const showHeaderContact = business.show_header_contact ?? true;
  
  // Hero
  const showHeroSection = business.show_hero_section ?? true;
  const heroTitle = business.hero_title || `Bem-vindo à ${business.name}`;
  const heroSubtitle = business.hero_subtitle || business.description || '';
  const heroBgType = business.hero_bg_type || 'color';
  const heroBgColor = business.hero_bg_color || business.primary_color || DEFAULTS.heroBgColor;
  const heroBgGradientStart = business.hero_bg_gradient_start || DEFAULTS.heroBgColor;
  const heroBgGradientEnd = business.hero_bg_gradient_end || '#3b82f6';
  const heroTextColor = business.hero_text_color || DEFAULTS.heroTextColor;
  const heroOverlayOpacity = business.hero_overlay_opacity ?? 50;
  const heroCtaText = business.hero_cta_text || 'Ver Produtos';
  const heroCtaColor = business.hero_cta_color || DEFAULTS.heroCtaColor;
  
  // Section 1 (Intro/About - above products)
  const section1Enabled = business.section1_enabled ?? false;
  const section1Title = business.section1_title || '';
  const section1Subtitle = business.section1_subtitle || '';
  const section1Content = business.section1_content || '';
  const section1BgColor = business.section1_bg_color || DEFAULTS.sectionBgColor;
  const section1TextColor = business.section1_text_color || DEFAULTS.sectionTextColor;
  const section1Layout = business.section1_layout || 'centered';
  const section1ImageUrl = business.section1_image_url || '';
  const section1CtaText = business.section1_cta_text || '';
  const section1CtaUrl = business.section1_cta_url || '';
  const section1CtaColor = business.section1_cta_color || DEFAULTS.secondaryColor;
  
  // Products
  const productsSectionEnabled = business.products_section_enabled ?? true;
  const productsTitle = business.products_title || 'Nossos Produtos';
  const productsSubtitle = business.products_subtitle || '';
  const productsBgColor = business.products_bg_color || DEFAULTS.sectionBgColor;
  const productsColumns = business.products_columns ?? 3;
  const showProductDescription = business.show_product_description ?? true;
  const cardStyle = business.card_style || 'elevated';
  
  // Section 2 (Benefits/Features - below products)
  const section2Enabled = business.section2_enabled ?? true;
  const section2Type = business.section2_type || 'features';
  const section2Title = business.section2_title || 'Por que nos escolher?';
  const section2Subtitle = business.section2_subtitle || '';
  const section2BgColor = business.section2_bg_color || '#f8fafc';
  const section2TextColor = business.section2_text_color || DEFAULTS.sectionTextColor;
  
  // Section 2 items
  const section2Items = [
    {
      icon: business.section2_item1_icon || 'star',
      title: business.section2_item1_title || 'Qualidade',
      description: business.section2_item1_description || 'Produtos e serviços de alta qualidade',
    },
    {
      icon: business.section2_item2_icon || 'clock',
      title: business.section2_item2_title || 'Agilidade',
      description: business.section2_item2_description || 'Atendimento rápido e eficiente',
    },
    {
      icon: business.section2_item3_icon || 'shield',
      title: business.section2_item3_title || 'Segurança',
      description: business.section2_item3_description || 'Sua satisfação é nossa prioridade',
    },
    business.section2_item4_title ? {
      icon: business.section2_item4_icon || 'heart',
      title: business.section2_item4_title,
      description: business.section2_item4_description || '',
    } : null,
  ].filter(Boolean);
  
  // Section 3 (Additional content)
  const section3Enabled = business.section3_enabled ?? false;
  const section3Type = business.section3_type || 'text';
  const section3Title = business.section3_title || '';
  const section3Subtitle = business.section3_subtitle || '';
  const section3Content = business.section3_content || '';
  const section3BgColor = business.section3_bg_color || DEFAULTS.sectionBgColor;
  const section3TextColor = business.section3_text_color || DEFAULTS.sectionTextColor;
  const section3ImageUrl = business.section3_image_url || '';
  const section3CtaText = business.section3_cta_text || '';
  const section3CtaUrl = business.section3_cta_url || '';
  
  // CTA Banner
  const ctaBannerEnabled = business.cta_banner_enabled ?? false;
  const ctaBannerTitle = business.cta_banner_title || '';
  const ctaBannerSubtitle = business.cta_banner_subtitle || '';
  const ctaBannerButtonText = business.cta_banner_button_text || 'Saiba Mais';
  const ctaBannerButtonUrl = business.cta_banner_button_url || '';
  const ctaBannerBgColor = business.cta_banner_bg_color || DEFAULTS.heroBgColor;
  const ctaBannerTextColor = business.cta_banner_text_color || '#ffffff';
  
  // Footer
  const footerBgColor = business.footer_bg_color || DEFAULTS.footerBgColor;
  const footerTextColor = business.footer_text_color || DEFAULTS.footerTextColor;
  const showFooterContact = business.show_footer_contact ?? true;
  const showFooterSocial = business.show_footer_social ?? true;
  
  // General
  const pageBgColor = business.page_bg_color || DEFAULTS.pageBgColor;
  const borderRadius = business.border_radius || 'rounded';
  const giftCardColor = business.gift_card_color || DEFAULTS.giftCardColor;
  const secondaryColor = business.secondary_color || DEFAULTS.secondaryColor;
  const radiusClass = RADIUS_MAP[borderRadius] || 'rounded-xl';

  // ========== HELPER FUNCTIONS ==========
  const getHeroStyle = () => {
    if (heroBgType === 'gradient') {
      return { background: `linear-gradient(135deg, ${heroBgGradientStart}, ${heroBgGradientEnd})` };
    }
    if (heroBgType === 'image' && business.hero_bg_image_url) {
      return { backgroundImage: `url(${business.hero_bg_image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' };
    }
    return { backgroundColor: heroBgColor };
  };

  const getCardClasses = () => {
    switch (cardStyle) {
      case 'flat': return 'bg-white';
      case 'bordered': return 'bg-white border-2 border-slate-200';
      default: return 'bg-white shadow-lg hover:shadow-xl';
    }
  };

  const getGridCols = () => {
    switch (productsColumns) {
      case 1: return 'grid-cols-1';
      case 2: return 'grid-cols-1 sm:grid-cols-2';
      case 4: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
      default: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
    }
  };

  // Hero CTA URL - can be any URL or anchor
  const heroCtaUrl = business.hero_cta_url || '#produtos';
  
  // Show/hide header
  const showHeader = business.show_header ?? true;
  
  // Show/hide footer
  const showFooter = business.show_footer ?? true;
  
  // Custom cards
  const customCardsEnabled = business.custom_cards_enabled ?? false;
  const customCardsSectionTitle = business.custom_cards_section_title || 'Crie seu Vale-Presente Personalizado';
  const customCardsSectionSubtitle = business.custom_cards_section_subtitle || 'Personalize com sua mensagem especial';
  const hideTemplateCards = business.hide_template_cards ?? false;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: pageBgColor }}>
      {/* Professional Sticky Header */}
      {showHeader && (
        <header className="sticky top-0 z-50 transition-all duration-300">
          <div 
            className="border-b border-white/10 backdrop-blur-md"
            style={{ backgroundColor: `${headerBgColor}e8` }}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16 md:h-20">
                {/* Logo & Brand */}
                <div className="flex items-center gap-3">
                  {business.logo_link_url ? (
                    <a href={business.logo_link_url} className="flex items-center gap-3 group">
                      {business.logo_url ? (
                        <img src={business.logo_url} alt={business.name} className="h-9 md:h-10 w-auto object-contain transition-transform group-hover:scale-105" />
                      ) : (
                        <div className={`w-10 h-10 flex items-center justify-center ${radiusClass} transition-transform group-hover:scale-105`} style={{ backgroundColor: secondaryColor }}>
                          <Gift className="w-5 h-5 text-white" />
                        </div>
                      )}
                      <span className="text-lg md:text-xl font-bold tracking-tight" style={{ color: headerTextColor }}>{business.name}</span>
                    </a>
                  ) : (
                    <div className="flex items-center gap-3">
                      {business.logo_url ? (
                        <img src={business.logo_url} alt={business.name} className="h-9 md:h-10 w-auto object-contain" />
                      ) : (
                        <div className={`w-10 h-10 flex items-center justify-center ${radiusClass}`} style={{ backgroundColor: secondaryColor }}>
                          <Gift className="w-5 h-5 text-white" />
                        </div>
                      )}
                      <span className="text-lg md:text-xl font-bold tracking-tight" style={{ color: headerTextColor }}>{business.name}</span>
                    </div>
                  )}
                </div>

                {/* Navigation & Actions */}
                <div className="flex items-center gap-2 md:gap-4">
                  {/* Contact Links - Desktop */}
                  {showHeaderContact && (
                    <nav className="hidden md:flex items-center gap-1">
                      {business.contact_phone && (
                        <a 
                          href={`tel:${business.contact_phone}`} 
                          className={`flex items-center gap-2 px-3 py-2 text-sm font-medium opacity-80 hover:opacity-100 transition-opacity ${radiusClass}`}
                          style={{ color: headerTextColor }}
                        >
                          <Phone className="w-4 h-4" />
                          <span className="hidden lg:inline">{business.contact_phone}</span>
                        </a>
                      )}
                      {business.website && (
                        <a 
                          href={business.website} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className={`flex items-center gap-2 px-3 py-2 text-sm font-medium opacity-80 hover:opacity-100 transition-opacity ${radiusClass}`}
                          style={{ color: headerTextColor }}
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span className="hidden lg:inline">Site</span>
                        </a>
                      )}
                    </nav>
                  )}
                  
                  {/* Auth Button */}
                  {user ? (
                    <Link 
                      href="/account" 
                      className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border transition-all hover:shadow-md ${radiusClass}`}
                      style={{ color: headerTextColor, borderColor: `${headerTextColor}30` }}
                    >
                      <User className="w-4 h-4" />
                      <span className="hidden sm:inline">Minha Conta</span>
                    </Link>
                  ) : (
                    <Link 
                      href={`/auth/login?redirect=/store/${slug}`} 
                      className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 ${radiusClass}`}
                      style={{ backgroundColor: secondaryColor }}
                    >
                      <User className="w-4 h-4" />
                      <span className="hidden sm:inline">Entrar</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>
      )}

      <main className="flex-1">
        {/* Hero Section - Professional Landing */}
        {showHeroSection && (
          <section className="relative overflow-hidden" style={getHeroStyle()}>
            {/* Background overlay for images */}
            {heroBgType === 'image' && business.hero_bg_image_url && (
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" style={{ opacity: heroOverlayOpacity / 100 }} />
            )}
            
            {/* Decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
              <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
            </div>
            
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 lg:py-40">
              <div className="text-center max-w-4xl mx-auto">
                {/* Main Headline */}
                <h1 
                  className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-tight"
                  style={{ color: heroTextColor }}
                >
                  {heroTitle}
                </h1>
                
                {/* Subtitle */}
                {heroSubtitle && (
                  <p 
                    className="text-lg sm:text-xl md:text-2xl max-w-2xl mx-auto mb-10 leading-relaxed"
                    style={{ color: heroTextColor, opacity: 0.85 }}
                  >
                    {heroSubtitle}
                  </p>
                )}
                
                {/* CTA Button - Links to any URL */}
                {heroCtaText && (
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <a 
                      href={heroCtaUrl}
                      className={`inline-flex items-center gap-3 px-8 py-4 text-lg font-semibold text-white shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-1 ${radiusClass}`}
                      style={{ backgroundColor: heroCtaColor }}
                    >
                      {heroCtaText}
                      <ArrowRight className="w-5 h-5" />
                    </a>
                  </div>
                )}
              </div>
            </div>
            
            {/* Bottom fade */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
          </section>
        )}

        {/* Section 1 - Intro/About (above products) */}
        {section1Enabled && (
          <section className="py-12 md:py-16" style={{ backgroundColor: section1BgColor }}>
            <div className="max-w-6xl mx-auto px-4">
              {section1Layout === 'split' && section1ImageUrl ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div className={section1Layout === 'right' ? 'order-2' : ''}>
                    {section1Title && <h3 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: section1TextColor }}>{section1Title}</h3>}
                    {section1Subtitle && <p className="text-lg mb-4 opacity-80" style={{ color: section1TextColor }}>{section1Subtitle}</p>}
                    {section1Content && <div className="prose max-w-none" style={{ color: section1TextColor }} dangerouslySetInnerHTML={{ __html: section1Content.replace(/\n/g, '<br/>') }} />}
                    {section1CtaText && section1CtaUrl && (
                      <a href={section1CtaUrl} className={`inline-flex items-center gap-2 mt-6 px-6 py-3 text-white font-semibold ${radiusClass}`} style={{ backgroundColor: section1CtaColor }}>
                        {section1CtaText}
                        <ArrowRight className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                  <div className={section1Layout === 'right' ? 'order-1' : ''}>
                    <img src={section1ImageUrl} alt={section1Title || ''} className={`w-full h-auto ${radiusClass}`} />
                  </div>
                </div>
              ) : (
                <div className={`${section1Layout === 'centered' ? 'text-center max-w-3xl mx-auto' : ''}`}>
                  {section1Title && <h3 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: section1TextColor }}>{section1Title}</h3>}
                  {section1Subtitle && <p className="text-lg mb-4 opacity-80" style={{ color: section1TextColor }}>{section1Subtitle}</p>}
                  {section1Content && <div className="prose max-w-none" style={{ color: section1TextColor }} dangerouslySetInnerHTML={{ __html: section1Content.replace(/\n/g, '<br/>') }} />}
                  {section1ImageUrl && <img src={section1ImageUrl} alt={section1Title || ''} className={`mt-8 w-full max-w-2xl mx-auto h-auto ${radiusClass}`} />}
                  {section1CtaText && section1CtaUrl && (
                    <a href={section1CtaUrl} className={`inline-flex items-center gap-2 mt-6 px-6 py-3 text-white font-semibold ${radiusClass}`} style={{ backgroundColor: section1CtaColor }}>
                      {section1CtaText}
                      <ArrowRight className="w-5 h-5" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Custom Gift Cards Section - ABOVE templates for better visibility */}
        {customCardsEnabled && (
          <CustomCardShowcase
            businessSlug={slug}
            businessName={business.name}
            sectionTitle={customCardsSectionTitle}
            sectionSubtitle={customCardsSectionSubtitle}
            accentColor={secondaryColor}
            presetAmounts={business.custom_cards_preset_amounts || [2500, 5000, 10000, 15000, 20000, 50000]}
            minAmount={business.custom_cards_min_amount_cents || 1000}
            maxAmount={business.custom_cards_max_amount_cents || 100000}
          />
        )}

        {/* Products Section - Template gift cards */}
        {productsSectionEnabled && !hideTemplateCards && (
          <section id="produtos" className="py-12 md:py-16" style={{ backgroundColor: productsBgColor }}>
            <div className="max-w-6xl mx-auto px-4">
              <div className="text-center mb-8">
                <h3 className="text-2xl md:text-3xl font-bold text-slate-900">{productsTitle}</h3>
                {productsSubtitle && <p className="text-slate-600 mt-2 max-w-2xl mx-auto">{productsSubtitle}</p>}
              </div>

              {templates.length === 0 ? (
                <div className="text-center py-16">
                  <Gift className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h4 className="text-xl font-medium text-slate-900 mb-2">Em breve!</h4>
                  <p className="text-slate-500">Estamos preparando nossos produtos. Volte em breve!</p>
                </div>
              ) : (
                <div className={`grid ${getGridCols()} gap-6`}>
                  {templates.map((template) => (
                    <Link key={template.id} href={`/store/${slug}/buy/${template.id}`} className="group">
                      <div className={`${getCardClasses()} ${radiusClass} overflow-hidden transition-all duration-200 hover:-translate-y-1`}>
                        <div className="h-40 flex items-center justify-center relative" style={{ backgroundColor: template.card_color || giftCardColor }}>
                          <div className="text-center">
                            <p className="text-4xl font-bold text-white">{formatCurrency(template.amount_cents)}</p>
                            <p className="text-white/60 text-sm mt-1">Vale-Presente</p>
                          </div>
                          <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full" />
                          <div className="absolute bottom-4 left-4 w-12 h-12 bg-white/10 rounded-full" />
                        </div>
                        <div className="p-6">
                          <h4 className="text-lg font-semibold text-slate-900 mb-2">{template.name}</h4>
                          {showProductDescription && template.description && (
                            <p className="text-slate-500 text-sm mb-4 line-clamp-2">{template.description}</p>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold text-slate-900">{formatCurrency(template.amount_cents)}</span>
                            <span className={`inline-flex items-center gap-2 px-4 py-2 text-white text-sm font-medium ${radiusClass}`} style={{ backgroundColor: secondaryColor }}>
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
        )}

        {/* Section 2 - Benefits/Features */}
        {section2Enabled && section2Type === 'features' && (
          <section className="py-12 md:py-16" style={{ backgroundColor: section2BgColor }}>
            <div className="max-w-6xl mx-auto px-4">
              <div className="text-center mb-10">
                <h3 className="text-2xl md:text-3xl font-bold" style={{ color: section2TextColor }}>{section2Title}</h3>
                {section2Subtitle && <p className="mt-2 opacity-80" style={{ color: section2TextColor }}>{section2Subtitle}</p>}
              </div>
              <div className={`grid grid-cols-1 md:grid-cols-${section2Items.length > 3 ? '4' : section2Items.length} gap-8`}>
                {section2Items.map((item, index) => {
                  if (!item) return null;
                  const IconComponent = ICON_MAP[item.icon || 'star'] || Star;
                  return (
                    <div key={index} className="text-center">
                      <div className={`w-16 h-16 mx-auto mb-4 flex items-center justify-center ${radiusClass}`} style={{ backgroundColor: secondaryColor }}>
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                      <h4 className="text-lg font-semibold mb-2" style={{ color: section2TextColor }}>{item.title}</h4>
                      <p className="opacity-70" style={{ color: section2TextColor }}>{item.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Section 2 - Text Block */}
        {section2Enabled && section2Type === 'text' && (
          <section className="py-12 md:py-16" style={{ backgroundColor: section2BgColor }}>
            <div className="max-w-4xl mx-auto px-4 text-center">
              <h3 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: section2TextColor }}>{section2Title}</h3>
              {section2Subtitle && <p className="text-lg" style={{ color: section2TextColor }}>{section2Subtitle}</p>}
            </div>
          </section>
        )}

        {/* Section 3 - Additional Content */}
        {section3Enabled && (
          <section className="py-12 md:py-16" style={{ backgroundColor: section3BgColor }}>
            <div className="max-w-6xl mx-auto px-4">
              {section3Type === 'cta' ? (
                <div className="text-center">
                  {section3Title && <h3 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: section3TextColor }}>{section3Title}</h3>}
                  {section3Subtitle && <p className="text-lg mb-6 opacity-80" style={{ color: section3TextColor }}>{section3Subtitle}</p>}
                  {section3CtaText && section3CtaUrl && (
                    <a href={section3CtaUrl} className={`inline-flex items-center gap-2 px-8 py-4 text-white font-semibold ${radiusClass}`} style={{ backgroundColor: secondaryColor }}>
                      {section3CtaText}
                      <ArrowRight className="w-5 h-5" />
                    </a>
                  )}
                </div>
              ) : section3ImageUrl ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div>
                    {section3Title && <h3 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: section3TextColor }}>{section3Title}</h3>}
                    {section3Subtitle && <p className="text-lg mb-4 opacity-80" style={{ color: section3TextColor }}>{section3Subtitle}</p>}
                    {section3Content && <div className="prose max-w-none" style={{ color: section3TextColor }} dangerouslySetInnerHTML={{ __html: section3Content.replace(/\n/g, '<br/>') }} />}
                    {section3CtaText && section3CtaUrl && (
                      <a href={section3CtaUrl} className={`inline-flex items-center gap-2 mt-6 px-6 py-3 text-white font-semibold ${radiusClass}`} style={{ backgroundColor: secondaryColor }}>
                        {section3CtaText}
                        <ArrowRight className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                  <img src={section3ImageUrl} alt={section3Title || ''} className={`w-full h-auto ${radiusClass}`} />
                </div>
              ) : (
                <div className="text-center max-w-3xl mx-auto">
                  {section3Title && <h3 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: section3TextColor }}>{section3Title}</h3>}
                  {section3Subtitle && <p className="text-lg mb-4 opacity-80" style={{ color: section3TextColor }}>{section3Subtitle}</p>}
                  {section3Content && <div className="prose max-w-none mx-auto" style={{ color: section3TextColor }} dangerouslySetInnerHTML={{ __html: section3Content.replace(/\n/g, '<br/>') }} />}
                  {section3CtaText && section3CtaUrl && (
                    <a href={section3CtaUrl} className={`inline-flex items-center gap-2 mt-6 px-6 py-3 text-white font-semibold ${radiusClass}`} style={{ backgroundColor: secondaryColor }}>
                      {section3CtaText}
                      <ArrowRight className="w-5 h-5" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        {/* CTA Banner */}
        {ctaBannerEnabled && ctaBannerTitle && (
          <section className="py-12 md:py-16" style={{ backgroundColor: ctaBannerBgColor }}>
            <div className="max-w-4xl mx-auto px-4 text-center">
              <h3 className="text-2xl md:text-4xl font-bold mb-4" style={{ color: ctaBannerTextColor }}>{ctaBannerTitle}</h3>
              {ctaBannerSubtitle && <p className="text-lg mb-8 opacity-90" style={{ color: ctaBannerTextColor }}>{ctaBannerSubtitle}</p>}
              {ctaBannerButtonUrl && (
                <a href={ctaBannerButtonUrl} className={`inline-flex items-center gap-2 px-8 py-4 bg-white font-semibold ${radiusClass} transition-transform hover:scale-105`} style={{ color: ctaBannerBgColor }}>
                  {ctaBannerButtonText}
                  <ArrowRight className="w-5 h-5" />
                </a>
              )}
            </div>
          </section>
        )}
      </main>

      {/* Professional Footer */}
      {showFooter && (
        <footer className="relative" style={{ backgroundColor: footerBgColor }}>
          {/* Top decorative border */}
          <div className="absolute top-0 left-0 right-0 h-1" style={{ background: `linear-gradient(90deg, ${secondaryColor}, ${giftCardColor})` }} />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
              {/* Brand Column */}
              <div className="lg:col-span-2">
                <div className="flex items-center gap-3 mb-4">
                  {business.logo_url ? (
                    <img src={business.logo_url} alt={business.name} className="h-10 w-auto object-contain" />
                  ) : (
                    <div className={`w-10 h-10 flex items-center justify-center ${radiusClass}`} style={{ backgroundColor: secondaryColor }}>
                      <Gift className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <span className="text-xl font-bold text-white">{business.name}</span>
                </div>
                {business.footer_text && (
                  <p className="max-w-md leading-relaxed" style={{ color: footerTextColor }}>{business.footer_text}</p>
                )}
                {business.description && !business.footer_text && (
                  <p className="max-w-md leading-relaxed" style={{ color: footerTextColor }}>{business.description}</p>
                )}
              </div>

              {/* Contact Column */}
              {showFooterContact && (business.contact_email || business.contact_phone || business.website) && (
                <div>
                  <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Contato</h4>
                  <div className="space-y-3" style={{ color: footerTextColor }}>
                    {business.contact_email && (
                      <a href={`mailto:${business.contact_email}`} className="flex items-center gap-3 hover:text-white transition-colors">
                        <Mail className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm">{business.contact_email}</span>
                      </a>
                    )}
                    {business.contact_phone && (
                      <a href={`tel:${business.contact_phone}`} className="flex items-center gap-3 hover:text-white transition-colors">
                        <Phone className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm">{business.contact_phone}</span>
                      </a>
                    )}
                    {business.website && (
                      <a href={business.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-white transition-colors">
                        <Globe className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm">{business.website.replace(/^https?:\/\//, '')}</span>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Social Column */}
              {showFooterSocial && (business.social_facebook || business.social_instagram || business.whatsapp_number) && (
                <div>
                  <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Redes Sociais</h4>
                  <div className="flex items-center gap-3">
                    {business.social_facebook && (
                      <a 
                        href={business.social_facebook} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className={`w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors ${radiusClass}`} 
                        style={{ color: footerTextColor }}
                      >
                        <Facebook className="w-5 h-5" />
                      </a>
                    )}
                    {business.social_instagram && (
                      <a 
                        href={business.social_instagram} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className={`w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors ${radiusClass}`} 
                        style={{ color: footerTextColor }}
                      >
                        <Instagram className="w-5 h-5" />
                      </a>
                    )}
                    {business.whatsapp_number && (
                      <a 
                        href={`https://wa.me/${business.whatsapp_number}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className={`w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors ${radiusClass}`} 
                        style={{ color: footerTextColor }}
                      >
                        <MessageCircle className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Bar */}
            <div className="mt-12 pt-8 border-t border-white/10">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-sm" style={{ color: footerTextColor }}>
                  © {new Date().getFullYear()} {business.name}. Todos os direitos reservados.
                </p>
                <p className="text-xs" style={{ color: footerTextColor, opacity: 0.6 }}>
                  Powered by <a href="https://tapresente.com" className="hover:text-white transition-colors font-medium">Tapresente</a>
                </p>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
