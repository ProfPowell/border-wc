import { test, expect } from '@playwright/test';
test('grass appends a canvas overlay', async ({ page }) => {
  await page.goto('/test/test-page.html');
  await page.evaluate(() => document.getElementById('bw').setAttribute('effect', 'grass'));
  await page.waitForTimeout(120);
  const has = await page.evaluate(
    () => !!document.getElementById('bw').querySelector('canvas[data-border-wc="grass"]')
  );
  expect(has).toBe(true);
});
