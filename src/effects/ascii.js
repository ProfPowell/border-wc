import { resolveRadius } from '../params.js';
import { attachOverlaySvg, SVG_NS } from './_helpers.js';

// ASCII-style boxed border drawn as monospace characters along the perimeter.
// `+` sits at each of the four corners; `-` and `|` fill the edges. Glyphs
// reveal in clockwise order from the top-left for the typewriter look.
export function createAscii(host, params) {
  const svg = attachOverlaySvg(host, 'ascii');
  const color = params.color === 'currentColor' ? 'currentColor' : params.color;
  const size = Math.max(10, params.thickness * 3);

  const make = (x, y, ch) => {
    const txt = document.createElementNS(SVG_NS, 'text');
    txt.setAttribute('x', String(x));
    txt.setAttribute('y', String(y));
    txt.setAttribute('text-anchor', 'middle');
    txt.setAttribute('dominant-baseline', 'central');
    txt.setAttribute('font-family', 'ui-monospace, Menlo, Consolas, monospace');
    txt.setAttribute('font-size', String(size));
    txt.setAttribute('fill', color);
    txt.textContent = ch;
    svg.appendChild(txt);
    return txt;
  };

  const fit = () => {
    const r = host.getBoundingClientRect();
    const inset = Math.max(params.thickness / 2, resolveRadius(host, params) * 0.3);
    const w = r.width;
    const h = r.height;
    svg.innerHTML = '';
    const glyphs = [];
    // 4 corners — `+` at the visual corner of the bounding box (after inset).
    const corners = [
      [inset, inset], // TL
      [w - inset, inset], // TR
      [w - inset, h - inset], // BR
      [inset, h - inset], // BL
    ];
    // Walk clockwise: TL → top edge → TR → right edge → BR → bottom edge → BL → left edge.
    const pushEdge = (a, b, axis) => {
      const len = axis === 'x' ? Math.abs(b[0] - a[0]) : Math.abs(b[1] - a[1]);
      const N = Math.max(0, Math.floor((len - size) / size));
      if (N === 0) return;
      const step = len / (N + 1);
      const sign = axis === 'x' ? Math.sign(b[0] - a[0]) : Math.sign(b[1] - a[1]);
      for (let i = 1; i <= N; i++) {
        const x = axis === 'x' ? a[0] + sign * step * i : a[0];
        const y = axis === 'y' ? a[1] + sign * step * i : a[1];
        glyphs.push([x, y, axis === 'x' ? '-' : '|']);
      }
    };
    glyphs.push([...corners[0], '+']);
    pushEdge(corners[0], corners[1], 'x');
    glyphs.push([...corners[1], '+']);
    pushEdge(corners[1], corners[2], 'y');
    glyphs.push([...corners[2], '+']);
    pushEdge(corners[2], corners[3], 'x');
    glyphs.push([...corners[3], '+']);
    pushEdge(corners[3], corners[0], 'y');

    const total = glyphs.length || 1;
    glyphs.forEach(([x, y, ch], i) => {
      const el = make(x, y, ch);
      if (!params.reduce) {
        el.style.opacity = '0';
        el.style.transition = `opacity 80ms linear ${((i / total) * params.speed) | 0}ms`;
      }
    });
    if (!params.reduce) {
      void svg.getBoundingClientRect();
      svg.querySelectorAll('text').forEach((t) => (t.style.opacity = '1'));
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
