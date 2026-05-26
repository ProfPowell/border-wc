import { roundedRectSampler } from '../perimeter.js';
import { resolveRadius } from '../params.js';
import { toRGBA } from '../color.js';

export function createSparks(host, params) {
  const canvas = document.createElement('canvas');
  canvas.setAttribute('data-border-wc', 'sparks');
  Object.assign(canvas.style, {
    position: 'absolute',
    inset: '0',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
  });
  host.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  const color = toRGBA(
    params.color === 'currentColor' ? getComputedStyle(host).color : params.color
  );

  let sampler = () => [0, 0];
  let dpr = 1;
  const fit = () => {
    const rect = host.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    sampler = roundedRectSampler({
      width: rect.width,
      height: rect.height,
      radius: resolveRadius(host, params),
      inset: params.thickness / 2,
    });
  };
  fit();

  const N = 24;
  const parts = Array.from({ length: N }, (_, i) => ({ t: i / N, v: 0.02 + Math.random() * 0.02 }));
  let raf = 0;
  const frame = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = color;
    const dt = params.reduce ? 0 : 1;
    for (const p of parts) {
      p.t = (p.t + p.v * 0.016 * dt) % 1;
      const [x, y] = sampler(p.t);
      ctx.beginPath();
      ctx.arc(x * dpr, y * dpr, params.thickness * dpr, 0, Math.PI * 2);
      ctx.fill();
    }
    raf = params.reduce ? 0 : requestAnimationFrame(frame);
  };
  frame();

  const io = new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !raf && !params.reduce) raf = requestAnimationFrame(frame);
    else if (!e.isIntersecting && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  });
  io.observe(host);
  const ro = new ResizeObserver(fit);
  ro.observe(host);
  return () => {
    cancelAnimationFrame(raf);
    io.disconnect();
    ro.disconnect();
    canvas.remove();
  };
}
