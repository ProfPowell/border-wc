import { EXTREME } from './src/registry.js';

// The public modules, mapped from source to the file consumers actually receive.
const PUBLIC_MODULES = {
  'src/border-wc.js': 'dist/border-wc.js',
  'src/data-border-effect.js': 'dist/data-border-effect.js',
};

const EFFECT_TYPE = EXTREME.map((name) => `'${name}'`).join(' | ');

function retargetToDist(ref) {
  if (ref?.module && PUBLIC_MODULES[ref.module]) ref.module = PUBLIC_MODULES[ref.module];
}

// Effects and helpers are internal chunks, and src/ is not published. Keep only
// the public modules, point them at dist/, and spell out the effect names.
function publicApiOnly() {
  return {
    name: 'public-api-only',
    packageLinkPhase({ customElementsManifest: manifest }) {
      manifest.modules = manifest.modules
        .filter((mod) => PUBLIC_MODULES[mod.path])
        .sort((a, b) => a.path.localeCompare(b.path, 'en'));
      for (const mod of manifest.modules) {
        mod.path = PUBLIC_MODULES[mod.path];
        for (const exp of mod.exports ?? []) retargetToDist(exp.declaration);
        for (const decl of mod.declarations ?? []) {
          if (decl.tagName !== 'border-wc') continue;
          decl.members = decl.members?.filter((member) => member.privacy !== 'private');
          const effectAttr = decl.attributes.find((attr) => attr.name === 'effect');
          effectAttr.type = { text: EFFECT_TYPE };
          const effectField = decl.members?.find((member) => member.name === 'effect');
          if (effectField) effectField.type = { text: EFFECT_TYPE };
        }
      }
    },
  };
}

export default {
  globs: ['src/**/*.js'],
  exclude: ['src/**/*.test.js'],
  outdir: '.',
  litelement: false,
  plugins: [publicApiOnly()],
};
