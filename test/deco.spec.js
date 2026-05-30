import { test, expect } from '@playwright/test';
test('deco appends double-rule paths + corner fan lines', async ({ page }) => {
  await page.goto('/test/test-page.html');
  await page.evaluate(() => document.getElementById('bw').setAttribute('effect', 'deco'));
  await page.waitForTimeout(120);
  const r = await page.evaluate(() => {
    const svg = document.getElementById('bw').querySelector('svg[data-border-wc="deco"]');
    return {
      paths: svg.querySelectorAll('path').length,
      // 4 corners × 5 lines per fan = 20 fan lines.
      lines: svg.querySelectorAll('line').length,
    };
  });
  expect(r.paths).toBeGreaterThanOrEqual(2);
  expect(r.lines).toBe(20);
});
