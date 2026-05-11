import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();

page.on('console', msg => {
  if (msg.type() === 'error') console.log('[ERR]', msg.text().slice(0, 100));
});

await page.goto('http://localhost:5174/', { waitUntil: 'commit', timeout: 15000 });
console.log('Page loaded, waiting 5s for popup...');
await page.waitForTimeout(5000);

const popup = await page.$('.popup-modal');
console.log('Popup visible:', popup ? 'YES ✅' : 'NO ❌');
if (popup) {
  const h1 = await popup.$eval('h1', el => el.textContent).catch(() => '?');
  console.log('H1:', h1);
  
  // Test: fill fields, close, reload, check if empty
  await page.$eval('input[placeholder*="Website name"]', el => el.value = 'Scraped Property');
  await page.$eval('textarea[placeholder*="Website description"]', el => el.value = 'Scraped desc');
  
  const filledName = await page.$eval('input[placeholder*="Website name"]', el => el.value);
  console.log('After fill:', filledName);
  
  // Close popup
  await page.click('.popup-close');
  await page.waitForTimeout(500);
  console.log('Closed popup');
  
  // Full page reload
  await page.reload({ waitUntil: 'commit' });
  await page.waitForTimeout(5000);
  
  const afterReloadName = await page.$eval('input[placeholder*="Website name"]', el => el.value).catch(() => 'N/A');
  console.log('After FULL RELOAD:', afterReloadName === '' ? '✅ Empty (PASS)' : '❌ Still has: ' + afterReloadName);
} else {
  // Debug: check what's in the DOM
  const hasBackdrop = await page.$('.popup-backdrop');
  console.log('Has backdrop:', hasBackdrop ? 'yes' : 'no');
}

await browser.close();
