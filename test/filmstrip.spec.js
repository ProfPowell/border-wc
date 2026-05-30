import { test, expect } from '@playwright/test';
test('filmstrip appends two sprocket-hole bars (top + bottom)', async ({ page }) => {
  await page.goto('/test/test-page.html');
  await page.evaluate(() => document.getElementById('bw').setAttribute('effect', 'filmstrip'));
  await page.waitForTimeout(120);
  const r = await page.evaluate(() => {
    const bars = document
      .getElementById('bw')
      .querySelectorAll('[data-border-wc="filmstrip-bar"]');
    return {
      count: bars.length,
      bgImage: bars[0] && getComputedStyle(bars[0]).backgroundImage,
    };
  });
  expect(r.count).toBe(2);
  expect(r.bgImage).toContain('radial-gradient');
});
