// ============================================
// MIMOZ - Type Definitions
// ============================================

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
