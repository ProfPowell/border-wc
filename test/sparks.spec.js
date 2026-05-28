import { test, expect } from '@playwright/test';
test('sparks appends SVG circles riding offset-path', async ({ page }) => {
  await page.goto('/test/test-page.html');
  await page.evaluate(() => document.getElementById('bw').setAttribute('effect', 'sparks'));
  await page.waitForTimeout(150);
  const r = await page.evaluate(() => {
    const svg = document.getElementById('bw').querySelector('svg[data-border-wc="sparks"]');
    if (!svg) return null;
    const c = svg.querySelector('circle');
    return {
      count: svg.querySelectorAll('circle').length,
      hasOffsetPath: !!c && /path\(/.test(c.style.offsetPath || ''),
    };
  });
  expect(r.count).toBe(3);
  expect(r.hasOffsetPath).toBe(true);
});
