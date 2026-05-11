import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();

page.on('console', msg => {
  const t = msg.type();
  if (t === 'error' || t === 'warning') console.log(`[${t}]`, msg.text().slice(0, 200));
});

await page.goto('http://localhost:5174/', { waitUntil: 'commit', timeout: 15000 });
console.log('Page loaded, waiting...');

// Poll every 500ms
for (let i = 0; i < 10; i++) {
  await page.waitForTimeout(500);
  const bodyText = await page.$eval('body', el => el.textContent).catch(() => '');
  const hasPopup = bodyText.includes('Create your site');
  console.log(`t=${i*500}ms: has "Create your site" = ${hasPopup}`);
  if (hasPopup) { console.log('Found it!'); break; }
}

await browser.close();
