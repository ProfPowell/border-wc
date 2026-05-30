import { test, expect } from '@playwright/test';
test('gooey installs a goo filter + orbiting circles', async ({ page }) => {
  await page.goto('/test/test-page.html');
  await page.evaluate(() => document.getElementById('bw').setAttribute('effect', 'gooey'));
  await page.waitForTimeout(120);
  const r = await page.evaluate(() => {
    const svg = document.getElementById('bw').querySelector('svg[data-border-wc="gooey"]');
    const g = svg.querySelector('g[filter]');
    const blur = svg.querySelector('feGaussianBlur');
    const cm = svg.querySelector('feColorMatrix');
    return {
      hasFilterRef: !!g && g.getAttribute('filter').startsWith('url(#'),
      hasBlur: !!blur,
      hasColorMatrix: !!cm,
      circles: svg.querySelectorAll('circle').length,
    };
  });
  expect(r.hasFilterRef).toBe(true);
  expect(r.hasBlur).toBe(true);
  expect(r.hasColorMatrix).toBe(true);
  expect(r.circles).toBe(7);
});
