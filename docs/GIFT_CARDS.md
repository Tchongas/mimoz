# Gift Card System

## Overview

The gift card system allows businesses to sell digital gift cards through their customized store pages. Customers can purchase cards for themselves or as gifts, and recipients can redeem them at any business location.

---

## Database Schema

### Tables

#### `gift_card_templates`
Templates define the types of gift cards a business sells.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| business_id | uuid FK | Owner business |
| name | text | Template name (e.g., "Vale-Presente R$50") |
| description | text | Card description |
| amount_cents | integer | Value in cents (5000 = R$50) |
| image_url | text | Card image (future) |
| is_active | boolean | Available for purchase |
| valid_days | integer | Days until expiration (default 365) |
| created_at | timestamp | Creation date |
| updated_at | timestamp | Last update |

#### `gift_cards`
Individual gift cards created after purchase.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| business_id | uuid FK | Business |
| template_id | uuid FK | Template used |
| code | text UNIQUE | Redemption code (MIMO-XXXX-XXXX) |
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

#### `orders`
Payment transactions.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| business_id | uuid FK | Business |
| gift_card_id | uuid FK | Purchased card |
| stripe_checkout_session_id | text | Stripe session |
| stripe_payment_intent_id | text | Stripe payment |
| amount_cents | integer | Total charged |
| platform_fee_cents | integer | Mimoz fee |
| status | text | PENDING, PAID, FAILED, REFUNDED |
| customer_email | text | Customer email |
| customer_name | text | Customer name |
| created_at | timestamp | Order date |
| paid_at | timestamp | Payment confirmation |

#### `redemptions`
Track partial/full redemptions.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| gift_card_id | uuid FK | Gift card |
| business_id | uuid FK | Business |
| cashier_id | uuid FK | Who processed |
| amount_cents | integer | Amount redeemed |
| balance_before | integer | Balance before |
| balance_after | integer | Balance after |
| notes | text | Optional notes |
| redeemed_at | timestamp | Redemption time |

---

## Code Generation

Gift card codes follow the format: `MIMO-XXXX-XXXX`

- **Prefix:** `MIMO-` (brand identifier)
- **Characters:** A-Z (excluding O, I) and 2-9 (excluding 0, 1) to avoid confusion
- **Collision prevention:** Database checks for uniqueness before saving
- **Example:** `MIMO-K7HN-P3WX`

```sql
-- Database function for code generation
CREATE OR REPLACE FUNCTION public.generate_gift_card_code()
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    new_code := 'MIMO-' || 
      UPPER(SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 4)) || '-' ||
      UPPER(SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 5 FOR 4));
    
    SELECT EXISTS(SELECT 1 FROM public.gift_cards WHERE code = new_code) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN new_code;
END;
$$ LANGUAGE plpgsql;
```

---

## User Flows

### 1. Business Owner: Create Templates

```
/business/cards → /business/cards/new
```

1. Navigate to "Vale-Presentes" in sidebar
2. Click "Novo Modelo"
3. Fill form:
   - Name (e.g., "Vale-Presente R$50")
   - Description (optional)
   - Amount (select preset or custom)
   - Validity period (days)
   - Active status
4. Save template
5. Template appears in store

### 2. Customer: Purchase Gift Card

```
/store/[slug] → /store/[slug]/buy/[templateId] → /store/[slug]/success
```

1. Visit store page (e.g., `/store/acme-store`)
2. Browse available gift cards
3. Click "Comprar" on desired card
4. Fill purchase form:
   - Your name and email
   - (Optional) Gift recipient details
   - Personal message
5. Submit payment
6. Receive confirmation with gift card code
7. Code sent via email to purchaser and recipient

### 3. Cashier: Validate & Redeem

```
/cashier → Enter code → View balance → Redeem amount
```

1. Customer presents gift card code at checkout
2. Cashier enters code in validation screen
3. System shows:
   - Card status (ACTIVE/REDEEMED/EXPIRED)
   - Original amount
   - Current balance
   - Recipient name
   - Expiration date
