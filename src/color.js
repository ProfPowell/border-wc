// Resolve ANY CSS color (oklch/lab/hsl/named/hex/rgb) to an "rgb(...)"/"rgba(...)"
// string a Canvas 2D context can use, via 1px render + readback. SVG can use the
// raw CSS color directly; this is for the Canvas (sparks) effect.
let ctx;
const cache = new Map();
export function toRGBA(css) {
  if (!css) return 'rgba(0,0,0,0)';
  const key = String(css).trim();
  if (cache.has(key)) return cache.get(key);
  if (!ctx) ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  ctx.clearRect(0, 0, 1, 1);
  ctx.fillStyle = '#000';
  ctx.fillStyle = key;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
  const out =
    a === 255 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(3)})`;
  cache.set(key, out);
  return out;
}
