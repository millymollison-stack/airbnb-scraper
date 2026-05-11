const http = require('http');
const https = require('https');
const url = require('url');
const crypto = require('crypto');

const SB_BUCKET = 'NewSiteOnboarding';
const SB_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0emFncGJkcnFmaWZkaXN4aXByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3MzUyODUsImV4cCI6MjA2MDMxMTI4NX0.uWqc82Hb-qnRq4H9kg5IPykUosm9VvU2s6e8mOalkR0';
const SUPABASE_URL = 'https://jtzagpbdrqfifdisxipr.supabase.co';

function btoa(str) { return Buffer.from(str).toString('base64'); }

function extractMeta(html, property) {
  let m = html.match(new RegExp('<meta[^>]+property="' + property + '"[^>]+content="([^"]+)"'));
  if (m) return decodeHtmlEntities(m[1]);
  const m2 = html.match(new RegExp('<meta[^>]+content="([^"]+)"[^>]+property="' + property + '"'));
  if (m2) return decodeHtmlEntities(m2[1]);
  return null;
}

function decodeHtmlEntities(str) {
  return str.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ');
}

function upgradeImageUrl(imgUrl) {
  if (!imgUrl) return null;
  return imgUrl.replace(/\?.*$/, '').replace(/\?$/, '') + '?im_w=1200';
}

async function httpGet(targetUrl, extraHeaders) {
  return new Promise((resolve, reject) => {
    const u = new URL(targetUrl);
    const opts = {
      hostname: u.hostname, path: u.pathname + u.search, method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'sec-fetch-site': 'none', 'sec-fetch-mode': 'navigate', 'sec-fetch-dest': 'document',
        ...extraHeaders
      }
    };
    const mod = u.protocol === 'https:' ? https : http;
    const req = mod.request(opts, res => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    });
    req.on('error', reject);
    req.setTimeout(20000, () => { req.destroy(); reject(new Error('timeout')); });
    req.end();
  });
}

