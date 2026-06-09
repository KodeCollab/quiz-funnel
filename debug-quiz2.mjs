import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:3000';

async function debug() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    await page.goto(`${BASE_URL}/quiz/test-t5e6l`, { waitUntil: 'networkidle' });
    
    console.log('Initial state:');
    let h1 = await page.locator('h1').first().textContent();
    console.log(`  H1: ${h1}`);

    // Get all buttons
    let buttons = await page.locator('button:visible').all();
    console.log(`  Buttons: ${buttons.length}`);
    for (let i = 0; i < buttons.length; i++) {
      const text = await buttons[i].textContent();
      console.log(`    ${i}: "${text?.trim()}"`);
    }

    // Click Option 1
    console.log('\nClicking "Option 1"...');
    await page.locator('button:visible').filter({ hasText: 'Option 1' }).click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    console.log('\nAfter click:');
    h1 = await page.locator('h1').first().textContent();
    console.log(`  H1: ${h1}`);

    buttons = await page.locator('button:visible').all();
    console.log(`  Buttons: ${buttons.length}`);
    for (let i = 0; i < buttons.length; i++) {
      const text = await buttons[i].textContent();
      console.log(`    ${i}: "${text?.trim()}"`);
    }

    await page.screenshot({ path: '/tmp/debug-after-click.png' });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

debug();
