import { test, expect } from '@playwright/test';
test('rope appends two dashed strands', async ({ page }) => {
  await page.goto('/test/test-page.html');
  await page.evaluate(() => document.getElementById('bw').setAttribute('effect', 'rope'));
  await page.waitForTimeout(120);
  const n = await page.evaluate(
    () =>
      document.getElementById('bw').querySelectorAll('svg[data-border-wc="rope"] path').length
  );
  expect(n).toBe(2);
});
