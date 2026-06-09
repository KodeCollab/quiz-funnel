import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:3000';

async function debug() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Use the funnel we just created
    const funnelId = '78f2bfe7-754f-41ae-8dda-14f9057c52a2';

    console.log('Fetching funnel data...\n');
    
    // Get the funnel config via the page
    await page.goto(`${BASE_URL}/admin/funnels/${funnelId}`, { waitUntil: 'networkidle' });

    // Extract step info from the page
    const steps = await page.locator('div:has(> div:has-text("Step"))').all();
    console.log(`Found ${steps.length} steps on page\n`);

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const question = await step.locator('h3').textContent();
      const type = await step.locator('span.font-mono').textContent();
      console.log(`Step ${i + 1}:`);
      console.log(`  Question: ${question?.trim()}`);
      console.log(`  Type: ${type?.trim()}`);
    }

    // Try to get the actual JSON from Supabase
    // by checking browser's network tab or looking at the page source
    console.log('\nNeed to check the actual funnel data structure...');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

debug();
