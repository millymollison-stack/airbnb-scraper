# Vacation Rental SaaS — Project Documentation

Updated: April 13, 2026

---

## Overview

Four projects make up this system:

| Project | Path | Port | Purpose |
|---------|------|------|---------|
| **Surf House Baja (Original)** | `projects/Surf-House-Baja-(Original)/` | 9103 | Live property site (READ ONLY — do not modify) |
| **New Site Template** | `projects/02-surfhousebaja-template/src/` | 5174 | Onboarding wizard for new site creation |
| **Airbnb Scraper** | `projects/airbnb-scraper/` | 6905 | Scrapes Airbnb listings via curl + JSON-LD |
| **Vacation Rental Deploy** | `projects/vacation-rental-deploy/` | 9000 | SaaS landing page (Get Your Own Site) |

---

## Servers to Boot

Run these commands in sequence to start everything:

```bash
# 1. New Site Template (port 5174)
cd /Users/davidsassistant/.openclaw/workspace/projects/02-surfhousebaja-template/src && npm run dev -- --port 5174

# 2. Airbnb Scraper (port 6905)
node /Users/davidsassistant/.openclaw/workspace/projects/airbnb-scraper/server.js

# 3. Surf House Baja Original (port 9103)
cd "/Users/davidsassistant/.openclaw/workspace/projects/Surf-House-Baja-(Original)/dist" && npx serve -l 9103 .

# 4. Vacation Rental Deploy (port 9000)
cd /Users/davidsassistant/.openclaw/workspace/projects/vacation-rental-deploy && npx serve -l 9000 .
```

**Quick check:** `lsof -i :5174 -i :6905 -i :9103 -i :9000 2>/dev/null | grep LISTEN`

---

## Project Details

### 1. Surf House Baja (Original) — port 9103

**Path:** `/Users/davidsassistant/.openclaw/workspace/projects/Surf-House-Baja-(Original)/`
**Docroot:** `dist/` (served via `npx serve`)
**Purpose:** The actual live Surf House Baja property booking site

**IMPORTANT:** This is the PROTECTED site. Do not modify any files in this project without explicit permission from David. It's David's working property site.

**Popup:** Onboarding popup is DISABLED on this site (line in `pages/Home.tsx`: `{false && (`)
**Source:** `src/` → built → `dist/` (don't edit dist directly)

### 2. New Site Template — port 5174

**Path:** `/Users/davidsassistant/.openclaw/workspace/projects/02-surfhousebaja-template/src/`
**Port:** 5174
**Purpose:** React app with onboarding wizard that imports Airbnb listings and generates property sites

**Key files:**
- `components/OnboardingPopup.tsx` — the 7-step wizard modal
- `components/TemplatePreview.tsx` — shows imported property preview
- `components/styles.css` — all popup CSS classes
- `components/TemplatePreview.css` — template preview styling (185 lines, matches example.html)
- `pages/Home.tsx` — main page, renders OnboardingPopup

**Popup behavior:**
- Auto-opens 2 seconds after page load
- Only renders on port 5174 (New Site Template), NOT on 9103
- Step 2 has Airbnb import — select radio → URL input appears → "Get data" button

**Airbnb import flow:**
1. User pastes Airbnb listing URL
2. "Get data" calls `http://localhost:6905/scrape?url=<url>`
3. Loading state with countdown (20s max)
4. On success: TemplatePreview renders below the button
5. Website name + description auto-fill from scraped data

**Debug:** Press `D` to toggle scraped data inspector overlay

### 3. Airbnb Scraper — port 6905

**Path:** `/Users/davidsassistant/.openclaw/workspace/projects/airbnb-scraper/server.js`
**Port:** 6905
**Method:** curl HTTP GET + JSON-LD parsing (no browser/Playwright)

**API:**
```
GET http://localhost:6905/scrape?url=https://www.airbnb.com/rooms/XXXXX
GET http://localhost:6905/health
```

**Returns:**
```json
{
  "success": true,
  "data": {
    "title": "...",
    "location": "...",
    "description": "...",
    "hero_image": "https://a0.muscache.com/...",
    "images": ["https://a0.muscache.com/...", ...],
    "guests": 4,
    "bedrooms": null,
    "beds": null,
    "baths": null,
    "rating": 5,
    "reviews": 2
  }
}
```

**Known issues:**
- `price`, `beds`, `baths` are NULL — Airbnb renders these via JS after load
- `hero_image` is often the fe7217ff bot-detect placeholder — TemplatePreview uses `images[1]` instead
- Supabase image uploads fail silently (bucket may not exist or lacks write policy)

**Restart:** `kill -9 $(lsof -ti :6905) && node /Users/davidsassistant/.openclaw/workspace/projects/airbnb-scraper/server.js`

### 4. Vacation Rental Deploy — port 9000

**Path:** `/Users/davidsassistant/.openclaw/workspace/projects/vacation-rental-deploy/`
**Port:** 9000
**Purpose:** Marketing/sales page for "Get Your Own Site" SaaS product

---

## Git Repos

| Project | Remote | Notes |
|---------|--------|-------|
| `02-surfhousebaja-template` | `millymollison-stack/surfhousebaja` | Has staged changes |
| `vacation-rental-deploy` | `millymollison-stack/vacation-rental-template` | Clean |
| `Surf-House-Baja-(Original)` | None | Not a git repo — PROTECTED, do not modify |
| `airbnb-scraper` | None | Not a git repo |

---

## CSS Rules (David's Preference)

1. NO hard-coded inline `style={{}}` in JSX — all styling in external CSS files
2. CSS files linked, not embedded in HTML
3. Use meaningful class names — don't mix Tailwind with hand-written CSS in the same element
4. Inter font as base font

---

## Supabase

**URL:** `https://jtzagpbdrqfifdisxipr.supabase.co`
**Anon key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0emFncGJkcnFmaWZkaXN4aXByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3MzUyODUsImV4cCI6MjA2MDMxMTI4NX0.uWqc82Hb-qnRq4H9kg5IPykUosm9VvU2s6e8mOalkR0`
**Auth:** `mollymollison@gmail.com` / `Clawbot12!`

**Grace period:** until April 1, 2026 — minimize egress

**Key tables:** `properties`, `property_images`, `onboarding_data`
**Bucket:** `NewSiteOnboarding` (uploads currently failing)

---

## Test URLs

- http://localhost:5174 — New Site Template (popup active here)
- http://localhost:9103 — Surf House Baja original (popup DISABLED)
- http://localhost:6905/health — Scraper health check
- http://localhost:9000 — Vacation rental SaaS landing page

Airbnb test listings:
- `https://www.airbnb.com/rooms/40551862` — Rio de Janeiro apartment
- `https://www.airbnb.com/rooms/1569039869816457609` — Surf House Baja (our listing)

---

*Last updated: April 13, 2026 (1:15 AM)*
