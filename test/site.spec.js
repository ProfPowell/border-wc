import { test, expect } from '@playwright/test';

// The authored <html data-mode="dark"> is overwritten when vanilla-breeze boots,
// so assert on the picker, which only reflects the theme manager's real state.
const pickerChoice = (page) =>
  page.evaluate(() => document.querySelector('theme-picker input:checked')?.value);
const mode = (page) => page.evaluate(() => document.documentElement.dataset.mode);
const SITE = 'http://localhost:5181/docs/index.html';

// An OS light preference makes "stayed in auto" and "moved to dark" distinguishable.
test.use({ colorScheme: 'light' });

async function firstVisit(page) {
  await page.goto(SITE);
  await expect.poll(() => pickerChoice(page)).toBe('dark');
}

test('first visit defaults to dark', async ({ page }) => {
  await firstVisit(page);
  expect(await mode(page)).toBe('dark');
});

for (const [choice, expected] of [
  ['light', 'light'],
  ['auto', 'light'],
]) {
  test(`choosing ${choice} survives a reload`, async ({ page }) => {
    await firstVisit(page);
    await page.evaluate((v) => {
      document.querySelector(`theme-picker input[value="${v}"]`).click();
    }, choice);
    await expect.poll(() => mode(page)).toBe(expected);
    await page.waitForTimeout(300); // VBStore persists asynchronously.
    await page.reload();
    await page.waitForTimeout(1000); // Long enough for a wrong default to apply.
    expect(await pickerChoice(page)).toBe(choice);
    expect(await mode(page)).toBe(expected);
  });
}

async function washiBlend(page) {
  // The card is hidden until its gallery tab is active.
  await page.locator('#groupTabs .group-tab[data-group="decor"]').click();
  const host = page.locator('border-wc[effect="washi"]').first();
  await host.scrollIntoViewIfNeeded();
  const strip = host.locator('.bwc-strip').first();
  await expect(strip).toBeAttached();
  return strip.evaluate((el) => getComputedStyle(el).mixBlendMode);
}

test('washi drops multiply in dark mode and restores it when switched to light', async ({
  page,
}) => {
  await firstVisit(page);
  expect(await washiBlend(page)).toBe('normal');
  await page.evaluate(() => document.querySelector('theme-picker input[value="light"]').click());
  await expect.poll(() => mode(page)).toBe('light');
  expect(await washiBlend(page)).toBe('multiply');
});

test('washi drops multiply when auto resolves to an OS dark preference', async ({ page }) => {
  await firstVisit(page);
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.evaluate(() => document.querySelector('theme-picker input[value="auto"]').click());
  await expect.poll(() => pickerChoice(page)).toBe('auto');
  expect(await washiBlend(page)).toBe('normal');
});
