import { attachOverlaySvg, SVG_NS } from './_helpers.js';

// Scallop border: half-circle bumps placed along the perimeter. Edges get
// evenly-spaced bumps; each corner gets one bump on its outward bisector so
// the four corners stay clean instead of clustering. Sharp-corner postage-
// stamp geometry; the `radius` param is intentionally not used here.
export function createScallop(host, params) {
  const svg = attachOverlaySvg(host, 'scallop');
  const color = params.color === 'currentColor' ? 'currentColor' : params.color;
  const g = document.createElementNS(SVG_NS, 'g');
  svg.appendChild(g);

  const fit = () => {
    const r = host.getBoundingClientRect();
    const inset = params.thickness / 2;
    const w = r.width;
    const h = r.height;
    const bumpR = Math.max(6, params.thickness * 1.5);

    const corners = [
      { pos: [inset, inset], rot: 135 }, // TL — bisector points NW
      { pos: [w - inset, inset], rot: 225 }, // TR
      { pos: [w - inset, h - inset], rot: 315 }, // BR
      { pos: [inset, h - inset], rot: 45 }, // BL
    ];
    const edges = [
      { from: corners[0].pos, to: corners[1].pos, rot: 180 }, // top
      { from: corners[1].pos, to: corners[2].pos, rot: 270 }, // right
      { from: corners[2].pos, to: corners[3].pos, rot: 0 }, // bottom
      { from: corners[3].pos, to: corners[0].pos, rot: 90 }, // left
    ];

    const placements = []; // [{x, y, rot}] in clockwise order for sequencing
    for (let ci = 0; ci < 4; ci++) {
      // Corner bump.
      placements.push({ x: corners[ci].pos[0], y: corners[ci].pos[1], rot: corners[ci].rot });
      // Edge bumps from this corner to the next, leaving `bumpR` of clearance
      // on each end so the corner bump and the first/last edge bump don't overlap.
      const edge = edges[ci];
      const dx = edge.to[0] - edge.from[0];
      const dy = edge.to[1] - edge.from[1];
      const len = Math.hypot(dx, dy);
      const usable = len - 2 * bumpR;
      const N = Math.max(0, Math.floor(usable / (2 * bumpR)));
      if (N === 0) continue;
      const span = N * 2 * bumpR;
      const start = (len - span) / 2; // even slack on both sides of the run
      const ux = dx / len;
      const uy = dy / len;
      for (let i = 0; i < N; i++) {
        const d = start + bumpR + i * 2 * bumpR;
        placements.push({
          x: edge.from[0] + ux * d,
          y: edge.from[1] + uy * d,
          rot: edge.rot,
        });
      }
    }

    g.innerHTML = '';
    const total = placements.length || 1;
    placements.forEach((p, i) => {
      const bump = document.createElementNS(SVG_NS, 'path');
      bump.setAttribute('d', `M -${bumpR} 0 A ${bumpR} ${bumpR} 0 0 1 ${bumpR} 0 Z`);
      bump.setAttribute('fill', color);
      bump.setAttribute('transform', `translate(${p.x} ${p.y}) rotate(${p.rot})`);
      if (!params.reduce) {
        bump.style.opacity = '0';
        bump.style.transition = `opacity 80ms ease-out ${((i / total) * params.speed) | 0}ms`;
      }
      g.appendChild(bump);
    });
    if (!params.reduce) {
      void svg.getBoundingClientRect();
      g.querySelectorAll('path').forEach((p) => (p.style.opacity = '1'));
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
