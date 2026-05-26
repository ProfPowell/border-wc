import { test, expect } from '@playwright/test';
test('sparks appends a sized canvas', async ({ page }) => {
  await page.goto('/test/test-page.html');
  await page.evaluate(() => document.getElementById('bw').setAttribute('effect', 'sparks'));
  await page.waitForTimeout(150);
  const r = await page.evaluate(() => {
    const c = document.getElementById('bw').querySelector('canvas[data-border-wc="sparks"]');
    return { hasCanvas: !!c, sized: !!c && c.width > 0 && c.height > 0 };
  });
  expect(r).toEqual({ hasCanvas: true, sized: true });
});
