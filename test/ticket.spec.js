import { test, expect } from '@playwright/test';
test('ticket appends notched body path + dashed tear line', async ({ page }) => {
  await page.goto('/test/test-page.html');
  await page.evaluate(() => document.getElementById('bw').setAttribute('effect', 'ticket'));
  await page.waitForTimeout(120);
  const r = await page.evaluate(() => {
    const svg = document.getElementById('bw').querySelector('svg[data-border-wc="ticket"]');
    const body = svg.querySelector('path');
    const tear = svg.querySelector('line');
    return {
      hasBody: !!body && !!body.getAttribute('d'),
      // Body has 6 arcs: 4 corners + 2 notches.
      arcCount: body ? (body.getAttribute('d').match(/A/g) || []).length : 0,
      hasTear: !!tear,
      tearDash: tear && tear.getAttribute('stroke-dasharray'),
    };
  });
  expect(r.hasBody).toBe(true);
  expect(r.arcCount).toBe(6);
  expect(r.hasTear).toBe(true);
  expect(r.tearDash).toBe('2 4');
});