4. Cashier enters redemption amount
5. System updates balance
6. If balance = 0, status changes to REDEEMED

---

## API Endpoints

### Store APIs (Public)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/store/checkout` | Create checkout session and gift card |

**Request:**
```json
{
  "businessId": "uuid",
  "templateId": "uuid",
  "purchaserName": "João Silva",
  "purchaserEmail": "joao@email.com",
  "recipientName": "Maria Santos",
  "recipientEmail": "maria@email.com",
  "recipientMessage": "Feliz aniversário!"
}
```

**Response:**
```json
{
  "success": true,
  "giftCardCode": "MIMO-K7HN-P3WX",
  "giftCardId": "uuid"
}
```

### Business APIs (Authenticated)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/business/templates` | List templates |
| POST | `/api/business/templates` | Create template |
| GET | `/api/business/templates/[id]` | Get template |
| PATCH | `/api/business/templates/[id]` | Update template |
| DELETE | `/api/business/templates/[id]` | Delete template |

### Validation APIs (Cashier)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/codes/validate` | Lookup gift card |
| POST | `/api/codes/redeem` | Redeem amount |
| GET | `/api/codes/validate` | Get validation history |

**Validate Request:**
```json
{
  "code": "MIMO-K7HN-P3WX",
  "businessId": "uuid"
}
```

**Validate Response (Valid):**
```json
{
  "valid": true,
  "message": "Código válido",
  "giftCard": {
    "id": "uuid",
    "code": "MIMO-K7HN-P3WX",
    "status": "ACTIVE",
    "amount_cents": 5000,
    "balance_cents": 5000,
    "recipient_name": "Maria Santos",
    "expires_at": "2025-12-04T00:00:00Z"
  }
}
```

**Redeem Request:**
```json
{
  "giftCardId": "uuid",
  "amountCents": 2500,
  "businessId": "uuid",
  "notes": "Compra de café"
}
```

**Redeem Response:**
```json
{
  "success": true,
  "message": "Resgate realizado com sucesso",
  "redemption": {
    "amount_cents": 2500,
    "balance_before": 5000,
    "balance_after": 2500,
    "new_status": "ACTIVE"
  }
}
```

---

## Gift Card Statuses

| Status | Description |
|--------|-------------|
| `ACTIVE` | Card has balance and is valid |
| `REDEEMED` | Balance is zero (fully used) |
| `EXPIRED` | Past expiration date |
| `CANCELLED` | Manually cancelled (refund, fraud) |

---

## Pages

### Public Store

| Route | Component | Description |
|-------|-----------|-------------|
| `/store/[slug]` | StorePage | Landing with card catalog |
| `/store/[slug]/buy/[templateId]` | BuyPage | Purchase form |
| `/store/[slug]/success` | SuccessPage | Confirmation with code |

### Business Dashboard

| Route | Component | Description |
|-------|-----------|-------------|
| `/business/cards` | BusinessCardsPage | Templates list + stats |
| `/business/cards/new` | NewTemplatePage | Create template |
| `/business/cards/[id]` | EditTemplatePage | Edit template |

### Cashier Dashboard

| Route | Component | Description |
|-------|-----------|-------------|
| `/cashier` | CashierPage | Code validation |
| `/cashier/history` | HistoryPage | Validation history |

---

## Future Enhancements

### Phase 6: Payment Integration
- [ ] Stripe Connect for business accounts
- [ ] Stripe Checkout integration
- [ ] Webhook handling for payment confirmation
- [ ] Platform fees

### Phase 7: Delivery
- [ ] Email delivery via Resend
- [ ] PDF generation with QR code
- [ ] Digital wallet passes (Apple/Google)

### Phase 8: Enhanced Redemption
- [ ] QR code scanning (camera)
- [ ] Receipt printing
- [ ] Partial redemption UI improvements

### Phase 9: Customization
- [ ] Business branding (logo, colors)
- [ ] Custom card images
- [ ] Seasonal templates

---

## Migration

Run `supabase/migrations/005_gift_cards.sql` in Supabase SQL Editor to create all tables and functions.
