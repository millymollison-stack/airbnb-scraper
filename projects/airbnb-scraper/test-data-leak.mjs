import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();

// First: open the ORIGINAL site and check its current state
console.log('=== Testing Original Site (9103) ===');
await page.goto('http://localhost:9103/', { waitUntil: 'commit', timeout: 10000 });
await page.waitForTimeout(3000);

let bodyText = await page.$eval('body', el => el.textContent).catch(() => '');
console.log('Original site title area:', bodyText.slice(0, 200));

// Now open the template site and import some data
console.log('\n=== Testing Template (5174) ===');
const page2 = await context.newPage();
await page2.goto('http://localhost:5174/', { waitUntil: 'commit', timeout: 10000 });

// Wait for popup
try {
  await page2.waitForSelector('.popup-modal', { timeout: 5000 });
  console.log('Template popup appeared');
  
  // Fill in websiteName and websiteDesc with UNIQUE test data
  // First need to navigate to step 2 (property info)
  // The popup starts on step 1 (design choice)
  
  // Look for any input fields and fill them with test data
  const inputs = await page2.$$('input[type="text"], input[type="url"]');
  console.log('Found', inputs.length, 'text/url inputs in popup');
  
  // Try to find and fill websiteName and websiteDesc
  const nameInput = await page2.$('input[placeholder*="Website name"]');
  const descInput = await page2.$('textarea[placeholder*="Website description"]');
  
  if (nameInput) {
    await nameInput.fill('UNIQUE TEST PROPERTY 2026');
    console.log('Filled websiteName with test data');
  }
  if (descInput) {
    await descInput.fill('This is unique test description from automated test - should not appear on original site');
    console.log('Filled websiteDesc with test data');
  }
  
  // Read back what we filled
  const filledName = nameInput ? await nameInput.inputValue() : 'N/A';
  const filledDesc = descInput ? await descInput.inputValue() : 'N/A';
  console.log('Filled values - name:', filledName, 'desc:', filledDesc.slice(0, 50));
  
} catch(e) {
  console.log('Error:', e.message.slice(0, 100));
}

// Wait a moment
await page2.waitForTimeout(1000);

// NOW check the original site again - does it have the test data?
console.log('\n=== Checking Original Site Again ===');
await page.goto('http://localhost:9103/', { waitUntil: 'commit', timeout: 10000 });
await page.waitForTimeout(3000);

bodyText = await page.$eval('body', el => el.textContent).catch(() => '');
const hasTestData = bodyText.includes('UNIQUE TEST PROPERTY 2026') || bodyText.includes('unique test description');
console.log('Original site has test data?', hasTestData ? '❌ YES - DATA LEAKED!' : '✅ No test data found');
if (hasTestData) {
  console.log('Found in original site:', bodyText.slice(0, 300));
}

await browser.close();
