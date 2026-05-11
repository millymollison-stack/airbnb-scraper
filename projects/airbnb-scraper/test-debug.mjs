import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();

page.on('console', msg => {
  if (msg.type() === 'error') console.log('BROWSER ERROR:', msg.text().slice(0, 200));
});

await page.goto('http://localhost:5174/', { waitUntil: 'domcontentloaded', timeout: 10000 });
await page.waitForTimeout(3000);

const html = await page.content();
const hasPopup = html.includes('popup-modal');
const hasPopupBackdrop = html.includes('popup-backdrop');
const hasCreate = html.includes('Create your site');
console.log('Has popup-modal class:', hasPopup);
console.log('Has popup-backdrop class:', hasPopupBackdrop);
console.log('Has "Create your site":', hasCreate);

// Try to find any element in the popup
const bodyHtml = await page.$eval('body', el => el.innerHTML.slice(0, 500));
console.log('Body start:', bodyHtml);

await browser.close();
