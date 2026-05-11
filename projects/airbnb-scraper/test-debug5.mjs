import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();

page.on('console', msg => console.log(`[${msg.type()}]`, msg.text().slice(0, 250)));

await page.goto('http://localhost:5174/', { waitUntil: 'commit', timeout: 15000 });
await page.waitForTimeout(3000);

const html = await page.content();
// Check if there's a loading spinner or error or actual content
const hasLoading = html.includes('animate-spin');
const hasError = html.includes('Property not found') || html.includes('Failed to load');
const hasSurfHouse = html.includes('Surf House') || html.includes('surf-house');
console.log('\nHas loading spinner:', hasLoading);
console.log('Has error message:', hasError);
console.log('Has Surf House content:', hasSurfHouse);

const bodyText = await page.$eval('body', el => el.textContent).catch(() => '');
console.log('Body text (first 200):', bodyText.slice(0, 200));

await browser.close();
