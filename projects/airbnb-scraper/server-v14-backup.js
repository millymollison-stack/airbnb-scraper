const { chromium } = require('playwright');

const SB_BUCKET = 'NewSiteOnboarding';
const SB_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0emFncGJkcnFmaWZkaXN4aXByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3MzUyODUsImV4cCI6MjA2MDMxMTI4NX0.uWqc82Hb-qnRq4H9kg5IPykUosm9VvU2s6e8mOalkR0';
const SUPABASE_URL = 'https://jtzagpbdrqfifdisxipr.supabase.co';

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0',
];

function randomUA() { return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]; }

async function downloadImageBuffer(imageUrl) {
  try {
    const resp = await fetch(imageUrl, {
      headers: { 'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8' },
      signal: AbortSignal.timeout(10000)
    });
    if (!resp.ok) return null;
    return Buffer.from(await resp.arrayBuffer());
  } catch { return null; }
}

async function uploadToSupabase(buffer, filename) {
  try {
    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${SB_BUCKET}/${filename}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${SB_ANON_KEY}`, 'apikey': SB_ANON_KEY, 'Content-Type': 'image/jpeg', 'x-upsert': 'true' },
      body: buffer
    });
    if (!res.ok) return null;
    return `${SUPABASE_URL}/storage/v1/object/public/${SB_BUCKET}/${filename}`;
  } catch { return null; }
}

function upgradeImageUrl(url) {
  if (!url) return null;
  return url.replace(/(\?|&)im_w=\d+/, '').replace(/\?$/, '') + '?im_w=1200';
}

function findListingInJson(obj) {
  if (!obj || typeof obj !== 'object') return null;
  if (obj['@type'] === 'LodgingBusiness' || obj['@type'] === 'Hotel') return obj;
  for (const key of ['itemListElement', 'mainEntity', '@graph', 'array']) {
    if (obj[key]) {
      const found = findListingInJson(obj[key]);
      if (found) return found;
    }
  }
  if (Array.isArray(obj)) {
    for (const item of obj) {
      const found = findListingInJson(item);
      if (found) return found;
    }
  }
  return null;
}

async function scrapeListing(targetUrl) {
  const data = {
    title: null, location: null, price: null, currency: 'USD',
    guests: null, bedrooms: null, beds: null, baths: null,
    rating: null, reviews: null, hero_image: null,
    images: [], description: null, host_name: null, error: null
  };

  let browser;
  try {
    const ua = randomUA();

    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage',
        '--disable-blink-features=AutomationControlled',
        '--no-first-run', '--no-default-browser-check',
        '--disable-hang-monitor', '--disable-popup-blocking',
        '--disable-background-timer-throttling',
        '--disable-renderer-backgrounding',
        '--enable-features=NetworkService,NetworkServiceInProcess',
        '--disable-gpu',
      ]
    });

    const context = await browser.newContext({
      viewport: { width: 1280, height: 900 },
      userAgent: ua,
      locale: 'en-US',
      timezoneId: 'America/Los_Angeles',
      permissions: ['geolocation'],
      extraHTTPHeaders: {
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Upgrade-Insecure-Requests': '1',
        'sec-fetch-site': 'none',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-dest': 'document',
      },
    });

    // Remove webdriver flags
    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
      Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3] });
      Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
    });

    const page = await context.newPage();

    console.log(`Navigating: ${targetUrl} (UA: ${ua.substring(0, 60)})`);

    let navError = null;
    try {
      await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 25000 });
    } catch (e) {
      navError = e.message;
      console.log('Nav warning:', navError);
    }

    // Get og:title
    const ogTitle = await page.evaluate(() => {
      const el = document.querySelector('meta[property="og:title"]');
      return el ? el.content : null;
    });
    const ogImage = await page.evaluate(() => {
      const el = document.querySelector('meta[property="og:image"]');
      return el ? el.content : null;
    });

    console.log('og:title:', ogTitle ? ogTitle.substring(0, 60) : 'missing');
    console.log('og:image:', ogImage ? ogImage.substring(0, 60) : 'missing');

    // Check for Oops/CAPTCHA page
    if (ogTitle && (ogTitle.includes('Oops') || ogTitle.includes('404'))) {
      data.error = 'Airbnb CAPTCHA/block detected';
      console.log('[BLOCKED] Airbnb returned non-listing page');
      await browser.close();
      return { success: false, data };
    }

    // Extract title from og:title
    if (ogTitle) {
      const parts = ogTitle.split('·');
      data.title = parts[0].trim();
      if (parts.length >= 2) {
        data.location = parts.slice(1).join('·').replace(/\$[^·]+/, '').trim();
      }
    }

    // Extract images
    if (ogImage) {
      const upgraded = upgradeImageUrl(ogImage);
      data.images.push(upgraded);
      data.hero_image = upgraded;
    }

    // Get all og:image meta tags
    try {
      const metaImages = await page.locator('meta[property="og:image"]').all();
      for (const meta of metaImages) {
        const content = await meta.getAttribute('content');
        if (content && !data.images.includes(content)) {
          data.images.push(upgradeImageUrl(content));
        }
      }
    } catch {}

    // Try h1
    try {
      await page.locator('h1').first().waitFor({ state: 'attached', timeout: 4000 });
      const h1Text = await page.locator('h1').first().textContent();
      if (h1Text && h1Text.trim().length > 5 && !h1Text.includes('Oops')) {
        data.title = h1Text.trim();
      }
    } catch {}

    // Short wait for JS
    await page.waitForTimeout(1200);

    // JSON-LD for description and host
    try {
      const ldScripts = await page.locator('script[type="application/ld+json"]').all();
      for (const script of ldScripts) {
        try {
          const parsed = JSON.parse(await script.textContent());
          const listing = findListingInJson(parsed);
          if (listing) {
            if (!data.description && listing.description) {
              data.description = listing.description.substring(0, 1500);
            }
            if (!data.host_name && listing.author) {
              data.host_name = typeof listing.author === 'string'
                ? listing.author : (listing.author.name || null);
            }
            // Rating/reviews
            if (!data.rating && listing.aggregateRating) {
              const ar = listing.aggregateRating;
              data.rating = ar.ratingValue || null;
              data.reviews = ar.reviewCount || null;
            }
          }
        } catch {}
      }
    } catch {}

    // Body text for price/details
    try {
      const bodyText = await page.evaluate(() => {
        return new Promise((resolve) => {
          const timeout = setTimeout(() => resolve(''), 3000);
          document.fonts.ready.then(() => {
            clearTimeout(timeout);
            resolve(document.body.innerText);
          });
        });
      });

      if (bodyText) {
        // Price — look for $XX or $X,XXX pattern
        const priceMatch = bodyText.match(/\$\s*([\d,]+(?:\.\d{2})?)/);
        if (priceMatch) data.price = priceMatch[1].replace(/,/g, '');

        const guestMatch = bodyText.match(/(\d+)\s*guest/i) || bodyText.match(/(\d+)\s*people/i);
        if (guestMatch) data.guests = parseInt(guestMatch[1]);
        const bedMatch = bodyText.match(/(\d+)\s*bed(?!room)/i);
        if (bedMatch) data.beds = parseInt(bedMatch[1]);
        const bathMatch = bodyText.match(/([\d.]+)\s*bath/i);
        if (bathMatch) data.baths = parseFloat(bathMatch[1]);
      }
    } catch {}

    // Upload to NewSiteOnboarding bucket
    if (data.images.length > 0) {
      console.log('[UPLOAD] Uploading to NewSiteOnboarding...');
      const timestamp = Date.now();
      const results = await Promise.all(
        data.images.slice(0, 6).map(async (imgUrl, i) => {
          try {
            const buffer = await downloadImageBuffer(imgUrl);
            if (!buffer) return { index: i, url: imgUrl, failed: true };
            const filename = `onboarding/${timestamp}-${i}.jpg`;
            const sbUrl = await uploadToSupabase(buffer, filename);
            if (sbUrl) {
              console.log(`[UPLOAD] ${i + 1}: ${sbUrl.substring(0, 70)}`);
              return { index: i, url: sbUrl };
            }
          } catch (e) {
            console.log(`[UPLOAD] ${i} failed: ${e.message}`);
          }
          return { index: i, url: imgUrl, failed: true };
        })
      );
      results.forEach(r => { if (!r.failed && r.url) data.images[r.index] = r.url; });
      if (results[0] && !results[0].failed) data.hero_image = results[0].url;
    }

    console.log('Result:', JSON.stringify({
      title: data.title ? '✓' : '✗', location: data.location ? '✓' : '✗',
      price: data.price ? `$${data.price}` : '✗',
      hero: data.hero_image ? '✓' : '✗', imgs: data.images.length,
      desc: data.description ? '✓' : '✗'
    }));

    await browser.close();
    return { success: true, data };

  } catch (e) {
    data.error = e.message;
    console.log('Error:', e.message);
    if (browser) try { await browser.close(); } catch {}
    return { success: false, data };
  }
}

// ── HTTP Server ─────────────────────────────────────────────────────────────
const http = require('http');
const url = require('url');

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, apikey');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  if (parsedUrl.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  if (parsedUrl.pathname.startsWith('/scrape')) {
    const targetUrl = parsedUrl.query.url;
    if (!targetUrl) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Missing url param' }));
      return;
    }

    console.log(`\n[SCRAPE] ${targetUrl}`);
    const result = await scrapeListing(targetUrl);
    setImmediate(() => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

const PORT = process.env.PORT || 6905;
server.listen(PORT, () => {
  console.log(`\nAirbnb scraper v14 — April 12, 2026`);
  console.log(`Port: ${PORT} | Bucket: ${SB_BUCKET}`);
  console.log(`Anti-detection: sec-fetch headers enabled\n`);
});
