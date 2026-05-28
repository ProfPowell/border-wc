import { attachOverlaySvg, SVG_NS } from './_helpers.js';

// Concave half-circle bites cut into each edge — the inverse of scallop. A
// single stroked path traces the perimeter, dipping into the rect at every
// scoop position. One-shot reveal via stroke-dashoffset (like draw/rope).
export function createScoop(host, params) {
  const svg = attachOverlaySvg(host, 'scoop');
  const color = params.color === 'currentColor' ? 'currentColor' : params.color;
  const path = document.createElementNS(SVG_NS, 'path');
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', color);
  path.setAttribute('stroke-width', String(Math.max(1, params.thickness)));
  path.setAttribute('stroke-linejoin', 'round');
  path.setAttribute('stroke-linecap', 'round');
  svg.appendChild(path);

  const fit = () => {
    const r = host.getBoundingClientRect();
    const inset = params.thickness / 2;
    const w = r.width;
    const h = r.height;
    const scoopR = Math.max(6, params.thickness * 1.5);

    const cmds = [];
    const addEdge = (x0, y0, x1, y1, isFirst) => {
      const dx = x1 - x0;
      const dy = y1 - y0;
      const len = Math.hypot(dx, dy);
      const usable = Math.max(0, len - 2 * scoopR);
      const N = Math.max(1, Math.floor(usable / (2 * scoopR * 1.2)));
      const totalScoops = N * 2 * scoopR;
      const gap = N > 0 ? (usable - totalScoops) / (N + 1) : 0;
      const tx = dx / len;
      const ty = dy / len;
      if (isFirst) cmds.push(`M${x0} ${y0}`);
      let d = scoopR; // corner margin
      for (let i = 0; i < N; i++) {
        d += gap;
        cmds.push(`L${x0 + tx * d} ${y0 + ty * d}`);
        d += 2 * scoopR;
        // sweep-flag=0: arc bulges to the right of tangent in CW walk = into the rect.
        cmds.push(`A${scoopR} ${scoopR} 0 0 0 ${x0 + tx * d} ${y0 + ty * d}`);
      }
      cmds.push(`L${x1} ${y1}`);
    };
    const TL = [inset, inset];
    const TR = [w - inset, inset];
    const BR = [w - inset, h - inset];
    const BL = [inset, h - inset];
    addEdge(TL[0], TL[1], TR[0], TR[1], true);
    addEdge(TR[0], TR[1], BR[0], BR[1], false);
    addEdge(BR[0], BR[1], BL[0], BL[1], false);
    addEdge(BL[0], BL[1], TL[0], TL[1], false);
    cmds.push('Z');
    path.setAttribute('d', cmds.join(' '));

    const len = path.getTotalLength?.() || 2 * (w + h);
    path.style.transition = 'none';
    path.setAttribute('stroke-dasharray', String(len));
    path.style.strokeDashoffset = params.reduce ? '0' : String(len);
    if (!params.reduce) {
      void svg.getBoundingClientRect();
      path.style.transition = `stroke-dashoffset ${Math.max(400, params.speed)}ms ease-out`;
      path.style.strokeDashoffset = '0';
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
