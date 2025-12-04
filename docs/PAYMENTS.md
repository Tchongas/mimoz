# Payment Integration - AbacatePay

## Overview

Mimoz uses [AbacatePay](https://abacatepay.com) as the payment gateway for processing gift card purchases via PIX (Brazilian instant payment system).

The integration is designed to be:
- **Gateway-agnostic**: Easy to swap to another provider if needed
- **Type-safe**: Full TypeScript types for all API interactions
- **Secure**: Webhook signature verification
- **Dev-friendly**: Works without payment in dev mode

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Store Page    │────▶│  Checkout API    │────▶│   AbacatePay    │
│  /store/[slug]  │     │ /api/store/      │     │   (Payment)     │
│     /buy/...    │     │    checkout      │     │                 │
└─────────────────┘     └──────────────────┘     └────────┬────────┘
                                                          │
                                                          │ Webhook
                                                          ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Success Page   │◀────│  Webhook Handler │◀────│  billing.paid   │
│ /store/[slug]/  │     │ /api/webhooks/   │     │     event       │
│    success      │     │   abacatepay     │     │                 │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

## Environment Variables

Add these to your `.env.local`:

```bash
# AbacatePay API Key (get from dashboard)
ABACATEPAY_API_KEY=your_api_key_here

# Webhook secret for URL validation (optional but recommended)
ABACATEPAY_WEBHOOK_SECRET=your_random_secret_here
```

### Getting Your API Key

1. Create an account at [abacatepay.com](https://abacatepay.com)
2. Go to Settings → API Keys
3. Create a new API key
4. Use the dev/sandbox key for testing

## Payment Flow

### 1. Customer Initiates Purchase

Customer fills out the purchase form on `/store/[slug]/buy/[templateId]`.

### 2. Checkout API Creates Billing

```typescript
// POST /api/store/checkout
{
  businessId: "uuid",
  templateId: "uuid",
  purchaserName: "João Silva",
  purchaserEmail: "joao@email.com",
  recipientName: "Maria Santos",
  recipientEmail: "maria@email.com",
  recipientMessage: "Feliz aniversário!"
}
```

The API:
1. Validates the request
2. Creates a **pending** gift card in the database
3. Creates an AbacatePay billing (payment link)
4. Returns the payment URL

### 3. Customer Pays via PIX

Customer is redirected to AbacatePay's payment page where they can pay via PIX QR code.

### 4. Webhook Activates Gift Card

After payment, AbacatePay sends a `billing.paid` webhook to `/api/webhooks/abacatepay`.

The webhook handler:
1. Verifies the signature
2. Finds the pending gift card
3. Updates status to `active`
4. (Future) Sends confirmation emails

### 5. Customer Sees Success

Customer is redirected to the success page with their gift card code.

## File Structure

```
src/lib/payments/
├── types.ts          # TypeScript interfaces (gateway-agnostic)
├── abacatepay.ts     # AbacatePay client implementation
└── index.ts          # Central exports

src/app/api/
├── store/checkout/route.ts           # Creates billing
└── webhooks/abacatepay/route.ts      # Handles payment events
```

## Types Reference

### CreateBillingRequest

```typescript
interface CreateBillingRequest {
  frequency: 'ONE_TIME' | 'MULTIPLE_PAYMENTS';
  methods: ('PIX' | 'CARD')[];
  products: BillingProduct[];
  completionUrl: string;  // Redirect after payment
  returnUrl: string;      // Redirect on cancel
  customer: CustomerMetadata;
  externalId?: string;    // Your reference ID
  metadata?: Record<string, unknown>;
}
```

### Billing Response

```typescript
interface Billing {
  id: string;           // bill_xxx
  url: string;          // Payment page URL
  status: 'PENDING' | 'PAID' | 'EXPIRED' | 'CANCELLED' | 'REFUNDED';
  devMode: boolean;     // true in sandbox
  amount?: number;      // Total in cents
  customer: Customer;
  // ...
}
```

### Webhook Event

```typescript
interface BillingPaidEvent {
  id: string;           // log_xxx
  event: 'billing.paid';
  devMode: boolean;
  data: {
    payment: {
      amount: number;   // Amount in cents
      fee: number;      // Platform fee
      method: 'PIX';
    };
    pixQrCode?: {
      id: string;       // pix_char_xxx
      status: 'PAID';
    };
  };
}
```

## Usage Examples

### Creating a Billing

```typescript
import { createBilling } from '@/lib/payments';

const billing = await createBilling({
  frequency: 'ONE_TIME',
  methods: ['PIX'],
  products: [{
    externalId: 'gift-card-123',
    name: 'Vale-Presente R$50',
    quantity: 1,
    price: 5000, // R$50.00 in cents
  }],
  completionUrl: 'https://mysite.com/success',
  returnUrl: 'https://mysite.com/store',
  customer: { email: 'customer@email.com' },
});

// Redirect customer to billing.url
```

### Verifying Webhook

```typescript
import { verifyWebhookSignature, parseWebhookEvent } from '@/lib/payments';

// Method 1: HMAC signature
const signature = request.headers.get('x-webhook-signature');
if (!verifyWebhookSignature(rawBody, signature)) {
  return { error: 'Invalid signature' };
}

// Method 2: URL secret
const secret = request.nextUrl.searchParams.get('webhookSecret');
if (!verifyWebhookSecret(secret)) {
  return { error: 'Invalid secret' };
}

const event = parseWebhookEvent(rawBody);
```

## Webhook Configuration

### In AbacatePay Dashboard

1. Go to Settings → Webhooks
2. Click "Create Webhook"
3. Enter URL: `https://your-domain.com/api/webhooks/abacatepay?webhookSecret=YOUR_SECRET`
4. Select events: `billing.paid`
5. Save

### Local Development

For local testing, use a tunnel service like [ngrok](https://ngrok.com):

```bash
ngrok http 3000
```

Then use the ngrok URL in your webhook configuration.

## Dev Mode

When `ABACATEPAY_API_KEY` is not set, the checkout API creates gift cards directly without payment. This is useful for:

- Local development
- Testing the UI flow
- Demo environments

The response includes `devMode: true` to indicate this mode.

## Swapping Payment Gateways

The integration is designed to be swappable. To use a different gateway:

1. Create a new client in `src/lib/payments/newgateway.ts`
2. Implement the `PaymentGateway` interface
3. Update `src/lib/payments/index.ts` to export the new gateway
4. Create a new webhook handler

```typescript
// src/lib/payments/index.ts
import { newGateway } from './newgateway';
export const paymentGateway = newGateway;
```

## Troubleshooting

### "ABACATEPAY_API_KEY not set"

Add the API key to your `.env.local` file.

### Webhook not receiving events

1. Check the webhook URL is correct in AbacatePay dashboard
2. Verify the webhook secret matches
3. Check server logs for errors
4. Use ngrok for local testing

### Payment created but gift card not activated

1. Check webhook logs in AbacatePay dashboard
2. Verify `payment_provider_id` is being saved
3. Check database for pending gift cards

## API Reference

### AbacatePay Endpoints Used

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/billing/create` | POST | Create payment link |
| `/v1/billing/get` | GET | Get billing details |
| `/v1/billing/list` | GET | List all billings |
| `/v1/customer/create` | POST | Create customer |
| `/v1/customer/list` | GET | List customers |

### Webhook Events

| Event | Description |
|-------|-------------|
| `billing.paid` | Payment completed |
| `withdraw.done` | Withdrawal completed |
| `withdraw.failed` | Withdrawal failed |

## Resources

- [AbacatePay Documentation](https://docs.abacatepay.com/)
- [AbacatePay GitHub](https://github.com/AbacatePay)
- [PIX Documentation](https://www.bcb.gov.br/estabilidadefinanceira/pix)
