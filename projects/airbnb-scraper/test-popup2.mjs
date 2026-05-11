import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();

let step = 1;

async function getFieldValues() {
  const name = await page.$eval('input[placeholder*="Website name"]', el => el.value).catch(() => 'N/A');
  const desc = await page.$eval('textarea[placeholder*="Website description"]', el => el.value).catch(() => 'N/A');
  return { name, desc };
}

console.log(`${step++}. Navigate to localhost:5174`);
await page.goto('http://localhost:5174/', { waitUntil: 'domcontentloaded', timeout: 10000 });

console.log(`${step++}. Wait for popup auto-open (3s)`);
await page.waitForSelector('.popup-modal', { timeout: 5000 }).catch(() => console.log('   No popup'));
await page.waitForTimeout(500);

let vals = await getFieldValues();
console.log(`${step++}. Initial state — websiteName: "${vals.name}", websiteDesc: "${vals.desc.slice(0,60)}"`);

// Click "Create your own site" radio/tab if visible (Step 1)
const manualTab = await page.$('input[value="manual"], input[name="design"][value="manual"]');
if (manualTab) {
  await manualTab.click();
  await page.waitForTimeout(200);
  console.log(`${step++}. Clicked manual tab`);
}

// Try to advance to step 2 (property info with websiteName/websiteDesc fields)
// Look for a Next button
const nextBtn = await page.$('button:has-text("Next"), button:has-text("Continue"), button:has-text("→")');
if (nextBtn) {
  await nextBtn.click();
  await page.waitForTimeout(300);
  console.log(`${step++}. Clicked Next`);
}

// Now check if websiteName/websiteDesc are visible and fill them
vals = await getFieldValues();
console.log(`${step++}. After next — websiteName: "${vals.name}", websiteDesc: "${vals.desc.slice(0,60)}"`);

if (vals.name === '' || vals.desc === '') {
  // Manually set values to test the reset
  await page.$eval('input[placeholder*="Website name"]', el => el.value = 'Test Site Name');
  await page.$eval('textarea[placeholder*="Website description"]', el => el.value = 'Test site description for testing');
  console.log(`${step++}. Manually filled fields with test data`);
}

vals = await getFieldValues();
console.log(`${step++}. After fill — websiteName: "${vals.name}", websiteDesc: "${vals.desc.slice(0,60)}"`);

// Close popup
const closeBtn = await page.$('.popup-close');
if (closeBtn) {
  await closeBtn.click();
  await page.waitForTimeout(500);
  console.log(`${step++}. Popup closed`);
}

// Full page reload
await page.reload({ waitUntil: 'domcontentloaded' });
await page.waitForTimeout(4000); // wait for auto-open timer

vals = await getFieldValues();
console.log(`${step++}. After FULL RELOAD — websiteName: "${vals.name}", websiteDesc: "${vals.desc.slice(0,60)}"`);
console.log(vals.name === '' ? '✅ PASS: Fields are empty after reload' : '❌ FAIL: Fields still have data after reload');

await browser.close();
