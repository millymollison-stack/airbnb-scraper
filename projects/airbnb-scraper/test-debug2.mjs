import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();

page.on('console', msg => {
  if (msg.type() === 'error') console.log('BROWSER ERROR:', msg.text().slice(0, 200));
  if (msg.text().includes('HOME')) console.log('HOME LOG:', msg.text().slice(0, 200));
});

await page.goto('http://localhost:5174/', { waitUntil: 'domcontentloaded', timeout: 10000 });

// Poll every 500ms for 10 seconds
for (let i = 0; i < 20; i++) {
  await page.waitForTimeout(500);
  const popup = await page.$('.popup-modal');
  const h1Text = popup ? await popup.$eval('h1', el => el.textContent).catch(() => 'no h1') : 'no popup';
  console.log(`t=${i*500}ms: popup=${popup ? 'yes' : 'no'}, h1="${h1Text}"`);
  if (popup && h1Text !== 'no h1') break;
}

await browser.close();
