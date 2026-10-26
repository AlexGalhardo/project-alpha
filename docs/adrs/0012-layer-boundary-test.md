# ADR 0012: Layer boundary enforced by a test

- Status: accepted
- Date: 2026-10-26

## Context

`src/core/` must stay free of Phaser, scenes, views and the DOM (ADR 0005, engineering rules). A rule that is only written in a document is easy to break.

## Decision

- A unit test under `tests/unit/` reads the import statements of every file in `src/core/` and fails if any import reaches `phaser`, `src/scenes`, `src/view`, DOM globals or `src/i18n` (core returns event ids, not text).
- The same test forbids `Math.random`, `Date`, `performance.now`, `setTimeout` and `setInterval` in `src/core/`.
- The check runs with `bun test`, so no new lint plugin is needed (the architecture outline rejected a lint plugin as a new dependency).

## Alternatives

- A lint plugin: a new dependency that needs approval.
- Code review only: relies on people remembering.

## Consequences

- Violations fail the test suite and the CI gate.
- The test is a grep-like scan; it is simple on purpose and may need an allow-list if the rule is ever relaxed through an ADR.
