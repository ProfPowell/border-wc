import { test, expect } from '@playwright/test';
test('scoop appends a perforated perimeter path with arc bites', async ({ page }) => {
  await page.goto('/test/test-page.html');
  await page.evaluate(() => document.getElementById('bw').setAttribute('effect', 'scoop'));
  await page.waitForTimeout(120);
  const d = await page.evaluate(() => {
    const p = document.getElementById('bw').querySelector('svg[data-border-wc="scoop"] path');
    return p && p.getAttribute('d');
  });
  expect(d).toBeTruthy();
  // Each scoop is one A command; expect multiple per edge.
  expect((d.match(/A/g) || []).length).toBeGreaterThan(8);
});
