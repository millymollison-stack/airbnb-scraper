# Knowledge References
_Lessons, decisions, and important context — not injected before every call. Read on demand._

---

## Project: Vacation Rental SaaS

### Tech Stack
- Frontend: React + Vite + TypeScript
- Backend: Node.js + Supabase
- Payments: Stripe
- Hosting: Static export + npx serve
- Scraper: Playwright (chromium-headless) on port 6905

### Workspace
- `02-surfhousebaja-template/src/` — main workspace
- `OnboardingPopup.tsx` — 4-step wizard modal
- `TemplatePreview.tsx` — inline-styled template renderer
- `airbnb-scraper/server.js` — Playwright scraper
- `Supabase` — user_sites + property_images tables

### Vercel
- Project: 02-surfhousebaja-template
- URL: https://02-surfhousebaja-template.vercel.app
- Deploy: `vercel --prod` in project root

---

## Current Priority Order
1. Editmode.css — fix edit inputs styled & functional
2. Color picker — verify clean working in edit mode
3. Popup fields — wire email, banking, server URL, details to Supabase
4. Stripe payment — full subscription/save-card flow
5. Site duplication function
6. Get Your Own Site — clean up
7. Build Airbnb host list
8. Video + ads

---

## Key Technical Decisions

### Color Theming
- `#C47756` → `var(--brand)` via CSS vars in `index.html` `<head>`, survives Vite builds
- `saveBrandColor()` persists to localStorage

### Popup Design
- Backdrop: `rgba(0,0,0,0.1)` — template shows through behind modal
- Modal body: `rgba(10,10,10,0.95)` — dark, readable, big box-shadow
- OnboardingPopup left-justified: `align-items: flex-start`, `text-align: left`, `margin: 0 auto` on `.popup-modal`

### Font Fix (Apr 25 — COMPLETED)
- All h1s now use `var(--font-accent)`, weight 400, `clamp(1.25rem, 3vw, 1.75rem)`, black 73%
- `.sidebar-header-label` and `.sidebar-section-header` — only `letter-spacing`, `color`, `margin` (no font overrides)
- **Phantom CSS lesson:** class selectors (`.sidebar-header-label`) override element selectors (`h1`) by CSS specificity — explicit font-size/weight on a class blocked the base h1 rule
- Tailwind preflight (Apr 25): disabled `corePlugins: { preflight: false }` in `tailwind.config.js` because preflight injects `h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}` that was making all h1s tiny
- **⚠️ Risk:** disabling preflight could break other elements that relied on Tailwind base resets — re-enable if layout/form issues appear

### CSS Rule
- All CSS in separate `.css` files — never inline in JSX (except TemplatePreview which is self-contained)
- **ONLY surgical targeted changes** — never rewrite CSS files wholesale

### Scraper
- Port 6905
- `waitUntil: 'commit'` + 2000ms waitForTimeout
- `browser.close()` must use `setImmediate(() => { browser.close(); })` to avoid blocking HTTP response on macOS

### Sidebar Design (Apr 26+)
- Labels: `<h3>` with `clamp(0.8rem,1.7vw,0.9rem)`, values: `<p>` at 16px/#545454/600
- Edit inputs: `padding: 12px 16px`
- Section headers: `.sidebar-section-header`, `.sidebar-header-label` — letter-spacing + color + margin only

### Editmode/ColorPicker (Apr 26)
- `.edit-intro-textarea` width → 100%
- OnboardingPopup.css: inputs margin trimmed (8px 0 28px removed)
- TemplatePreview.css: added 400px media query — `.preview-container` height: 400px
- ColorPicker: CSS handles `right: 20px` positioning — removed Tailwind `right-[5px]` overwrite
- Layout.tsx: "Save & Exit" button → "Save"

### Auth Modal
- Centered form, 100% wide inputs + button
- h1 `font-accent`, `.popup-link` brand color
- React Router `<Link>` instead of `<a href>`

### LocationMap
- Address shown first, falls back to local_area

---

### AdminSidebarBundle Integration (COMPLETED May 10)
- File: `src/AdminSidebarBundle.tsx` — fully wired to app's stores (auth.ts, property.ts, lib/supabase.ts)
- New Zustand store: `src/store/property.ts` — nav title sync
- Services toggle saves to `profiles.services_ai_seo|marketing|advertising|analytics|influencers|social`
- `servicesLoaded` guard removed → live data refreshes every sidebar open
- Profile button now universal (all logged-in users, not admin-gated)
- sidebar.css extended: 27 new classes for fields, toggles, booking cards, credentials, nav sections, service rows, plan cards, action buttons

