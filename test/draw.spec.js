import { test, expect } from '@playwright/test';
test('draw appends an SVG stroke and emits draw-complete', async ({ page }) => {
  await page.goto('/test/test-page.html');
  const done = page.evaluate(() => new Promise((res) => {
    const el = document.getElementById('bw');
    el.addEventListener('border-wc:draw-complete', () => res(true), { once: true });
    el.setAttribute('speed', '120');
    el.setAttribute('effect', 'draw');
  }));
  await page.waitForTimeout(50);
  const hasSvg = await page.evaluate(() => !!document.getElementById('bw').querySelector('svg[data-border-wc="draw"]'));
  expect(hasSvg).toBe(true);
  expect(await done).toBe(true);
});
