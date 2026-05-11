# Servers — How to Get Running

**Read this when you need to boot everything up from scratch.**

---

## PORT 9000 — "Get Your Own Site" Landing Page

**URL:** `http://localhost:9000`

**What it is:** The SaaS marketing landing page — "Create Your Own Vacation Rental Website".

**File location:**
```
/Users/davidsassistant/.openclaw/workspace/projects/vacation-rental-deploy/index.html
```

**How to start:**
```bash
cd /Users/davidsassistant/.openclaw/workspace/projects/vacation-rental-deploy && npx serve -l 9000 .
```

---

## PORT 5174 — React Template (Main Work)

**URL:** `http://localhost:5174`

**What it is:** The Surf House Baja template React app. This is where the OnboardingPopup lives — the 4-step wizard that imports Airbnb listings and shows a template preview.

**File location:**
```
/Users/davidsassistant/.openclaw/workspace/projects/02-surfhousebaja-template/src/
```

**Key files inside this folder:**
```
src/
├── components/
│   ├── OnboardingPopup.tsx        ← the popup wizard
│   ├── OnboardingPopup.css
│   └── TemplatePreview.tsx        ← template preview with Airbnb data
├── pages/
│   └── Home.tsx                   ← main page
└── template/
    └── Airbnb Import Template/
        └── example.html           ← the exported HTML site template
```

**How to start:**
```bash
cd /Users/davidsassistant/.openclaw/workspace/projects/02-surfhousebaja-template/src && npm run dev -- --port 5174
```

---

## PORT 6904 — Airbnb Scraper

**URL:** `http://localhost:6904` (not a browser page — API only)

**What it is:** The Playwright scraper that takes an Airbnb URL and returns property data (hero image, title, price, description, etc.)

**File location:**
```
/Users/davidsassistant/.openclaw/workspace/projects/airbnb-scraper/server.js
```

**How to start:**
```bash
cd /Users/davidsassistant/.openclaw/workspace/projects/airbnb-scraper && node server.js
```

**Restart if stuck:**
```bash
kill -9 $(lsof -ti :6904) && cd /Users/davidsassistant/.openclaw/workspace/projects/airbnb-scraper && node server.js
```

**Test it:**
```bash
curl "http://localhost:6904/health"
```

---

## PORT 9103 — Surf House Baja ORIGINAL (DO NOT MODIFY)

**URL:** `http://localhost:9103`

**What it is:** David's actual live website. **DO NOT touch this. DO NOT edit any files in this folder.**

**File location:**
```
/Users/davidsassistant/.openclaw/workspace/projects/Surf House Baja (Original)/
```

**How to start:**
```bash
cd "/Users/davidsassistant/.openclaw/workspace/projects/Surf House Baja (Original)" && npx serve -l 9103 .
```

---

## ALL FOUR TOGETHER — Copy and Paste This

Open four terminal tabs and run each line in its own tab:

**Tab 1 — Get Your Own Site landing page (port 9000):**
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

---

## What Each Port Does

| Port | URL | What it is |
|------|-----|------------|
| 9000 | http://localhost:9000 | "Get Your Own Site" landing page (marketing) |
| 5174 | http://localhost:5174 | React template with popup (main work) |
| 6904 | http://localhost:6904 | Airbnb scraper API (behind the scenes) |
| 9103 | http://localhost:9103 | ORIGINAL live site — DO NOT TOUCH |

---

_April 10, 2026_
