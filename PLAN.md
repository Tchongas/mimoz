# Mimoz - Whitelabel Gift Card Platform

## Project Overview
A whitelabel webpage generator for businesses to sell gift cards. This system includes:
- **Dashboard** for configuration and management
- **Store pages** at `/store/[slug]` for gift card sales
- **API layer** for external system integration
- **Payment processing** for online purchases

**Target Market:** Brazil

---

## Architecture

### Tech Stack
| Component | Technology | Purpose |
|-----------|------------|---------|
| Framework | Next.js 16 (App Router) | Full-stack React framework |
| Language | TypeScript | Type safety |
| Styling | TailwindCSS v4 | Utility-first CSS |
| Auth | Supabase Auth (Google OAuth) | Authentication |
| Database | Supabase PostgreSQL | Data storage with RLS |
| Payments | Stripe | Payment processing |
| Email | Resend | Transactional emails |
| QR Codes | qrcode.react | Gift card QR generation |
| PDF | @react-pdf/renderer | Gift card PDF generation |
| Charts | Recharts | Analytics visualization |

### Role System
| Role | Access Level |
|------|--------------|
| ADMIN | Full system-wide access, all businesses |
| BUSINESS_OWNER | Manage their business, view reports, team |
| CASHIER | Code validation only for their business |

### Multi-Tenant Structure
- Each business has isolated data via RLS
- Users belong to one business (except ADMIN)
- Pre-registration via invite system (user_invites table)

---

## Database Schema

### Current Tables

**businesses**
| Column | Type | Description |
|--------|------|-------------|
| id | uuid PK | Unique identifier |
| name | text | Business display name |
| slug | text UNIQUE | URL slug for /store/[slug] |
| logo_url | text | Business logo (future) |
| primary_color | text | Brand color (future) |
| stripe_account_id | text | Connected Stripe account |
| created_at | timestamp | Creation date |
| updated_at | timestamp | Last update |

**profiles** (shadow table for auth.users)
| Column | Type | Description |
|--------|------|-------------|
| id | uuid PK | Matches auth.users.id |
| email | text | User email |
| full_name | text | Display name |
| avatar_url | text | Profile picture |
| business_id | uuid FK | Assigned business |
| role | text | ADMIN, BUSINESS_OWNER, CASHIER |
| created_at | timestamp | Creation date |
| updated_at | timestamp | Last update |

**user_invites** (pre-registration)
| Column | Type | Description |
|--------|------|-------------|
| id | uuid PK | Unique identifier |
| email | text UNIQUE | Invited email |
| full_name | text | Optional name |
| role | text | Assigned role on login |
| business_id | uuid FK | Assigned business |
| invited_by | uuid FK | Admin who invited |
| created_at | timestamp | Invite date |

**code_validations**
| Column | Type | Description |
|--------|------|-------------|
| id | uuid PK | Unique identifier |
| business_id | uuid FK | Business |
| cashier_id | uuid FK | Who validated |
| code | text | Gift card code |
| gift_card_id | uuid FK | Link to gift card |
| validated_at | timestamp | Validation time |

### New Tables (Phase 4+)

**gift_card_templates**
| Column | Type | Description |
|--------|------|-------------|
| id | uuid PK | Unique identifier |
| business_id | uuid FK | Owner business |
| name | text | Template name (e.g., "R$50 Gift Card") |
| description | text | Card description |
| amount_cents | integer | Value in cents (5000 = R$50) |
| image_url | text | Card image |
| is_active | boolean | Available for purchase |
| valid_days | integer | Days until expiration (default 365) |
| created_at | timestamp | Creation date |

**gift_cards** (purchased cards)
| Column | Type | Description |
|--------|------|-------------|
| id | uuid PK | Unique identifier |
| business_id | uuid FK | Business |
| template_id | uuid FK | Template used |
| code | text UNIQUE | Redemption code (e.g., MIMO-XXXX-XXXX) |
| amount_cents | integer | Original value |
| balance_cents | integer | Remaining balance |
| status | text | ACTIVE, REDEEMED, EXPIRED, CANCELLED |
| purchaser_email | text | Buyer email |
| purchaser_name | text | Buyer name |
| recipient_email | text | Gift recipient email |
| recipient_name | text | Gift recipient name |
| recipient_message | text | Personal message |
| purchased_at | timestamp | Purchase date |
| expires_at | timestamp | Expiration date |
| redeemed_at | timestamp | When fully used |

**orders** (purchase transactions)
| Column | Type | Description |
|--------|------|-------------|
| id | uuid PK | Unique identifier |
| business_id | uuid FK | Business |
| gift_card_id | uuid FK | Purchased card |
| stripe_payment_intent_id | text | Stripe reference |
| stripe_checkout_session_id | text | Checkout session |
| amount_cents | integer | Total charged |
| platform_fee_cents | integer | Mimoz fee |
| status | text | PENDING, PAID, FAILED, REFUNDED |
| customer_email | text | Customer email |
| created_at | timestamp | Order date |
| paid_at | timestamp | Payment confirmation |

