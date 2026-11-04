import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { EXTREME } from '../src/registry.js';

const read = (f) => readFileSync(f, 'utf8');

test('README lists every effect', () => {
  const readme = read('README.md');
  for (const effect of EXTREME) expect(readme, effect).toContain(`\`${effect}\``);
});

test('API catalog has a row for every effect', () => {
  const api = read('docs/api.html');
  for (const effect of EXTREME) expect(api, effect).toContain(`<tr><td><code>${effect}</code>`);
});

test('gallery has a card for every effect and accurate tab counts', () => {
  const gallery = read('docs/index.html');
  for (const effect of EXTREME) {
    expect(gallery, effect).toContain(`data-border-effect="${effect}"`);
  }
  for (const [, group, count] of gallery.matchAll(
    /class="group-tab"[^>]*data-group="(\w+)"[^>]*>[^<]*<span class="count">(\d+)</g
  )) {
    const cards = gallery.match(new RegExp(`effect-card" data-group="${group}"`, 'g')) ?? [];
    expect(cards.length, group).toBe(Number(count));
  }
});

test('no doc states a stale effect count', () => {
  for (const file of ['README.md', 'docs/index.html', 'docs/api.html', 'docs/gallery.js']) {
    const text = read(file);
    expect(text, file).not.toMatch(/thirty-two|nineteen|\b32 (CSS|effect)/i);
  }
});

test('docs name the base effects vanilla-breeze actually ships', () => {
  expect(read('docs/api.html')).not.toContain('corner-trace');
  expect(read('src/registry.js')).not.toContain('corner-trace');
});

test('README documents the full element API', () => {
  const readme = read('README.md');
  for (const term of ['`trigger`', '`eager`', 'refresh()', 'data-motion-reduced']) {
    expect(readme, term).toContain(term);
  }
});

test('docs give jsDelivr users a binder path that resolves', () => {
  const url = 'cdn.jsdelivr.net/npm/@profpowell/border-wc/dist/data-border-effect.js';
  expect(read('README.md')).toContain(url);
  expect(read('docs/api.html')).toContain(url);
});
