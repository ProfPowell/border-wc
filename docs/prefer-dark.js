// First-load default: prefer dark (presets pop on dark backgrounds). Only a first
// visit is changed: any stored mode, including an explicit Auto, is the visitor's
// choice. Clicking the radio routes through theme-picker, which saves the mode.
// Shared by the gallery and the API page (docs-entry.js) and the demos hub.
import { VBStore } from 'vanilla-breeze';

export async function preferDarkByDefault() {
  const stored = await VBStore.get('theme', 'current');
  if (stored?.mode) return;
  const dark = document.querySelector('theme-picker input[type="radio"][value="dark"]');
  if (dark) dark.click();
  else document.documentElement.dataset.mode = 'dark';
}

window.addEventListener('load', preferDarkByDefault, { once: true });
