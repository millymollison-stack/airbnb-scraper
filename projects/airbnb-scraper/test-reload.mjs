import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();

page.on('console', msg => { if (msg.type() === 'error') console.log('[ERR]', msg.text().slice(0,80)); });

// Test: Close popup, full reload → popup should auto-open again (sessionStorage clears)
console.log('1. First page load...');
await page.goto('http://localhost:5174/', { waitUntil: 'commit', timeout: 15000 });
await page.waitForSelector('.popup-modal', { timeout: 6000 });
console.log('2. Popup appeared ✅');

// Fill fields
await page.$eval('input[placeholder*="Website name"]', el => el.value = 'Test Property');
await page.$eval('textarea[placeholder*="Website description"]', el => el.value = 'Test desc');
console.log('3. Filled fields');

// Close popup
await page.click('.popup-close');
await page.waitForTimeout(500);
console.log('4. Popup closed');

// Full page reload (simulates new browser session)
await page.evaluate(() => location.reload());
await page.waitForTimeout(6000); // wait 6s for auto-open timer

const popup = await page.$('.popup-modal');
console.log('5. Popup after full reload:', popup ? '✅ appeared (sessionStorage cleared correctly)' : '❌ did NOT appear');

const vals = await page.$eval('input[placeholder*="Website name"]', el => el.value).catch(() => 'N/A');
console.log('6. websiteName after reload:', vals === '' ? '✅ empty (fresh)' : vals === 'N/A' ? '⚠️ N/A' : '❌ has: ' + vals);

await browser.close();
