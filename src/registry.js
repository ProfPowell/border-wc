// Shared effect registry + host styling, used by <border-wc> and the
// data-border-effect binder so both resolve effects from one source.

// effect name → loader returning the effect's create() fn
export const EFFECTS = {
  // Modern CSS
  aurora: () => import('./effects/aurora.js').then((m) => m.createAurora),
  barber: () => import('./effects/barber.js').then((m) => m.createBarber),
  chroma: () => import('./effects/chroma.js').then((m) => m.createChroma),
  wings: () => import('./effects/wings.js').then((m) => m.createWings),
  // Energy
  lightning: () => import('./effects/lightning.js').then((m) => m.createLightning),
  neon: () => import('./effects/neon.js').then((m) => m.createNeon),
  glitch: () => import('./effects/glitch.js').then((m) => m.createGlitch),
  // Retro / Craft
  ascii: () => import('./effects/ascii.js').then((m) => m.createAscii),
  stitching: () => import('./effects/stitching.js').then((m) => m.createStitching),
  typewriter: () => import('./effects/typewriter.js').then((m) => m.createTypewriter),
  // Pattern
  'barbed-wire': () => import('./effects/barbed-wire.js').then((m) => m.createBarbedWire),
  rope: () => import('./effects/rope.js').then((m) => m.createRope),
  scallop: () => import('./effects/scallop.js').then((m) => m.createScallop),
  // Trippy
  psychedelic: () => import('./effects/psychedelic.js').then((m) => m.createPsychedelic),
  plasma: () => import('./effects/plasma.js').then((m) => m.createPlasma),
  // Marquee
  sparks: () => import('./effects/sparks.js').then((m) => m.createSparks),
  marquee: () => import('./effects/marquee.js').then((m) => m.createMarquee),
  // Originals
  squiggle: () => import('./effects/squiggle.js').then((m) => m.createSquiggle),
  draw: () => import('./effects/draw.js').then((m) => m.createDraw),
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
