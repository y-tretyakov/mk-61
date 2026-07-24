const { test, expect } = require('@playwright/test');
const path = require('path');

const HTML_PATH = 'file://' + path.resolve(__dirname, '..', 'index.html');

test('Debug lesson 1', async ({ page }) => {
  await page.goto(HTML_PATH);
  await page.waitForSelector('#task-status');
  await page.click('#btn-reset-calc');
  await page.waitForTimeout(300);

  console.log('Initial state - X:', await page.evaluate(() => window.state?.X));

  await page.click('[data-key="5"]');
  await page.waitForTimeout(100);
  console.log('After 5, X:', await page.evaluate(() => window.state?.X));

  await page.click('[data-key="ENTER"]');
  await page.waitForTimeout(100);
  console.log('After ENTER, X:', await page.evaluate(() => window.state?.X), 'Y:', await page.evaluate(() => window.state?.Y));

  await page.click('[data-key="3"]');
  await page.waitForTimeout(100);
  console.log('After 3, X:', await page.evaluate(() => window.state?.X), 'Y:', await page.evaluate(() => window.state?.Y));

  await page.click('[data-key="\\+"]');
  await page.waitForTimeout(100);
  console.log('After +, X:', await page.evaluate(() => window.state?.X));

  await page.click('[data-key="4"]');
  await page.waitForTimeout(100);
  console.log('After 4, X:', await page.evaluate(() => window.state?.X));

  await page.click('[data-key="\\*"]');
  await page.waitForTimeout(100);
  console.log('After *, X:', await page.evaluate(() => window.state?.X));

  console.log('Task status:', await page.textContent('#task-status'));
  console.log('Check result:', await page.evaluate(() => window.lessons[0].check()));

  await page.screenshot({ path: 'debug_lesson1.png', fullPage: true });
});
