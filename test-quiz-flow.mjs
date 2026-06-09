import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:3000';

async function runTest() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    console.log('1️⃣ Creating test funnel...');
    await page.goto(`${BASE_URL}/admin/funnels/new`, { waitUntil: 'networkidle' });

    const funnelName = 'Test Quiz ' + Date.now();
    const funnelSlug = 'test-' + Math.random().toString(36).substring(7);

    await page.fill('input[placeholder="e.g., Solar Savings Quiz"]', funnelName);
    await page.fill('input[placeholder="e.g., solar"]', funnelSlug);

    console.log(`   Name: "${funnelName}"`);
    console.log(`   Slug: "${funnelSlug}"`);

    await page.click('button:has-text("Create Funnel")');

    // Wait for navigation and get the actual URL
    await page.waitForLoadState('networkidle');
    let funnelUrl = page.url();

    // Keep waiting if we're still on the new page
    let attempts = 0;
    while ((funnelUrl.includes('/funnels/new') || funnelUrl.includes('/new')) && attempts < 10) {
      await page.waitForTimeout(500);
      funnelUrl = page.url();
      attempts++;
    }

    console.log(`   Redirected to: ${funnelUrl}`);

    // Extract funnel ID from URL
    const match = funnelUrl.match(/\/funnels\/([a-f0-9\-]+)/);
    const funnelId = match ? match[1] : null;

    if (!funnelId || funnelId === 'new') {
      throw new Error(`Failed to create funnel, got URL: ${funnelUrl}`);
    }

    console.log(`   ✅ Created: ${funnelId}\n`);

    // Open the public quiz
    console.log('2️⃣ Opening public quiz (from beginning)...');
    const quizUrl = `${BASE_URL}/quiz/${funnelSlug}`;
    console.log(`   URL: ${quizUrl}`);

    await page.goto(quizUrl, { waitUntil: 'networkidle' });

    // Check if 404
    const pageContent = await page.content();
    if (pageContent.includes('404') || pageContent.includes('not found')) {
      console.log('   ⚠️  Quiz page returned 404');
      console.log('   This might be because the quiz needs time to become public');
      await page.waitForTimeout(2000);
      await page.reload({ waitUntil: 'networkidle' });
    }

    await page.waitForSelector('h1', { timeout: 5000 });
    await page.screenshot({ path: '/tmp/quiz-start.png' });
    console.log('   📸 Quiz started\n');

    // Fill out the form
    console.log('3️⃣ Filling out form and navigating to results...');

    let stepNum = 1;
    let stepName = '';

    while (stepNum <= 10) {
      stepName = await page.locator('h1').first().textContent() || 'Unknown';
      console.log(`   Step ${stepNum}: ${stepName}`);

      // Check if we reached results
      if (stepName?.match(/Results|Thank|Complete/i)) {
        console.log('\n✅ Successfully reached results page!\n');
        await page.screenshot({ path: '/tmp/quiz-complete.png' });
        console.log('   📸 Results page screenshot');
        break;
      }

      // Check for 404
      if (stepName === '404') {
        console.log('   ❌ Got 404 error');
        break;
      }

      // Get all visible buttons
      const buttons = await page.locator('button:visible').all();
      let actionTaken = false;

      // First pass: look for answer option buttons (not Continue)
      for (const btn of buttons) {
        const text = await btn.textContent();
        if (text && !text.match(/Continue|Submit|Next|Back|Issues/i) && text.trim().length > 0) {
          console.log(`      Selecting: "${text.trim()}"`);
          await btn.click();
          actionTaken = true;
          break;
        }
      }

      // Second pass: look for text input fields
      if (!actionTaken) {
        const inputs = await page.locator('input[type="text"]:visible').all();
        if (inputs.length > 0) {
          const auto = await inputs[0].getAttribute('autocomplete') || '';
          const name = await inputs[0].getAttribute('name') || '';

          let val = 'test@example.com';
          if (auto.includes('name') || name.includes('name')) val = 'John Doe';
          else if (auto.includes('phone') || name.includes('phone')) val = '555-123-4567';
          else if (auto.includes('postal') || name.includes('postal')) val = '90210';
          else if (auto.includes('level2') || name.includes('city')) val = 'Los Angeles';
          else if (auto.includes('street') || name.includes('address')) val = '123 Main';
          else if (auto.includes('country') || name.includes('country')) val = 'USA';
          else if (name.includes('house')) val = '123';

          console.log(`      Entered: "${val}"`);
          await inputs[0].fill(val);
          actionTaken = true;
        }
      }

      if (!actionTaken) {
        console.log('      No interactive elements found');
        break;
      }

      // Wait and move to next step
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(200);

      stepNum++;
    }

    // Verify in admin
    console.log('\n4️⃣ Checking admin submissions...');
    await page.goto(`${BASE_URL}/admin/funnels/${funnelId}/submissions`, { waitUntil: 'networkidle' });

    const rows = await page.locator('table tbody tr').all();
    if (rows.length > 0) {
      console.log(`   ✅ ${rows.length} submission(s) found`);
    } else {
      console.log('   ℹ️  No submissions captured');
    }

    await page.screenshot({ path: '/tmp/quiz-admin.png' });

    console.log('\n✨ Test complete!');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    try {
      await page.screenshot({ path: '/tmp/quiz-error.png' });
    } catch (e) {}
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runTest();
