# Stripe Server — Standalone Unit

## Setup
```bash
cd stripe
npm install
```

## Run
```bash
node server.js
# or
bash start.sh
```

## Deploy to your hosting server
1. Upload entire `stripe/` folder to your server
2. Run `npm install` on the server
3. Set `PORT=3099` (or change in server.js)
4. Run `node server.js` (use PM2 or similar for production)

## API Endpoints
- `POST /create-payment-intent` — one-time payments
- `POST /create-subscription` — recurring subscriptions  
- `POST /create-customer` — create Stripe customer
- `GET /subscription/:id` — check subscription status
- `POST /customer-portal` — Stripe billing portal

## Notes
- Keys are hardcoded in server.js (live keys, NOT test)
- Update `STRIPE_PRICE_*` IDs after creating products in Stripe dashboard