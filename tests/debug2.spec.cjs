const { test, expect } = require('@playwright/test');
const path = require('path');

const HTML_PATH = 'file://' + path.resolve(__dirname, '..', 'index.html');

test('Debug lesson 1 - DOM based', async ({ page }) => {
  await page.goto(HTML_PATH);
  await page.waitForSelector('#task-status');
  await page.click('#btn-reset-calc');
  await page.waitForTimeout(300);

  console.log('Initial VFD:', await page.textContent('#vfd-display'));

  await page.click('[data-key="5"]');
  await page.waitForTimeout(100);
  console.log('After 5, VFD:', await page.textContent('#vfd-display'));

  await page.click('[data-key="ENTER"]');
  await page.waitForTimeout(100);
  console.log('After ENTER, VFD:', await page.textContent('#vfd-display'), 'X reg:', await page.textContent('#reg-x'), 'Y reg:', await page.textContent('#reg-y'));

  await page.click('[data-key="3"]');
  await page.waitForTimeout(100);
  console.log('After 3, VFD:', await page.textContent('#vfd-display'));

  // Try clicking + with different approaches
  const plusBtn = page.locator('[data-key="+"]');
  console.log('Plus button count:', await plusBtn.count());
  await plusBtn.click();
  await page.waitForTimeout(100);
  console.log('After +, VFD:', await page.textContent('#vfd-display'));

  await page.click('[data-key="4"]');
  await page.waitForTimeout(100);
  console.log('After 4, VFD:', await page.textContent('#vfd-display'));

  const multBtn = page.locator('[data-key="*"]');
  console.log('Mult button count:', await multBtn.count());
  await multBtn.click();
  await page.waitForTimeout(100);
  console.log('After *, VFD:', await page.textContent('#vfd-display'));

  console.log('Task status:', await page.textContent('#task-status'));
  console.log('Stack tab X:', await page.textContent('#reg-x'));
  console.log('Stack tab Y:', await page.textContent('#reg-y'));
  console.log('Stack tab Z:', await page.textContent('#reg-z'));
  console.log('Stack tab T:', await page.textContent('#reg-t'));

  await page.screenshot({ path: 'debug_lesson1_result.png', fullPage: true });
});
