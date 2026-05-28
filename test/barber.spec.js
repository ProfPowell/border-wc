import { test, expect } from '@playwright/test';
test('barber appends a striped overlay div', async ({ page }) => {
  await page.goto('/test/test-page.html');
  await page.evaluate(() => document.getElementById('bw').setAttribute('effect', 'barber'));
  await page.waitForTimeout(120);
  const has = await page.evaluate(
    () => !!document.getElementById('bw').querySelector('[data-border-wc="barber"]')
  );
  expect(has).toBe(true);
});
