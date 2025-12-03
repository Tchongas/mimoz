// ============================================
// MIMOZ - RBAC Utilities (BoxyHQ Compatible)
// ============================================
// Role-Based Access Control with multi-tenant support
// Designed to be compatible with BoxyHQ SAML Jackson for future SSO

import type { Permission, Role, RolePermissions, SessionUser } from '@/types';

// ============================================
// ROLE PERMISSIONS MAPPING
// ============================================
// Define what each role can do

const ROLE_PERMISSIONS: RolePermissions[] = [
  {
    role: 'ADMIN',
    permissions: [
      'businesses:read',
      'businesses:write',
      'businesses:delete',
      'users:read',
      'users:write',
      'users:delete',
      'codes:validate',
      'codes:read',
      'analytics:read',
      'settings:read',
      'settings:write',
    ],
  },
  {
    role: 'BUSINESS_OWNER',
    permissions: [
      'businesses:read',
      'businesses:write',
      'users:read',
      'users:write',
      'codes:validate',
      'codes:read',
      'analytics:read',
      'settings:read',
      'settings:write',
    ],
  },
  {
    role: 'CASHIER',
    permissions: [
      'codes:validate',
      'codes:read',
    ],
  },
];

// ============================================
// GET ROLE PERMISSIONS
// ============================================

export function getRolePermissions(role: Role): Permission[] {
  const roleConfig = ROLE_PERMISSIONS.find((r) => r.role === role);
  return roleConfig?.permissions ?? [];
}

// ============================================
// HAS ROLE
// ============================================
// Check if user has a specific role

export function hasRole(user: SessionUser | null, role: Role): boolean {
  if (!user) return false;
  return user.role === role;
}

// ============================================
// HAS ANY ROLE
// ============================================
// Check if user has any of the specified roles

export function hasAnyRole(user: SessionUser | null, roles: Role[]): boolean {
  if (!user) return false;
  return roles.includes(user.role);
}

// ============================================
// HAS PERMISSION
// ============================================
// Check if user has a specific permission

export function hasPermission(user: SessionUser | null, permission: Permission): boolean {
  if (!user) return false;
  const permissions = getRolePermissions(user.role);
  return permissions.includes(permission);
}

// ============================================
// HAS ALL PERMISSIONS
// ============================================
// Check if user has all specified permissions

export function hasAllPermissions(user: SessionUser | null, permissions: Permission[]): boolean {
  if (!user) return false;
  const userPermissions = getRolePermissions(user.role);
  return permissions.every((p) => userPermissions.includes(p));
}

// ============================================
// HAS ANY PERMISSION
// ============================================
// Check if user has any of the specified permissions

export function hasAnyPermission(user: SessionUser | null, permissions: Permission[]): boolean {
  if (!user) return false;
  const userPermissions = getRolePermissions(user.role);
  return permissions.some((p) => userPermissions.includes(p));
}

// ============================================
// IS ADMIN
// ============================================

export function isAdmin(user: SessionUser | null): boolean {
  return hasRole(user, 'ADMIN');
}

// ============================================
// IS BUSINESS OWNER
// ============================================

export function isBusinessOwner(user: SessionUser | null): boolean {
  return hasRole(user, 'BUSINESS_OWNER');
}

// ============================================
// IS CASHIER
// ============================================

export function isCashier(user: SessionUser | null): boolean {
  return hasRole(user, 'CASHIER');
}

// ============================================
// CAN ACCESS BUSINESS
// ============================================
// Check if user can access a specific business

export function canAccessBusiness(user: SessionUser | null, businessId: string): boolean {
  if (!user) return false;
  
  // Admins can access any business
  if (isAdmin(user)) return true;
  
  // Other roles can only access their assigned business
  return user.businessId === businessId;
}

// ============================================
// TENANT-AWARE PERMISSION CHECK
// ============================================
// Check permission with business context (BoxyHQ compatible)

export function checkTenantPermission(
  user: SessionUser | null,
  permission: Permission,
  businessId?: string
): boolean {
  if (!user) return false;
  
  // First check if user has the permission
  if (!hasPermission(user, permission)) return false;
  
  // If businessId is provided, check tenant access
  if (businessId) {
    return canAccessBusiness(user, businessId);
  }
  
  return true;
}

// ============================================
// BOXYHQ ORGANIZATION MAPPING
// ============================================
// Maps our business structure to BoxyHQ organizations
// This is used when integrating with BoxyHQ SAML Jackson

export interface BoxyHQOrganization {
  id: string;
  name: string;
  slug: string;
}

export interface BoxyHQMember {
  userId: string;
  organizationId: string;
  role: Role;
}

// Convert our business to BoxyHQ organization format
export function toBoxyHQOrganization(business: {
  id: string;
  name: string;
  slug: string;
}): BoxyHQOrganization {
  return {
    id: business.id,
    name: business.name,
    slug: business.slug,
  };
}

// Convert our profile to BoxyHQ member format
export function toBoxyHQMember(profile: {
  id: string;
  business_id: string | null;
  role: Role;
}): BoxyHQMember | null {
  if (!profile.business_id) return null;
  
  return {
    userId: profile.id,
    organizationId: profile.business_id,
    role: profile.role,
  };
}

// ============================================
// PERMISSION CONSTANTS
// ============================================
// Export permission constants for use in components

export const PERMISSIONS = {
  BUSINESSES_READ: 'businesses:read' as Permission,
  BUSINESSES_WRITE: 'businesses:write' as Permission,
  BUSINESSES_DELETE: 'businesses:delete' as Permission,
  USERS_READ: 'users:read' as Permission,
  USERS_WRITE: 'users:write' as Permission,
  USERS_DELETE: 'users:delete' as Permission,
  CODES_VALIDATE: 'codes:validate' as Permission,
  CODES_READ: 'codes:read' as Permission,
  ANALYTICS_READ: 'analytics:read' as Permission,
  SETTINGS_READ: 'settings:read' as Permission,
  SETTINGS_WRITE: 'settings:write' as Permission,
};

// ============================================
// ROLE CONSTANTS
// ============================================

export const ROLES = {
  ADMIN: 'ADMIN' as Role,
  BUSINESS_OWNER: 'BUSINESS_OWNER' as Role,
  CASHIER: 'CASHIER' as Role,
};
