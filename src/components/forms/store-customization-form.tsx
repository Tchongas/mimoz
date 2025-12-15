'use client';

// ============================================
// Tapresente - Store Customization Form Component
// ============================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Label, Alert, Spinner } from '@/components/ui';
import { 
  Palette, 
  Layout, 
  Type, 
  Image as ImageIcon, 
  Gift, 
  Clock, 
  Shield, 
  Star, 
  Heart,
  Zap,
  Check,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { Business } from '@/types';

// Icon options for features
const ICON_OPTIONS = [
  { value: 'gift', label: 'Presente', icon: Gift },
  { value: 'clock', label: 'Relógio', icon: Clock },
  { value: 'shield', label: 'Escudo', icon: Shield },
  { value: 'star', label: 'Estrela', icon: Star },
  { value: 'heart', label: 'Coração', icon: Heart },
  { value: 'zap', label: 'Raio', icon: Zap },
  { value: 'check', label: 'Check', icon: Check },
];

// Font options
const FONT_OPTIONS = [
  { value: 'Inter', label: 'Inter (Moderno)' },
  { value: 'Poppins', label: 'Poppins (Elegante)' },
  { value: 'Roboto', label: 'Roboto (Clássico)' },
  { value: 'Open Sans', label: 'Open Sans (Limpo)' },
  { value: 'Lato', label: 'Lato (Amigável)' },
  { value: 'Montserrat', label: 'Montserrat (Sofisticado)' },
];

// Border radius options
const RADIUS_OPTIONS = [
  { value: 'none', label: 'Sem arredondamento' },
  { value: 'small', label: 'Pequeno' },
  { value: 'rounded', label: 'Médio' },
  { value: 'large', label: 'Grande' },
  { value: 'full', label: 'Máximo' },
];

interface StoreCustomizationFormProps {
  business: Business;
}

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function CollapsibleSection({ title, icon, children, defaultOpen = false }: SectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon}
          <span className="font-semibold text-slate-900">{title}</span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-slate-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-500" />
        )}
      </button>
      {isOpen && (
        <div className="p-4 space-y-4 bg-white">
          {children}
        </div>
      )}
    </div>
  );
}

