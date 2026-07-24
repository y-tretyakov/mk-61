const { test } = require('@playwright/test');
const path = require('path');

const HTML_PATH = 'file://' + path.resolve(__dirname, '..', 'index.html');

test('Debug lesson 12', async ({ page }) => {
  await page.goto(HTML_PATH);
  await page.waitForSelector('#task-status');
  await page.click('#btn-reset-calc');
  await page.waitForTimeout(300);

  for (let i = 1; i < 12; i++) {
    await page.click('#btn-next-lesson');
    await page.waitForTimeout(100);
  }
  console.log('Lesson:', await page.textContent('#lesson-title'));
  console.log('Indicator:', await page.textContent('#lesson-indicator'));
  console.log('Check condition for lesson 12: X === 90');

  await page.click('[data-key="7"]');
  await page.click('[data-key="ENTER"]');
  await page.click('[data-key="8"]');
  await page.click('[data-key="+"]');
  console.log('After (7+8), X:', await page.textContent('#reg-x'));

  await page.click('[data-key="9"]');
  await page.click('[data-key="ENTER"]');
  await page.click('[data-key="3"]');
  await page.click('[data-key="-"]');
  console.log('After (9-3), X:', await page.textContent('#reg-x'));

  await page.click('[data-key="*"]');
  console.log('After *, X:', await page.textContent('#reg-x'), '(expected 90)');
  console.log('Task status:', await page.textContent('#task-status'));
});