**redemptions** (partial/full redemptions)
| Column | Type | Description |
|--------|------|-------------|
| id | uuid PK | Unique identifier |
| gift_card_id | uuid FK | Gift card |
| cashier_id | uuid FK | Who processed |
| amount_cents | integer | Amount redeemed |
| balance_before | integer | Balance before |
| balance_after | integer | Balance after |
| notes | text | Optional notes |
| redeemed_at | timestamp | Redemption time |

---

## RLS Policies Summary

| Table | ADMIN | BUSINESS_OWNER | CASHIER | PUBLIC |
|-------|-------|----------------|---------|--------|
| businesses | CRUD all | Read own | Read own | Read (store) |
| profiles | CRUD all | Read own business | Read own | - |
| user_invites | CRUD all | - | - | - |
| gift_card_templates | CRUD all | CRUD own | Read own | Read active |
| gift_cards | CRUD all | Read own | Read own | - |
| orders | CRUD all | Read own | - | - |
| redemptions | CRUD all | Read own | Insert/Read own | - |
| code_validations | CRUD all | Read own | Insert/Read own | - |

---

## Implementation Phases

### Phase 1: Foundation ✅
- [x] Project setup (Next.js 16, TypeScript, TailwindCSS v4)
- [x] Database migrations (001_initial_schema.sql)
- [x] RLS policies (002_rls_policies.sql)
- [x] Supabase utilities (client, server, middleware)
- [x] Auth utilities (getSessionUser, requireAuth, requireBusiness)
- [x] RBAC utilities (isAdmin, isBusinessOwner, isCashier)
- [x] Middleware (route protection)

### Phase 2: Auth & Dashboards ✅
- [x] Auth pages (login, logout, callback)
- [x] UI Components (Button, Input, Card, Label, Select, Alert, Spinner, etc.)
- [x] Dashboard layout (DashboardLayout, SidebarNav, TopBar)
- [x] Admin dashboard (home, businesses CRUD, users CRUD)
- [x] Business dashboard (home, settings, team view)
- [x] Cashier dashboard (validation, history)
- [x] Skeleton loading components
- [x] Navigation progress bar

### Phase 3: API Layer ✅
- [x] Admin businesses API (GET, POST, PATCH, DELETE)
- [x] Admin users API (GET, POST, PATCH)
- [x] Admin invites API (DELETE)
- [x] Business info API (GET)
- [x] Business settings API (PATCH)
- [x] Code validation API (POST, GET)

### Phase 3.5: Reports & UX ✅
- [x] User invite system (pre-register users before login)
- [x] Pending invites display in admin users page
- [x] Admin reports page (cross-business analytics)
- [x] Business reports page (single business analytics)
- [x] Optimistic navigation (useTransition)
- [x] Loading states for all pages

### Phase 4: Gift Card System ✅
- [x] **Database migration** for gift_card_templates, gift_cards, orders, redemptions
- [x] **Gift card templates CRUD** (business owner creates card types)
  - Create/edit template form
  - Set amounts, descriptions, validity
  - Activate/deactivate templates
- [x] **Gift card code generation**
  - Secure random code generator (MIMO-XXXX-XXXX format)
  - Collision prevention in database
- [x] **Admin gift cards management**
  - View all cards for any business
  - Stats (revenue, active cards, templates)
  - Link from business edit page
- [x] **Business owner gift cards page**
  - `/business/cards` - List templates with stats
  - `/business/cards/new` - Create new template
  - `/business/cards/[id]` - Edit template

### Phase 5: Public Store Pages ✅
- [x] **Store landing page** `/store/[slug]`
  - Business branding (logo, colors from customization)
  - Gift card catalog display
  - Responsive design
  - Contact info display
- [x] **Gift card purchase page** `/store/[slug]/buy/[templateId]`
  - Card preview with customized colors
  - Purchaser/recipient form
  - Personal message
- [x] **Checkout API** `/api/store/checkout`
  - Creates gift card with unique code
  - Creates order record
  - Returns gift card code
- [x] **Success page** `/store/[slug]/success`
  - Display gift card code
  - Copy to clipboard button
  - Card details summary

### Phase 5.5: Business Customization ✅
- [x] **Database migration** for customization fields
  - primary_color, secondary_color, gift_card_color
  - description, contact_email, contact_phone, website
  - logo_url (ready for future upload)
- [x] **Admin business edit** with customization
  - Color pickers with live preview
  - Contact information fields
- [x] **Store pages** apply customization
  - Header uses primary_color
  - Buttons use secondary_color
  - Gift cards use gift_card_color
  - Business description in hero

