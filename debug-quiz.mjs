import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:3000';

async function debug() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    await page.goto(`${BASE_URL}/quiz/test-1ftbrv`, { waitUntil: 'networkidle' });
    
    await page.screenshot({ path: '/tmp/debug-quiz.png' });
    console.log('Screenshot taken');

    // List all buttons
    const buttons = await page.locator('button').all();
    console.log(`Found ${buttons.length} buttons:`);
    for (let i = 0; i < buttons.length; i++) {
      const text = await buttons[i].textContent();
      const dataValue = await buttons[i].getAttribute('data-value');
      console.log(`  Button ${i}: "${text?.trim()}", data-value="${dataValue}"`);
    }

    // Check for any visible buttons
    const visibleButtons = await page.locator('button:visible').all();
    console.log(`\nFound ${visibleButtons.length} visible buttons`);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

debug();
