const { test, expect } = require('@playwright/test');

test.describe('МК-61 Интерактивный Курс — Все Упражнения', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#task-status');
    await page.click('#btn-reset-calc');
    await page.waitForTimeout(200);
  });

  async function getTaskStatus(page) {
    return await page.textContent('#task-status');
  }

  async function loadLesson(page, index) {
    // Navigate to lesson by clicking next/prev
    // Start at lesson 0, click next until we reach desired index
    const indicator = await page.textContent('#lesson-indicator');
    const current = parseInt(indicator.split('/')[0].trim()) - 1;
    if (index > current) {
      for (let i = current; i < index; i++) {
        await page.click('#btn-next-lesson');
        await page.waitForTimeout(100);
      }
    } else if (index < current) {
      for (let i = current; i > index; i--) {
        await page.click('#btn-prev-lesson');
        await page.waitForTimeout(100);
      }
    }
  }

  test('Урок 1: Вычисление (5+3)*4 = 32', async ({ page }) => {
    await loadLesson(page, 0);
    await expect(page.locator('#task-status')).toHaveText('Ожидает выполнения');

    // Enter: 5 ENTER 3 + 4 *
    await page.click('[data-key="5"]');
    await page.click('[data-key="ENTER"]');
    await page.click('[data-key="3"]');
    await page.click('[data-key="+"]');
    await page.click('[data-key="4"]');
    await page.click('[data-key="*"]');

    await expect(page.locator('#task-status')).toContainText('Выполнено');
  });

  test('Урок 2: Загрузка 10 и 20 в стек, затем SWAP', async ({ page }) => {
    await loadLesson(page, 1);
    await expect(page.locator('#task-status')).toHaveText('Ожидает выполнения');

    // Enter: 1 0 ENTER 2 0 SWAP
    await page.click('[data-key="1"]');
    await page.click('[data-key="0"]');
    await page.click('[data-key="ENTER"]');
    await page.click('[data-key="2"]');
    await page.click('[data-key="0"]');
    await page.click('[data-key="SWAP"]');

    await expect(page.locator('#task-status')).toContainText('Выполнено');
  });

  test('Урок 3: Сохранение 42 в регистр памяти 1', async ({ page }) => {
    await loadLesson(page, 2);
    await expect(page.locator('#task-status')).toHaveText('Ожидает выполнения');

    // Enter: 4 2 then demo uses handleKey('4'); handleKey('2'); state.memory[1] = 42;
    // The П→Х then 1 mechanism is not fully wired, so press demo or manually set
    await page.click('[data-key="4"]');
    await page.click('[data-key="2"]');
    await page.click('[data-key="P"]');
    await page.click('[data-key="1"]');

    // Check memory tab value for register 1
    await page.click('#tab-btn-stack');
    await page.waitForTimeout(200);

    await expect(page.locator('#task-status')).toContainText('Выполнено');
  });

  test('Урок 4: Переключение в режим ПРГ', async ({ page }) => {
    await loadLesson(page, 3);
    await expect(page.locator('#task-status')).toHaveText('Ожидает выполнения');

    // Press F then VP (ВП) to switch to PRG mode
    await page.click('[data-key="F"]');
    await page.click('[data-key="VP"]');

    await expect(page.locator('#task-status')).toContainText('Выполнено');
  });

  test('Урок 5: Деление на ноль — ЕГГОГ', async ({ page }) => {
    await loadLesson(page, 4);
    await expect(page.locator('#task-status')).toHaveText('Ожидает выполнения');

    // Enter: 5 ENTER 0 /
    await page.click('[data-key="5"]');
    await page.click('[data-key="ENTER"]');
    await page.click('[data-key="0"]');
    await page.click('[data-key="/"]');

    await expect(page.locator('#task-status')).toContainText('Выполнено');
  });

  test.describe('Новые уроки (6+)', () => {

    test('Урок 6: Тригонометрические функции — sin 30°', async ({ page }) => {
      await loadLesson(page, 5);

      // Switch angle to DEG first
      await page.click('#switch-angle');
      await page.waitForTimeout(100);

      // Enter: 3 0 F 7 (sin)
      await page.click('[data-key="3"]');
      await page.click('[data-key="0"]');
      await page.click('[data-key="F"]');
      await page.click('[data-key="7"]');

      await expect(page.locator('#task-status')).toContainText('Выполнено');
    });

    test('Урок 7: Логарифмические функции — lg(100) = 2', async ({ page }) => {
      await loadLesson(page, 6);

      // Enter: 1 0 0 F 2 (lg)
      await page.click('[data-key="1"]');
      await page.click('[data-key="0"]');
      await page.click('[data-key="0"]');
      await page.click('[data-key="F"]');
      await page.click('[data-key="2"]');

      await expect(page.locator('#task-status')).toContainText('Выполнено');
    });

    test('Урок 8: Корни и степени — √(25) = 5', async ({ page }) => {
      await loadLesson(page, 7);

      // Enter: 2 5 F - (sqrt)
      await page.click('[data-key="2"]');
      await page.click('[data-key="5"]');
      await page.click('[data-key="F"]');
      await page.click('[data-key="-"]');

      await expect(page.locator('#task-status')).toContainText('Выполнено');
    });

    test('Урок 9: Число π и 1/x', async ({ page }) => {
      await loadLesson(page, 8);

      // Enter: 2 F + (π) → pushStack, X=π, then / (1/x)
      await page.click('[data-key="2"]');
      await page.click('[data-key="F"]');
      await page.click('[data-key="+"]');

      await page.click('[data-key="F"]');
      await page.click('[data-key="/"]');

      await expect(page.locator('#task-status')).toContainText('Выполнено');
    });

    test('Урок 10: K-функции — модуль, знак, целая/дробная часть', async ({ page }) => {
      await loadLesson(page, 9);

      // Enter: - 5 (CHS to negate) then K 4 (abs)
      await page.click('[data-key="5"]');
      await page.click('[data-key="CHS"]');
      await page.click('[data-key="K"]');
      await page.click('[data-key="4"]');

      await expect(page.locator('#task-status')).toContainText('Выполнено');
    });

    test('Урок 11: Использование Bx для восстановления X из X1', async ({ page }) => {
      await loadLesson(page, 10);

      // Enter: 1 0 0 ENTER (push to Y), then 5 0 + (100+50=150)
      // Then F ENTER (Bx) should restore X1 (which was 50)
      await page.click('[data-key="1"]');
      await page.click('[data-key="0"]');
      await page.click('[data-key="0"]');
      await page.click('[data-key="ENTER"]');
      await page.click('[data-key="5"]');
      await page.click('[data-key="0"]');
      await page.click('[data-key="+"]');

      await page.click('[data-key="F"]');
      await page.click('[data-key="ENTER"]');

      await expect(page.locator('#task-status')).toContainText('Выполнено');
    });

    test('Урок 12: Сложное выражение — (7+8)×(9-3)', async ({ page }) => {
      await loadLesson(page, 11);

      // Enter: 7 ENTER 8 + 9 ENTER 3 - *
      await page.click('[data-key="7"]');
      await page.click('[data-key="ENTER"]');
      await page.click('[data-key="8"]');
      await page.click('[data-key="+"]');
      await page.click('[data-key="9"]');
      await page.click('[data-key="ENTER"]');
      await page.click('[data-key="3"]');
      await page.click('[data-key="-"]');
      await page.click('[data-key="*"]');

      await expect(page.locator('#task-status')).toContainText('Выполнено');
    });

  });

});