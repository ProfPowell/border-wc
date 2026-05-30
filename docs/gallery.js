// Group-tab driver for docs/index.html. All 32 effect cards live in a single
// grid; we show only one group at a time via `body[data-active-group=…]`
// CSS rules in site.css. Hiding inactive groups with `display: none` also
// means their <border-wc>s never intersect the viewport, so the IO-based
// lazy-init in border-wc.js skips initializing them entirely — switching
// groups is genuinely cheap.

const VALID = new Set(['lines', 'glow', 'glitch', 'decor']);
const DEFAULT_GROUP = 'lines';

function readGroup() {
  const fromHash = location.hash.replace(/^#/, '');
  return VALID.has(fromHash) ? fromHash : DEFAULT_GROUP;
}

function setActive(group) {
  document.body.dataset.activeGroup = group;
  for (const btn of document.querySelectorAll('#groupTabs .group-tab')) {
    const on = btn.dataset.group === group;
    btn.setAttribute('aria-selected', String(on));
    btn.classList.toggle('active', on);
  }
}

const initial = readGroup();
setActive(initial);
if (location.hash !== `#${initial}`) {
  history.replaceState(null, '', `#${initial}`);
}

for (const btn of document.querySelectorAll('#groupTabs .group-tab')) {
  btn.addEventListener('click', () => {
    const group = btn.dataset.group;
    if (!VALID.has(group)) return;
    setActive(group);
    if (location.hash !== `#${group}`) history.pushState(null, '', `#${group}`);
    // Scroll the grid into view so the new tab's first card is visible.
    const grid = document.getElementById('grid');
    if (grid && grid.getBoundingClientRect().top < 0) {
      grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
}

window.addEventListener('hashchange', () => {
  setActive(readGroup());
});
