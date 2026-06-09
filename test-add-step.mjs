import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:3000';

async function testAddStep() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    console.log('1️⃣ Creating funnel...');
    await page.goto(`${BASE_URL}/admin/funnels/new`, { waitUntil: 'networkidle' });

    const slug = 'test-' + Math.random().toString(36).substring(7);
    await page.fill('input[placeholder="e.g., Solar Savings Quiz"]', 'Test Multi-Step');
    await page.fill('input[placeholder="e.g., solar"]', slug);
    await page.click('button:has-text("Create Funnel")');

    let maxAttempts = 15;
    while (maxAttempts > 0 && page.url().includes('/funnels/new')) {
      await page.waitForTimeout(500);
      maxAttempts--;
    }

    const funnelUrl = page.url();
    const match = funnelUrl.match(/\/funnels\/([a-f0-9\-]+)/);
    const funnelId = match ? match[1] : null;

    if (!funnelId) throw new Error('Funnel creation failed');
    console.log(`   Created: ${funnelId}\n`);

    // Go to funnel editor
    console.log('2️⃣ Adding new step to funnel...');
    await page.goto(`${BASE_URL}/admin/funnels/${funnelId}`, { waitUntil: 'networkidle' });
    await page.waitForSelector('button:has-text("+ Add Step")', { timeout: 5000 });

    // Add a new step
    await page.click('button:has-text("+ Add Step")');
    await page.waitForTimeout(1000);

    console.log('   Step added\n');

    console.log('3️⃣ Opening public quiz and navigating through all steps...');
    await page.goto(`${BASE_URL}/quiz/${slug}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Navigate through steps - continue until we hit Results
    let stepCount = 1;
    let resultsFound = false;

    while (stepCount <= 10 && !resultsFound) {
      const question = await page.locator('h1').first().textContent();
      console.log(`   Step ${stepCount}: "${question}"`);

      if (question?.includes('Results')) {
        resultsFound = true;
        console.log('\n✅ Successfully navigated through all steps to Results Page!');
        break;
      }

      // Click first available option button
      const buttons = await page.locator('button:visible').all();
      let clicked = false;

      for (const btn of buttons) {
        const text = await btn.textContent();
        if (text && text.trim().length > 1 && !text.match(/Continue|Submit|Back|Next/i)) {
          await btn.click();
          clicked = true;
          break;
        }
      }

      if (!clicked) {
        console.log('   ⚠️  No more buttons to click');
        break;
      }

      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(300);
      stepCount++;
    }

    if (!resultsFound) {
      console.log(`\n⚠️  Did not reach Results page (stopped at step ${stepCount})`);
    }

    await page.screenshot({ path: '/tmp/test-steps-final.png' });

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    try {
      await page.screenshot({ path: '/tmp/test-add-step-error.png' });
    } catch (e) {}
    process.exit(1);
  } finally {
    await browser.close();
  }
}

testAddStep();
