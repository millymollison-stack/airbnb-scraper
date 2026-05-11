# Definitive Airbnb Scraper — April 10, 2026

## Location
`/Users/davidsassistant/.openclaw/workspace/projects/airbnb-scraper/server.js`

## Status
**Working** — restart needed to pick up new code

## Start
```bash
cd /Users/davidsassistant/.openclaw/workspace/projects/airbnb-scraper && node server.js
```

## API
- `GET /scrape?url=https://www.airbnb.com/rooms/XXXXX`
- Returns `{ success: true, data: { title, location, price, description, hero_image, images, guests, bedrooms, beds, baths, reviews, rating } }`
- `GET /health`

## What's Fixed (v10)
- Price: body text regex `\$\d{1,3}(,\d{3})*` — finds first dollar amount
- Description: longest `p` tag over 100 chars
- Location: smarter h2 detection (looks for comma/Entire/Private)
- Details: extracts guests/bedroom/bed/bath from `li` elements
- Reviews + rating: from body text patterns
- All images: collected from og:image meta, first = hero, upgraded to im_w=1200

## Architecture
- Node.js + Playwright (chromium headless)
- Single `server.js` file — self-contained
- Hero image converted to base64 for CORS-free embedding
- GET request (simpler than POST for frontend)

## Test URLs
```
https://www.airbnb.com/rooms/40551862
https://www.airbnb.com/rooms/670576704094588867
https://www.airbnb.com/rooms/1230061019276288869
https://www.airbnb.com/rooms/494903
```