function ColorInput({ 
  label, 
  value, 
  onChange, 
  hint,
  disabled 
}: { 
  label: string; 
  value: string; 
  onChange: (v: string) => void; 
  hint?: string;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-10 h-10 rounded border border-slate-300 cursor-pointer disabled:opacity-50"
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          disabled={disabled}
          className="flex-1"
        />
      </div>
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

function ToggleSwitch({ 
  label, 
  checked, 
  onChange,
  hint,
  disabled 
}: { 
  label: string; 
  checked: boolean; 
  onChange: (v: boolean) => void;
  hint?: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
      <div>
        <p className="font-medium text-slate-900">{label}</p>
        {hint && <p className="text-xs text-slate-500">{hint}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        disabled={disabled}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          checked ? 'bg-blue-600' : 'bg-slate-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span
          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
            checked ? 'translate-x-6' : ''
          }`}
        />
      </button>
    </div>
  );
}

function SelectInput({
  label,
  value,
  onChange,
  options,
  hint,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  hint?: string;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full px-4 py-3 border border-slate-200 rounded-lg text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent disabled:bg-slate-50 disabled:cursor-not-allowed"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export function StoreCustomizationForm({ business }: StoreCustomizationFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Header settings
  const [headerBgColor, setHeaderBgColor] = useState(business.header_bg_color || '#ffffff');
  const [headerTextColor, setHeaderTextColor] = useState(business.header_text_color || '#1e293b');
  const [headerStyle, setHeaderStyle] = useState<string>(business.header_style || 'solid');
  const [showHeaderContact, setShowHeaderContact] = useState(business.show_header_contact ?? true);
  const [logoLinkUrl, setLogoLinkUrl] = useState(business.logo_link_url || '');
  
  // Header/Footer visibility
  const [showHeader, setShowHeader] = useState(business.show_header ?? true);
  const [showFooter, setShowFooter] = useState(business.show_footer ?? true);
  
  // Hero settings
  const [heroTitle, setHeroTitle] = useState(business.hero_title || '');
  const [heroSubtitle, setHeroSubtitle] = useState(business.hero_subtitle || '');
  const [heroBgType, setHeroBgType] = useState<string>(business.hero_bg_type || 'color');
  const [heroBgColor, setHeroBgColor] = useState(business.hero_bg_color || '#1e3a5f');
  const [heroBgGradientStart, setHeroBgGradientStart] = useState(business.hero_bg_gradient_start || '#1e3a5f');
  const [heroBgGradientEnd, setHeroBgGradientEnd] = useState(business.hero_bg_gradient_end || '#3b82f6');
  const [heroBgImageUrl, setHeroBgImageUrl] = useState(business.hero_bg_image_url || '');
  const [heroTextColor, setHeroTextColor] = useState(business.hero_text_color || '#ffffff');
  const [heroOverlayOpacity, setHeroOverlayOpacity] = useState(business.hero_overlay_opacity ?? 50);
  const [heroCtaText, setHeroCtaText] = useState(business.hero_cta_text || 'Ver Produtos');
  const [heroCtaUrl, setHeroCtaUrl] = useState(business.hero_cta_url || '');
  const [heroCtaColor, setHeroCtaColor] = useState(business.hero_cta_color || '#2563eb');
  const [showHeroSection, setShowHeroSection] = useState(business.show_hero_section ?? true);
  
  // Products settings
  const [productsTitle, setProductsTitle] = useState(business.products_title || 'Nossos Produtos');
  const [productsBgColor, setProductsBgColor] = useState(business.products_bg_color || '#ffffff');
  const [productsLayout, setProductsLayout] = useState<string>(business.products_layout || 'grid');
  const [productsColumns, setProductsColumns] = useState(business.products_columns ?? 3);
  const [showProductDescription, setShowProductDescription] = useState(business.show_product_description ?? true);
  const [cardStyle, setCardStyle] = useState<string>(business.card_style || 'elevated');
  
  // Section 1 (Intro/About - above products)
  const [section1Enabled, setSection1Enabled] = useState(business.section1_enabled ?? false);
  const [section1Title, setSection1Title] = useState(business.section1_title || '');
  const [section1Subtitle, setSection1Subtitle] = useState(business.section1_subtitle || '');
  const [section1Content, setSection1Content] = useState(business.section1_content || '');
  const [section1BgColor, setSection1BgColor] = useState(business.section1_bg_color || '#ffffff');
  const [section1TextColor, setSection1TextColor] = useState(business.section1_text_color || '#1e293b');
  const [section1Layout, setSection1Layout] = useState<string>(business.section1_layout || 'centered');
  const [section1ImageUrl, setSection1ImageUrl] = useState(business.section1_image_url || '');
  const [section1CtaText, setSection1CtaText] = useState(business.section1_cta_text || '');
  const [section1CtaUrl, setSection1CtaUrl] = useState(business.section1_cta_url || '');
  const [section1CtaColor, setSection1CtaColor] = useState(business.section1_cta_color || '#2563eb');
  
  // Products section extra
  const [productsSectionEnabled, setProductsSectionEnabled] = useState(business.products_section_enabled ?? true);
  const [productsSubtitle, setProductsSubtitle] = useState(business.products_subtitle || '');
  
  // Section 2 (Benefits/Features - below products)
  const [section2Enabled, setSection2Enabled] = useState(business.section2_enabled ?? true);
  const [section2Type, setSection2Type] = useState<string>(business.section2_type || 'features');
  const [section2Title, setSection2Title] = useState(business.section2_title || 'Por que nos escolher?');
  const [section2Subtitle, setSection2Subtitle] = useState(business.section2_subtitle || '');
  const [section2BgColor, setSection2BgColor] = useState(business.section2_bg_color || '#f8fafc');
  const [section2TextColor, setSection2TextColor] = useState(business.section2_text_color || '#1e293b');
  const [section2Item1Icon, setSection2Item1Icon] = useState(business.section2_item1_icon || 'star');
  const [section2Item1Title, setSection2Item1Title] = useState(business.section2_item1_title || 'Qualidade');
  const [section2Item1Description, setSection2Item1Description] = useState(business.section2_item1_description || 'Produtos e serviços de alta qualidade');
  const [section2Item2Icon, setSection2Item2Icon] = useState(business.section2_item2_icon || 'clock');
  const [section2Item2Title, setSection2Item2Title] = useState(business.section2_item2_title || 'Agilidade');
  const [section2Item2Description, setSection2Item2Description] = useState(business.section2_item2_description || 'Atendimento rápido e eficiente');
  const [section2Item3Icon, setSection2Item3Icon] = useState(business.section2_item3_icon || 'shield');
  const [section2Item3Title, setSection2Item3Title] = useState(business.section2_item3_title || 'Segurança');
  const [section2Item3Description, setSection2Item3Description] = useState(business.section2_item3_description || 'Sua satisfação é nossa prioridade');
  const [section2Item4Icon, setSection2Item4Icon] = useState(business.section2_item4_icon || '');
  const [section2Item4Title, setSection2Item4Title] = useState(business.section2_item4_title || '');
  const [section2Item4Description, setSection2Item4Description] = useState(business.section2_item4_description || '');
  
  // Section 3 (Additional content)
  const [section3Enabled, setSection3Enabled] = useState(business.section3_enabled ?? false);
  const [section3Type, setSection3Type] = useState<string>(business.section3_type || 'text');
  const [section3Title, setSection3Title] = useState(business.section3_title || '');
  const [section3Subtitle, setSection3Subtitle] = useState(business.section3_subtitle || '');
  const [section3Content, setSection3Content] = useState(business.section3_content || '');
  const [section3BgColor, setSection3BgColor] = useState(business.section3_bg_color || '#ffffff');
  const [section3TextColor, setSection3TextColor] = useState(business.section3_text_color || '#1e293b');
  const [section3ImageUrl, setSection3ImageUrl] = useState(business.section3_image_url || '');
  const [section3CtaText, setSection3CtaText] = useState(business.section3_cta_text || '');
  const [section3CtaUrl, setSection3CtaUrl] = useState(business.section3_cta_url || '');
  
  // CTA Banner
  const [ctaBannerEnabled, setCtaBannerEnabled] = useState(business.cta_banner_enabled ?? false);
  const [ctaBannerTitle, setCtaBannerTitle] = useState(business.cta_banner_title || '');
  const [ctaBannerSubtitle, setCtaBannerSubtitle] = useState(business.cta_banner_subtitle || '');
  const [ctaBannerButtonText, setCtaBannerButtonText] = useState(business.cta_banner_button_text || 'Saiba Mais');
  const [ctaBannerButtonUrl, setCtaBannerButtonUrl] = useState(business.cta_banner_button_url || '');
  const [ctaBannerBgColor, setCtaBannerBgColor] = useState(business.cta_banner_bg_color || '#1e3a5f');
  const [ctaBannerTextColor, setCtaBannerTextColor] = useState(business.cta_banner_text_color || '#ffffff');
  
  // Footer settings
  const [footerBgColor, setFooterBgColor] = useState(business.footer_bg_color || '#1e293b');
  const [footerTextColor, setFooterTextColor] = useState(business.footer_text_color || '#94a3b8');
  const [footerText, setFooterText] = useState(business.footer_text || '');
  const [showFooterContact, setShowFooterContact] = useState(business.show_footer_contact ?? true);
  const [showFooterSocial, setShowFooterSocial] = useState(business.show_footer_social ?? true);
  const [socialFacebook, setSocialFacebook] = useState(business.social_facebook || '');
  const [socialInstagram, setSocialInstagram] = useState(business.social_instagram || '');
  const [socialWhatsapp, setSocialWhatsapp] = useState(business.social_whatsapp || '');
  const [whatsappNumber, setWhatsappNumber] = useState(business.whatsapp_number || '');
  
  // General settings
  const [pageBgColor, setPageBgColor] = useState(business.page_bg_color || '#f8fafc');
  const [fontFamily, setFontFamily] = useState<string>(business.font_family || 'Inter');
  const [borderRadius, setBorderRadius] = useState<string>(business.border_radius || 'rounded');
  const [faviconUrl, setFaviconUrl] = useState(business.favicon_url || '');
  const [ogImageUrl, setOgImageUrl] = useState(business.og_image_url || '');
  const [metaTitle, setMetaTitle] = useState(business.meta_title || '');
  const [metaDescription, setMetaDescription] = useState(business.meta_description || '');
  
  // Custom gift cards settings
  const [customCardsEnabled, setCustomCardsEnabled] = useState(business.custom_cards_enabled ?? false);
  const [customCardsMinAmount, setCustomCardsMinAmount] = useState((business.custom_cards_min_amount_cents || 1000) / 100);
  const [customCardsMaxAmount, setCustomCardsMaxAmount] = useState((business.custom_cards_max_amount_cents || 100000) / 100);
  const [customCardsPresetAmounts, setCustomCardsPresetAmounts] = useState(
    (business.custom_cards_preset_amounts || [2500, 5000, 10000, 15000, 20000, 50000]).map(a => a / 100).join(', ')
  );
  const [customCardsAllowCustomAmount, setCustomCardsAllowCustomAmount] = useState(business.custom_cards_allow_custom_amount ?? true);
  const [customCardsSectionTitle, setCustomCardsSectionTitle] = useState(business.custom_cards_section_title || 'Crie seu Vale-Presente Personalizado');
  const [customCardsSectionSubtitle, setCustomCardsSectionSubtitle] = useState(business.custom_cards_section_subtitle || 'Personalize com sua mensagem especial');
  const [hideTemplateCards, setHideTemplateCards] = useState(business.hide_template_cards ?? false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/business/store-customization', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Business ID (for admin editing other businesses)
          business_id: business.id,
          
          // Header/Footer visibility
          show_header: showHeader,
          show_footer: showFooter,
          
          // Header
          header_bg_color: headerBgColor,
          header_text_color: headerTextColor,
          header_style: headerStyle,
          show_header_contact: showHeaderContact,
          logo_link_url: logoLinkUrl || null,
          
          // Hero
          hero_title: heroTitle || null,
          hero_subtitle: heroSubtitle || null,
          hero_bg_type: heroBgType,
          hero_bg_color: heroBgColor,
          hero_bg_gradient_start: heroBgGradientStart,
          hero_bg_gradient_end: heroBgGradientEnd,
          hero_bg_image_url: heroBgImageUrl || null,
          hero_text_color: heroTextColor,
          hero_overlay_opacity: heroOverlayOpacity,
          hero_cta_text: heroCtaText,
          hero_cta_url: heroCtaUrl || null,
          hero_cta_color: heroCtaColor,
          show_hero_section: showHeroSection,
          
          // Products
          products_title: productsTitle,
          products_subtitle: productsSubtitle || null,
          products_bg_color: productsBgColor,
          products_layout: productsLayout,
          products_columns: productsColumns,
          show_product_description: showProductDescription,
          card_style: cardStyle,
          products_section_enabled: productsSectionEnabled,
          
          // Section 1 (Intro/About)
          section1_enabled: section1Enabled,
          section1_title: section1Title || null,
          section1_subtitle: section1Subtitle || null,
          section1_content: section1Content || null,
          section1_bg_color: section1BgColor,
          section1_text_color: section1TextColor,
          section1_layout: section1Layout,
          section1_image_url: section1ImageUrl || null,
          section1_cta_text: section1CtaText || null,
          section1_cta_url: section1CtaUrl || null,
          section1_cta_color: section1CtaColor,
          
          // Section 2 (Benefits/Features)
          section2_enabled: section2Enabled,
          section2_type: section2Type,
          section2_title: section2Title || null,
          section2_subtitle: section2Subtitle || null,
          section2_bg_color: section2BgColor,
          section2_text_color: section2TextColor,
          section2_item1_icon: section2Item1Icon,
          section2_item1_title: section2Item1Title,
          section2_item1_description: section2Item1Description,
          section2_item2_icon: section2Item2Icon,
          section2_item2_title: section2Item2Title,
          section2_item2_description: section2Item2Description,
          section2_item3_icon: section2Item3Icon,
          section2_item3_title: section2Item3Title,
          section2_item3_description: section2Item3Description,
          section2_item4_icon: section2Item4Icon || null,
          section2_item4_title: section2Item4Title || null,
          section2_item4_description: section2Item4Description || null,
          
          // Section 3 (Additional content)
          section3_enabled: section3Enabled,
          section3_type: section3Type,
          section3_title: section3Title || null,
          section3_subtitle: section3Subtitle || null,
          section3_content: section3Content || null,
          section3_bg_color: section3BgColor,
          section3_text_color: section3TextColor,
          section3_image_url: section3ImageUrl || null,
          section3_cta_text: section3CtaText || null,
          section3_cta_url: section3CtaUrl || null,
          
          // CTA Banner
          cta_banner_enabled: ctaBannerEnabled,
          cta_banner_title: ctaBannerTitle || null,
          cta_banner_subtitle: ctaBannerSubtitle || null,
          cta_banner_button_text: ctaBannerButtonText,
          cta_banner_button_url: ctaBannerButtonUrl || null,
          cta_banner_bg_color: ctaBannerBgColor,
          cta_banner_text_color: ctaBannerTextColor,
          
          // Footer
          footer_bg_color: footerBgColor,
          footer_text_color: footerTextColor,
          footer_text: footerText || null,
          show_footer_contact: showFooterContact,
          show_footer_social: showFooterSocial,
          social_facebook: socialFacebook || null,
          social_instagram: socialInstagram || null,
          social_whatsapp: socialWhatsapp || null,
          whatsapp_number: whatsappNumber || null,
          
          // General
          page_bg_color: pageBgColor,
          font_family: fontFamily,
          border_radius: borderRadius,
          favicon_url: faviconUrl || null,
          og_image_url: ogImageUrl || null,
          meta_title: metaTitle || null,
          meta_description: metaDescription || null,
          
          // Custom gift cards
          custom_cards_enabled: customCardsEnabled,
          custom_cards_min_amount_cents: Math.round(customCardsMinAmount * 100),
          custom_cards_max_amount_cents: Math.round(customCardsMaxAmount * 100),
          custom_cards_preset_amounts: customCardsPresetAmounts
            .split(',')
            .map(s => Math.round(parseFloat(s.trim()) * 100))
            .filter(n => !isNaN(n) && n > 0),
          custom_cards_allow_custom_amount: customCardsAllowCustomAmount,
          custom_cards_section_title: customCardsSectionTitle || null,
          custom_cards_section_subtitle: customCardsSectionSubtitle || null,
          hide_template_cards: hideTemplateCards,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao salvar configurações');
      }

      setSuccess('Configurações da loja salvas com sucesso!');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert variant="error">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {/* General Settings */}
      <CollapsibleSection 
        title="Configurações Gerais" 
        icon={<Palette className="w-5 h-5 text-purple-600" />}
        defaultOpen
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ColorInput
            label="Cor de Fundo da Página"
            value={pageBgColor}
            onChange={setPageBgColor}
            disabled={isLoading}
          />
          <SelectInput
            label="Fonte"
            value={fontFamily}
            onChange={setFontFamily}
            options={FONT_OPTIONS}
            disabled={isLoading}
          />
        </div>
        <SelectInput
          label="Arredondamento dos Cantos"
          value={borderRadius}
          onChange={setBorderRadius}
          options={RADIUS_OPTIONS}
          hint="Afeta botões, cards e outros elementos"
          disabled={isLoading}
        />
        <div className="pt-2 border-t border-slate-200 mt-4">
          <p className="text-sm font-medium text-slate-700 mb-3">Visibilidade das Seções</p>
          <div className="space-y-2">
            <ToggleSwitch
              label="Mostrar Cabeçalho"
              checked={showHeader}
              onChange={setShowHeader}
              hint="Desative para ocultar o cabeçalho completamente"
              disabled={isLoading}
            />
            <ToggleSwitch
              label="Mostrar Rodapé"
              checked={showFooter}
              onChange={setShowFooter}
              hint="Desative para ocultar o rodapé completamente"
              disabled={isLoading}
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* Header Settings */}
      {showHeader && (
        <CollapsibleSection 
          title="Cabeçalho" 
          icon={<Layout className="w-5 h-5 text-blue-600" />}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ColorInput
              label="Cor de Fundo"
              value={headerBgColor}
              onChange={setHeaderBgColor}
              disabled={isLoading}
            />
            <ColorInput
              label="Cor do Texto"
              value={headerTextColor}
              onChange={setHeaderTextColor}
              disabled={isLoading}
            />
          </div>
          <SelectInput
            label="Estilo do Cabeçalho"
            value={headerStyle}
            onChange={setHeaderStyle}
            options={[
              { value: 'solid', label: 'Sólido' },
              { value: 'transparent', label: 'Transparente' },
              { value: 'gradient', label: 'Gradiente' },
            ]}
            disabled={isLoading}
          />
          <div className="space-y-1">
            <Label>Link do Logo</Label>
            <Input
              value={logoLinkUrl}
              onChange={(e) => setLogoLinkUrl(e.target.value)}
              placeholder="https://seusite.com.br"
              disabled={isLoading}
            />
            <p className="text-xs text-slate-500">URL para redirecionar ao clicar no logo</p>
          </div>
          <ToggleSwitch
            label="Mostrar Contato no Cabeçalho"
            checked={showHeaderContact}
            onChange={setShowHeaderContact}
            disabled={isLoading}
          />
        </CollapsibleSection>
      )}

      {/* Hero Settings */}
      <CollapsibleSection 
        title="Seção Principal (Hero)" 
        icon={<ImageIcon className="w-5 h-5 text-green-600" />}
      >
        <ToggleSwitch
          label="Mostrar Seção Hero"
          checked={showHeroSection}
          onChange={setShowHeroSection}
          disabled={isLoading}
        />
        
        {showHeroSection && (
          <>
            <div className="space-y-1">
              <Label>Título Principal</Label>
              <Input
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                placeholder="Presenteie quem você ama"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-1">
              <Label>Subtítulo</Label>
              <textarea
                value={heroSubtitle}
                onChange={(e) => setHeroSubtitle(e.target.value)}
                placeholder="Escolha o valor perfeito e envie um vale-presente digital instantaneamente."
                disabled={isLoading}
                rows={2}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent disabled:bg-slate-50 disabled:cursor-not-allowed resize-none"
              />
            </div>
            
            <SelectInput
              label="Tipo de Fundo"
              value={heroBgType}
              onChange={setHeroBgType}
              options={[
                { value: 'color', label: 'Cor Sólida' },
                { value: 'gradient', label: 'Gradiente' },
                { value: 'image', label: 'Imagem' },
              ]}
              disabled={isLoading}
            />
            
            {heroBgType === 'color' && (
              <ColorInput
                label="Cor de Fundo"
                value={heroBgColor}
                onChange={setHeroBgColor}
                disabled={isLoading}
              />
            )}
            
            {heroBgType === 'gradient' && (
              <div className="grid grid-cols-2 gap-4">
                <ColorInput
                  label="Cor Inicial"
                  value={heroBgGradientStart}
                  onChange={setHeroBgGradientStart}
                  disabled={isLoading}
                />
                <ColorInput
                  label="Cor Final"
                  value={heroBgGradientEnd}
                  onChange={setHeroBgGradientEnd}
                  disabled={isLoading}
                />
              </div>
            )}
            
            {heroBgType === 'image' && (
              <>
                <div className="space-y-1">
                  <Label>URL da Imagem de Fundo</Label>
                  <Input
                    value={heroBgImageUrl}
                    onChange={(e) => setHeroBgImageUrl(e.target.value)}
                    placeholder="https://exemplo.com/imagem.jpg"
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Opacidade da Sobreposição ({heroOverlayOpacity}%)</Label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={heroOverlayOpacity}
                    onChange={(e) => setHeroOverlayOpacity(Number(e.target.value))}
                    disabled={isLoading}
                    className="w-full"
                  />
                  <p className="text-xs text-slate-500">Escurece a imagem para melhor legibilidade do texto</p>
                </div>
              </>
            )}
            
            <ColorInput
              label="Cor do Texto"
              value={heroTextColor}
              onChange={setHeroTextColor}
              disabled={isLoading}
            />
            
            <div className="p-4 bg-slate-50 rounded-lg space-y-3">
              <p className="font-medium text-slate-700">Botão de Ação (CTA)</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Texto do Botão</Label>
                  <Input
                    value={heroCtaText}
                    onChange={(e) => setHeroCtaText(e.target.value)}
                    placeholder="Ver Produtos"
                    disabled={isLoading}
                  />
                </div>
                <ColorInput
                  label="Cor do Botão"
                  value={heroCtaColor}
                  onChange={setHeroCtaColor}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-1">
                <Label>URL do Botão</Label>
                <Input
                  value={heroCtaUrl}
                  onChange={(e) => setHeroCtaUrl(e.target.value)}
                  placeholder="#produtos ou https://exemplo.com"
                  disabled={isLoading}
                />
                <p className="text-xs text-slate-500">Use #produtos para rolar até os produtos, ou qualquer URL externa</p>
              </div>
            </div>
          </>
        )}
      </CollapsibleSection>

      {/* Products Settings */}
      <CollapsibleSection 
        title="Seção de Produtos" 
        icon={<Gift className="w-5 h-5 text-pink-600" />}
      >
        <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
          <div>
            <p className="font-medium text-amber-900">Ocultar Vale-Presentes Pré-definidos</p>
            <p className="text-sm text-amber-700">Mostrar apenas vale-presentes personalizados (se ativado)</p>
          </div>
          <button
            type="button"
            onClick={() => setHideTemplateCards(!hideTemplateCards)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              hideTemplateCards ? 'bg-amber-600' : 'bg-slate-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                hideTemplateCards ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        <div className="space-y-1">
          <Label>Título da Seção</Label>
          <Input
            value={productsTitle}
            onChange={(e) => setProductsTitle(e.target.value)}
            placeholder="Escolha seu Vale-Presente"
            disabled={isLoading}
          />
        </div>
        <ColorInput
          label="Cor de Fundo"
          value={productsBgColor}
          onChange={setProductsBgColor}
          disabled={isLoading}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectInput
            label="Layout"
            value={productsLayout}
            onChange={setProductsLayout}
            options={[
              { value: 'grid', label: 'Grade' },
              { value: 'list', label: 'Lista' },
              { value: 'carousel', label: 'Carrossel' },
            ]}
            disabled={isLoading}
          />
          <SelectInput
            label="Colunas (Grade)"
            value={String(productsColumns)}
            onChange={(v) => setProductsColumns(Number(v))}
            options={[
              { value: '1', label: '1 coluna' },
              { value: '2', label: '2 colunas' },
              { value: '3', label: '3 colunas' },
              { value: '4', label: '4 colunas' },
            ]}
            disabled={isLoading}
          />
        </div>
        <SelectInput
          label="Estilo dos Cards"
          value={cardStyle}
          onChange={setCardStyle}
          options={[
            { value: 'elevated', label: 'Elevado (com sombra)' },
            { value: 'flat', label: 'Plano' },
            { value: 'bordered', label: 'Com borda' },
          ]}
          disabled={isLoading}
        />
        <ToggleSwitch
          label="Mostrar Descrição dos Produtos"
          checked={showProductDescription}
          onChange={setShowProductDescription}
          disabled={isLoading}
        />
      </CollapsibleSection>

      {/* Section 1 - Intro/About */}
      <CollapsibleSection 
        title="Seção 1 - Introdução (acima dos produtos)" 
        icon={<Layout className="w-5 h-5 text-teal-600" />}
      >
        <ToggleSwitch
          label="Ativar Seção de Introdução"
          checked={section1Enabled}
          onChange={setSection1Enabled}
          hint="Aparece entre o Hero e os Produtos"
          disabled={isLoading}
        />
        
        {section1Enabled && (
          <>
            <Input
              value={section1Title}
              onChange={(e) => setSection1Title(e.target.value)}
              placeholder="Título da seção"
              disabled={isLoading}
            />
            <Input
              value={section1Subtitle}
              onChange={(e) => setSection1Subtitle(e.target.value)}
              placeholder="Subtítulo (opcional)"
              disabled={isLoading}
            />
            <div className="space-y-1">
              <Label>Conteúdo</Label>
              <textarea
                value={section1Content}
                onChange={(e) => setSection1Content(e.target.value)}
                placeholder="Texto do conteúdo..."
                disabled={isLoading}
                rows={4}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent disabled:bg-slate-50 disabled:cursor-not-allowed resize-none"
              />
            </div>
            <SelectInput
              label="Layout"
              value={section1Layout}
              onChange={setSection1Layout}
              options={[
                { value: 'centered', label: 'Centralizado' },
                { value: 'left', label: 'Alinhado à esquerda' },
                { value: 'split', label: 'Dividido (texto + imagem)' },
              ]}
              disabled={isLoading}
            />
            <Input
              value={section1ImageUrl}
              onChange={(e) => setSection1ImageUrl(e.target.value)}
              placeholder="URL da imagem (opcional)"
              disabled={isLoading}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ColorInput label="Cor de Fundo" value={section1BgColor} onChange={setSection1BgColor} disabled={isLoading} />
              <ColorInput label="Cor do Texto" value={section1TextColor} onChange={setSection1TextColor} disabled={isLoading} />
            </div>
            <div className="p-4 bg-slate-50 rounded-lg space-y-3">
              <p className="font-medium text-slate-700">Botão de Ação (opcional)</p>
              <Input value={section1CtaText} onChange={(e) => setSection1CtaText(e.target.value)} placeholder="Texto do botão" disabled={isLoading} />
              <Input value={section1CtaUrl} onChange={(e) => setSection1CtaUrl(e.target.value)} placeholder="URL do botão" disabled={isLoading} />
              <ColorInput label="Cor do Botão" value={section1CtaColor} onChange={setSection1CtaColor} disabled={isLoading} />
            </div>
          </>
        )}
      </CollapsibleSection>

      {/* Section 2 - Benefits/Features */}
      <CollapsibleSection 
        title="Seção 2 - Benefícios (abaixo dos produtos)" 
        icon={<Star className="w-5 h-5 text-yellow-600" />}
      >
        <ToggleSwitch
          label="Ativar Seção de Benefícios"
          checked={section2Enabled}
          onChange={setSection2Enabled}
          disabled={isLoading}
        />
        
        {section2Enabled && (
          <>
            <SelectInput
              label="Tipo de Seção"
              value={section2Type}
              onChange={setSection2Type}
              options={[
                { value: 'features', label: 'Ícones com texto' },
                { value: 'text', label: 'Apenas texto' },
              ]}
              disabled={isLoading}
            />
            <Input
              value={section2Title}
              onChange={(e) => setSection2Title(e.target.value)}
              placeholder="Título da seção"
              disabled={isLoading}
            />
            <Input
              value={section2Subtitle}
              onChange={(e) => setSection2Subtitle(e.target.value)}
              placeholder="Subtítulo (opcional)"
              disabled={isLoading}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ColorInput label="Cor de Fundo" value={section2BgColor} onChange={setSection2BgColor} disabled={isLoading} />
              <ColorInput label="Cor do Texto" value={section2TextColor} onChange={setSection2TextColor} disabled={isLoading} />
            </div>
            
            {section2Type === 'features' && (
              <>
                {/* Item 1 */}
                <div className="p-4 bg-slate-50 rounded-lg space-y-3">
                  <p className="font-medium text-slate-700">Item 1</p>
                  <SelectInput label="Ícone" value={section2Item1Icon} onChange={setSection2Item1Icon} options={ICON_OPTIONS.map(i => ({ value: i.value, label: i.label }))} disabled={isLoading} />
                  <Input value={section2Item1Title} onChange={(e) => setSection2Item1Title(e.target.value)} placeholder="Título" disabled={isLoading} />
                  <Input value={section2Item1Description} onChange={(e) => setSection2Item1Description(e.target.value)} placeholder="Descrição" disabled={isLoading} />
                </div>
                {/* Item 2 */}
                <div className="p-4 bg-slate-50 rounded-lg space-y-3">
                  <p className="font-medium text-slate-700">Item 2</p>
                  <SelectInput label="Ícone" value={section2Item2Icon} onChange={setSection2Item2Icon} options={ICON_OPTIONS.map(i => ({ value: i.value, label: i.label }))} disabled={isLoading} />
                  <Input value={section2Item2Title} onChange={(e) => setSection2Item2Title(e.target.value)} placeholder="Título" disabled={isLoading} />
                  <Input value={section2Item2Description} onChange={(e) => setSection2Item2Description(e.target.value)} placeholder="Descrição" disabled={isLoading} />
                </div>
                {/* Item 3 */}
                <div className="p-4 bg-slate-50 rounded-lg space-y-3">
                  <p className="font-medium text-slate-700">Item 3</p>
                  <SelectInput label="Ícone" value={section2Item3Icon} onChange={setSection2Item3Icon} options={ICON_OPTIONS.map(i => ({ value: i.value, label: i.label }))} disabled={isLoading} />
                  <Input value={section2Item3Title} onChange={(e) => setSection2Item3Title(e.target.value)} placeholder="Título" disabled={isLoading} />
                  <Input value={section2Item3Description} onChange={(e) => setSection2Item3Description(e.target.value)} placeholder="Descrição" disabled={isLoading} />
                </div>
                {/* Item 4 (optional) */}
                <div className="p-4 bg-slate-50 rounded-lg space-y-3">
                  <p className="font-medium text-slate-700">Item 4 (opcional)</p>
                  <SelectInput label="Ícone" value={section2Item4Icon} onChange={setSection2Item4Icon} options={[{ value: '', label: 'Nenhum' }, ...ICON_OPTIONS.map(i => ({ value: i.value, label: i.label }))]} disabled={isLoading} />
                  <Input value={section2Item4Title} onChange={(e) => setSection2Item4Title(e.target.value)} placeholder="Título" disabled={isLoading} />
                  <Input value={section2Item4Description} onChange={(e) => setSection2Item4Description(e.target.value)} placeholder="Descrição" disabled={isLoading} />
                </div>
              </>
            )}
          </>
        )}
      </CollapsibleSection>

      {/* Section 3 - Additional Content */}
      <CollapsibleSection 
        title="Seção 3 - Conteúdo Adicional" 
        icon={<Type className="w-5 h-5 text-purple-600" />}
      >
        <ToggleSwitch
          label="Ativar Seção Adicional"
          checked={section3Enabled}
          onChange={setSection3Enabled}
          disabled={isLoading}
        />
        
        {section3Enabled && (
          <>
            <SelectInput
              label="Tipo de Seção"
              value={section3Type}
              onChange={setSection3Type}
              options={[
                { value: 'text', label: 'Texto' },
                { value: 'cta', label: 'Call to Action' },
              ]}
              disabled={isLoading}
            />
            <Input value={section3Title} onChange={(e) => setSection3Title(e.target.value)} placeholder="Título" disabled={isLoading} />
            <Input value={section3Subtitle} onChange={(e) => setSection3Subtitle(e.target.value)} placeholder="Subtítulo (opcional)" disabled={isLoading} />
            {section3Type !== 'cta' && (
              <textarea
                value={section3Content}
                onChange={(e) => setSection3Content(e.target.value)}
                placeholder="Conteúdo..."
                disabled={isLoading}
                rows={4}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent disabled:bg-slate-50 disabled:cursor-not-allowed resize-none"
              />
            )}
            <Input value={section3ImageUrl} onChange={(e) => setSection3ImageUrl(e.target.value)} placeholder="URL da imagem (opcional)" disabled={isLoading} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ColorInput label="Cor de Fundo" value={section3BgColor} onChange={setSection3BgColor} disabled={isLoading} />
              <ColorInput label="Cor do Texto" value={section3TextColor} onChange={setSection3TextColor} disabled={isLoading} />
            </div>
            <div className="p-4 bg-slate-50 rounded-lg space-y-3">
              <p className="font-medium text-slate-700">Botão de Ação</p>
              <Input value={section3CtaText} onChange={(e) => setSection3CtaText(e.target.value)} placeholder="Texto do botão" disabled={isLoading} />
              <Input value={section3CtaUrl} onChange={(e) => setSection3CtaUrl(e.target.value)} placeholder="URL do botão" disabled={isLoading} />
            </div>
          </>
        )}
      </CollapsibleSection>

      {/* CTA Banner */}
      <CollapsibleSection 
        title="Banner de Chamada (CTA)" 
        icon={<Zap className="w-5 h-5 text-orange-600" />}
      >
        <ToggleSwitch
          label="Ativar Banner de Chamada"
          checked={ctaBannerEnabled}
          onChange={setCtaBannerEnabled}
          hint="Um banner destacado para chamar atenção"
          disabled={isLoading}
        />
        
        {ctaBannerEnabled && (
          <>
            <Input value={ctaBannerTitle} onChange={(e) => setCtaBannerTitle(e.target.value)} placeholder="Título do banner" disabled={isLoading} />
            <Input value={ctaBannerSubtitle} onChange={(e) => setCtaBannerSubtitle(e.target.value)} placeholder="Subtítulo (opcional)" disabled={isLoading} />
            <Input value={ctaBannerButtonText} onChange={(e) => setCtaBannerButtonText(e.target.value)} placeholder="Texto do botão" disabled={isLoading} />
            <Input value={ctaBannerButtonUrl} onChange={(e) => setCtaBannerButtonUrl(e.target.value)} placeholder="URL do botão" disabled={isLoading} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ColorInput label="Cor de Fundo" value={ctaBannerBgColor} onChange={setCtaBannerBgColor} disabled={isLoading} />
              <ColorInput label="Cor do Texto" value={ctaBannerTextColor} onChange={setCtaBannerTextColor} disabled={isLoading} />
            </div>
          </>
        )}
      </CollapsibleSection>

      {/* Footer Settings */}
      <CollapsibleSection 
        title="Rodapé" 
        icon={<Type className="w-5 h-5 text-slate-600" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ColorInput
            label="Cor de Fundo"
            value={footerBgColor}
            onChange={setFooterBgColor}
            disabled={isLoading}
          />
          <ColorInput
            label="Cor do Texto"
            value={footerTextColor}
            onChange={setFooterTextColor}
            disabled={isLoading}
          />
        </div>
        <div className="space-y-1">
          <Label>Texto Personalizado do Rodapé</Label>
          <textarea
            value={footerText}
            onChange={(e) => setFooterText(e.target.value)}
            placeholder="Texto adicional para o rodapé..."
            disabled={isLoading}
            rows={2}
            className="w-full px-4 py-3 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent disabled:bg-slate-50 disabled:cursor-not-allowed resize-none"
          />
        </div>
        <ToggleSwitch
          label="Mostrar Informações de Contato"
          checked={showFooterContact}
          onChange={setShowFooterContact}
          disabled={isLoading}
        />
        <ToggleSwitch
          label="Mostrar Redes Sociais"
          checked={showFooterSocial}
          onChange={setShowFooterSocial}
          disabled={isLoading}
        />
        
        {showFooterSocial && (
          <div className="space-y-3 p-4 bg-slate-50 rounded-lg">
            <p className="font-medium text-slate-700">Redes Sociais</p>
            <Input
              value={socialFacebook}
              onChange={(e) => setSocialFacebook(e.target.value)}
              placeholder="URL do Facebook"
              disabled={isLoading}
            />
            <Input
              value={socialInstagram}
              onChange={(e) => setSocialInstagram(e.target.value)}
              placeholder="URL do Instagram"
              disabled={isLoading}
            />
            <Input
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder="Número do WhatsApp (ex: 5511999999999)"
              disabled={isLoading}
            />
          </div>
        )}
      </CollapsibleSection>

      {/* Custom Gift Cards Settings */}
      <CollapsibleSection 
        title="Vale-Presentes Personalizados" 
        icon={<Gift className="w-5 h-5 text-violet-600" />}
      >
        <div className="p-4 bg-violet-50 rounded-lg mb-4">
          <p className="text-sm text-violet-800">
            Permita que seus clientes criem vale-presentes personalizados com valor, design e mensagem próprios.
          </p>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
          <div>
            <p className="font-medium text-slate-900">Ativar Vale-Presentes Personalizados</p>
            <p className="text-sm text-slate-500">Clientes poderão criar seus próprios vale-presentes</p>
          </div>
          <button
            type="button"
            onClick={() => setCustomCardsEnabled(!customCardsEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              customCardsEnabled ? 'bg-violet-600' : 'bg-slate-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                customCardsEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        
        {customCardsEnabled && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div className="space-y-1">
                <Label>Valor Mínimo (R$)</Label>
                <Input
                  type="number"
                  value={customCardsMinAmount}
                  onChange={(e) => setCustomCardsMinAmount(parseFloat(e.target.value) || 0)}
                  min={1}
                  step={0.01}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-1">
                <Label>Valor Máximo (R$)</Label>
                <Input
                  type="number"
                  value={customCardsMaxAmount}
                  onChange={(e) => setCustomCardsMaxAmount(parseFloat(e.target.value) || 0)}
                  min={1}
                  step={0.01}
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <Label>Valores Pré-definidos (R$)</Label>
              <Input
                value={customCardsPresetAmounts}
                onChange={(e) => setCustomCardsPresetAmounts(e.target.value)}
                placeholder="25, 50, 100, 150, 200, 500"
                disabled={isLoading}
              />
              <p className="text-xs text-slate-500">Separe os valores por vírgula. Ex: 25, 50, 100</p>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <p className="font-medium text-slate-900">Permitir Valor Personalizado</p>
                <p className="text-sm text-slate-500">Cliente pode digitar qualquer valor dentro dos limites</p>
              </div>
              <button
                type="button"
                onClick={() => setCustomCardsAllowCustomAmount(!customCardsAllowCustomAmount)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  customCardsAllowCustomAmount ? 'bg-violet-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    customCardsAllowCustomAmount ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            <div className="space-y-1">
              <Label>Título da Seção</Label>
              <Input
                value={customCardsSectionTitle}
                onChange={(e) => setCustomCardsSectionTitle(e.target.value)}
                placeholder="Crie seu Vale-Presente Personalizado"
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-1">
              <Label>Subtítulo da Seção</Label>
              <Input
                value={customCardsSectionSubtitle}
                onChange={(e) => setCustomCardsSectionSubtitle(e.target.value)}
                placeholder="Personalize com sua mensagem especial"
                disabled={isLoading}
              />
            </div>
          </>
        )}
      </CollapsibleSection>

      {/* SEO Settings */}
      <CollapsibleSection 
        title="SEO e Compartilhamento" 
        icon={<Eye className="w-5 h-5 text-indigo-600" />}
      >
        <div className="space-y-1">
          <Label>Título da Página (SEO)</Label>
          <Input
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            placeholder={`Vale-Presente ${business.name}`}
            disabled={isLoading}
          />
          <p className="text-xs text-slate-500">Aparece na aba do navegador e nos resultados de busca</p>
        </div>
        <div className="space-y-1">
          <Label>Descrição (SEO)</Label>
          <textarea
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            placeholder="Compre vale-presentes digitais..."
            disabled={isLoading}
            rows={2}
            className="w-full px-4 py-3 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent disabled:bg-slate-50 disabled:cursor-not-allowed resize-none"
          />
        </div>
        <div className="space-y-1">
          <Label>URL do Favicon</Label>
          <Input
            value={faviconUrl}
            onChange={(e) => setFaviconUrl(e.target.value)}
            placeholder="https://exemplo.com/favicon.ico"
            disabled={isLoading}
          />
        </div>
        <div className="space-y-1">
          <Label>Imagem de Compartilhamento (Open Graph)</Label>
          <Input
            value={ogImageUrl}
            onChange={(e) => setOgImageUrl(e.target.value)}
            placeholder="https://exemplo.com/og-image.jpg"
            disabled={isLoading}
          />
          <p className="text-xs text-slate-500">Imagem exibida ao compartilhar no WhatsApp, Facebook, etc. (1200x630px recomendado)</p>
        </div>
      </CollapsibleSection>

      <div className="pt-4 flex gap-3">
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Spinner size="sm" className="mr-2" />}
          Salvar Configurações da Loja
        </Button>
        <a
          href={`/store/${business.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
        >
          <Eye className="w-4 h-4" />
          Visualizar Loja
        </a>
      </div>
    </form>
  );
}
