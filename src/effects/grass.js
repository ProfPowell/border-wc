import { roundedRectSampler } from '../perimeter.js';
import { resolveRadius } from '../params.js';
import { attachCanvas } from './_helpers.js';

export function createGrass(host, params) {
  const { canvas, ctx, fit, dpr, rect } = attachCanvas(host, 'grass');

  let sampler = () => [0, 0];
  const refit = () => {
    fit();
    const r = rect();
    sampler = roundedRectSampler({
      width: r.width,
      height: r.height,
      radius: resolveRadius(host, params),
      inset: params.thickness / 2,
    });
  };
  refit();

  const N = 80;
  const blades = Array.from({ length: N }, (_, i) => ({
    t: i / N,
    len: 8 + Math.random() * 16,
    sway: Math.random() * Math.PI * 2,
    phase: 0.4 + Math.random() * 0.6,
  }));
  const startMs = performance.now();
  const growMs = Math.max(200, params.speed / 2);

  function tangentNormal(t) {
    const dt = 0.001;
    const a = sampler((t - dt + 1) % 1);
    const b = sampler((t + dt) % 1);
    const tx = b[0] - a[0];
    const ty = b[1] - a[1];
    const L = Math.hypot(tx, ty) || 1;
    return { nx: ty / L, ny: -tx / L };
  }

  let raf = 0;
  function frame(now) {
    const d = dpr();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const t = (now - startMs) / 1000;
    const grow = params.reduce ? 1 : Math.min(1, (now - startMs) / growMs);
    for (const b of blades) {
      const [x, y] = sampler(b.t);
      const { nx, ny } = tangentNormal(b.t);
      const len = b.len * grow;
      const sway = params.reduce ? 0 : Math.sin(t * 0.8 + b.sway) * 0.5 * b.phase;
      const tipX = x + nx * len + sway * 8;
      const tipY = y + ny * len;
      const ctlX = x + nx * len * 0.5 + sway * 6;
      const ctlY = y + ny * len * 0.6;
      const g = ctx.createLinearGradient(x * d, y * d, tipX * d, tipY * d);
      g.addColorStop(0, '#1e6b2a');
      g.addColorStop(1, '#6fd06b');
      ctx.strokeStyle = g;
      ctx.lineWidth = 1.5 * d;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x * d, y * d);
      ctx.quadraticCurveTo(ctlX * d, ctlY * d, tipX * d, tipY * d);
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
