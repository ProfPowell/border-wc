import { test, expect } from '@playwright/test';

// Final set of 19 effects after the CSS-first refresh.
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
  'psychedelic',
  'plasma',
  'sparks',
  'marquee',
  'squiggle',
  'draw',
];

// Effects whose modules exist *right now*. Tasks 2–9 grow this list until it
// equals ALL_EFFECTS at end of refactor. Keep the lists in sync as new modules
// land — otherwise the reduce-motion sweep will throw on missing imports.
const IMPLEMENTED = [
  'lightning',
  'glitch',
  'ascii',
  'stitching',
  'typewriter',
  'barbed-wire',
  'rope',
  'scallop',
  'psychedelic',
  'plasma',
  'sparks',
  'squiggle',
  'draw',
];

test('registry exposes all 19 effect names', async ({ page }) => {
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
      return !!host.querySelector(
        'canvas[data-border-wc], svg[data-border-wc], [data-border-wc-chroma]'
      );
    });
    expect(ok).toBe(true);
  });
}
