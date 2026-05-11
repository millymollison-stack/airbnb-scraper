import { chromium } from './node_modules/playwright/index.mjs';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1200, height: 900 });
await page.goto('http://localhost:9103', { waitUntil: 'networkidle' });
await page.waitForTimeout(3000);

const result = await page.evaluate(() => {
  const rdp = document.querySelector('.rdp');
  const table = rdp?.querySelector('.rdp-table');
  const thead = table?.querySelector('.rdp-head');
  const tbody = table?.querySelector('.rdp-tbody');
  
  const headCells = thead ? Array.from(thead.querySelectorAll('.rdp-head_cell')) : [];
  const bodyCells = tbody ? Array.from(tbody.querySelectorAll('.rdp-cell')) : [];
  
  return {
    rdpWidth: rdp?.offsetWidth,
    tableWidth: table?.offsetWidth,
    theadWidth: thead?.offsetWidth,
    tbodyWidth: tbody?.offsetWidth,
    headCells: headCells.map(c => ({ w: c.offsetWidth, pw: c.style.width, html: c.innerHTML })),
    firstRowBody: bodyCells.slice(0, 7).map(c => {
      const btn = c.querySelector('button');
      return { cellW: c.offsetWidth, btnW: btn?.offsetWidth, inner: btn?.innerHTML };
    }),
    allBodyCellWidths: bodyCells.map(c => c.offsetWidth)
  };
});
console.log(JSON.stringify(result, null, 2));
await browser.close();
