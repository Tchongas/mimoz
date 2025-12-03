# Mimoz - Whitelabel Gift Card Platform

## Project Overview
A whitelabel webpage generator for businesses to sell gift cards. This system includes:
- **Dashboard** for configuration (current focus)
- **Store pages** at `/store/[slug]` for gift card sales (future)
- **API layer** for external system integration

**Target Market:** Brazil

---

## Architecture

### Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS v4
- **Auth:** Supabase Auth (Google OAuth only)
- **RBAC:** BoxyHQ (roles + multi-tenant organizations)
- **Database:** Supabase PostgreSQL

### Role System
| Role | Access Level |
|------|--------------|
| ADMIN | Full system-wide access |
| BUSINESS_OWNER | Access to their assigned Organization/Business |
| CASHIER | Code validation only for their Business |

### Multi-Tenant Structure
- **Organizations** = Businesses (BoxyHQ)
- **Members** = Users with roles
- Future SSO-ready with BoxyHQ Directory Sync

---

## File Structure

```
/src
├── /app
│   ├── /admin                    # Admin dashboard
│   │   ├── page.tsx              # Dashboard home
│   │   ├── /users/page.tsx       # Manage users
│   │   └── /businesses/page.tsx  # Manage businesses
│   ├── /business                 # Business owner dashboard
│   │   ├── page.tsx              # Overview
│   │   ├── /settings/page.tsx    # Business settings
│   │   └── /analytics/page.tsx   # Analytics placeholder
│   ├── /cashier                  # Cashier dashboard
│   │   └── page.tsx              # Code validation screen
│   ├── /auth
│   │   ├── /login/page.tsx       # Google OAuth login
│   │   ├── /logout/page.tsx      # Logout handler
│   │   └── /callback/route.ts    # OAuth callback
│   └── /api
│       ├── /admin
│       │   ├── /businesses/route.ts
│       │   └── /users/route.ts
│       ├── /business
│       │   └── /info/route.ts
│       └── /codes
│           └── /validate/route.ts
├── /components
│   ├── DashboardLayout.tsx
│   ├── SidebarNav.tsx
│   ├── TopBar.tsx
│   └── AuthProvider.tsx
├── /lib
│   ├── supabase/
│   │   ├── client.ts             # Browser client
│   │   ├── server.ts             # Server client
│   │   └── middleware.ts         # Middleware client
│   ├── auth.ts                   # Auth utilities
│   └── rbac.ts                   # BoxyHQ RBAC utilities
└── /types
    └── index.ts                  # TypeScript types

/supabase
├── migrations/
│   └── 001_initial_schema.sql    # Tables
└── policies/
    └── 001_rls_policies.sql      # RLS policies
```

---

## Database Schema

### Tables

**businesses**
- `id` uuid PK
- `name` text NOT NULL
- `slug` text UNIQUE (for /store/[slug])
- `created_at` timestamp
- `updated_at` timestamp

**profiles** (shadow table for auth.users)
- `id` uuid PK (matches auth.users.id)
- `email` text
- `full_name` text
- `avatar_url` text
- `business_id` uuid FK → businesses(id)
- `role` text CHECK (ADMIN, BUSINESS_OWNER, CASHIER)
- `created_at` timestamp
- `updated_at` timestamp

**code_validations**
- `id` uuid PK
- `business_id` uuid FK → businesses(id)
- `cashier_id` uuid FK → profiles(id)
- `code` text NOT NULL
- `validated_at` timestamp DEFAULT now()

---

## RLS Policies Summary

| Table | ADMIN | BUSINESS_OWNER | CASHIER |
|-------|-------|----------------|---------|
| businesses | CRUD all | Read own | None |
| profiles | CRUD all | Read/Update own business | Read own |
| code_validations | CRUD all | Read own business | Insert/Read own business |

---

## Implementation Phases

### Phase 1: Foundation (Current)
- [x] Project setup
- [ ] Database migrations
- [ ] RLS policies
- [ ] Supabase utilities
- [ ] Auth utilities
- [ ] RBAC utilities
- [ ] Middleware

### Phase 2: Auth & Dashboards
- [ ] Auth pages (login, logout, callback)
- [ ] Shared components
- [ ] Admin dashboard
- [ ] Business dashboard
- [ ] Cashier dashboard

### Phase 3: API Layer
- [ ] Admin API routes
- [ ] Business API routes
- [ ] Code validation API

### Phase 4: Future (Store Pages)
- [ ] /store/[slug] public pages
- [ ] Gift card purchase flow
- [ ] Payment integration
- [ ] Sales tracking

---

## Security Checklist
- [ ] All auth on server-side
- [ ] RLS enabled on all tables
- [ ] Middleware protects all dashboard routes
- [ ] API routes validate session + role
- [ ] No client-side role checks for security
- [ ] Business isolation enforced at DB level
