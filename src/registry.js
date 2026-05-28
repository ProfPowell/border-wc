// Shared effect registry + host styling, used by <border-wc> and the
// data-border-effect binder so both resolve effects from one source.

// effect name → loader returning the effect's create() fn
export const EFFECTS = {
  draw: () => import('./effects/draw.js').then((m) => m.createDraw),
  squiggle: () => import('./effects/squiggle.js').then((m) => m.createSquiggle),
  sparks: () => import('./effects/sparks.js').then((m) => m.createSparks),
  lightning: () => import('./effects/lightning.js').then((m) => m.createLightning),
  flames: () => import('./effects/flames.js').then((m) => m.createFlames),
  glitch: () => import('./effects/glitch.js').then((m) => m.createGlitch),
  grass: () => import('./effects/grass.js').then((m) => m.createGrass),
  vines: () => import('./effects/vines.js').then((m) => m.createVines),
  fireflies: () => import('./effects/fireflies.js').then((m) => m.createFireflies),
  ascii: () => import('./effects/ascii.js').then((m) => m.createAscii),
  stitching: () => import('./effects/stitching.js').then((m) => m.createStitching),
  typewriter: () => import('./effects/typewriter.js').then((m) => m.createTypewriter),
  'barbed-wire': () => import('./effects/barbed-wire.js').then((m) => m.createBarbedWire),
  rope: () => import('./effects/rope.js').then((m) => m.createRope),
  scallop: () => import('./effects/scallop.js').then((m) => m.createScallop),
  psychedelic: () => import('./effects/psychedelic.js').then((m) => m.createPsychedelic),
  plasma: () => import('./effects/plasma.js').then((m) => m.createPlasma),
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
