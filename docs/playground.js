// Wires the gallery playground: each .effect-card has knobs that update its
// inner <border-wc> attributes live, and a <code-block> that shows the current
// HTML snippet. Knob IDs use the two-letter prefix sq-/dr-/sp- matching the
// squiggle/draw/sparks cards in docs/index.html.

const SAMPLE_LABELS = {
  squiggle: 'Hand-drawn vibe',
  draw: 'Stroke-on reveal',
  sparks: 'Live indicator',
};

function setupCard(card) {
  const effect = card.dataset.effect;
  const win = card.querySelector('border-wc');
  const sample = card.querySelector('.sample');
  const codeBlock = card.querySelector('code-block');
  const inputs = card.querySelectorAll('.knobs input');

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
    // Code-block reads its content from textContent (and updates on attribute
    // changes); set both so it works whether it has upgraded yet or not.
    codeBlock.setAttribute('value', snippet);
    codeBlock.textContent = snippet;
  }

  for (const i of inputs) i.addEventListener('input', apply);
  apply(); // initialize
}

document.querySelectorAll('.effect-card').forEach(setupCard);
