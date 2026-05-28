import { test, expect } from '@playwright/test';
test('typewriter appends text characters around the perimeter', async ({ page }) => {
  await page.goto('/test/test-page.html');
  await page.evaluate(() => document.getElementById('bw').setAttribute('effect', 'typewriter'));
  await page.waitForTimeout(120);
  const n = await page.evaluate(
    () =>
      document.getElementById('bw').querySelectorAll('svg[data-border-wc="typewriter"] text')
        .length
  );
  expect(n).toBeGreaterThanOrEqual(8);
});
