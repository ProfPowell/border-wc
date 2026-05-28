import { roundedRectSampler } from '../perimeter.js';
import { resolveRadius } from '../params.js';
import { attachCanvas } from './_helpers.js';

export function createFlames(host, params) {
  const { canvas, ctx, fit, dpr, rect } = attachCanvas(host, 'flames');

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

  const N = 60;
  function spawn(t) {
    return {
      t,
      life: 0,
      max: 0.6 + Math.random() * 0.6,
      dx: (Math.random() - 0.5) * 0.3,
      dy: -0.8 - Math.random() * 0.8,
    };
  }
  const parts = Array.from({ length: N }, (_, i) => spawn(i / N));
  function colorAt(k) {
    if (k < 0.33) return `rgba(255, ${Math.round(80 + k * 120)}, 0, ${1 - k * 0.5})`;
    if (k < 0.66) return `rgba(255, ${Math.round(160 + (k - 0.33) * 250)}, 0, ${1 - k * 0.5})`;
    return `rgba(255, 230, ${Math.round((k - 0.66) * 200)}, ${Math.max(0, 1 - k)})`;
  }

  let raf = 0;
  function frame() {
    const d = dpr();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'lighter';
    for (const p of parts) {
      p.life += 0.016;
      if (p.life > p.max) Object.assign(p, spawn(Math.random()));
      const [x, y] = sampler(p.t);
      const offX = p.dx * p.life * 24;
      const offY = p.dy * p.life * 16;
      const r = (2 + p.life * 6) * d * params.thickness * 0.5;
      ctx.fillStyle = colorAt(p.life / p.max);
      ctx.beginPath();
      ctx.arc((x + offX) * d, (y + offY) * d, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
    raf = params.reduce ? 0 : requestAnimationFrame(frame);
  }
  frame();

  const ro = new ResizeObserver(refit);
  ro.observe(host);
  return () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    canvas.remove();
  };
}
