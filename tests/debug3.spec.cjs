const { test, expect } = require('@playwright/test');
const path = require('path');

const HTML_PATH = 'file://' + path.resolve(__dirname, '..', 'index.html');

test('Debug lesson 1 - fixed', async ({ page }) => {
  await page.goto(HTML_PATH);
  await page.waitForSelector('#task-status');
  await page.click('#btn-reset-calc');
  await page.waitForTimeout(300);

  await page.click('[data-key="5"]');
  await page.click('[data-key="ENTER"]');
  await page.click('[data-key="3"]');
  await page.click('[data-key="+"]');
  console.log('After +, X:', await page.textContent('#reg-x'), '(expected 8)');

  await page.click('[data-key="4"]');
  await page.click('[data-key="*"]');
  console.log('After *, X:', await page.textContent('#reg-x'), '(expected 32)');

  console.log('Task status:', await page.textContent('#task-status'));
  console.log('Expected: ✓ Выполнено!');
});
