import { attachOverlaySvg, SVG_NS, ensureStyles } from './_helpers.js';

const MARCH_CSS = `
  @keyframes bwc-zigzag-march { to { stroke-dashoffset: var(--bwc-zigzag-dist, -64); } }
`;

// Sawtooth perimeter. A single stroked polyline traces the rect with
// triangle-wave teeth on each edge; optional dasharray + offset gives a
// marching-stripes animation.
export function createZigzag(host, params) {
  const svg = attachOverlaySvg(host, 'zigzag');
  ensureStyles('zigzag', MARCH_CSS);
  const color = params.color === 'currentColor' ? 'currentColor' : params.color;
  const path = document.createElementNS(SVG_NS, 'path');
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', color);
  path.setAttribute('stroke-width', String(Math.max(1, params.thickness)));
  path.setAttribute('stroke-linejoin', 'miter');
  svg.appendChild(path);

  const fit = () => {
    const r = host.getBoundingClientRect();
    const inset = params.thickness / 2;
    const w = r.width;
    const h = r.height;
    const amp = Math.max(4, params.thickness * 3);
    const step = amp * 2; // 90° teeth (45° on each side)
    const pts = [];
    const addEdge = (x0, y0, x1, y1, nx, ny) => {
      const dx = x1 - x0;
      const dy = y1 - y0;
      const len = Math.hypot(dx, dy);
      const n = Math.max(2, Math.floor(len / step));
      const tx = dx / len;
      const ty = dy / len;
      const seg = len / n;
      pts.push([x0, y0]);
      for (let i = 0; i < n; i++) {
        const peak = (i + 0.5) * seg;
        pts.push([x0 + tx * peak + nx * amp, y0 + ty * peak + ny * amp]);
        const base = (i + 1) * seg;
        pts.push([x0 + tx * base, y0 + ty * base]);
      }
    };
    const TL = [inset, inset];
    const TR = [w - inset, inset];
    const BR = [w - inset, h - inset];
    const BL = [inset, h - inset];
    addEdge(TL[0], TL[1], TR[0], TR[1], 0, -1);
    addEdge(TR[0], TR[1], BR[0], BR[1], 1, 0);
    addEdge(BR[0], BR[1], BL[0], BL[1], 0, 1);
    addEdge(BL[0], BL[1], TL[0], TL[1], -1, 0);
    const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]} ${p[1]}`).join(' ') + ' Z';
    path.setAttribute('d', d);

    if (!params.reduce && params.animate !== false) {
      const dash = Math.max(6, params.thickness * 4);
      const gap = dash * 0.6;
      path.setAttribute('stroke-dasharray', `${dash} ${gap}`);
      path.style.setProperty('--bwc-zigzag-dist', `-${(dash + gap) * 4}px`);
      path.style.animation = `bwc-zigzag-march ${Math.max(600, params.speed)}ms linear infinite`;
    } else {
      path.removeAttribute('stroke-dasharray');
      path.style.animation = 'none';
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
