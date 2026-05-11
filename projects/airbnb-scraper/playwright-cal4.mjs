import { chromium } from './node_modules/playwright/index.mjs';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1200, height: 900 });
await page.goto('http://localhost:9103', { waitUntil: 'networkidle' });
await page.waitForTimeout(3000);

// Scroll to find the calendar
await page.evaluate(() => {
  const el = document.querySelector('[class*="booking"], [id*="booking"], .rdp-root, .DayPicker');
  if (el) el.scrollIntoView();
});
await page.waitForTimeout(1000);

const structure = await page.evaluate(() => {
  const rdpRoot = document.querySelector('.rdp-root');
  if (!rdpRoot) return 'No rdp-root found';
  const tables = rdpRoot.querySelectorAll('table');
  return {
    rdpRootClass: rdpRoot.className,
    tablesCount: tables.length,
    rdpRootWidth: rdpRoot.offsetWidth,
    tables: Array.from(tables).map(t => ({
      className: t.className,
      width: t.offsetWidth,
      hasThead: !!t.querySelector('thead'),
      hasTbody: !!t.querySelector('tbody'),
      theadHTML: t.querySelector('thead')?.innerHTML?.substring(0, 300),
      firstTrCells: Array.from(t.querySelectorAll('tr:first-child td, tr:first-child th')).map(c => ({
        className: c.className,
        offsetWidth: c.offsetWidth,
        innerHTML: c.innerHTML?.substring(0, 30)
      }))
    }))
  };
});
console.log(JSON.stringify(structure, null, 2));
await browser.close();
