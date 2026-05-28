// Wires the gallery playground: each .effect-card has knobs (input[data-knob])
// that update its inner <border-wc> attributes live, and a <code-block> that
// shows the current HTML snippet. The card's effect name comes from
// data-effect, the sample label from data-sample-label, and the knob name
// from data-knob — this scales to all 17 effects without per-card JS.

// code-block snapshots its textContent at connect time, so after upgrade the
// only way to update its content is via the public setCode() method. Pre-upgrade,
// set textContent so the connect snapshot picks it up.
function writeSnippet(cb, snippet) {
  if (typeof cb.setCode === 'function') cb.setCode(snippet);
  else cb.textContent = snippet;
}

function setupCard(card) {
  const effect = card.dataset.effect;
  const label = card.dataset.sampleLabel || 'Sample';
  const win = card.querySelector('border-wc');
  const sample = card.querySelector('.sample');
  const codeBlock = card.querySelector('code-block');
  const inputs = card.querySelectorAll('.knobs input[data-knob]');
  const replay = card.querySelector('[data-replay]');

  function read() {
    const v = {};
    for (const i of inputs) v[i.dataset.knob] = i.value;
    return v;
  }

  function apply() {
    const { color, thickness, speed, radius } = read();
    win.setAttribute('color', color);
    win.setAttribute('thickness', thickness);
    win.setAttribute('speed', speed);
    win.setAttribute('radius', radius);
    sample.style.borderRadius = radius + 'px';
    const snippet =
      `<border-wc effect="${effect}" color="${color}" thickness="${thickness}"\n` +
      `           speed="${speed}" radius="${radius}" animate>\n` +
      `  <div class="sample">${label}</div>\n` +
      `</border-wc>`;
    writeSnippet(codeBlock, snippet);
  }

  // Knob changes apply live; one-shot effects (draw/vines/ascii/typewriter)
  // expose a Replay button that re-runs the reveal via refresh().
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
