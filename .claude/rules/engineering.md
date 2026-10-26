# Engineering rules

## Language

- All repository content is English: docs, code, comments, keys, commit messages.
- PT-BR appears only as in-game localization in `src/i18n/`. English is the default locale.

## Layers

- `src/core/` is pure, deterministic logic. Do not import `phaser`, `src/scenes`, `src/view`; do not use the DOM, `Math.random`, `Date`, `performance.now` or timers.
- `src/scenes/` and `src/view/` present: they consume core events and animate. They never decide game rules.
- All randomness comes from the RNG with an injected seed. Same seed + same commands = same state.
- Balancing numbers live in `src/data/`. A magic number in logic is a defect.
- Player-facing text lives in `src/i18n/`, in EN (default) and PT-BR. A player string in code is a defect.

## TypeScript

- No `any`. Unknown types use `unknown` with narrowing.
- Explicit return type on every exported function.
- No `@ts-ignore` and no `@ts-expect-error` to "make it pass".
- Core state is immutable: a command returns a new state.

## Tests

- Logic in `src/core/`: test first, implementation after.
- A fixed bug gets a test that reproduces it.
- Never re-run an unstable test until it passes: fix the cause (almost always determinism).
- Never disable, skip or weaken a test to make CI pass.
- Before declaring done: run the assert's command and `bun run ci`, and read the result.
- Fast tests (unit, integration) during development; balancing simulation, e2e and human QA only at the end of each phase.

## Dependencies and tooling

- Bun for everything (`bun`, `bunx`). Node/npm only when a tool requires it, recorded in `docs/adrs/`.
- A new dependency requires the developer's approval.
- Exact stable versions in `package.json`: no `^`, `~`, `latest`, `next`, `rc`, `beta`, `alpha`.
- Phaser 4: consult the official skill for the topic before using an API. Do not apply Phaser 3 patterns.

## Code

- Comment only for the why, a non-obvious edge case, or a workaround with a reason.
- Fix the root cause. Never swallow an exception.
- Formatting and linting with Biome; Markdown with markdownlint. Do not argue style by hand.

## Secrets

- `.env` is never read for display, printed, logged or committed.
- API keys only in scripts under `scripts/`, never in the game bundle.
