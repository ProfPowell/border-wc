import { test, expect } from '@playwright/test';
test('opart appends a masked ring with crossed gradients', async ({ page }) => {
  await page.goto('/test/test-page.html');
  await page.evaluate(() => document.getElementById('bw').setAttribute('effect', 'opart'));
  await page.waitForTimeout(120);
  const r = await page.evaluate(() => {
    const ring = document.getElementById('bw').querySelector('[data-border-wc="opart"]');
    if (!ring) return null;
    const cs = getComputedStyle(ring);
    return {
      bg: cs.backgroundImage,
      maskComposite: cs.maskComposite || cs.webkitMaskComposite,
    };
  });
  expect(r).not.toBeNull();
  expect(r.bg).toContain('repeating-linear-gradient');
});
