# SDD-18 Testing and QA

| Field | Value |
|---|---|
| Status | Draft, 2026-10-26 |
| Owner | All agents (each tests its own area); Opus reviews |
| Phase | STRUCTURE onward |
| Depends on | SDD-01 |
| References | `.claude/rules/engineering.md` (tests), `.claude/rules/git-and-release.md`; GDD §20; skills `ccgs-qa-plan`, `gc-game-qa`; human QA script [`docs/qa/human-qa.md`](../qa/human-qa.md) |

## 1. Goal

Define the test pyramid, where each kind of test lives, when it runs, and what blocks a release: fast tests during development, big tests (simulation, e2e, human QA) at the end of each phase.

## 2. Non-goals

- Visual regression of final art before Alpha (art changes too fast).
- Load testing (no server).

## 3. Requirements

- R-1 Test-first for `src/core`: every rule has a failing test before its implementation; every fixed bug gets a test that reproduces it.
- R-2 Levels and locations:

| Level | Tool | Location | Runs |
|---|---|---|---|
| Unit | `bun test` | `tests/unit/` | Every commit (`bun run ci`) |
| Data integrity | `bun test` | `tests/unit/data-integrity.test.ts` | Every commit |
| Layer boundary | `bun test` | `tests/unit/layers.test.ts` | Every commit |
| Integration | `bun test` | `tests/integration/` (full runs by seed, save round-trip, speed parity 100 seeds) | Every commit (fast subset ≤ 60 s) |
| Exhaustive/slow | `bun test` with `@slow` | `tests/integration/` (10 000 maps, 1000-seed runs) | End of phase |
| Simulation | `bun run sim` | `scripts/sim.ts`, reports in `docs/reports/` | Before/after number changes, end of phase |
| Smoke e2e | Playwright (`@playwright/test`, config recreated in STRUCTURE) | `tests/smoke/*.spec.ts` | End of phase, before deploy |
| E2E flows | Playwright + `agent-browser` for exploratory runs | `tests/e2e/` | End of phase |
| Human QA | Person + script | `docs/qa/human-qa.md` → `docs/reports/qa-<phase>-<date>.md` | End of phase |

- R-3 A flaky test is never re-run until it passes: fix the cause (usually determinism) (`.claude/rules/engineering.md`).
- R-4 Never disable, skip or weaken a test to make CI pass.
- R-5 The game exposes a test bridge only in test builds: `window.__OSSUARY__ = { seed, dispatch, state, skipAnimations }` for Playwright; absent from production builds.
- R-6 Release gate: `bun run ci` green; at phase end also the slow suite, the sim targets (SDD-17 R-6), the smoke e2e and a human QA round with no open S1/S2.
- R-7 Every bug report records seed, build version, browser, viewport, language and steps.

## 4. Design

```text
tests/
├── unit/          rules, data, i18n, layers, view mappings
├── integration/   determinism, save, speed parity, full runs, intent honesty
├── smoke/         boot and smoke specs (Playwright)
├── e2e/           flows/*.spec.ts (Playwright)
└── fixtures/      saves by version, seeds, images for validators
```

Playwright projects: `desktop` (1280×720, DPR 1) and `mobile-touch` (844×390, DPR 3, touch).

## 5. Acceptance criteria

- AC-1 Given `bun run ci`, then unit, data, layer and the fast integration subset run in under 60 s on the development machine.
- AC-2 Given a production build, then `window.__OSSUARY__` is undefined.
- AC-3 Given the smoke test, then it starts a seeded run, plays a combat with auto battle at 3x, reloads mid-combat and verifies the turn resumes, on both Playwright projects.
- AC-4 Given the end of a phase, then a QA report exists in `docs/reports/` with the quick-regression list of `docs/qa/human-qa.md` §27 executed.

## 6. Edge cases

- Tests that depend on fonts or canvas output run only in e2e, never in unit tests.
- Time in tests: the core has no time; view tests use Phaser's scene clock with `skipAnimations` or Playwright's `page.clock`.

## 7. Test strategy

This spec is the strategy; each system spec lists its own tests.

## 8. Verification

```sh
bun run ci
bun test tests/integration --timeout 600000   # slow suite at phase end
bunx playwright test
```
