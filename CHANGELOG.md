# Changelog

All notable changes to `@profpowell/border-wc` are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow
[Semantic Versioning](https://semver.org/) (pre-1.0, so a minor bump may break).

## [Unreleased]

### Fixed

- Docs site: the dark-by-default setting never ran in production builds, because
  the `sideEffects` list let the bundler drop `docs/prefer-dark.js`. A stored mode,
  including an explicit Auto, is now respected across reloads.

### Documentation

- jsDelivr does not resolve the `/attr` shortcut, so the docs now give its file path.

## [0.3.0] — 2026-11-03

### Added

- **`custom-elements.json` now ships** and is importable as
  `@profpowell/border-wc/custom-elements.json`. It describes only the published
  modules, points at `dist/`, and documents every attribute and effect name.
- TypeScript declarations for both entry points.
- `repository`, `homepage`, and `bugs` metadata, so npm links back to the project.
- Effects `brutalist` and `aqua`, plus gallery cards and catalog entries.
- Support for vanilla-breeze's root `data-motion-reduced` attribute, in both the
  element and the binder. `motion="force"` and `motion="reduce"` still win.

### Changed

- Effects re-apply when the reduced-motion preference changes while the page is
  open. A one-shot effect such as `draw` replays when this happens.
- A non-numeric `thickness`, `speed`, or `radius` now falls back to the next source
  (attribute, then default) instead of passing `NaN` to the effect.
- Importing either entry point without a DOM is a no-op instead of throwing.

### Fixed

- Changing or removing `effect` while the previous effect was still loading could
  mount the stale effect.
- `effect="constructor"` and other `Object.prototype` names fired `border-wc:error`
  instead of being ignored as unknown values.
- Binder: an element removed while its effect was loading could never be bound again
  after `stopWatching()`.
- Docs named a base effect `corner-trace`; vanilla-breeze calls it `trace`.
