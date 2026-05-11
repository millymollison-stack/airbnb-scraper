import { chromium } from './node_modules/playwright/index.mjs';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1200, height: 900 });
await page.goto('http://localhost:9103', { waitUntil: 'networkidle' });
await page.waitForTimeout(3000);

// Get full calendar HTML structure
const structure = await page.evaluate(() => {
  const cal = document.querySelector('.booking-calendar');
  if (!cal) return 'No .booking-calendar found';
  return {
    innerHTML: cal.innerHTML.substring(0, 2000)
  };
});
console.log(JSON.stringify(structure, null, 2));
await browser.close();
