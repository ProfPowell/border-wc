import { roundedRectSampler } from '../perimeter.js';
import { resolveRadius } from '../params.js';
import { attachCanvas } from './_helpers.js';
import { toRGBA } from '../color.js';

export function createFireflies(host, params) {
  const { canvas, ctx, fit, dpr, rect } = attachCanvas(host, 'fireflies');
  const baseColor = toRGBA(params.color === 'currentColor' ? '#ffe27a' : params.color);

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

  const N = 10;
  const parts = Array.from({ length: N }, (_, i) => ({
    t: i / N + Math.random() * 0.02,
    v: 0.004 + Math.random() * 0.005,
    blink: Math.random() * Math.PI * 2,
  }));
  let raf = 0;
  function frame(now) {
    const d = dpr();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.shadowColor = baseColor;
    ctx.shadowBlur = 12 * d;
    ctx.fillStyle = baseColor;
    const t = now * 0.001;
    for (const p of parts) {
      if (!params.reduce) p.t = (p.t + p.v) % 1;
      const [x, y] = sampler(p.t);
      const alpha = params.reduce ? 0.8 : 0.5 + 0.5 * Math.sin(t * 1.4 + p.blink);
      ctx.globalAlpha = Math.max(0.15, alpha);
      ctx.beginPath();
      ctx.arc(x * d, y * d, (params.thickness + 1.5) * d, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
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
