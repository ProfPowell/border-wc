import { test, expect } from '@playwright/test';
test('plasma appends a canvas overlay', async ({ page }) => {
  await page.goto('/test/test-page.html');
  await page.evaluate(() => document.getElementById('bw').setAttribute('effect', 'plasma'));
  await page.waitForTimeout(120);
  const has = await page.evaluate(
    () => !!document.getElementById('bw').querySelector('canvas[data-border-wc="plasma"]')
  );
  expect(has).toBe(true);
});
