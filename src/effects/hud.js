import { attachOverlaySvg, SVG_NS, ensureStyles } from './_helpers.js';

const HUD_CSS = `
  @keyframes bwc-hud-scan {
    0%   { top: 0;    opacity: 0; }
    10%  { opacity: 1; }
    90%  { opacity: 1; }
    100% { top: 100%; opacity: 0; }
  }
`;

function ensurePositioned(host) {
  const cs = getComputedStyle(host);
  if (cs.position === 'static') host.style.position = 'relative';
}

// Cyberpunk HUD: corner brackets + edge tick-marks + a sweeping scan line.
// The host itself is left alone — only overlays are added.
export function createHud(host, params) {
  ensurePositioned(host);
  ensureStyles('hud', HUD_CSS);
  const svg = attachOverlaySvg(host, 'hud');
  const color = params.color === 'currentColor' ? 'oklch(0.82 0.15 195)' : params.color;
  const t = Math.max(1, params.thickness * 0.8 + 0.6);

  const fit = () => {
    svg.innerHTML = '';
    const r = host.getBoundingClientRect();
    const w = r.width;
    const h = r.height;
    const L = Math.min(18, Math.min(w, h) * 0.18);
    const inset = 2;
    const corner = (x, y, sx, sy) => {
      const p = document.createElementNS(SVG_NS, 'path');
      p.setAttribute('d', `M${x} ${y + sy * L} V${y} H${x + sx * L}`);
      p.setAttribute('fill', 'none');
      p.setAttribute('stroke', color);
      p.setAttribute('stroke-width', String(t * 1.4));
      svg.appendChild(p);
    };
    corner(inset, inset, 1, 1);
    corner(w - inset, inset, -1, 1);
    corner(inset, h - inset, 1, -1);
    corner(w - inset, h - inset, -1, -1);

    for (let x = L + 8; x < w - L - 8; x += 16) {
      const tick = document.createElementNS(SVG_NS, 'line');
      tick.setAttribute('x1', String(x));
      tick.setAttribute('y1', String(inset));
      tick.setAttribute('x2', String(x));
      tick.setAttribute('y2', String(inset + 5));
      tick.setAttribute('stroke', color);
      tick.setAttribute('stroke-width', '1');
      tick.setAttribute('opacity', '0.6');
      svg.appendChild(tick);
    }
    const frame = document.createElementNS(SVG_NS, 'rect');
    frame.setAttribute('x', '0');
    frame.setAttribute('y', '0');
    frame.setAttribute('width', String(w));
    frame.setAttribute('height', String(h));
    frame.setAttribute('fill', 'none');
    frame.setAttribute('stroke', color);
    frame.setAttribute('stroke-width', '1');
    frame.setAttribute('opacity', '0.3');
    svg.appendChild(frame);
  };
  fit();

  const scan = document.createElement('div');
  scan.setAttribute('data-border-wc', 'hud-scan');
  Object.assign(scan.style, {
    position: 'absolute',
    left: '0',
    right: '0',
    height: '2px',
    pointerEvents: 'none',
    background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
    boxShadow: `0 0 8px ${color}`,
  });
  if (!params.reduce && params.animate !== false) {
    scan.style.animation = `bwc-hud-scan ${Math.max(2200, params.speed * 2.6)}ms linear infinite`;
  }
  host.appendChild(scan);

  const ro = new ResizeObserver(fit);
  ro.observe(host);
  return () => {
    ro.disconnect();
    svg.remove();
    scan.remove();
  };
}
