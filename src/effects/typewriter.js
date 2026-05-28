import { roundedRectSampler } from '../perimeter.js';
import { resolveRadius } from '../params.js';
import { attachOverlaySvg, SVG_NS } from './_helpers.js';

// Text border: characters from the host's data-text attribute (or "* "
// fallback) typed one-by-one around the perimeter.
export function createTypewriter(host, params) {
  const svg = attachOverlaySvg(host, 'typewriter');
  const color = params.color === 'currentColor' ? 'currentColor' : params.color;
  const fontSize = Math.max(10, params.thickness * 3);
  const text = host.getAttribute('data-text') || '* ';
  const chars = [...text];

  const fit = () => {
    const r = host.getBoundingClientRect();
    const radius = resolveRadius(host, params);
    const inset = params.thickness / 2;
    const sampler = roundedRectSampler({ width: r.width, height: r.height, radius, inset });
    const perim = 2 * (r.width + r.height);
    const N = Math.max(8, Math.floor(perim / (fontSize * 0.65)));
    svg.innerHTML = '';
    for (let i = 0; i < N; i++) {
      const t = i / N;
      const [x, y] = sampler(t);
      const [x2, y2] = sampler((t + 0.001) % 1);
      const ang = (Math.atan2(y2 - y, x2 - x) * 180) / Math.PI;
      const ch = chars[i % chars.length];
      const el = document.createElementNS(SVG_NS, 'text');
      el.setAttribute('x', '0');
      el.setAttribute('y', '0');
      el.setAttribute('text-anchor', 'middle');
      el.setAttribute('dominant-baseline', 'central');
      el.setAttribute('font-family', 'ui-monospace, Menlo, Consolas, monospace');
      el.setAttribute('font-size', String(fontSize));
      el.setAttribute('fill', color);
      el.setAttribute('transform', `translate(${x} ${y}) rotate(${ang})`);
      el.textContent = ch;
      if (!params.reduce) {
        el.style.opacity = '0';
        el.style.transition = `opacity 60ms linear ${((t * params.speed) | 0)}ms`;
      }
      svg.appendChild(el);
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
