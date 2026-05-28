import { test, expect } from '@playwright/test';
test('scallop appends svg overlay with bump paths', async ({ page }) => {
  await page.goto('/test/test-page.html');
  await page.evaluate(() => document.getElementById('bw').setAttribute('effect', 'scallop'));
  await page.waitForTimeout(120);
  const n = await page.evaluate(
    () =>
      document.getElementById('bw').querySelectorAll('svg[data-border-wc="scallop"] path').length
  );
  expect(n).toBeGreaterThan(4);
});
