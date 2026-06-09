import { test, expect } from '@playwright/test';

test('brutalist applies a border + hard offset box-shadow to the host', async ({ page }) => {
  await page.goto('/test/test-page.html');
  await page.evaluate(() => document.getElementById('bw').setAttribute('effect', 'brutalist'));
  await page.waitForTimeout(80);
  const r = await page.evaluate(() => {
    const el = document.getElementById('bw');
    return {
      border: el.style.border,
      shadow: el.style.boxShadow,
    };
  });
  expect(r.border).toContain('solid');
  // hard shadow: an offset with a 0 blur radius
  expect(r.shadow).toMatch(/\d+px \d+px 0/);
});

test('brutalist restores host styles when the effect changes', async ({ page }) => {
  await page.goto('/test/test-page.html');
  await page.evaluate(() => document.getElementById('bw').setAttribute('effect', 'brutalist'));
  await page.waitForTimeout(60);
  await page.evaluate(() => document.getElementById('bw').setAttribute('effect', 'draw'));
  await page.waitForTimeout(60);
  const r = await page.evaluate(() => {
    const el = document.getElementById('bw');
    return { border: el.style.border, shadow: el.style.boxShadow };
  });
  expect(r.border).toBe('');
  expect(r.shadow).toBe('');
});
