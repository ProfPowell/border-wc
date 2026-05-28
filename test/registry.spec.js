import { test, expect } from '@playwright/test';

const ALL_EFFECTS = [
  'draw',
  'squiggle',
  'sparks',
  'lightning',
  'flames',
  'glitch',
  'grass',
  'vines',
  'fireflies',
  'ascii',
  'stitching',
  'typewriter',
  'barbed-wire',
  'rope',
  'scallop',
  'psychedelic',
  'plasma',
];

test('registry exposes all 17 effect names', async ({ page }) => {
  await page.goto('/test/test-page.html');
  const keys = await page.evaluate(async () => {
    const m = await import('/src/registry.js');
    return m.EXTREME;
  });
  expect(keys.sort()).toEqual([...ALL_EFFECTS].sort());
});

for (const name of ALL_EFFECTS) {
  test(`reduced-motion: ${name} mounts an overlay element`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/test/test-page.html');
    await page.evaluate((n) => document.getElementById('bw').setAttribute('effect', n), name);
    await page.waitForTimeout(150);
    const ok = await page.evaluate(() => {
      const host = document.getElementById('bw');
      return !!host.querySelector('canvas[data-border-wc], svg[data-border-wc]');
    });
    expect(ok).toBe(true);
  });
}
