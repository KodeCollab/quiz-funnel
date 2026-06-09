import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:3000';

async function runTest() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    console.log('1️⃣ Creating a test funnel...');
    await page.goto(`${BASE_URL}/admin/funnels/new`, { waitUntil: 'networkidle' });

    // Take screenshot to see actual page
    await page.screenshot({ path: '/tmp/funnel-new-page.png' });
    
    // List all inputs on page
    const inputs = await page.locator('input').all();
    console.log(`   Found ${inputs.length} input fields`);
    for (let i = 0; i < inputs.length; i++) {
      const placeholder = await inputs[i].getAttribute('placeholder');
      const type = await inputs[i].getAttribute('type');
      console.log(`   Input ${i}: type="${type}", placeholder="${placeholder}"`);
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

runTest();
