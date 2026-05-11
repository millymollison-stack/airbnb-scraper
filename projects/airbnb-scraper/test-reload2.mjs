import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();

page.on('console', msg => {
  const text = msg.text();
  if (text.includes('[Popup]') || msg.type() === 'error') {
    console.log(`[${msg.type()}]`, text.slice(0, 200));
  }
});

await page.goto('http://localhost:5174/', { waitUntil: 'commit', timeout: 15000 });
await page.waitForSelector('.popup-modal', { timeout: 6000 });
console.log('Popup appeared');

await page.click('.popup-close');
await page.waitForTimeout(500);
console.log('Closed, reloading...');

await page.evaluate(() => location.reload());
// Poll every 500ms for 8 seconds
for (let i = 0; i < 16; i++) {
  await page.waitForTimeout(500);
  const popup = await page.$('.popup-modal');
  console.log(`t=${i*500}ms: popup=${popup ? 'YES' : 'NO'}`);
  if (popup) break;
}

await browser.close();
