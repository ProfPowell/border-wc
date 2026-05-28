import { roundedRectPath, roundedRectPerimeter } from '../perimeter.js';
import { resolveRadius } from '../params.js';
import { attachOverlaySvg, SVG_NS } from './_helpers.js';

// Twisted rope: two offset strands stroked with a tight dash to suggest a twist.
export function createRope(host, params) {
  const svg = attachOverlaySvg(host, 'rope');
  const color = params.color === 'currentColor' ? '#b08a52' : params.color;
  const strands = [];
  for (let i = 0; i < 2; i++) {
    const p = document.createElementNS(SVG_NS, 'path');
    p.setAttribute('fill', 'none');
    p.setAttribute('stroke', i === 0 ? color : 'rgba(255,255,255,0.35)');
    p.setAttribute('stroke-width', String(Math.max(2, params.thickness)));
    p.setAttribute('stroke-linecap', 'butt');
    const dash = Math.max(4, params.thickness * 1.2);
    p.setAttribute('stroke-dasharray', `${dash} ${dash}`);
    p.setAttribute('stroke-dashoffset', i === 0 ? '0' : String(dash));
    svg.appendChild(p);
    strands.push(p);
  }

  const fit = () => {
    const r = host.getBoundingClientRect();
    const radius = resolveRadius(host, params);
    const inset = params.thickness / 2;
    const d = roundedRectPath({ width: r.width, height: r.height, radius, inset });
    const len = roundedRectPerimeter({ width: r.width, height: r.height, radius, inset }) || 1;
    strands.forEach((p, i) => {
      p.setAttribute('d', d);
      p.style.transition = 'none';
      const off = i === 0 ? 0 : Math.max(4, params.thickness * 1.2);
      p.style.strokeDashoffset = params.reduce ? String(off) : String(off + len);
    });
    if (!params.reduce) {
      void svg.getBoundingClientRect();
      strands.forEach((p, i) => {
        const off = i === 0 ? 0 : Math.max(4, params.thickness * 1.2);
        p.style.transition = `stroke-dashoffset ${params.speed}ms linear`;
        p.style.strokeDashoffset = String(off);
      });
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
