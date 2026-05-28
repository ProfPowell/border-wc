import { test, expect } from '@playwright/test';
test('fireflies appends a canvas overlay', async ({ page }) => {
  await page.goto('/test/test-page.html');
  await page.evaluate(() => document.getElementById('bw').setAttribute('effect', 'fireflies'));
  await page.waitForTimeout(120);
  const has = await page.evaluate(
    () => !!document.getElementById('bw').querySelector('canvas[data-border-wc="fireflies"]')
  );
  expect(has).toBe(true);
});
