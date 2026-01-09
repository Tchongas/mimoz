# Payment Integration - Mercado Pago

## Overview

Tapresente uses [Mercado Pago](https://www.mercadopago.com.br/developers/en/docs) as the payment gateway for processing gift card purchases via Checkout Pro.

The integration is designed to be:
- **Gateway-agnostic**: Easy to swap to another provider if needed
- **Type-safe**: Full TypeScript types for all API interactions
- **Secure**: Webhook signature verification
- **Dev-friendly**: Works without payment in dev mode

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Store Page    │────▶│  Checkout API    │────▶│  Mercado Pago   │
│  /store/[slug]  │     │ /api/store/      │     │   (Payment)     │
│     /buy/...    │     │    checkout      │     │                 │
└─────────────────┘     └──────────────────┘     └────────┬────────┘
                                                          │
                                                          │ Webhook
                                                          ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Success Page   │◀────│  Webhook Handler │◀────│  billing.paid   │
│ /store/[slug]/  │     │ /api/webhooks/   │     │ payment.* event │
│    success      │     │  mercadopago     │     │                 │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

## Environment Variables

Add these to your `.env.local`:

```bash
# Mercado Pago access token
MERCADOPAGO_ACCESS_TOKEN=your_access_token_here

# Webhook secret for signature validation (Your integrations -> Webhooks)
MERCADOPAGO_WEBHOOK_SECRET=your_webhook_secret_here
```

### Getting Your Access Token

1. Create an application in the Mercado Pago developers panel
2. Copy the Access Token for your environment
3. Configure it as `MERCADOPAGO_ACCESS_TOKEN`

## Payment Flow

### 1. Customer Initiates Purchase

Customer fills out the purchase form on `/store/[slug]/buy/[templateId]`.

### 2. Checkout API Creates Checkout Session

```typescript
// POST /api/store/checkout
{
  businessId: "uuid",
  templateId: "uuid",
  paymentProvider: "mercadopago",
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
3. Creates a Mercado Pago Checkout Pro preference
4. Returns the payment URL

### 3. Customer Pays via Mercado Pago

Customer is redirected to Mercado Pago's checkout page, where they can choose the available payment method (PIX, card, etc.).

### 4. Webhook Activates Gift Card

After payment, Mercado Pago sends a webhook to `/api/webhooks/mercadopago`.

The webhook handler:
1. Verifies the signature (recommended)
2. Fetches payment details from Mercado Pago API
3. Finds the pending gift card via `external_reference`
4. Updates status to `ACTIVE` and `payment_status` to `COMPLETED`
5. Sends confirmation emails

### 5. Customer Sees Success

Customer is redirected to the success page with their gift card code.

## File Structure

```
src/lib/payments/
├── types.ts          # TypeScript interfaces (gateway-agnostic)
├── mercadopago.ts    # Mercado Pago client implementation
├── abacatepay.ts     # (Legacy) AbacatePay client implementation
└── index.ts          # Central exports

src/app/api/
├── store/checkout/route.ts             # Creates checkout session
└── webhooks/mercadopago/route.ts       # Handles payment events
```

## Types Reference

The integration uses Mercado Pago Checkout Pro preferences and payment notifications.

- `external_reference` is set to the `giftCardId` so the webhook can map payments back to a gift card.

## Usage Examples

### Creating a Checkout Session

```typescript
import { createCheckoutSession } from '@/lib/payments';

const checkout = await createCheckoutSession({
  provider: 'mercadopago',
  title: 'Vale-Presente R$50',
  amountCents: 5000,
  giftCardId: 'gift-card-123',
  successUrl: 'https://mysite.com/success',
  pendingUrl: 'https://mysite.com/success',
  failureUrl: 'https://mysite.com/store',
  notificationUrl: 'https://mysite.com/api/webhooks/mercadopago',
});

// Redirect customer to checkout.url
```

### Verifying Webhook

```typescript
import { verifyMercadoPagoWebhookSignature } from '@/lib/payments';

const xSignature = request.headers.get('x-signature');
const xRequestId = request.headers.get('x-request-id');
const dataId = request.nextUrl.searchParams.get('data.id');

const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
const isValid = verifyMercadoPagoWebhookSignature({
  secret,
  xSignature,
  xRequestId,
  dataId,
});

if (!isValid) {
  return { error: 'Invalid signature' };
}
```

## Webhook Configuration

### In Mercado Pago Developers Panel

1. Go to Your integrations → Webhooks
2. Add URL: `https://your-domain.com/api/webhooks/mercadopago`
3. Select event type(s) that include payments (payment topic)
4. Copy the generated webhook secret and set `MERCADOPAGO_WEBHOOK_SECRET`

### Local Development

For local testing, use a tunnel service like [ngrok](https://ngrok.com):

```bash
ngrok http 3000
```

Then use the ngrok URL in your webhook configuration.

## Dev Mode

When `MERCADOPAGO_ACCESS_TOKEN` is not set, the checkout API creates gift cards directly without payment. This is useful for:

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

### "MERCADOPAGO_ACCESS_TOKEN not set"

Add the access token to your `.env.local` file.

### Webhook not receiving events

1. Check the webhook URL is correct in Mercado Pago dashboard
2. Verify the webhook secret matches `MERCADOPAGO_WEBHOOK_SECRET`
3. Check server logs for errors
4. Use ngrok for local testing

### Payment created but gift card not activated

1. Check webhook logs in Mercado Pago dashboard
2. Verify `payment_provider_id` is being saved
3. Check database for pending gift cards

## API Reference

### Mercado Pago Endpoints Used

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/checkout/preferences` | POST | Create Checkout Pro preference |
| `/v1/payments/{id}` | GET | Fetch payment details |

### Webhook Events

| Event | Description |
|-------|-------------|
| `payment.*` | Payment status changes |

## Resources

- [Mercado Pago Docs](https://www.mercadopago.com.br/developers/en/docs)
- [Webhooks - Validate origin](https://www.mercadopago.com.br/developers/en/docs/your-integrations/notifications/webhooks)
- [PIX Documentation](https://www.bcb.gov.br/estabilidadefinanceira/pix)
