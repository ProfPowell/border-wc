import { attachOverlaySvg, SVG_NS } from './_helpers.js';

function ensurePositioned(host) {
  const cs = getComputedStyle(host);
  if (cs.position === 'static') host.style.position = 'relative';
  // Establish a stacking context so the z-index:-1 ticket SVG below stays
  // inside the host (rather than escaping behind an opaque ancestor).
  if (cs.isolation !== 'isolate') host.style.isolation = 'isolate';
}

// Ticket / coupon — single SVG path traces a rounded rect with a semicircle
// dipping inward at the top + bottom centers (the perforation), filled with a
// cream paper color, stroked with the param color, and bisected by a dashed
// vertical tear line. The SVG sits at z-index: -1 so the body fill paints
// UNDER the slotted text. Consumers whose slot has its own opaque background
// must clear it for the fill to show through (the docs site does this via a
// card-specific CSS override).
export function createTicket(host, params) {
  ensurePositioned(host);
  const svg = attachOverlaySvg(host, 'ticket');
  svg.style.zIndex = '-1';
  svg.style.filter = 'drop-shadow(0 4px 8px oklch(0.3 0.03 60 / 0.22))';

  const stroke = params.color === 'currentColor' ? 'oklch(0.55 0.18 25)' : params.color;
  const fill = 'oklch(0.985 0.045 92)';

  const body = document.createElementNS(SVG_NS, 'path');
  const tear = document.createElementNS(SVG_NS, 'line');
  svg.appendChild(body);
  svg.appendChild(tear);

  const fit = () => {
    const r = host.getBoundingClientRect();
    const w = r.width;
    const h = r.height;
    const corner = 14;
    const nr = Math.max(8, params.thickness * 3 + 4);
    const xt = w / 2; // perforation at horizontal center
    const d =
      `M${corner} 0 H${xt - nr} A${nr} ${nr} 0 0 0 ${xt + nr} 0 H${w - corner} ` +
      `A${corner} ${corner} 0 0 1 ${w} ${corner} V${h - corner} ` +
      `A${corner} ${corner} 0 0 1 ${w - corner} ${h} ` +
      `H${xt + nr} A${nr} ${nr} 0 0 0 ${xt - nr} ${h} H${corner} ` +
      `A${corner} ${corner} 0 0 1 0 ${h - corner} V${corner} ` +
      `A${corner} ${corner} 0 0 1 ${corner} 0 Z`;
    body.setAttribute('d', d);
    body.setAttribute('fill', fill);
    body.setAttribute('stroke', stroke);
    body.setAttribute('stroke-width', String(Math.max(1.5, params.thickness)));
    tear.setAttribute('x1', String(xt));
    tear.setAttribute('y1', String(nr + 2));
    tear.setAttribute('x2', String(xt));
    tear.setAttribute('y2', String(h - nr - 2));
    tear.setAttribute('stroke', 'oklch(0.7 0.04 60)');
    tear.setAttribute('stroke-width', String(Math.max(1, params.thickness * 0.75)));
    tear.setAttribute('stroke-dasharray', '2 4');
    tear.setAttribute('stroke-linecap', 'round');
  };
  fit();

  const ro = new ResizeObserver(fit);
  ro.observe(host);
  return () => {
    ro.disconnect();
    svg.remove();
  };
}
