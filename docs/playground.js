// Wires the gallery playground: each .effect-card has knobs that update its
// inner <border-wc> attributes live, and a <code-block> that shows the current
// HTML snippet. Knob IDs use the two-letter prefix sq-/dr-/sp- matching the
// squiggle/draw/sparks cards in docs/index.html.

const SAMPLE_LABELS = {
  squiggle: 'Hand-drawn vibe',
  draw: 'Stroke-on reveal',
  sparks: 'Live indicator',
};

// code-block snapshots its textContent at connect time, so after upgrade the
// only way to update its content is via the public setCode() method. Pre-upgrade,
// set textContent so the connect snapshot picks it up.
function writeSnippet(cb, snippet) {
  if (typeof cb.setCode === 'function') cb.setCode(snippet);
  else cb.textContent = snippet;
}

function setupCard(card) {
  const effect = card.dataset.effect;
  const win = card.querySelector('border-wc');
  const sample = card.querySelector('.sample');
  const codeBlock = card.querySelector('code-block');
  const inputs = card.querySelectorAll('.knobs input');
  const replay = card.querySelector('[data-replay]');

  function read() {
    const v = {};
    for (const i of inputs) v[i.id.split('-')[1]] = i.value;
    return v;
  }

  function apply() {
    const { color, thick, speed, radius } = read();
    win.setAttribute('color', color);
    win.setAttribute('thickness', thick);
    win.setAttribute('speed', speed);
    win.setAttribute('radius', radius);
    sample.style.borderRadius = radius + 'px';
    const label = SAMPLE_LABELS[effect] ?? 'Sample';
    const snippet =
      `<border-wc effect="${effect}" color="${color}" thickness="${thick}"\n` +
      `           speed="${speed}" radius="${radius}" animate>\n` +
      `  <div class="sample">${label}</div>\n` +
      `</border-wc>`;
    writeSnippet(codeBlock, snippet);
  }

  // Knob changes apply live; for the draw card, the dedicated Replay button
  // re-runs the stroke animation (the squiggle and sparks effects loop on their
  // own — they don't need a replay).
  for (const i of inputs) i.addEventListener('input', apply);
  if (replay) {
    replay.addEventListener('click', () => {
      if (typeof win.refresh === 'function') win.refresh();
    });
  }

  // code-block may not have upgraded yet on first paint; once it defines, set
  // the initial snippet via setCode so it renders highlighted.
  customElements.whenDefined('code-block').then(apply);
  apply(); // initialize (pre-upgrade textContent for the snapshot)
}

document.querySelectorAll('.effect-card').forEach(setupCard);
