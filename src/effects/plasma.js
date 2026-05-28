import { roundedRectSampler } from '../perimeter.js';
import { resolveRadius } from '../params.js';
import { attachCanvas } from './_helpers.js';

// Plasma: hue-shifting glow drawn as a stroked path along the perimeter using
// 2d canvas, blurred via shadowBlur. Reduced-motion = static gradient stroke.
export function createPlasma(host, params) {
  const { canvas, ctx, fit, dpr, rect } = attachCanvas(host, 'plasma');

  let pts = [];
  const refit = () => {
    fit();
    const r = rect();
    const sampler = roundedRectSampler({
      width: r.width,
      height: r.height,
      radius: resolveRadius(host, params),
      inset: params.thickness / 2,
    });
    pts = [];
    const N = 180;
    for (let i = 0; i <= N; i++) pts.push(sampler(i / N));
  };
  refit();

  let raf = 0;
  const start = performance.now();
  function frame(now) {
    const d = dpr();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const t = (now - start) / 1000;
    ctx.lineWidth = Math.max(2, params.thickness) * d;
    ctx.lineCap = 'round';
    ctx.shadowBlur = 24 * d;
    // Draw segment-by-segment so each gets its own hue stop.
    for (let i = 0; i < pts.length - 1; i++) {
      const f = i / pts.length;
      const hue = params.reduce ? (f * 360) % 360 : ((t * 60 + f * 360) | 0) % 360;
      const color = `hsl(${hue} 100% 60%)`;
      ctx.strokeStyle = color;
      ctx.shadowColor = color;
      ctx.beginPath();
      ctx.moveTo(pts[i][0] * d, pts[i][1] * d);
      ctx.lineTo(pts[i + 1][0] * d, pts[i + 1][1] * d);
      ctx.stroke();
    }
    raf = params.reduce ? 0 : requestAnimationFrame(frame);
  }
  frame(performance.now());

  const ro = new ResizeObserver(refit);
  ro.observe(host);
  return () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    canvas.remove();
  };
}
