import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        window: 'readonly', document: 'readonly', customElements: 'readonly',
        HTMLElement: 'readonly', CustomEvent: 'readonly', SVGElement: 'readonly',
        IntersectionObserver: 'readonly', ResizeObserver: 'readonly', MutationObserver: 'readonly',
        requestAnimationFrame: 'readonly', cancelAnimationFrame: 'readonly',
        setInterval: 'readonly', clearInterval: 'readonly',
        setTimeout: 'readonly', clearTimeout: 'readonly',
        CSS: 'readonly',
        getComputedStyle: 'readonly', matchMedia: 'readonly', performance: 'readonly',
        console: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
      'no-empty': ['error', { allowEmptyCatch: true }],
    },
  },
  { ignores: ['dist/', 'node_modules/', 'demos/', 'test/'] },
];
