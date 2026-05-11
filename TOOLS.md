# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

---

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Servers to Boot

| Port | Site | Command | Notes |
|------|------|---------|-------|
| **9000** | **Get Your Own Site (landing page)** | **`cd .../vacation-rental-deploy && npx serve -l 9000 .`** | Marketing/SaaS landing page |
| **5174** | **🌊 Surf House Baja Template (React)** | **`cd .../02-surfhousebaja-template/src && npm run dev -- --port 5174`** | Main dev server |
| **6905 | Airbnb scraper** | **`cd .../airbnb-scraper && node server.js`** | Playwright/Chromium |
| **9103** | **🌊 Surf House Baja (Original) — LIVE SITE** | **`cd "/Users/davidsassistant/.openclaw/workspace/projects/Surf House Baja (Original)/dist" && npx serve -l 9103 .`** | **⚠️ DO NOT modify — serve from dist/ folder** |

## Server URLs

- **http://localhost:9000** — Get Your Own Site (SaaS landing page)
- **http://localhost:5174** — React template dev server
- **http://localhost:6904** — Airbnb scraper (POST /scrape?url=...)
- **http://localhost:9103** — Original Surf House Baja site (READ ONLY) |

## Vercel
- Account: millymollison@gmail.com
- Password: Clawbot12!
- Project: 02-surfhousebaja-template
- Alias: https://02-surfhousebaja-template.vercel.app
- Deploy: `vercel --prod` in project root

## Scraper

**Location:** `projects/airbnb-scraper/server.js`
**Port:** 6904
**Restart:**
```bash
kill -9 $(lsof -ti :6905) ; cd /Users/davidsassistant/.openclaw/workspace/projects/airbnb-scraper && node server.js
```
**Health:** `http://localhost:6904/health`
**Scrape:** `GET http://localhost:6904/scrape?url=<airbnb_url>`

## Supabase

- URL: `https://jtzagpbdrqfifdisxipr.supabase.co`
- API Key: `re_LL3ybLoE_FJ6jAuqAV7uWZSbKWasevWFh`
- ⚠️ Grace period until Apr 1, 2026 — minimize egress

## Key Files

```
02-surfhousebaja-template/src/
├── components/
│   ├── OnboardingPopup.tsx        ← 4-step wizard modal
│   ├── OnboardingPopup.css        ← external CSS
│   └── TemplatePreview.tsx        ← inline-styled template renderer
├── pages/Home.tsx                 ← main page + popup trigger
└── template/Airbnb Import Template/example.html  ← exported site template
```

## Instagram

- Account: @millymollison
- Email: millymollison@gmail.com
- Password: Clawbot12!
- Following: @dvdmllsn, @surfhousebaja

## TTS

- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod

---

_Updated: April 11, 2026_
