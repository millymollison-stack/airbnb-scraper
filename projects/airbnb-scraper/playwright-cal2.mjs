import { chromium } from './node_modules/playwright/index.mjs';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1200, height: 900 });
await page.goto('http://localhost:9103', { waitUntil: 'networkidle' });
await page.waitForTimeout(3000);

const structure = await page.evaluate(() => {
  const cal = document.querySelector('.booking-calendar');
  const rdpRoot = document.querySelector('.rdp-root');
  const tables = rdpRoot ? rdpRoot.querySelectorAll('table') : [];
  const months = rdpRoot ? rdpRoot.querySelectorAll('.rdp-month') : [];
  return {
    tablesCount: tables.length,
    monthsCount: months.length,
    tablesHTML: Array.from(tables).map(t => ({
      class: t.className,
      width: t.offsetWidth,
      rows: t.querySelectorAll('tr').length,
      hasThead: !!t.querySelector('thead'),
      hasTbody: !!t.querySelector('tbody')
    })),
    rdpRootWidth: rdpRoot?.offsetWidth
  };
});
console.log(JSON.stringify(structure, null, 2));
await browser.close();
