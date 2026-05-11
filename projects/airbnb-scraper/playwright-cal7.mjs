import { chromium } from './node_modules/playwright/index.mjs';

for (const width of [1400, 1600, 1920]) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width, height: 900 });
  await page.goto('http://localhost:9103', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const result = await page.evaluate(() => {
    const rdp = document.querySelector('.rdp');
    const table = rdp?.querySelector('.rdp-table');
    const headCells = Array.from(table?.querySelectorAll('.rdp-head_cell') || []);
    const bodyCells = Array.from(table?.querySelectorAll('.rdp-cell') || []);
    return {
      rdpWidth: rdp?.offsetWidth,
      tableWidth: table?.offsetWidth,
      headCellWidths: headCells.map(c => c.offsetWidth),
      bodyCellWidths: bodyCells.slice(0, 7).map(c => c.offsetWidth)
    };
  });
  
  console.log(`\n=== Viewport ${width} ===`);
  console.log('rdp:', result.rdpWidth, '| table:', result.tableWidth);
  console.log('head cells:', result.headCellWidths);
  console.log('body cells:', result.bodyCellWidths);
  console.log('DRIFT?:', result.headCellWidths[0] !== result.bodyCellWidths[0] ? 'YES' : 'NO');
  await browser.close();
}
