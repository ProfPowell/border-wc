import { test, expect } from '@playwright/test';
test('border-wc upgrades, reflects effect, exposes refresh(), sets position', async ({ page }) => {
  await page.goto('/test/test-page.html');
  const r = await page.evaluate(() => {
    const el = document.getElementById('bw');
    return { upgraded: el instanceof HTMLElement && typeof el.refresh === 'function', effect: el.effect, position: getComputedStyle(el).position };
  });
  expect(r.upgraded).toBe(true);
  expect(r.effect).toBe('draw');
  expect(r.position).toBe('relative');
});
test('changing effect re-applies without console error', async ({ page }) => {
  await page.goto('/test/test-page.html');
  const errs = [];
  page.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  await page.evaluate(() => document.getElementById('bw').setAttribute('effect', 'sparks'));
  await page.waitForTimeout(200);
  expect(errs).toEqual([]);
});
