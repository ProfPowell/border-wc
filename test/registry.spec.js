import { test, expect } from '@playwright/test';

// Current effect catalog: 19 from the CSS-first refresh + scoop/zigzag/wave.
const ALL_EFFECTS = [
  'aurora',
  'barber',
  'chroma',
  'wings',
  'lightning',
  'neon',
  'glitch',
  'ascii',
  'stitching',
  'typewriter',
  'barbed-wire',
  'rope',
  'scallop',
  'scoop',
  'zigzag',
  'wave',
  'psychedelic',
  'plasma',
  'sparks',
  'marquee',
  'washi',
  'squiggle',
  'draw',
];

// All modules exist; the reduce-motion sweep exercises each.
const IMPLEMENTED = ALL_EFFECTS;

test(`registry exposes all ${ALL_EFFECTS.length} effect names`, async ({ page }) => {
  await page.goto('/test/test-page.html');
  const keys = await page.evaluate(async () => {
    const m = await import('/src/registry.js');
    return m.EXTREME;
  });
  expect(keys.sort()).toEqual([...ALL_EFFECTS].sort());
});

for (const name of IMPLEMENTED) {
  test(`reduced-motion: ${name} mounts an overlay element`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/test/test-page.html');
    await page.evaluate((n) => document.getElementById('bw').setAttribute('effect', n), name);
    await page.waitForTimeout(150);
    const ok = await page.evaluate(() => {
      const host = document.getElementById('bw');
      // Effects mount either a child overlay (svg/canvas/div carrying
      // data-border-wc) OR mutate the host directly (chroma sets
      // data-border-wc-chroma on the host).
      return (
        !!host.querySelector('[data-border-wc]') || host.hasAttribute('data-border-wc-chroma')
      );
    });
    expect(ok).toBe(true);
  });
}
