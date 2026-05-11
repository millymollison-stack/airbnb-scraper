import { chromium } from './node_modules/playwright/index.mjs';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1200, height: 900 });
await page.goto('http://localhost:9103', { waitUntil: 'networkidle' });
await page.waitForTimeout(3000);

// Get all classes with rdp
const rdp = await page.evaluate(() => {
  const all = document.querySelectorAll('*');
  const classes = new Set();
  Array.from(all).forEach(el => {
    if (el.className && typeof el.className === 'string' && el.className.includes('rdp')) {
      classes.add(el.className);
    }
  });
  return Array.from(classes).slice(0, 20);
});
console.log('RDP classes found:', rdp);

// Try to find any calendar-related element
const calendar = await page.evaluate(() => {
  const candidates = [
    '.rdp', '.rdp-root', '.rdp-months', '.rdp-month', '.DayPicker',
    '[class*="calendar"]', '[id*="calendar"]'
  ];
  for (const sel of candidates) {
    const el = document.querySelector(sel);
    if (el) return { selector: sel, found: true, className: el.className, width: el.offsetWidth };
  }
  return 'Calendar not found';
});
console.log('Calendar:', JSON.stringify(calendar, null, 2));

await browser.close();
