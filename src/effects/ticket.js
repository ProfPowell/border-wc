import { attachOverlaySvg, SVG_NS } from './_helpers.js';

function ensurePositioned(host) {
  const cs = getComputedStyle(host);
  if (cs.position === 'static') host.style.position = 'relative';
  // z-index:-1 on the SVG below escapes its stacking context without isolation
  // — same fix we use in wings.
  if (cs.isolation !== 'isolate') host.style.isolation = 'isolate';
}

// Ticket / coupon: notched perimeter (semicircles dip inward at ~70% along
// the top + bottom edges) with a dashed tear line. The SVG body carries the
// paper-fill and sits behind the host's content via z-index: -1.
export function createTicket(host, params) {
  ensurePositioned(host);
  const svg = attachOverlaySvg(host, 'ticket');
  svg.style.zIndex = '-1';
  svg.style.filter = 'drop-shadow(0 3px 6px oklch(0.3 0.03 60 / .28))';
  const stroke = params.color === 'currentColor' ? 'oklch(0.62 0.08 58)' : params.color;
  const body = document.createElementNS(SVG_NS, 'path');
  const tear = document.createElementNS(SVG_NS, 'line');
  svg.appendChild(body);
  svg.appendChild(tear);

  const fit = () => {
    const r = host.getBoundingClientRect();
    const w = r.width;
    const h = r.height;
    const corner = 12;
    const nr = Math.max(6, params.thickness * 3 + 2);
    const xt = Math.round(w * 0.7);
    const d =
      `M${corner} 0 H${xt - nr} A${nr} ${nr} 0 0 0 ${xt + nr} 0 H${w - corner} ` +
      `A${corner} ${corner} 0 0 1 ${w} ${corner} V${h - corner} ` +
      `A${corner} ${corner} 0 0 1 ${w - corner} ${h} ` +
      `H${xt + nr} A${nr} ${nr} 0 0 0 ${xt - nr} ${h} H${corner} ` +
      `A${corner} ${corner} 0 0 1 0 ${h - corner} V${corner} ` +
      `A${corner} ${corner} 0 0 1 ${corner} 0 Z`;
    body.setAttribute('d', d);
    body.setAttribute('fill', 'oklch(0.985 0.045 92)');
    body.setAttribute('stroke', stroke);
    body.setAttribute('stroke-width', String(Math.max(1, params.thickness * 0.75)));
    tear.setAttribute('x1', String(xt));
    tear.setAttribute('y1', String(nr));
    tear.setAttribute('x2', String(xt));
    tear.setAttribute('y2', String(h - nr));
    tear.setAttribute('stroke', 'oklch(0.78 0.04 60)');
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
