# Project File Map

_Augmented file map — primary reference for all projects_

---

## 🏠 Vacation Rental SaaS — Core Files

### React Template (02-surfhousebaja-template)
**Dev server:** `http://localhost:5174`
```
/projects/02-surfhousebaja-template/src/
├── components/
│   ├── OnboardingPopup.tsx       ← 4-step wizard modal (inline styles, 95% opaque)
│   ├── OnboardingPopup.css       ← external CSS for popup
│   ├── TemplatePreview.tsx       ← renders example.html layout with scraped data (inline styles)
│   ├── Layout.tsx
│   ├── Header.tsx
│   ├── ImageGallery.tsx           ← main site image slider
│   ├── PropertyDetails.tsx
│   └── ...
├── pages/
│   └── Home.tsx                   ← loads property from Supabase, renders ImageGallery + OnboardingPopup
├── app/
│   └── App.tsx
├── store/
│   └── auth.tsx                   ← supabase auth
└── lib/
    └── supabase.ts                ← supabase client
```

### Template Export (example.html)
**Purpose:** The actual HTML site generated when user publishes
```
/projects/02-surfhousebaja-template/src/template/Airbnb Import Template/
└── example.html                   ← the exported site template (hardcoded CSS, JS interpolation at publish time)
```

### OnboardingPopup — Full Component Spec
- **File:** `02-surfhousebaja-template/src/components/OnboardingPopup.tsx`
- **Styles:** `OnboardingPopup.css` (external) + inline for modal body
- **Backdrop:** `rgba(0,0,0,0.1)` — outer overlay (10% opacity, shows template behind)
- **Modal body:** `rgba(10,10,10,0.95)` — 95% opaque dark
- **Box shadow:** `0 25px 80px rgba(0,0,0,0.6)`

### TemplatePreview — Full Component Spec
- **File:** `02-surfhousebaja-template/src/components/TemplatePreview.tsx`
- **All styles inline** (self-contained preview, replicates example.html exactly)
- **Container height:** 700px
- **Hero bg:** `position:absolute` filling container
- **Shows:** hero image, nav, title, location, price, description, details row, Book Now button

---

## 🔧 Airbnb Scraper

**File:** `/projects/airbnb-scraper/server.js`
**Port:** 6904
**Command:** `cd /projects/airbnb-scraper && node server.js`
**Health:** `http://localhost:6904/health`
**Scrape:** `http://localhost:6904/scrape?url=<airbnb_url>`

**Speed:** ~17 seconds end-to-end
**Wait strategy:** `waitUntil: 'commit'` + 2000ms `waitForTimeout`

**Restart command:**
```bash
kill -9 $(lsof -ti :6904) && cd /Users/davidsassistant/.openclaw/workspace/projects/airbnb-scraper && node server.js
```

---

## 🌊 Surf House Baja (Original) — LIVE SITE

**⚠️ DO NOT MODIFY — David's actual website**

**Path:** `/projects/Surf House Baja (Original)/`
**Port:** 9103
**Command:** `cd "/Users/davidsassistant/.openclaw/workspace/projects/Surf House Baja (Original)" && npx serve -l 9103 .`

---

## ☁️ Supabase

**URL:** `https://jtzagpbdrqfifdisxipr.supabase.co`
**⚠️ Grace period until Apr 1, 2026** — minimize egress (cached data calls)

### Tables
- `user_sites` — stores property data (title, description, hero_image, price, location, etc.)
- `property_images` — stores gallery images (url, position, is_featured)
- `users` — auth users

---

## 🖥️ To Boot All Servers

```bash
# 1. React dev server (port 5174)
cd /Users/davidsassistant/.openclaw/workspace/projects/02-surfhousebaja-template/src && npm run dev -- --port 5174

# 2. Airbnb scraper (port 6904)
cd /Users/davidsassistant/.openclaw/workspace/projects/airbnb-scraper && node server.js
```

---

## 📋 Full Airbnb Import Flow

1. User opens `http://localhost:5174` → popup appears after 2s
2. User clicks "Airbnb" radio → Airbnb URL input appears
3. User pastes Airbnb URL → clicks "Import from Airbnb"
4. Popup shows "Importing from Airbnb... (20s remaining)" countdown
5. OnboardingPopup calls `http://localhost:6904/scrape?url=...`
6. Playwright scrapes Airbnb → returns hero_image (base64), title, location, price, description, images[]
7. `TemplatePreview` renders with scraped data (hero bg, title, location, price, description, details)
8. "1 image imported from Airbnb" shows below preview
9. User fills Step 2 (property name/desc) → Step 3 (plan) → PUBLISH
10. `publishSite()` saves to `user_sites` + `property_images` in Supabase

---

_Updated: April 10, 2026 (late night)_
