// Wires the gallery playground: each .effect-card has knobs (input[data-knob])
// that update its inner <border-wc> attributes live, and a <code-block> that
// shows the current HTML snippet. The card's effect name comes from
// data-border-effect, the sample label from data-sample-label, and the knob
// name from data-knob — this scales to all effects without per-card JS.
// NOTE: the article uses data-border-effect (not data-effect) to avoid
// colliding with vanilla-breeze, which scans data-effect for its own base
// effects (e.g. typewriter) and would rewrite the article's contents.
//
// Knob targeting:
//   data-knob="color"                       → setAttribute('color', value)
//   data-knob="washi-pattern"
//     data-knob-target="style"              → host.style.setProperty('--washi-pattern', value)
//
// Style-targeted knobs are written to the snippet as a `style="--name: value"`
// attribute so the copy-paste snippet matches the live preview.

// code-block snapshots its textContent at connect time, so after upgrade the
// only way to update its content is via the public setCode() method. Pre-upgrade,
// set textContent so the connect snapshot picks it up.
function writeSnippet(cb, snippet) {
  if (typeof cb.setCode === 'function') cb.setCode(snippet);
  else cb.textContent = snippet;
}

function setupCard(card) {
  const effect = card.dataset.borderEffect;
  const label = card.dataset.sampleLabel || 'Sample';
  const win = card.querySelector('border-wc');
  const sample = card.querySelector('.sample');
  const codeBlock = card.querySelector('code-block');
  // Pick up inputs *and* selects (e.g. mode dropdowns on barber/marquee).
  const inputs = card.querySelectorAll('.knobs [data-knob]');
  const replay = card.querySelector('[data-replay]');

  function apply() {
    const attrs = {};
    const styles = []; // [{ prop, value }]
    for (const i of inputs) {
      const name = i.dataset.knob;
      const value = i.value;
      if (i.dataset.knobTarget === 'style') {
        styles.push({ prop: `--${name}`, value });
      } else {
        attrs[name] = value;
      }
    }

    const { color, thickness, speed, radius, mode, trigger } = attrs;
    // Empty color string = "use the effect's default theme palette".
    if (color) win.setAttribute('color', color);
    else win.removeAttribute('color');
    if (thickness != null) win.setAttribute('thickness', thickness);
    if (speed != null) win.setAttribute('speed', speed);
    if (radius != null) win.setAttribute('radius', radius);
    if (mode) win.setAttribute('mode', mode);
    if (trigger) win.setAttribute('trigger', trigger);
    else win.removeAttribute('trigger');
    if (radius != null) sample.style.borderRadius = radius + 'px';

    for (const { prop, value } of styles) {
      if (value === '' || value == null) win.style.removeProperty(prop);
      else win.style.setProperty(prop, value);
    }

    const colorAttr = color ? ` color="${color}"` : '';
    const thickAttr = thickness != null ? ` thickness="${thickness}"` : '';
    const speedAttr = speed != null ? ` speed="${speed}"` : '';
    const radiusAttr = radius != null ? ` radius="${radius}"` : '';
    const modeAttr = mode ? ` mode="${mode}"` : '';
    const triggerAttr = trigger ? ` trigger="${trigger}"` : '';
    const styleAttr = styles.length
      ? ` style="${styles
          .filter((s) => s.value !== '' && s.value != null)
          .map((s) => `${s.prop}: ${s.value}`)
          .join('; ')}"`
      : '';
    const snippet =
      `<border-wc effect="${effect}"${colorAttr}${thickAttr}\n` +
      `           ${speedAttr.trimStart()}${radiusAttr}${modeAttr}${triggerAttr}${styleAttr} animate>\n` +
      `  <div class="sample">${label}</div>\n` +
      `</border-wc>`;
    writeSnippet(codeBlock, snippet);
  }

  // Knob changes apply live; one-shot effects (draw/ascii/typewriter) expose
  // a Replay button that re-runs the reveal via refresh().
  for (const i of inputs) {
    i.addEventListener('input', apply);
    i.addEventListener('change', apply);
  }
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
