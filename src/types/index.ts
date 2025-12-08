// ============================================
// MIMOZ - Type Definitions
// ============================================

// Re-export gift card types
export * from './gift-cards';

// Database Types
export type Role = 'ADMIN' | 'BUSINESS_OWNER' | 'CASHIER' | 'CUSTOMER';

export interface Business {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  gift_card_color: string | null;
  description: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  website: string | null;
  created_at: string;
  updated_at: string;
  
  // Header customization
  header_bg_color: string | null;
  header_text_color: string | null;
  header_style: 'solid' | 'transparent' | 'gradient' | null;
  show_header_contact: boolean | null;
  logo_link_url: string | null;
  
  // Hero section customization
  hero_title: string | null;
  hero_subtitle: string | null;
  hero_bg_type: 'color' | 'gradient' | 'image' | null;
  hero_bg_color: string | null;
  hero_bg_gradient_start: string | null;
  hero_bg_gradient_end: string | null;
  hero_bg_image_url: string | null;
  hero_text_color: string | null;
  hero_overlay_opacity: number | null;
  hero_cta_text: string | null;
  hero_cta_color: string | null;
  hero_cta_url: string | null;
  show_hero_section: boolean | null;
  
  // Header/Footer visibility
  show_header: boolean | null;
  show_footer: boolean | null;
  
  // Products section customization
  products_title: string | null;
  products_bg_color: string | null;
  products_layout: 'grid' | 'list' | 'carousel' | null;
  products_columns: number | null;
  show_product_description: boolean | null;
  card_style: 'elevated' | 'flat' | 'bordered' | null;
  
  // Products section extra
  products_subtitle: string | null;
  products_section_enabled: boolean | null;
  
  // Section 1 (Intro/About - above products)
  section1_enabled: boolean | null;
  section1_title: string | null;
  section1_subtitle: string | null;
  section1_content: string | null;
  section1_bg_color: string | null;
  section1_text_color: string | null;
  section1_layout: 'centered' | 'left' | 'right' | 'split' | null;
  section1_image_url: string | null;
  section1_cta_text: string | null;
  section1_cta_url: string | null;
  section1_cta_color: string | null;
  
  // Section 2 (Benefits/Features - below products)
  section2_enabled: boolean | null;
  section2_type: 'features' | 'text' | 'cards' | 'stats' | null;
  section2_title: string | null;
  section2_subtitle: string | null;
  section2_bg_color: string | null;
  section2_text_color: string | null;
  section2_item1_icon: string | null;
  section2_item1_title: string | null;
  section2_item1_description: string | null;
  section2_item2_icon: string | null;
  section2_item2_title: string | null;
  section2_item2_description: string | null;
  section2_item3_icon: string | null;
  section2_item3_title: string | null;
  section2_item3_description: string | null;
  section2_item4_icon: string | null;
  section2_item4_title: string | null;
  section2_item4_description: string | null;
  
  // Section 3 (Additional content)
  section3_enabled: boolean | null;
  section3_type: 'features' | 'text' | 'cards' | 'gallery' | 'cta' | null;
  section3_title: string | null;
  section3_subtitle: string | null;
  section3_content: string | null;
  section3_bg_color: string | null;
  section3_text_color: string | null;
  section3_image_url: string | null;
  section3_cta_text: string | null;
  section3_cta_url: string | null;
  
  // CTA Banner
  cta_banner_enabled: boolean | null;
  cta_banner_title: string | null;
  cta_banner_subtitle: string | null;
  cta_banner_button_text: string | null;
  cta_banner_button_url: string | null;
  cta_banner_bg_color: string | null;
  cta_banner_text_color: string | null;
  
  // Legacy features (kept for backwards compatibility)
  features_bg_color: string | null;
  feature_1_icon: string | null;
  feature_1_title: string | null;
  feature_1_description: string | null;
  feature_2_icon: string | null;
  feature_2_title: string | null;
  feature_2_description: string | null;
  feature_3_icon: string | null;
  feature_3_title: string | null;
  feature_3_description: string | null;
  
  // Testimonials section
  show_testimonials_section: boolean | null;
  testimonials_title: string | null;
  testimonials_bg_color: string | null;
  
  // Footer customization
  footer_bg_color: string | null;
  footer_text_color: string | null;
  footer_text: string | null;
  show_footer_contact: boolean | null;
  show_footer_social: boolean | null;
  social_facebook: string | null;
  social_instagram: string | null;
  social_whatsapp: string | null;
  whatsapp_number: string | null;
  
  // General store settings
  page_bg_color: string | null;
  font_family: 'Inter' | 'Poppins' | 'Roboto' | 'Open Sans' | 'Lato' | 'Montserrat' | null;
  border_radius: 'none' | 'small' | 'rounded' | 'large' | 'full' | null;
  favicon_url: string | null;
  og_image_url: string | null;
  meta_title: string | null;
  meta_description: string | null;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  business_id: string | null;
  role: Role;
  created_at: string;
  updated_at: string;
}

export interface CodeValidation {
  id: string;
  business_id: string;
  cashier_id: string;
  code: string;
  validated_at: string;
}

// Extended types with relations
export interface ProfileWithBusiness extends Profile {
  business: Business | null;
}

export interface CodeValidationWithCashier extends CodeValidation {
  cashier: Profile;
}

// Auth Types
export interface AuthUser {
  id: string;
  email: string;
  profile: Profile | null;
}

export interface SessionUser {
  id: string;
  email: string;
  role: Role;
  businessId: string | null;
  fullName: string | null;
  avatarUrl: string | null;
}

// RBAC Types
export type Permission = 
  | 'businesses:read'
  | 'businesses:write'
  | 'businesses:delete'
  | 'users:read'
  | 'users:write'
  | 'users:delete'
  | 'codes:validate'
  | 'codes:read'
  | 'analytics:read'
  | 'settings:read'
  | 'settings:write';

export interface RolePermissions {
  role: Role;
  permissions: Permission[];
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form Types
export interface LoginFormData {
  provider: 'google';
}

export interface BusinessFormData {
  name: string;
  slug: string;
}

export interface UserFormData {
  email: string;
  full_name: string;
  role: Role;
  business_id: string | null;
}

export interface CodeValidationFormData {
  code: string;
}

// Dashboard Types
export interface NavItem {
  title: string;
  href: string;
  icon: string;
  permission?: Permission;
}

export interface DashboardStats {
  totalBusinesses?: number;
  totalUsers?: number;
  totalValidations?: number;
  todayValidations?: number;
}

// BoxyHQ Types (for future SSO integration)
export interface Organization {
  id: string;
  name: string;
  slug: string;
}

export interface OrganizationMember {
  id: string;
  userId: string;
  organizationId: string;
  role: Role;
}
