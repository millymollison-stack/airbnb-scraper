# Tonight's Work — Quick Ref

**2 hours building the Airbnb → Template Preview flow**

---

## Files Created / Modified

### 1. `airbnb-scraper/server.js`
**`/Users/davidsassistant/.openclaw/workspace/projects/airbnb-scraper/server.js`**
- Extends hero_image, title, location, JSON-LD data BEFORE the slow wait
- Then 1.5s wait for JS hydration → then body text for slow fallbacks
- Port 6904

### 2. `OnboardingPopup.tsx`
**`/Users/davidsassistant/.openclaw/workspace/projects/02-surfhousebaja-template/src/components/OnboardingPopup.tsx`**
- 4-step wizard: Design → Property Name → Banking → Publish
- Airbnb radio → URL input → "Import from Airbnb" button
- Countdown timer: "Importing from Airbnb... (20s remaining)"
- Calls scraper at `http://localhost:6904/scrape?url=...`
- Shows TemplatePreview on success
- Backdrop: `rgba(0,0,0,0.1)` (10% — template visible behind)

### 3. `OnboardingPopup.css`
**`/Users/davidsassistant/.openclaw/workspace/projects/02-surfhousebaja-template/src/components/OnboardingPopup.css`**
- External CSS (David's rule: no inline CSS in separate files)
- Modal box-shadow: `0 25px 80px rgba(0,0,0,0.6)`
- Fonts + spacing for wizard steps

### 4. `TemplatePreview.tsx`
**`/Users/davidsassistant/.openclaw/workspace/projects/02-surfhousebaja-template/src/components/TemplatePreview.tsx`**
- Renders `example.html` layout as a React component
- All styles inline (self-contained preview component)
- 700px tall preview showing: hero bg, nav, title, location, price, description, details row
- Airbnb hero image appears as the background

---

## How It Works

```
User opens http://localhost:5174
  → Popup appears after 2s
  → User clicks "Airbnb" radio
  → Pastes: https://www.airbnb.com/rooms/40551862
  → Clicks "Import from Airbnb"
  
  ┌─ Scraper starts ─────────────────────────────────────┐
  │  Step 1: Extract og:image, h1, JSON-LD (instant)      │
  │  Step 2: Wait 1.5s for Airbnb JS to load             │
  │  Step 3: Extract price, description, details (slow)   │
  │  Return: hero_image, title, location, price, desc    │
  └──────────────────────────────────────────────────────┘
  
  → TemplatePreview renders with hero bg visible FIRST
  → Countdown ticks down: "Importing... (15s remaining)"
  → Rest of data arrives → updates in place
  → "1 image imported from Airbnb" shows below
```

---

## Boot Commands

```bash
# React dev server (port 5174)
cd /Users/davidsassistant/.openclaw/workspace/projects/02-surfhousebaja-template/src && npm run dev -- --port 5174

# Airbnb scraper (port 6904)
cd /Users/davidsassistant/.openclaw/workspace/projects/airbnb-scraper && node server.js

# Restart scraper
kill -9 $(lsof -ti :6904) && cd /Users/davidsassistant/.openclaw/workspace/projects/airbnb-scraper && node server.js
```

---

## Memory Files Updated

| File | What it has |
|------|-------------|
| `MEMORY.md` | Everything — project overview, servers, key decisions |
| `memory/2026-04-10.md` | Today's session log |
| `memory/project-file-map.md` | Every file + port + command |
| `TOOLS.md` | Boot commands, Supabase URL |
| `knowledge/projects/active-project.json` | Current project snapshot |

---

## What Still Needs Doing

- [ ] Full publish flow (Step 2 → Step 3 → PUBLISH → Supabase save)
- [ ] Image strip in TemplatePreview (all scraped images, not just hero)
- [ ] Missing fields: rating, reviews, beds, host_name in TemplatePreview
- [ ] Connect ImageGallery in Home.tsx to use scraped images

---

_April 10, 2026 — 2 hours_
