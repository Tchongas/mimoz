'use client';

// ============================================
// MIMOZ - Store Customization Form Component
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
  const [heroCtaText, setHeroCtaText] = useState(business.hero_cta_text || 'Comprar Agora');
  const [heroCtaColor, setHeroCtaColor] = useState(business.hero_cta_color || '#2563eb');
  const [showHeroSection, setShowHeroSection] = useState(business.show_hero_section ?? true);
  
  // Products settings
  const [productsTitle, setProductsTitle] = useState(business.products_title || 'Escolha seu Vale-Presente');
  const [productsBgColor, setProductsBgColor] = useState(business.products_bg_color || '#ffffff');
  const [productsLayout, setProductsLayout] = useState<string>(business.products_layout || 'grid');
  const [productsColumns, setProductsColumns] = useState(business.products_columns ?? 3);
  const [showProductDescription, setShowProductDescription] = useState(business.show_product_description ?? true);
  const [cardStyle, setCardStyle] = useState<string>(business.card_style || 'elevated');
  
  // Features settings
  const [showFeaturesSection, setShowFeaturesSection] = useState(business.show_features_section ?? true);
  const [featuresTitle, setFeaturesTitle] = useState(business.features_title || 'Por que escolher nossos vale-presentes?');
  const [featuresBgColor, setFeaturesBgColor] = useState(business.features_bg_color || '#f8fafc');
  const [feature1Icon, setFeature1Icon] = useState(business.feature_1_icon || 'gift');
  const [feature1Title, setFeature1Title] = useState(business.feature_1_title || 'Presente Perfeito');
  const [feature1Description, setFeature1Description] = useState(business.feature_1_description || 'Ideal para qualquer ocasião especial');
  const [feature2Icon, setFeature2Icon] = useState(business.feature_2_icon || 'clock');
  const [feature2Title, setFeature2Title] = useState(business.feature_2_title || 'Entrega Instantânea');
  const [feature2Description, setFeature2Description] = useState(business.feature_2_description || 'Receba por email imediatamente');
  const [feature3Icon, setFeature3Icon] = useState(business.feature_3_icon || 'shield');
  const [feature3Title, setFeature3Title] = useState(business.feature_3_title || '100% Seguro');
  const [feature3Description, setFeature3Description] = useState(business.feature_3_description || 'Pagamento seguro via PIX');
  
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
          hero_cta_color: heroCtaColor,
          show_hero_section: showHeroSection,
          
          // Products
          products_title: productsTitle,
          products_bg_color: productsBgColor,
          products_layout: productsLayout,
          products_columns: productsColumns,
          show_product_description: showProductDescription,
          card_style: cardStyle,
          
          // Features
          show_features_section: showFeaturesSection,
          features_title: featuresTitle,
          features_bg_color: featuresBgColor,
          feature_1_icon: feature1Icon,
          feature_1_title: feature1Title,
          feature_1_description: feature1Description,
          feature_2_icon: feature2Icon,
          feature_2_title: feature2Title,
          feature_2_description: feature2Description,
          feature_3_icon: feature3Icon,
          feature_3_title: feature3Title,
          feature_3_description: feature3Description,
          
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
      </CollapsibleSection>

      {/* Header Settings */}
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
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Texto do Botão CTA</Label>
                <Input
                  value={heroCtaText}
                  onChange={(e) => setHeroCtaText(e.target.value)}
                  placeholder="Comprar Agora"
                  disabled={isLoading}
                />
              </div>
              <ColorInput
                label="Cor do Botão CTA"
                value={heroCtaColor}
                onChange={setHeroCtaColor}
                disabled={isLoading}
              />
            </div>
          </>
        )}
      </CollapsibleSection>

      {/* Products Settings */}
      <CollapsibleSection 
        title="Seção de Produtos" 
        icon={<Gift className="w-5 h-5 text-pink-600" />}
      >
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

      {/* Features Settings */}
      <CollapsibleSection 
        title="Seção de Benefícios" 
        icon={<Star className="w-5 h-5 text-yellow-600" />}
      >
        <ToggleSwitch
          label="Mostrar Seção de Benefícios"
          checked={showFeaturesSection}
          onChange={setShowFeaturesSection}
          disabled={isLoading}
        />
        
        {showFeaturesSection && (
          <>
            <div className="space-y-1">
              <Label>Título da Seção</Label>
              <Input
                value={featuresTitle}
                onChange={(e) => setFeaturesTitle(e.target.value)}
                placeholder="Por que escolher nossos vale-presentes?"
                disabled={isLoading}
              />
            </div>
            <ColorInput
              label="Cor de Fundo"
              value={featuresBgColor}
              onChange={setFeaturesBgColor}
              disabled={isLoading}
            />
            
            {/* Feature 1 */}
            <div className="p-4 bg-slate-50 rounded-lg space-y-3">
              <p className="font-medium text-slate-700">Benefício 1</p>
              <SelectInput
                label="Ícone"
                value={feature1Icon}
                onChange={setFeature1Icon}
                options={ICON_OPTIONS.map(i => ({ value: i.value, label: i.label }))}
                disabled={isLoading}
              />
              <Input
                value={feature1Title}
                onChange={(e) => setFeature1Title(e.target.value)}
                placeholder="Título"
                disabled={isLoading}
              />
              <Input
                value={feature1Description}
                onChange={(e) => setFeature1Description(e.target.value)}
                placeholder="Descrição"
                disabled={isLoading}
              />
            </div>
            
            {/* Feature 2 */}
            <div className="p-4 bg-slate-50 rounded-lg space-y-3">
              <p className="font-medium text-slate-700">Benefício 2</p>
              <SelectInput
                label="Ícone"
                value={feature2Icon}
                onChange={setFeature2Icon}
                options={ICON_OPTIONS.map(i => ({ value: i.value, label: i.label }))}
                disabled={isLoading}
              />
              <Input
                value={feature2Title}
                onChange={(e) => setFeature2Title(e.target.value)}
                placeholder="Título"
                disabled={isLoading}
              />
              <Input
                value={feature2Description}
                onChange={(e) => setFeature2Description(e.target.value)}
                placeholder="Descrição"
                disabled={isLoading}
              />
            </div>
            
            {/* Feature 3 */}
            <div className="p-4 bg-slate-50 rounded-lg space-y-3">
              <p className="font-medium text-slate-700">Benefício 3</p>
              <SelectInput
                label="Ícone"
                value={feature3Icon}
                onChange={setFeature3Icon}
                options={ICON_OPTIONS.map(i => ({ value: i.value, label: i.label }))}
                disabled={isLoading}
              />
              <Input
                value={feature3Title}
                onChange={(e) => setFeature3Title(e.target.value)}
                placeholder="Título"
                disabled={isLoading}
              />
              <Input
                value={feature3Description}
                onChange={(e) => setFeature3Description(e.target.value)}
                placeholder="Descrição"
                disabled={isLoading}
              />
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
