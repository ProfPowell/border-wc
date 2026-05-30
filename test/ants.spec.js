import { test, expect } from '@playwright/test';
test('ants appends two stroked paths (color + white underlay)', async ({ page }) => {
  await page.goto('/test/test-page.html');
  await page.evaluate(() => document.getElementById('bw').setAttribute('effect', 'ants'));
  await page.waitForTimeout(120);
  const r = await page.evaluate(() => {
    const paths = document
      .getElementById('bw')
      .querySelectorAll('svg[data-border-wc="ants"] path');
    return {
      count: paths.length,
      strokes: Array.from(paths).map((p) => p.getAttribute('stroke')),
    };
  });
  expect(r.count).toBe(2);
  expect(r.strokes).toContain('#fff');
});
