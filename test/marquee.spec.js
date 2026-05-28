import { test, expect } from '@playwright/test';
test('marquee appends bulb circles around the perimeter', async ({ page }) => {
  await page.goto('/test/test-page.html');
  await page.evaluate(() => document.getElementById('bw').setAttribute('effect', 'marquee'));
  await page.waitForTimeout(150);
  const n = await page.evaluate(
    () =>
      document.getElementById('bw').querySelectorAll('svg[data-border-wc="marquee"] circle').length
  );
  expect(n).toBeGreaterThan(8);
});
