# Airbnb Scraper Test Results

**Scraper version:** v11 (Definitive) — April 10, 2026
**Updated by:** Milly (subagent)

---

## What Was Changed (v10 → v11)

### URL Normalization
- Added handling for `/h/handleshort` URLs (Airbnb handle-based short URLs)
- Strips query params cleanly before processing
- Better detection of plain room numbers vs hostnames

### Price Extraction
- Added `meta[itemprop="price"]` extraction (most reliable structured source)
- Added range filter: only accepts prices $30–$3000/night (filters out cleaning fees/totals)
- Context-aware matching instead of just first `$X,XXX` pattern

### Description
- Added structured selectors: `#details .item`, `[data-section-id="DESCRIPTION"]`, section[id*="description"]
- Filters out noise (paragraphs with `·` or `airbnb.com` links)
- Cap at 1500 chars

### Property Details (guests/bedrooms/beds/baths)
- Uses `span[aria-label]` with patterns like "2 bedrooms", "3 beds", "2 bathrooms"
- Falls back to `li` element scanning
- More specific regex patterns to avoid false matches

### Reviews & Rating
- Added meta tag extraction: `meta[property="airbnb:rating"]` and `meta[property="airbnb:review_count"]`
- Fallback patterns still work if meta tags missing

### Host Name
- Added multiple selector fallbacks including `a[href*="/users/show/"]`
- Added length/content validation to avoid garbled text

### Images
- Cleaner URL normalization with `upgradeImageUrl()` helper
- Strips query params, adds `?im_w=1200` for hi-res
- More robust detection

### JSON-LD Parsing
- New `findListingInJson()` helper to search nested JSON-LD for accommodation data
- Can extract description and author from structured data when available

### Other
- Added User-Agent header to avoid basic bot detection
- Blocked image/css/woff resources to speed up page load
- Better error handling with structured fallbacks at every step

---

## Test URLs
To test, run these curl commands against the running server (port 6904):

```bash
curl "http://localhost:6904/scrape?url=https://www.airbnb.com/rooms/670576704094588867"
curl "http://localhost:6904/scrape?url=https://www.airbnb.com/rooms/1230061019276288869"
curl "http://localhost:6904/scrape?url=https://www.airbnb.com/rooms/40551862"
curl "http://localhost:6904/scrape?url=https://www.airbnb.com/rooms/494903"
```

---

## Test Run 1 — TBD
<!-- Fill in after running tests -->

| Field | URL 1 | URL 2 | URL 3 | URL 4 |
|-------|-------|-------|-------|-------|
| title | | | | |
| location | | | | |
| price | | | | |
| description | | | | |
| hero_image | | | | |
| guests | | | | |
| bedrooms | | | | |
| beds | | | | |
| baths | | | | |
| rating | | | | |
| reviews | | | | |
| host_name | | | | |
| error | | | | |
