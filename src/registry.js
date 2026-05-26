// Shared effect registry + host styling, used by <border-wc> and the
// data-border-effect binder so both resolve effects from one source.

// effect name → loader returning the effect's create() fn
export const EFFECTS = {
  draw: () => import('./effects/draw.js').then((m) => m.createDraw),
  squiggle: () => import('./effects/squiggle.js').then((m) => m.createSquiggle),
  sparks: () => import('./effects/sparks.js').then((m) => m.createSparks),
};

// Effect names the JS tier owns. The data-border-effect binder uses this to
// tell extreme values apart from base values (spin/pulse/march/hue-cycle/
// breathe/corner-trace), which vanilla-breeze CSS renders.
export const EXTREME = Object.keys(EFFECTS);

// Make an element a positioning context so absolute overlays fit it.
export function styleHost(host) {
  const cs = getComputedStyle(host);
  if (cs.position === 'static') host.style.position = 'relative';
  if (cs.display === 'inline') host.style.display = 'block';
}
