# START HERE

**Last updated: April 10, 2026 — late night**

---

## Current Project

Vacation Rental SaaS — building an onboarding wizard that imports an Airbnb listing and generates a property site.

**What's working today:**
- Popup at `http://localhost:5174` — 4-step wizard with Airbnb import
- Airbnb scraper at port 6904 — returns hero image, title, location, price, description
- Template preview shows Airbnb data inside the popup
- Countdown timer during import

---

## Boot All Servers — 3 Terminal Tabs

**Tab 1 — Landing page (port 9000):**
```bash
cd /Users/davidsassistant/.openclaw/workspace/projects/vacation-rental-deploy && npx serve -l 9000 .
```

**Tab 2 — React template (port 5174):**
```bash
cd /Users/davidsassistant/.openclaw/workspace/projects/02-surfhousebaja-template/src && npm run dev -- --port 5174
```

**Tab 3 — Airbnb scraper (port 6904):**
```bash
cd /Users/davidsassistant/.openclaw/workspace/projects/airbnb-scraper && node server.js
```

**Restart scraper if stuck:**
```bash
kill -9 $(lsof -ti :6904) && cd /Users/davidsassistant/.openclaw/workspace/projects/airbnb-scraper && node server.js
```

---

## What Each Port Is

| Port | URL | What |
|------|-----|------|
| 9000 | http://localhost:9000 | Landing page (marketing) |
| 5174 | http://localhost:5174 | React template + popup (MAIN WORK) |
| 6904 | http://localhost:6904 | Airbnb scraper API |
| 9103 | http://localhost:9103 | ORIGINAL live site — **DO NOT TOUCH** |

---

## Key Files

| File | What it is |
|------|------------|
| `src/components/OnboardingPopup.tsx` | The 4-step wizard popup |
| `src/components/TemplatePreview.tsx` | Template preview with Airbnb data |
| `src/pages/Home.tsx` | Main page + loads property from Supabase |
| `airbnb-scraper/server.js` | Playwright scraper, port 6904 |
| `src/template/Airbnb Import Template/example.html` | The exported HTML site template |

Full file map: `memory/project-file-map.md`

---

## What's Left to Do

- [ ] Full publish flow (Step 2 → 3 → PUBLISH → Supabase save)
- [ ] Image strip in TemplatePreview (all scraped images)
- [ ] Missing fields: rating, reviews, beds, host name in TemplatePreview
- [ ] Connect ImageGallery to use scraped images

---

## Supabase

- URL: `https://jtzagpbdrqfifdisxipr.supabase.co`
- Tables: `user_sites`, `property_images`
- ⚠️ Grace period until Apr 1, 2026 — minimize egress

---

## Quick Test

1. Open `http://localhost:5174` in Chrome
2. Wait 2 seconds for popup
3. Click **Airbnb** radio button
4. Paste any Airbnb listing URL
5. Click **Import from Airbnb**
6. Wait ~17 seconds — template preview appears with real data

---
