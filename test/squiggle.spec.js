import { test, expect } from '@playwright/test';
test('squiggle appends an SVG with a turbulence filter on a stroked path', async ({ page }) => {
  await page.goto('/test/test-page.html');
  await page.evaluate(() => document.getElementById('bw').setAttribute('effect', 'squiggle'));
  await page.waitForTimeout(80);
  const r = await page.evaluate(() => {
    const svg = document.getElementById('bw').querySelector('svg[data-border-wc="squiggle"]');
    return { hasSvg: !!svg, hasTurb: !!svg?.querySelector('feTurbulence'), hasPath: !!svg?.querySelector('path[filter]') };
  });
  expect(r).toEqual({ hasSvg: true, hasTurb: true, hasPath: true });
});
