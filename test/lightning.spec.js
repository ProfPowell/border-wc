import { test, expect } from '@playwright/test';
test('lightning appends a canvas overlay', async ({ page }) => {
  await page.goto('/test/test-page.html');
  await page.evaluate(() => document.getElementById('bw').setAttribute('effect', 'lightning'));
  await page.waitForTimeout(120);
  const has = await page.evaluate(
    () => !!document.getElementById('bw').querySelector('canvas[data-border-wc="lightning"]')
  );
  expect(has).toBe(true);
});
