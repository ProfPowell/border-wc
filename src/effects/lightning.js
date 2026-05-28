import { roundedRectSampler } from '../perimeter.js';
import { resolveRadius } from '../params.js';
import { attachCanvas } from './_helpers.js';
import { toRGBA } from '../color.js';

export function createLightning(host, params) {
  const { canvas, ctx, fit, dpr, rect } = attachCanvas(host, 'lightning');
  const color = toRGBA(
    params.color === 'currentColor' ? getComputedStyle(host).color : params.color
  );

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

  function drawBolt(a, b, jitter, depth) {
    const d = dpr();
    if (depth === 0 || Math.hypot(b[0] - a[0], b[1] - a[1]) < 4) {
      ctx.beginPath();
      ctx.moveTo(a[0] * d, a[1] * d);
      ctx.lineTo(b[0] * d, b[1] * d);
      ctx.stroke();
      return;
    }
    const midX = (a[0] + b[0]) / 2 + (Math.random() - 0.5) * jitter;
    const midY = (a[1] + b[1]) / 2 + (Math.random() - 0.5) * jitter;
    const mid = [midX, midY];
    drawBolt(a, mid, jitter / 2, depth - 1);
    drawBolt(mid, b, jitter / 2, depth - 1);
    if (Math.random() < 0.35 && depth > 2) {
      const fork = [
        midX + (Math.random() - 0.5) * jitter * 1.5,
        midY + (Math.random() - 0.5) * jitter * 1.5,
      ];
      drawBolt(mid, fork, jitter / 2, depth - 2);
    }
  }

  let raf = 0;
  let lastBolt = 0;
  const interval = Math.max(80, params.speed / 4);
  function frame(now) {
    const d = dpr();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = color;
    ctx.lineWidth = params.thickness * d;
    ctx.lineCap = 'round';
    ctx.shadowColor = color;
    ctx.shadowBlur = 8 * d;
    if (now - lastBolt > interval) {
      const a = sampler(Math.random());
      const b = sampler(Math.random());
      drawBolt(a, b, 24, 6);
      lastBolt = now;
    }
    raf = requestAnimationFrame(frame);
  }

  if (params.reduce) {
    const d = dpr();
    ctx.strokeStyle = color;
    ctx.lineWidth = params.thickness * d;
    ctx.beginPath();
    const N = 96;
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const [x, y] = sampler(t);
      const jx = (Math.random() - 0.5) * 4;
      const jy = (Math.random() - 0.5) * 4;
      if (i === 0) ctx.moveTo((x + jx) * d, (y + jy) * d);
      else ctx.lineTo((x + jx) * d, (y + jy) * d);
    }
    ctx.closePath();
    ctx.stroke();
  } else {
    raf = requestAnimationFrame(frame);
  }

  const ro = new ResizeObserver(refit);
  ro.observe(host);
  return () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    canvas.remove();
  };
}
