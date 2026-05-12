# propbook.pro — Project Memory
_Reference file for session crashes and restarts. Updated 2026-05-12._

---

## 🔗 Live URLs & Servers

| URL / Port | Purpose | Status |
|---|---|---|
| `http://localhost:5174` | React template dev server | ✅ UP |
| `http://localhost:6905` | Airbnb scraper (Playwright/Node) | ⚠️ DOWN |
| `http://localhost:3099` | Stripe edge functions server (Node) | ⚠️ DOWN |
| `https://propbook.pro` | **LIVE SITE** — not yet deployed | 🚧 pending |
| `https://02-surfhousebaja-template.vercel.app` | Vercel alias (template build) | ✅ up |

**Restart scraper:** `kill -9 $(lsof -ti :6905) && cd .../airbnb-scraper && node server.js`
**Restart Stripe server:** `kill -9 $(lsof -ti :3099) && cd .../stripe-server && node server.js`

---

## 🎯 The Vision (Option A — True SaaS)

A multi-tenant vacation rental platform where each customer:
1. Signs up → gets their own subdomain: `customer1.propbook.pro`
2. Can upload their own `index.html` to their own domain (domain pointing)
3. Pays a monthly hosting fee
4. Uses our Stripe billing (or Stripe Connect if they want their own bank account)

**Key insight:** We proved Stripe works on a real public domain. Dev/localhost issues with payment modals may disappear once live.

---

## 🏗️ Architecture

### Frontend — Hostinger (static PHP/HTML hosting)
- Single `dist/` folder — pure HTML/CSS/JS
- Upload to `public_html` via hPanel File Manager
- Domain: `propbook.pro` → points to Hostinger via DNS A record
- No Node.js support on Single Web Hosting plan

### Backend Services — Needs Node.js Hosting
Stripe edge functions (`stripe-connect`, `stripe-subscription`, `process-refund`, `send-booking-email`) and the Airbnb scraper need a Node.js host. Options:

| Provider | Free Tier | Good For |
|---|---|---|
| **Render.com** | Sleeps after 15min idle, wakes on Stripe webhook | Stripe webhooks (cheap, reliable) |
| **Railway** | $5 free credit/month | Stripe webhooks + scraper |
| **Vercel Edge Functions** | Free tier, serverless | Stripe proxy |

**Recommended:** Railway for the Stripe webhook proxy. It's the simplest Node.js hosting with a real public URL that Stripe can hit.

### Database — Supabase
- URL: `https://jtzagpbdrqfifdisxipr.supabase.co`
- API Key: `re_LL3ybLoE_FJ6jAuqAV7uWZSbKWasevWFh`
- ⚠️ Grace period ends **April 1, 2026** — minimize unnecessary queries

---

## 🧾 Hostinger Account

| Field | Value |
|---|---|
| Login | Millymollison@gmail.com |
| Password | Clawbot12! |
| Account/Username | `u805930916` |
| Domain | `propbook.pro` (not yet pointed anywhere) |
| Plan | Single Web Hosting (PHP/static only — no Node.js) |
| hPanel | https://hpanel.hostinger.com/websites/mollisondavid.com/files/file-manager |
| How to upload | hPanel → File Manager → public_html → Upload |

---

## 📁 Key Project Files

**React Template (`02-surfhousebaja-template`):**
```
src/
├── AdminSidebarBundle.tsx        ← main sidebar logic
├── components/
│   ├── LocationMap.tsx          ← map modal (X btn fix May 12)
│   ├── BookingCalendar.tsx      ← booking flow + special requests
│   ├── PropertyDetails.tsx
│   ├── PropertyAmenities.tsx
│   └── sidebar.css              ← all sidebar/input CSS classes
│
└── app/
    └── index.css                ← view-location-btn, booking-modal-submit-btn, booking-modal-select
```

**Stripe Server:**
```
stripe-server/server.js
Port: 3099
Edge functions: stripe-connect, stripe-subscription, process-refund, send-booking-email
```

**Airbnb Scraper:**
```
airbnb-scraper/server.js
Port: 6905
Uses Playwright/Chromium headless
```

---

## 🚀 Deployment Plan

### Phase 1 — Frontend Live (Today)
1. `npm run build` in template project → `dist/` folder
2. Upload `dist/` contents to Hostinger `public_html` via hPanel
3. Point `propbook.pro` DNS A record to Hostinger
4. Test — site loads at `https://propbook.pro`

### Phase 2 — Stripe Proxy Live
1. Deploy Stripe edge function proxy to Railway (free tier)
2. Update frontend to call Railway URL instead of localhost:3099
3. Test Stripe payment modal on live domain

### Phase 3 — Airbnb Scraper
1. Deploy scraper to Railway (or keep on local Mac mini for now)
2. Supabase handles data; scraper wakes on demand
3. Railway's free tier should handle periodic scraping

### Phase 4 — SaaS Subdomains
1. Hostinger supports wildcard subdomains via DNS
2. New customer signup → provision subdomain `customer.propbook.pro`
3. Customer uploads own site or we generate from template
4. Stripe Connect for per-customer billing (later phase)

---

## ⚠️ Known Issues (as of May 12)

| Issue | Status |
|---|---|
| Stripe modal close (×) button doesn't work | 🚧 OPEN — causes stuck state |
| Day picker lozenge CSS | ❌ BROKEN — abandoned approach |
| `@tailwindcss/forms` removed | ⚠️ may cause form regressions elsewhere |
| Airbnb scraper anti-detection | ✅ Working since Apr 18 |
| Editmode.css | 🚧 Needs fixes |
| Popup fields (email, banking, server URL) | 🚧 Wire to Supabase |

---

## 🔑 Credentials Summary

| Service | Login | Password |
|---|---|---|
| Hostinger | Millymollison@gmail.com | Clawbot12! |
| Supabase | — | `re_LL3ybLoE_FJ6jAuqAV7uWZSbKWasevWFh` |
| Vercel | millymollison@gmail.com | Clawbot12! |
| Instagram | @millymollison | Clawbot12! |

**GitHub token:** `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`
