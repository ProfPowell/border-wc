import { test, expect } from '@playwright/test';
test('wings appends two oversized clip-path divs', async ({ page }) => {
  await page.goto('/test/test-page.html');
  await page.evaluate(() => document.getElementById('bw').setAttribute('effect', 'wings'));
  await page.waitForTimeout(120);
  const n = await page.evaluate(
    () => document.getElementById('bw').querySelectorAll('[data-border-wc="wings"]').length
  );
  expect(n).toBe(2);
});
