import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();

page.on('console', msg => {
  if (msg.type() === 'error') console.log('ERR:', msg.text().slice(0, 150));
});

console.log('Going to page...');
try {
  await page.goto('http://localhost:5174/', { waitUntil: 'commit', timeout: 15000 });
  console.log('Page loaded!');
} catch(e) {
  console.log('goto failed:', e.message.slice(0, 100));
}

// Wait 5s for popup
await page.waitForTimeout(5000);

const popup = await page.$('.popup-modal');
console.log('Popup found:', popup ? 'YES' : 'NO');
if (popup) {
  const h1 = await popup.$eval('h1', el => el.textContent).catch(() => 'no h1');
  console.log('H1 text:', h1);
}

await browser.close();
