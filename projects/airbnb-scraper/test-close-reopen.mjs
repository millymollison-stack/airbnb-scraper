import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();

async function fillFields(name, desc) {
  if (name !== undefined) {
    await page.$eval('input[placeholder*="Website name"]', el => el.value = name).catch(() => {});
  }
  if (desc !== undefined) {
    await page.$eval('textarea[placeholder*="Website description"]', el => el.value = desc).catch(() => {});
  }
}

async function getFieldValues() {
  const name = await page.$eval('input[placeholder*="Website name"]', el => el.value).catch(() => 'N/A');
  const desc = await page.$eval('textarea[placeholder*="Website description"]', el => el.value).catch(() => 'N/A');
  return { name, desc };
}

await page.goto('http://localhost:5174/', { waitUntil: 'commit', timeout: 15000 });

// Wait for popup to appear
await page.waitForSelector('.popup-modal', { timeout: 5000 });
await page.waitForTimeout(300);
console.log('1. Popup appeared ✅');

let vals = await getFieldValues();
console.log('2. Initial state:', vals.name === '' ? '✅ empty' : vals.name);

// Fill with test data
await fillFields('Surf House Mexico', 'Beautiful beachfront property');
vals = await getFieldValues();
console.log('3. After fill:', vals.name);

// Close popup
await page.click('.popup-close');
await page.waitForTimeout(1000);
const popupGone = !(await page.$('.popup-modal'));
console.log('4. Popup closed:', popupGone ? '✅' : '❌ still visible');

// WAIT: the auto-open timer fires after 2s — wait and see if it reopens
await page.waitForTimeout(3500);
const popupBack = !!(await page.$('.popup-modal'));
console.log('5. Popup auto-reopened after 3.5s?', popupBack ? '❌ YES (bug!)' : '✅ NO (correct)');

if (popupBack) {
  vals = await getFieldValues();
  console.log('   Fields after reopen:', vals.name === 'Surf House Mexico' ? '❌ STILL HAS DATA' : vals.name);
}

// Full page reload
await page.reload({ waitUntil: 'commit' });
await page.waitForSelector('.popup-modal', { timeout: 5000 }).catch(() => {});
await page.waitForTimeout(500);

vals = await getFieldValues();
console.log('6. After full reload:', vals.name === '' ? '✅ empty' : '❌ still has: ' + vals.name);

await browser.close();
console.log(vals.name === '' && !popupBack ? '\n✅ ALL TESTS PASS' : '\n❌ SOME TESTS FAILED');
