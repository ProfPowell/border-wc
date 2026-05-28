import { attachOverlaySvg, SVG_NS, ensureStyles } from './_helpers.js';

const MARCH_CSS = `
  @keyframes bwc-wave-march { to { stroke-dashoffset: var(--bwc-wave-dist, -64); } }
`;

// Smooth sine perimeter. A single stroked path traces the rect with two
// quad-bezier arcs per wavelength on each edge (outward then inward), giving
// a continuous in-and-out wave. Optional marching-dashes flow animation.
export function createWave(host, params) {
  const svg = attachOverlaySvg(host, 'wave');
  ensureStyles('wave', MARCH_CSS);
  const color = params.color === 'currentColor' ? 'currentColor' : params.color;
  const path = document.createElementNS(SVG_NS, 'path');
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', color);
  path.setAttribute('stroke-width', String(Math.max(1, params.thickness)));
  path.setAttribute('stroke-linecap', 'round');
  svg.appendChild(path);

  const fit = () => {
    const r = host.getBoundingClientRect();
    const inset = params.thickness / 2;
    const w = r.width;
    const h = r.height;
    const amp = Math.max(4, params.thickness * 2.5);
    const wavelength = amp * 4;
    const cmds = [];
    const addEdge = (x0, y0, x1, y1, nx, ny, isFirst) => {
      const dx = x1 - x0;
      const dy = y1 - y0;
      const len = Math.hypot(dx, dy);
      const n = Math.max(2, Math.round(len / wavelength));
      const tx = dx / len;
      const ty = dy / len;
      const seg = len / n;
      if (isFirst) cmds.push(`M${x0} ${y0}`);
      for (let i = 0; i < n; i++) {
        const q1 = (i + 0.25) * seg;
        const q2 = (i + 0.5) * seg;
        const q3 = (i + 0.75) * seg;
        const q4 = (i + 1) * seg;
        const c1x = x0 + tx * q1 + nx * amp;
        const c1y = y0 + ty * q1 + ny * amp;
        const m1x = x0 + tx * q2;
        const m1y = y0 + ty * q2;
        const c2x = x0 + tx * q3 - nx * amp;
        const c2y = y0 + ty * q3 - ny * amp;
        const m2x = x0 + tx * q4;
        const m2y = y0 + ty * q4;
        cmds.push(`Q${c1x} ${c1y} ${m1x} ${m1y}`);
        cmds.push(`Q${c2x} ${c2y} ${m2x} ${m2y}`);
      }
    };
    const TL = [inset, inset];
    const TR = [w - inset, inset];
    const BR = [w - inset, h - inset];
    const BL = [inset, h - inset];
    addEdge(TL[0], TL[1], TR[0], TR[1], 0, -1, true);
    addEdge(TR[0], TR[1], BR[0], BR[1], 1, 0, false);
    addEdge(BR[0], BR[1], BL[0], BL[1], 0, 1, false);
    addEdge(BL[0], BL[1], TL[0], TL[1], -1, 0, false);
    cmds.push('Z');
    path.setAttribute('d', cmds.join(' '));

    if (!params.reduce && params.animate !== false) {
      const dash = Math.max(8, params.thickness * 5);
      const gap = dash * 0.7;
      path.setAttribute('stroke-dasharray', `${dash} ${gap}`);
      path.style.setProperty('--bwc-wave-dist', `-${(dash + gap) * 3}px`);
      path.style.animation = `bwc-wave-march ${Math.max(800, params.speed)}ms linear infinite`;
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
