# Tapresente - Payment Integration

## Overview

Tapresente uses **Mercado Pago Checkout Pro** for payment processing. This integration handles PIX, credit cards, and other payment methods available through Mercado Pago.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MERCADOPAGO_ACCESS_TOKEN` | Yes (production) | Your Mercado Pago access token from the [credentials page](https://www.mercadopago.com/developers/panel/app) |

**Dev Mode**: When `MERCADOPAGO_ACCESS_TOKEN` is not set, gift cards are created directly as ACTIVE without payment processing.

## Payment Flow

### Production (with Mercado Pago)

```
1. Customer fills purchase form
2. POST /api/store/checkout or /api/store/custom-checkout
3. API creates PENDING gift card in database
4. API creates Mercado Pago preference
5. Customer redirected to Mercado Pago payment page
6. Customer completes payment (PIX, credit card, etc.)
7. Mercado Pago sends webhook to /api/webhooks/mercadopago
8. Webhook verifies payment and activates gift card
9. Confirmation emails sent to purchaser and recipient
10. Customer redirected to success page
```

### Development (without Mercado Pago)

```
1. Customer fills purchase form
2. POST /api/store/checkout or /api/store/custom-checkout
3. API creates ACTIVE gift card directly
4. Confirmation emails sent
5. Customer redirected to success page
```

## File Structure

```
src/lib/payments/
├── index.ts          # Central exports
└── mercadopago.ts    # Mercado Pago Checkout Pro implementation

src/app/api/
├── store/
│   ├── checkout/route.ts         # Standard gift card checkout
│   └── custom-checkout/route.ts  # Custom card checkout
└── webhooks/
    └── mercadopago/route.ts      # Payment notifications handler
```

## API Responses

### Checkout API (POST /api/store/checkout)

**With Mercado Pago:**
```json
{
  "success": true,
  "giftCardId": "uuid",
  "checkoutUrl": "https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=..."
}
```

**Dev Mode:**
```json
{
  "success": true,
  "giftCardCode": "MIMO-XXXX-XXXX",
  "giftCardId": "uuid",
  "redirectUrl": "/store/slug/success?code=MIMO-XXXX-XXXX",
  "devMode": true
}
```

## Webhook

The webhook endpoint (`/api/webhooks/mercadopago`) receives payment notifications from Mercado Pago.

### Notification Types
- `payment` - Payment status changed (we process this)
- `merchant_order` - Order status changed (ignored)

### Processing Flow
1. Receive notification with payment ID
2. Fetch payment details from Mercado Pago API
3. Find gift card by `external_reference` (gift card ID)
4. Update gift card status based on payment status:
   - `approved` → Activate gift card, send emails
   - `rejected/cancelled` → Mark as failed
   - `pending` → Keep waiting

## Testing

### Sandbox Testing
1. Create a test account in Mercado Pago developer panel
2. Use sandbox access token
3. Use test credit cards from Mercado Pago documentation

### Test Cards (Brazil)
| Card | Number | CVV | Expiry |
|------|--------|-----|--------|
| Approved | 5031 4332 1540 6351 | 123 | 11/25 |
| Rejected | 5031 4332 1540 6351 | 456 | 11/25 |

## Troubleshooting

### Gift card stays PENDING
- Check webhook logs for errors
- Verify `MERCADOPAGO_ACCESS_TOKEN` is correct
- Ensure webhook URL is accessible from internet (use ngrok for local testing)

### Payment creation fails
- Check access token permissions
- Verify amount is within Mercado Pago limits
- Check for API rate limiting

## Resources

- [Mercado Pago Checkout Pro Documentation](https://www.mercadopago.com.br/developers/en/docs/checkout-pro/landing)
- [Node.js SDK GitHub](https://github.com/mercadopago/sdk-nodejs)
- [Webhook Documentation](https://www.mercadopago.com.br/developers/en/docs/your-integrations/notifications/webhooks)
