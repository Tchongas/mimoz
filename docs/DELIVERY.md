# Gift Card Delivery System

This document describes the email and PDF delivery system for Mimoz gift cards.

## Overview

When a gift card is purchased and payment is confirmed, the system automatically:
1. Sends a **confirmation email** to the purchaser
2. Sends a **gift card email** to the recipient (if different from purchaser)
3. Makes a **downloadable PDF** available

## Email Service: Resend

We use [Resend](https://resend.com) for transactional emails.

### Free Tier
- 3,000 emails/month
- 100 emails/day
- No credit card required

### Environment Variables

```env
# Required
RESEND_API_KEY=re_xxxxx

# Optional (defaults shown)
RESEND_FROM_DOMAIN=mimoz.com.br
RESEND_FROM_EMAIL=noreply@mimoz.com.br
```

### Getting Started

1. Create account at [resend.com](https://resend.com)
2. Verify your domain (or use their test domain for development)
3. Copy API key to `.env.local`

## Email Templates

All templates are in `src/lib/email/templates.ts`.

### 1. Purchase Confirmation (`giftCardPurchasedEmail`)
- **Sent to:** Purchaser
- **When:** After payment is confirmed
- **Contains:**
  - Gift card code
  - Amount
  - Recipient info
  - Personal message (if any)
  - Expiration date
  - How to use instructions

### 2. Gift Card Received (`giftCardReceivedEmail`)
- **Sent to:** Recipient (only if different from purchaser)
- **When:** After payment is confirmed
- **Contains:**
  - Gift card code
  - Amount
  - Who sent it
  - Personal message (if any)
  - Expiration date
  - How to use instructions

### 3. Gift Card Redeemed (`giftCardRedeemedEmail`)
- **Sent to:** Gift card owner
- **When:** After redemption at cashier
- **Contains:**
  - Amount used
  - Remaining balance
  - Business name

## PDF Generation

PDFs are generated on-demand using `@react-pdf/renderer`.

### API Endpoint

```
GET /api/gift-cards/[id]/pdf
```

**Authentication:** User must be:
- The gift card owner (recipient_email matches)
- The purchaser
- An admin
- The business owner

**Response:** PDF file download

### PDF Contents
- Business name and branding
- Gift card amount
- Unique code
- Recipient name
- Personal message (if any)
- Expiration date
- Usage instructions

### Template Location
`src/lib/pdf/gift-card.tsx`

## Integration Points

### 1. Payment Webhook
When AbacatePay sends `billing.paid`:
```typescript
// src/app/api/webhooks/abacatepay/route.ts
await sendGiftCardNotifications(giftCard, supabase);
```

### 2. Success Page
Download button on `/store/[slug]/success`:
```tsx
<a href={`/api/gift-cards/${giftCard.id}/pdf`} download>
  Baixar PDF
</a>
```

### 3. Account Page
Download button in gift card modal:
```tsx
<a href={`/api/gift-cards/${card.id}/pdf`} download>
  Baixar PDF
</a>
```

## Testing

### Development Mode
When `RESEND_API_KEY` is not set:
- Emails are skipped with a warning log
- PDF generation still works

### Test Email
Use Resend's test domain for development:
```env
RESEND_FROM_EMAIL=onboarding@resend.dev
```

## File Structure

```
src/lib/email/
├── index.ts          # Exports
├── resend.ts         # Resend client & send functions
├── templates.ts      # HTML email templates
└── types.ts          # TypeScript interfaces

src/lib/pdf/
├── index.ts          # Exports
└── gift-card.tsx     # PDF template

src/app/api/gift-cards/[id]/pdf/
└── route.tsx         # PDF download endpoint
```

## Troubleshooting

### Emails not sending
1. Check `RESEND_API_KEY` is set
2. Verify domain is configured in Resend dashboard
3. Check webhook logs for errors

### PDF not generating
1. Check user has permission (owner, purchaser, admin, or business owner)
2. Check gift card exists
3. Look for errors in API route logs

### Email in spam
1. Verify domain DNS records (SPF, DKIM, DMARC)
2. Use a proper "from" address (not noreply@)
3. Ensure email content is not flagged
