import { chromium } from './node_modules/playwright/index.mjs';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1200, height: 900 });
await page.goto('http://localhost:9103', { waitUntil: 'networkidle' });
await page.waitForTimeout(3000);

const styles = await page.evaluate(() => {
  const table = document.querySelector('.rdp-table');
  if (!table) return 'No rdp-table';
  const thead = table.querySelector('thead');
  const tbody = table.querySelector('tbody');
  const headCell = thead?.querySelector('.rdp-head_cell');
  const bodyCell = tbody?.querySelector('.rdp-cell');
  const getStyle = el => el ? {
    width: el.style.width,
    offsetWidth: el.offsetWidth,
    boxSizing: window.getComputedStyle(el).boxSizing,
    paddingLeft: window.getComputedStyle(el).paddingLeft,
    paddingRight: window.getComputedStyle(el).paddingRight
  } : null;
  return {
    tableWidth: table?.offsetWidth,
    headCellWidth: headCell?.offsetWidth,
    bodyCellWidth: bodyCell?.offsetWidth,
    headStyle: getStyle(headCell),
    bodyStyle: getStyle(bodyCell),
    firstRowCells: Array.from(tbody?.querySelectorAll('.rdp-cell') || []).map(c => c.offsetWidth)
  };
});
console.log(JSON.stringify(styles, null, 2));
await browser.close();