### Phase 6: Payment Integration 🔜
- [ ] **Stripe Connect setup**
  - Platform account configuration
  - Connected accounts for businesses
  - OAuth flow for business onboarding
- [ ] **Stripe Checkout integration**
  - Create checkout sessions
  - Handle success/cancel redirects
  - Metadata for order tracking
- [ ] **Webhook handling** `/api/webhooks/stripe`
  - checkout.session.completed → create gift card
  - payment_intent.succeeded → update order
  - charge.refunded → handle refunds
- [ ] **Platform fees**
  - Application fee on each transaction
  - Fee configuration per business (future)

### Phase 7: Gift Card Delivery 🔜
- [ ] **Email delivery** (Resend)
  - Purchase confirmation to buyer
  - Gift card delivery to recipient
  - Beautiful HTML email templates
- [ ] **PDF generation** (@react-pdf/renderer)
  - Printable gift card with QR code
  - Business branding
  - Download link in email
- [ ] **Digital wallet** (future)
  - Apple Wallet pass
  - Google Pay pass

### Phase 8: Redemption Flow 🔜
- [ ] **Enhanced validation screen**
  - Scan QR code (camera access)
  - Manual code entry
  - Show card details and balance
- [ ] **Partial redemption**
  - Enter redemption amount
  - Update remaining balance
  - Print/email receipt
- [ ] **Redemption history**
  - Full audit trail
  - Filter by date, cashier, card

### Phase 9: Advanced Customization 🔜
- [ ] **Logo upload** (Supabase Storage)
  - Image upload component
  - Storage bucket setup
  - Image optimization
- [ ] **Custom domains** (future)
  - Domain mapping
  - SSL certificates
- [ ] **Gift card images**
  - Custom images per template
  - Seasonal/promotional cards
- [ ] **Advanced settings**
  - Notification preferences
  - Receipt customization
  - Operating hours (future)

### Phase 10: Advanced Features 🔮
- [ ] **Analytics dashboard**
  - Sales charts (Recharts)
  - Revenue tracking
  - Popular cards
  - Customer insights
- [ ] **Bulk operations**
  - Bulk card generation
  - CSV export/import
  - Batch email sending
- [ ] **Promotions system**
  - Discount codes
  - Buy X get Y
  - Seasonal campaigns
- [ ] **API for external systems**
  - REST API with API keys
  - Webhook notifications
  - POS integration

---

## Tech Decisions

### Payments: Stripe
- **Why:** Industry standard, excellent docs, Brazil support (PIX, cards)
- **Connect:** Each business gets a connected account
- **Fees:** Platform takes application fee per transaction

### Email: Resend
- **Why:** Modern API, great deliverability, React email templates
- **Use cases:** Gift card delivery, purchase confirmations, receipts

### QR Codes: qrcode.react
- **Why:** Simple, lightweight, customizable
- **Use case:** Gift card codes for scanning

### PDF: @react-pdf/renderer
- **Why:** React-based, server-side rendering, customizable
- **Use case:** Printable gift cards

### Charts: Recharts
- **Why:** React-native, composable, good defaults
- **Use case:** Analytics dashboards

---

## Security Checklist
- [x] All auth on server-side
- [x] RLS enabled on all tables
- [x] Middleware protects all dashboard routes
- [x] API routes validate session + role
- [x] No client-side role checks for security
- [x] Business isolation enforced at DB level
- [ ] Stripe webhook signature verification
- [ ] Rate limiting on public endpoints
- [ ] Gift card code entropy (secure random)
- [ ] Input sanitization on all forms
- [ ] CSRF protection on mutations

---

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Resend
RESEND_API_KEY=

# App
NEXT_PUBLIC_APP_URL=
```

---

## API Endpoints Summary

### Admin APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/businesses | List all businesses |
| POST | /api/admin/businesses | Create business |
| GET | /api/admin/businesses/[id] | Get business |
| PATCH | /api/admin/businesses/[id] | Update business |
| DELETE | /api/admin/businesses/[id] | Delete business |
| GET | /api/admin/users | List all users |
| POST | /api/admin/users | Create user invite |
| PATCH | /api/admin/users | Update user |
| DELETE | /api/admin/invites/[id] | Delete invite |

### Business APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/business/info | Get current business |
| PATCH | /api/business/settings | Update settings |
| GET | /api/business/templates | List gift card templates |
| POST | /api/business/templates | Create template |
| PATCH | /api/business/templates/[id] | Update template |

### Public APIs (Store)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/store/[slug] | Get store info |
| GET | /api/store/[slug]/cards | List available cards |
| POST | /api/store/[slug]/checkout | Create checkout session |

### Webhook APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/webhooks/stripe | Handle Stripe events |

### Validation APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/codes/validate | Validate gift card |
| POST | /api/codes/redeem | Redeem amount |
| GET | /api/codes/history | Validation history |