async function downloadImageBuffer(imageUrl) {
  try {
    const resp = await fetch(imageUrl, {
      headers: { 'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8', 'Referer': 'https://www.airbnb.com/' },
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

function parseImagesFromLdJson(obj, existing) {
  const images = [...existing];
  const imgField = obj.image;
  if (!imgField) return images;
  const imgList = Array.isArray(imgField) ? imgField : [imgField];
  for (const img of imgList) {
    const imgUrl = typeof img === 'string' ? img : (img.url || null);
    if (imgUrl) {
      const upgraded = upgradeImageUrl(imgUrl);
      if (!images.includes(upgraded)) images.push(upgraded);
    }
  }
  return images;
}

async function scrapeListing(targetUrl) {
  const data = {
    title: null, location: null, price: null, currency: 'USD',
    guests: null, bedrooms: null, beds: null, baths: null,
    rating: null, reviews: null, hero_image: null,
    images: [], description: null, host_name: null, error: null
  };

  let html;
  try {
    const res = await httpGet(targetUrl, {});
    html = res.body;
    console.log('[v25] HTTP status:', res.status, 'size:', html.length);
  } catch(e) {
    data.error = 'HTTP error: ' + e.message;
    return data;
  }

  // Check for block
  const ogTitle = extractMeta(html, 'og:title');
  console.log('[v25] og:title:', ogTitle ? ogTitle.substring(0, 60) : 'MISSING');
  
  if (!ogTitle || ogTitle.includes('Oops') || ogTitle.includes('Airbnb')) {
    // Might be blocked - check if it has listing data anyway
    if (!html.includes('VacationRental') && !html.includes('StayListing')) {
      data.error = 'Airbnb blocked or returned generic page';
      return data;
    }
  }

  // Extract JSON-LD data
  const scripts = [];
  const scriptRe = /<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = scriptRe.exec(html)) !== null) {
    try { scripts.push(JSON.parse(m[1])); } catch {}
  }

  for (const obj of scripts) {
    const graphs = obj['@graph'] || [obj];
    for (const item of graphs) {
      if (item['@type'] === 'VacationRental' || item['@type'] === 'LodgingBusiness' || item['@type'] === 'Hotel') {
        // Title
        if (!data.title && item.name) data.title = item.name;
        // Description
        if (!data.description && item.description) {
          data.description = item.description.substring(0, 2000);
        }
        // Images
        data.images = parseImagesFromLdJson(item, data.images);
        // Rating
        if (!data.rating && item.aggregateRating) {
          data.rating = parseFloat(item.aggregateRating.ratingValue) || null;
          data.reviews = parseInt(String(item.aggregateRating.ratingCount || "0").replace(/[^0-9]/g, "")) || null;
        }
        // Location
        if (!data.location && item.address) {
          const addr = item.address;
          data.location = addr.addressLocality || addr.addressRegion || addr.streetAddress || null;
        }
        // Geo
        if (!data.lat && item.geo) {
          data.lat = item.geo.latitude;
          data.lng = item.geo.longitude;
        }
        // Host name
        if (!data.host_name && item.author) {
          data.host_name = typeof item.author === 'string' ? item.author : (item.author.name || null);
        }
        // Guests/beds from occupancy
        if (item.containsPlace && item.containsPlace.occupancy) {
          const occ = item.containsPlace.occupancy;
          if (!data.guests && occ['@type'] === 'QuantitativeValue') {
            data.guests = occ.value || null;
          }
        }
      }
    }
  }

  // Also check Product type for same fields
  for (const obj of scripts) {
    if (obj['@type'] === 'Product') {
      if (!data.title && obj.name) data.title = obj.name;
      if (!data.description && obj.description) data.description = obj.description.substring(0, 2000);
      data.images = parseImagesFromLdJson(obj, data.images);
      if (!data.rating && obj.aggregateRating) {
        data.rating = obj.aggregateRating.ratingValue || null;
        data.reviews = parseInt(String(obj.aggregateRating.ratingCount || "0").replace(/[^0-9]/g, "")) || null;
      }
    }
  }

  // Hero image from og:image
  const ogImage = extractMeta(html, 'og:image');
  if (ogImage) {
    const upgraded = upgradeImageUrl(ogImage);
    if (!data.images.includes(upgraded)) data.images.unshift(upgraded);
    data.hero_image = data.images[0];
  }

  // All og:image meta tags
  const imgMetaRe = /<meta[^>]+property="og:image"[^>]+content="([^"]+)"/gi;
  while ((m = imgMetaRe.exec(html)) !== null) {
    const imgUrl = upgradeImageUrl(decodeHtmlEntities(m[1]));
    if (!data.images.includes(imgUrl)) data.images.push(imgUrl);
  }

  // Remove duplicates preserving order
  data.images = [...new Set(data.images)];

  // Get listing ID from URL for reference
  const listingId = targetUrl.split('/rooms/')[1] ? targetUrl.split('/rooms/')[1].split('?')[0] : null;
  console.log('[v25] Listing ID:', listingId, '| title:', data.title ? data.title.substring(0, 40) : 'MISSING');
  console.log('[v25] Images:', data.images.length, '| rating:', data.rating, '| reviews:', data.reviews);
  console.log('[v25] Description len:', data.description ? data.description.length : 0);

  // Upload images to Supabase (without price/guests/beds - require manual entry or Playwright fallback)
  if (data.images.length > 0) {
    console.log('[v25] Uploading', data.images.length, 'images to NewSiteOnboarding...');
    const timestamp = Date.now();
    const results = await Promise.all(
      data.images.slice(0, 8).map(async (imgUrl, i) => {
        try {
          const buffer = await downloadImageBuffer(imgUrl);
          if (!buffer) return { index: i, url: imgUrl, failed: true };
          const filename = `onboarding/${timestamp}-${i}.jpg`;
          const sbUrl = await uploadToSupabase(buffer, filename);
          if (sbUrl) {
            console.log(`  Image ${i+1}: ${sbUrl.substring(0, 80)}`);
            return { index: i, url: sbUrl };
          }
        } catch(e) { console.log(`  Image ${i} failed: ${e.message}`); }
        return { index: i, url: imgUrl, failed: true };
      })
    );
    results.forEach(r => { if (!r.failed) data.images[r.index] = r.url; });
    // Use images[1] as hero (images[0] is often Airbnb's placeholder fe7217ff)
    if (results.length > 1 && !results[1].failed) {
      data.hero_image = results[1].url;
    } else if (results[0] && !results[0].failed) {
      data.hero_image = results[0].url;
    }
  }

  return { success: true, data };
}

// ── HTTP Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 6905;
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  if (parsedUrl.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', port: PORT, bucket: SB_BUCKET }));
    return;
  }

  if (parsedUrl.pathname.startsWith('/scrape')) {
    const targetUrl = parsedUrl.query.url;
    if (!targetUrl) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Missing url param' }));
      return;
    }
    console.log('\n[SCRAPE]', targetUrl);
    const result = await scrapeListing(targetUrl);
    setImmediate(() => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
    });
    return;
  }

  res.writeHead(404);
  res.end();
});

server.listen(PORT, () => {
  console.log(`\nAirbnb scraper v25 (curl + JSON-LD) — April 12, 2026`);
  console.log(`Port: ${PORT} | Bucket: ${SB_BUCKET}`);
  console.log(`Fields: title, description, images, rating, reviews, location (no price/beds - GraphQL blocked)\n`);
});
