import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log('1. Load template (5174)...');
  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(3000); // wait for popup auto-open
  
  // Get the popup input fields
  const inputs = await page.$$('.popup-input input, .popup-input textarea');
  console.log(`2. Found ${inputs.length} popup inputs`);
  
  if (inputs.length >= 2) {
    await inputs[0].fill('MY TEST WEBSITE NAME');
    await inputs[1].fill('MY TEST DESCRIPTION TEXT');
    console.log('3. Filled websiteName and websiteDesc');
    await page.waitForTimeout(1000);
  }
  
  // Now check the original site (9103) 
  console.log('4. Checking original site for leaked data...');
  const originalPage = await browser.newPage();
  await originalPage.goto('http://localhost:9103/', { waitUntil: 'networkidle', timeout: 15000 });
  await originalPage.waitForTimeout(2000);
  
  const content = await originalPage.content();
  const checks = ['MY TEST WEBSITE NAME', 'MY TEST DESCRIPTION', 'websiteName', 'websiteDesc'];
  for (const check of checks) {
    if (content.includes(check)) {
      console.log(`  ❌ LEAKED: "${check}"`);
    } else {
      console.log(`  ✓ Clean: "${check}"`);
    }
  }
  
  // Also check Supabase properties table directly
  console.log('5. Checking properties table in Supabase...');
  const apiPage = await browser.newPage();
  await apiPage.goto('https://jtzagpbdrqfifdisxipr.supabase.co/rest/v1/properties?id=eq.f3d3e867-e0c6-4cc5-a05d-b5e368f8c766', {
    headers: {
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0emFncGJkcnFmaWZkaXN4aXByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3MzUyODUsImV4cCI6MjA2MDMxMTI4NX0.uWqc82Hb-qnRq4H9kg5IPykUosm9VvU2s6e8mOalkR0',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0emFncGJkcnFmaWZkaXN4aXByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3MzUyODUsImV4cCI6MjA2MDMxMTI4NX0.uWqc82Hb-qnRq4H9kg5IPykUosm9VvU2s6e8mOalkR0'
    }
  });
  await apiPage.waitForTimeout(2000);
  const apiContent = await apiPage.content();
  console.log('  Properties API content length:', apiContent.length);
  
  await browser.close();
  console.log('\nDone');
})();
