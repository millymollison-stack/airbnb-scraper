import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });

async function getFieldValues(page) {
  const name = await page.$eval('input[placeholder*="Website name"]', el => el.value).catch(() => 'N/A');
  const desc = await page.$eval('textarea[placeholder*="Website description"]', el => el.value).catch(() => 'N/A');
  return { name, desc };
}

async function run() {
  const context = await browser.newContext();
  const page = await context.newPage();

  // First page load — check popup auto-opens
  console.log('1. First page load...');
  await page.goto('http://localhost:5174/', { waitUntil: 'domcontentloaded', timeout: 10000 });
  
  // Wait for popup to appear (up to 5s)
  try {
    await page.waitForSelector('.popup-modal', { timeout: 5000 });
    console.log('2. Popup appeared ✅');
  } catch {
    console.log('2. Popup did NOT appear ❌');
  }
  
  await page.waitForTimeout(500);
  let vals = await getFieldValues(page);
  console.log('3. Initial websiteName:', vals.name === '' ? '✅ empty' : vals.name);

  // Manually fill with test data
  await page.$eval('input[placeholder*="Website name"]', el => el.value = 'Test Property');
  await page.$eval('textarea[placeholder*="Website description"]', el => el.value = 'Test description here');
  vals = await getFieldValues(page);
  console.log('4. After fill:', vals.name);

  // Close popup
  await page.click('.popup-close');
  await page.waitForTimeout(500);
  const closed = !(await page.$('.popup-modal'));
  console.log('5. Popup closed:', closed ? '✅' : '❌ still visible');

  // Navigate away then back (simulates closing tab and reopening)
  await page.goto('about:blank');
  await page.goto('http://localhost:5174/', { waitUntil: 'domcontentloaded', timeout: 10000 });
  
  // Wait for popup to appear (should auto-open on fresh page load)
  try {
    await page.waitForSelector('.popup-modal', { timeout: 5000 });
    console.log('6. After NEW page load: popup appeared ✅');
  } catch {
    console.log('6. After NEW page load: popup did NOT appear ❌');
  }
  
  await page.waitForTimeout(500);
  vals = await getFieldValues(page);
  console.log('7. websiteName after new page load:', vals.name === '' ? '✅ empty (fresh start)' : '❌ still has: ' + vals.name);

  await context.close();
}

await run();
await browser.close();
console.log('Done');
