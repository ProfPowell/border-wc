import { roundedRectPath, roundedRectPerimeter, roundedRectSampler } from '../perimeter.js';
import { resolveRadius } from '../params.js';
import { attachOverlaySvg, SVG_NS } from './_helpers.js';

// Barbed wire: solid stroked path + four-pointed barb stars rotated to the
// path tangent at regular intervals. Reveal draws the wire then pops barbs.
export function createBarbedWire(host, params) {
  const svg = attachOverlaySvg(host, 'barbed-wire');
  const color = params.color === 'currentColor' ? '#9a8a78' : params.color;
  const wire = document.createElementNS(SVG_NS, 'path');
  wire.setAttribute('fill', 'none');
  wire.setAttribute('stroke', color);
  wire.setAttribute('stroke-width', String(Math.max(1.5, params.thickness * 0.6)));
  wire.setAttribute('stroke-linecap', 'round');
  svg.appendChild(wire);
  const barbs = document.createElementNS(SVG_NS, 'g');
  svg.appendChild(barbs);

  const fit = () => {
    const r = host.getBoundingClientRect();
    const radius = resolveRadius(host, params);
    const inset = params.thickness / 2;
    wire.setAttribute(
      'd',
      roundedRectPath({ width: r.width, height: r.height, radius, inset })
    );
    const len =
      roundedRectPerimeter({ width: r.width, height: r.height, radius, inset }) || 1;
    const sampler = roundedRectSampler({
      width: r.width,
      height: r.height,
      radius,
      inset,
    });
    wire.style.transition = 'none';
    wire.style.strokeDasharray = String(len);
    wire.style.strokeDashoffset = params.reduce ? '0' : String(len);

    barbs.innerHTML = '';
    const BARB_COUNT = Math.max(8, Math.round(len / 60));
    for (let i = 0; i < BARB_COUNT; i++) {
      const t = i / BARB_COUNT;
      const [x, y] = sampler(t);
      const [x2, y2] = sampler((t + 0.001) % 1);
      const ang = (Math.atan2(y2 - y, x2 - x) * 180) / Math.PI;
      const s = Math.max(6, params.thickness * 1.5);
      const barb = document.createElementNS(SVG_NS, 'path');
      barb.setAttribute('d', `M -${s} 0 L ${s} 0 M 0 -${s} L 0 ${s}`);
      barb.setAttribute('stroke', color);
      barb.setAttribute('stroke-width', String(Math.max(1, params.thickness * 0.5)));
      barb.setAttribute('stroke-linecap', 'round');
      barb.setAttribute(
        'transform',
        `translate(${x} ${y}) rotate(${ang + 45})`
      );
      if (!params.reduce) {
        barb.style.opacity = '0';
        barb.style.transition = `opacity 80ms ease-out ${((t * params.speed) | 0)}ms`;
      }
      barbs.appendChild(barb);
    }
    if (!params.reduce) {
      void wire.getBoundingClientRect();
      wire.style.transition = `stroke-dashoffset ${params.speed}ms ease-out`;
      wire.style.strokeDashoffset = '0';
      barbs.querySelectorAll('path').forEach((p) => (p.style.opacity = '1'));
    }
  };
  fit();

  const ro = new ResizeObserver(fit);
  ro.observe(host);
  return () => {
    ro.disconnect();
    svg.remove();
  };
}
