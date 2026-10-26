# ADR 0008: Content data as typed TypeScript modules

- Status: accepted
- Date: 2026-10-26

## Context

Cards, enemies, encounters, items and balancing numbers change often. They must be checked for mistakes and referenced by typed keys. The rule "numbers live in `src/data`" applies.

## Decision

- Balancing numbers and content tables live in `src/data/` as TypeScript modules, typed with interfaces from `src/core/`.
- Lookups use the typed keys (for example `card.shb_hack`), so a missing or misspelled id fails the type check.
- Player-facing text is not in `src/data/`; it lives in `src/i18n/` (ADR 0009).
- No runtime schema validator for content; the compiler is the validator. External input (save files, URLs) is validated at its boundary (ADR 0011).

## Alternatives

- JSON with a runtime schema: adds a validator dependency and loses compile-time key checks.
- Spreadsheet export: weak for code review and diffs.

## Consequences

- Changing a number is a visible diff and triggers a simulation report (game-design rules).
- Adding content means editing typed modules, which is slower than editing JSON but catches mistakes earlier.
