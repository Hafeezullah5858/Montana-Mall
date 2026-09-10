# Muntaha Mall deployment

## Files
- `server.js` — backend, authentication, products, orders, seller center and payments
- `index.html`, `style.css`, `script.js`, `phase3.js` — storefront UI
- `assets/muntaha-mall-logo.png` — logo
- `data/db.json` — created automatically on first start

## Start
```
npm start
```
The server listens on `0.0.0.0` and uses the platform `PORT` variable.

## Online payments
Online payments use Safepay hosted checkout. Safepay provides hosted checkout so card/payment details do not pass through the Muntaha Mall server. A Safepay account and merchant onboarding are required for live payments.

Set these environment variables in Back4app (do not put secrets in GitHub):
- `PAYMENT_PROVIDER=safepay`
- `SAFEPAY_ENV=sandbox` for testing, then `production` for live
- `SAFEPAY_MERCHANT_API_KEY`
- `SAFEPAY_MERCHANT_SECRET`
- `SAFEPAY_WEBHOOK_SECRET`

Webhook endpoint:
`POST /api/payments/safepay/webhook`

Configure this endpoint in the Safepay dashboard and select the payment events you need. The server verifies the webhook signature before changing an order to Paid.

## Important
Never commit live payment secrets or the admin password to GitHub.


## VIP marketplace features
- Responsive marketplace storefront with category navigation, search, flash deals, product quick-view, wishlist and cart.
- Customer accounts, orders and order tracking.
- Seller Center with seller onboarding, product management and sales overview.
- Admin dashboard with product and order controls.
- Safepay hosted checkout for online payments plus Cash on Delivery.
- Payment status polling and signed webhook handling.

### Payment return/session note
The customer session cookie uses `SameSite=Lax` so a normal top-level return from the Safepay hosted checkout can still reach the order-status endpoint. Keep the live site on HTTPS.
