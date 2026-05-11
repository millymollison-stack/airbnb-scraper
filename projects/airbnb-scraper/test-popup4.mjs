import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

async function getFieldValues() {
  const name = await page.$eval('input[placeholder*="Website name"]', el => el.value).catch(() => 'N/A');
  const desc = await page.$eval('textarea[placeholder*="Website description"]', el => el.value).catch(() => 'N/A');
  return { name, desc };
}

await page.goto('http://localhost:5174/', { waitUntil: 'domcontentloaded', timeout: 10000 });
await page.waitForSelector('.popup-modal', { timeout: 5000 }).catch(() => null);
await page.waitForTimeout(500);

let vals = await getFieldValues();
console.log('1. Initial state:', vals.name === '' ? '✅ empty' : vals.name);

// Manually set values (simulating scraped data)
await page.$eval('input[placeholder*="Website name"]', el => el.value = 'Surf House Mexico');
await page.$eval('textarea[placeholder*="Website description"]', el => el.value = 'Beautiful beachfront property in Baja California');
await page.waitForTimeout(200);

vals = await getFieldValues();
console.log('2. After fill:', vals.name);

// Close popup
await page.click('.popup-close');
console.log('3. Closed popup, waiting 500ms...');
await page.waitForTimeout(500);

// Check if popup is visible after close
const popupVisible = await page.$('.popup-modal');
console.log('4. Popup still visible after close?', popupVisible ? 'YES ❌' : 'NO ✅');

// Wait 3 seconds (past the auto-open 2s timer)
console.log('5. Waiting 3s for potential auto-reopen...');
await page.waitForTimeout(3000);

vals = await getFieldValues();
console.log('6. After 3s wait:', vals.name === '' ? '✅ empty (no auto-reopen)' : '❌ HAS DATA - auto reopened with old data: ' + vals.name);

await browser.close();
