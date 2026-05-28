import { test, expect } from '@playwright/test';
test('chroma applies an 8-shadow stack to the host', async ({ page }) => {
  await page.goto('/test/test-page.html');
  await page.evaluate(() => document.getElementById('bw').setAttribute('effect', 'chroma'));
  await page.waitForTimeout(120);
  const r = await page.evaluate(() => {
    const el = document.getElementById('bw');
    return {
      flag: el.hasAttribute('data-border-wc-chroma'),
      shadowSegments: (el.style.boxShadow || '').split(',').length,
    };
  });
  expect(r.flag).toBe(true);
  expect(r.shadowSegments).toBeGreaterThanOrEqual(8);
});
