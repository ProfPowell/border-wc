import { test, expect } from '@playwright/test';
test('aurora appends ring + halo divs', async ({ page }) => {
  await page.goto('/test/test-page.html');
  await page.evaluate(() => document.getElementById('bw').setAttribute('effect', 'aurora'));
  await page.waitForTimeout(150);
  const has = await page.evaluate(() => {
    const host = document.getElementById('bw');
    return (
      !!host.querySelector('[data-border-wc="aurora"]') &&
      !!host.querySelector('[data-border-wc="aurora-halo"]')
    );
  });
  expect(has).toBe(true);
});
