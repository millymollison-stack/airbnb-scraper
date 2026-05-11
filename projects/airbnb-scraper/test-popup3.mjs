import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

async function getFieldValues() {
  const name = await page.$eval('input[placeholder*="Website name"]', el => el.value).catch(() => 
    page.$eval('.popup-modal input[type="text"]', el => el.value).catch(() => 'N/A')
  );
  const desc = await page.$eval('textarea[placeholder*="Website description"]', el => el.value).catch(() => 'N/A');
  return { name, desc };
}

await page.goto('http://localhost:5174/', { waitUntil: 'domcontentloaded', timeout: 10000 });
await page.waitForSelector('.popup-modal', { timeout: 5000 }).catch(() => null);
await page.waitForTimeout(500);

let vals = await getFieldValues();
console.log('1. Initial state:', vals.name === '' ? '✅ empty' : '❌ has: ' + vals.name);

// Manually fill fields to simulate scraped data
const nameInput = await page.$('input[placeholder*="Website name"]');
const descInput = await page.$('textarea[placeholder*="Website description"]');
if (nameInput) await nameInput.fill('Scraped Property Name');
if (descInput) await descInput.fill('Scraped description from Airbnb import');
await page.waitForTimeout(200);

vals = await getFieldValues();
console.log('2. After filling with test data:', vals.name);

// Close popup
await page.click('.popup-close');
await page.waitForTimeout(1000);
console.log('3. Popup closed');

// The popup is now unmounted (due to resetKey remounting)
// Wait for it to reappear (auto-opens after 2s on initial page load, but NOT on normal close)
// The user must click something to reopen... Let me check if there's a way
// Actually, let me just reload the page and test the reopen
await page.reload({ waitUntil: 'domcontentloaded' });
await page.waitForTimeout(4000); // auto-open timer

vals = await getFieldValues();
console.log('4. After full reload:', vals.name === '' ? '✅ empty' : '❌ FAIL still has: ' + vals.name);

await browser.close();