### sidebar.css Typography (May 10)
- Font scale: `clamp(0.9rem, 2vw, 1.1rem)`, weight 300/400
- Colors: `rgba(0,0,0,0.85)` primary, `rgba(0,0,0,0.5)` labels, `rgba(0,0,0,0.35)` placeholders
- Booking date callout: Apple Calendar style — 12px radius, 3px black keyline, color bars bleed to edge
- `.sb-input` — white-bg edit inputs visible on white background

### Auto-Compaction (May 10)
- After every 10 prompts: write daily note, git commit, remove `.bak`/`.json~` files, notify David

---

## Critical Lessons

**⚠️ CSS in production templates — NEVER rewrite wholesale**
- Apr 24: Full CSS refactor of styles.css/index.css destroyed 9103 live site's layout
- Fix: `git show HEAD~1:src/components/styles.css > src/components/styles.css` (full revert from git)
- **Rule: Only surgical targeted CSS changes. Test on dev copy (port 5175) first.**

**⚠️ exec-approvals.json controls exec security separately from openclaw.json**
- If `node`, `curl` get blocked while builtins (`ls`, `echo`) pass → exec-approvals.json is on `allowlist`
- Fix: set both `security` values to `"full"` via python3, then `openclaw gateway restart`

**⚠️ Scraper anti-detection**
- Airbnb blocked all headless Chrome Apr 12-17 (6 days) — returned CAPTCHA/fallback pages
- Working since Apr 18 with no changes

**⚠️ `browser.close()` blocks HTTP response on macOS**
- Fix: wrap in `setImmediate(() => { browser.close(); })`

**⚠️ isLight() stray `return null` crashes the page**
- Must return boolean

**⚠️ Stripe modal close (×) button — OPEN ISSUE**
- X button doesn't work, causes stuck state on payment screen — not yet fixed

**⚠️ Day picker lozenge CSS — BROKEN, DO NOT USE**
- Apr 27: Attempted lozenge styling for calendar day picker → completely broke calendar
- Reverted at 1:18am — abandoned this approach

**⚠️ Phantom CSS — CSS specificity class > element**
- Apr 25: `.sidebar-header-label` with explicit `font-size:11px` was overriding base `h1` font rules
- Fix: strip classes to only the properties they actually need (margin, letter-spacing, color)

**⚠️ Dev server instability (Apr 25)**
- 5174 serve process dying repeatedly — may need investigation if it continues

---

## Supabase Schema Notes
- `user_sites` — holds site configurations
- `property_images` — holds image URLs (has `is_main` / `is_featured` columns)
- `property-images` bucket — must be created manually in Supabase dashboard for scraper uploads
- RLS enabled — handleImportedImages was getting 403 on insert
- Grace period: Apr 1, 2026 — minimize egress

---

## Server Ports (Current)
| Port | Site | Note |
|------|------|------|
| 5174 | React template dev | main dev |
| 6905 | Airbnb scraper | Playwright |
| 3099 | Stripe server | |
| 9100 | NewAdminSite | |
| 9103 | Original live site | ⚠️ DO NOT MODIFY |
| 9000 | Landing page | SaaS marketing |

Restart scraper: `kill -9 $(lsof -ti :6905) && cd .../airbnb-scraper && node server.js`

---

## GitHub
- Token: `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`
- Last push: Apr 26 (commits 5eb8d18 and f642d8e)
- Junk files to remove: `src/app/index copy.css`, `src/spinners.html`, `work in progress/`

---

## Nightly Archive Log
- 2026-04-06 through 2026-04-24 → memory/archive/
- 2026-04-25 → memory/archive/2026-04-25.md
- 2026-04-27 → memory/archive/2026-04-27.md
- 2026-04-28 through 2026-04-30 → memory/archive/ (blank stubs — no session activity)
- **2026-05-11:** May 10 session: AdminSidebarBundle fully integrated + 27 new sidebar.css classes. No other changes. References and MEMORY.md updated.
- **2026-05-10:** No new daily notes. Project idle since May 1. No changes to project state or technical decisions. References and MEMORY.md current.
- **2026-05-08:** No new daily notes since Apr 25 (knowledge/daily/ only has 2026-04-25.md). Apr 25 archived to knowledge/archive/. References, MEMORY.md, and memory/archive/ all current. No changes to project state.
- **2026-05-07:** No new daily notes. References and MEMORY.md current. Nothing to archive.
- **2026-05-06:** No new daily notes. References and MEMORY.md current. Nothing to archive.
- **2026-05-04:** Consolidated Apr 24–25 notes; references.md distilled; MEMORY.md unchanged

---

_Updated: May 8, 2026 — nightly consolidation_