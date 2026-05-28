import { roundedRectSampler } from '../perimeter.js';
import { resolveRadius } from '../params.js';
import { attachOverlaySvg, SVG_NS } from './_helpers.js';

// ASCII-style boxed border drawn as monospace characters along the perimeter.
// Corner samples get + and edges get - or |, with a one-shot typewriter reveal.
export function createAscii(host, params) {
  const svg = attachOverlaySvg(host, 'ascii');
  const color = params.color === 'currentColor' ? 'currentColor' : params.color;
  const size = Math.max(10, params.thickness * 3);

  const fit = () => {
    const r = host.getBoundingClientRect();
    const radius = resolveRadius(host, params);
    const inset = params.thickness / 2;
    const sampler = roundedRectSampler({ width: r.width, height: r.height, radius, inset });
    // Step around the perimeter at ~size spacing
    const perim = 2 * (r.width + r.height);
    const N = Math.max(8, Math.floor(perim / size));
    svg.innerHTML = '';
    for (let i = 0; i < N; i++) {
      const t = i / N;
      const [x, y] = sampler(t);
      const [x2, y2] = sampler((t + 0.001) % 1);
      const dx = x2 - x;
      const dy = y2 - y;
      const corner =
        i === 0 ||
        i === Math.floor(N / 4) ||
        i === Math.floor(N / 2) ||
        i === Math.floor((3 * N) / 4);
      const ch = corner ? '+' : Math.abs(dx) > Math.abs(dy) ? '-' : '|';
      const txt = document.createElementNS(SVG_NS, 'text');
      txt.setAttribute('x', String(x));
      txt.setAttribute('y', String(y));
      txt.setAttribute('text-anchor', 'middle');
      txt.setAttribute('dominant-baseline', 'central');
      txt.setAttribute('font-family', 'ui-monospace, Menlo, Consolas, monospace');
      txt.setAttribute('font-size', String(size));
      txt.setAttribute('fill', color);
      txt.textContent = ch;
      if (!params.reduce) {
        txt.style.opacity = '0';
        txt.style.transition = `opacity 80ms linear ${(t * params.speed) | 0}ms`;
      }
      svg.appendChild(txt);
    }
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
