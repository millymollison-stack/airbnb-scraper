import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
page.on('console', msg => { if (msg.type() === 'error') console.log('BROWSER ERROR:', msg.text()); });

console.log('1. Navigate...');
await page.goto('http://localhost:5174/', { waitUntil: 'domcontentloaded', timeout: 10000 });

// Wait for popup with 5s timeout
console.log('2. Waiting for popup (5s)...');
await page.waitForSelector('.popup-modal', { timeout: 8000 }).catch(() => console.log('   No popup appeared'));

// Check initial state — try different selectors
await page.waitForTimeout(1000);
const websiteName = await page.$eval('input[placeholder*="Website name"]', el => el.value).catch(() => 
  page.$eval('.popup-modal input[type="text"]', el => el.value).catch(() => 'N/A')
);
const websiteDesc = await page.$eval('textarea[placeholder*="Website description"]', el => el.value).catch(() => 'N/A');
console.log(`3. Initial — websiteName: "${websiteName}", websiteDesc: "${websiteDesc.slice(0,50)}"`);

// Click the Airbnb tab if visible
const airbnbTab = await page.$('input[name="import-method"][value="airbnb"]');
if (airbnbTab) {
  await airbnbTab.click();
  await page.waitForTimeout(200);
  console.log('4. Clicked airbnb tab');
}

// Find and fill the Airbnb URL input
const urlInput = await page.$('input[placeholder*="airbnb"]') || await page.$('input[type="url"]');
if (urlInput) {
  const val = await urlInput.inputValue();
  console.log(`5. URL input current value: "${val}"`);
  if (!val) {
    await urlInput.fill('https://www.airbnb.com/rooms/40551862');
    console.log('6. Filled URL, clicking Import...');
    const importBtn = await page.$('button:has-text("Import")') || await page.$('button.primary');
    if (importBtn) {
      await importBtn.click();
      console.log('7. Waiting 25s for scrape...');
      await page.waitForTimeout(25000);
    }
  }
}

const afterName = await page.$eval('input[placeholder*="Website name"]', el => el.value).catch(() =>
  page.$eval('.popup-modal input[type="text"]', el => el.value).catch(() => 'N/A')
);
const afterDesc = await page.$eval('textarea[placeholder*="Website description"]', el => el.value).catch(() => 'N/A');
console.log(`8. After import — websiteName: "${afterName}", websiteDesc: "${afterDesc.slice(0,80)}"`);

// Close popup
const closeBtn = await page.$('.popup-close');
if (closeBtn) {
  await closeBtn.click();
  await page.waitForTimeout(500);
  console.log('9. Popup closed');
}

// Full page reload
await page.reload({ waitUntil: 'domcontentloaded' });
await page.waitForTimeout(4000); // wait for auto-open timer

const afterReloadName = await page.$eval('input[placeholder*="Website name"]', el => el.value).catch(() =>
  page.$eval('.popup-modal input[type="text"]', el => el.value).catch(() => 'N/A')
);
const afterReloadDesc = await page.$eval('textarea[placeholder*="Website description"]', el => el.value).catch(() => 'N/A');
console.log(`10. After full reload — websiteName: "${afterReloadName}", websiteDesc: "${afterReloadDesc.slice(0,80)}"`);

await browser.close();
console.log('Done');
