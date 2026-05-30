import { test, expect } from '@playwright/test';
test('neon appends an SVG with a feGaussianBlur+feMerge filter', async ({ page }) => {
  await page.goto('/test/test-page.html');
  await page.evaluate(() => document.getElementById('bw').setAttribute('effect', 'neon'));
  await page.waitForTimeout(120);
  const r = await page.evaluate(() => {
    const svg = document.getElementById('bw').querySelector('svg[data-border-wc="neon"]');
    if (!svg) return null;
    return {
      hasBlur: !!svg.querySelector('filter feGaussianBlur'),
      hasMerge: !!svg.querySelector('filter feMerge'),
      hasFiltered: !!svg.querySelector('path[filter]'),
    };
  });
  expect(r).toEqual({ hasBlur: true, hasMerge: true, hasFiltered: true });
});

test('neon mode="synthwave" uses a gradient stroke + adds a scanline overlay', async ({
  page,
}) => {
  await page.goto('/test/test-page.html');
  await page.evaluate(() => {
    const el = document.getElementById('bw');
    el.setAttribute('mode', 'synthwave');
    el.setAttribute('effect', 'neon');
  });
  await page.waitForTimeout(120);
  const r = await page.evaluate(() => {
    const host = document.getElementById('bw');
    const svg = host.querySelector('svg[data-border-wc="neon"]');
    const path = svg.querySelector('path[stroke]');
    return {
      hasGradient: !!svg.querySelector('linearGradient'),
      strokeIsGradientRef: (path.getAttribute('stroke') || '').startsWith('url(#'),
      hasScan: !!host.querySelector('[data-border-wc="neon-scan"]'),
    };
  });
  expect(r.hasGradient).toBe(true);
  expect(r.strokeIsGradientRef).toBe(true);
  expect(r.hasScan).toBe(true);
});
