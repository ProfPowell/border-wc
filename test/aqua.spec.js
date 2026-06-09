import { test, expect } from '@playwright/test';

test('aqua attaches a gloss layer and a gradient background', async ({ page }) => {
  await page.goto('/test/test-page.html');
  await page.evaluate(() => document.getElementById('bw').setAttribute('effect', 'aqua'));
  await page.waitForTimeout(80);
  const r = await page.evaluate(() => {
    const el = document.getElementById('bw');
    return {
      gloss: !!el.querySelector('[data-border-wc="aqua-gloss"]'),
      bg: el.style.background,
    };
  });
  expect(r.gloss).toBe(true);
  expect(r.bg).toContain('gradient');
});

test('aqua removes its gloss layer and restores styles on cleanup', async ({ page }) => {
  await page.goto('/test/test-page.html');
  await page.evaluate(() => document.getElementById('bw').setAttribute('effect', 'aqua'));
  await page.waitForTimeout(60);
  await page.evaluate(() => document.getElementById('bw').setAttribute('effect', 'draw'));
  await page.waitForTimeout(60);
  const r = await page.evaluate(() => {
    const el = document.getElementById('bw');
    return { gloss: !!el.querySelector('[data-border-wc="aqua-gloss"]'), bg: el.style.background };
  });
  expect(r.gloss).toBe(false);
  expect(r.bg).toBe('');
});
