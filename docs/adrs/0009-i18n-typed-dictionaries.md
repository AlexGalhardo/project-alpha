# ADR 0009: Localization with typed dictionaries (no library)

- Status: accepted
- Date: 2026-10-26

## Context

The game ships in English (default) and Brazilian Portuguese. Keys must be checked, placeholders must match between languages, and the dependency footprint should stay small.

## Decision

- `src/i18n/en.ts` is the source dictionary. `src/i18n/pt-BR.ts` is typed as the same `Strings` type, so a missing or extra key fails the type check.
- `Strings` is `DeepString<typeof en>`: every leaf is `string`, the key shape is kept.
- Placeholders use `{name}` and must be identical in both languages for each key.
- `bun test tests/unit/i18n.test.ts` checks key parity, empty strings, placeholder parity and the card text length limit (12 words in English, GDD §9.1).
- No i18n library. Locale choice follows the browser language when it is Portuguese, English otherwise (GDD §18.2).

## Alternatives

- `i18next` or similar: a new dependency that needs approval; typed keys are weaker than our own types.
- Strings inside components: breaks the rule that text is in `src/i18n/`.

## Consequences

- Adding a string means adding it to both dictionaries; the test fails otherwise.
- Pluralization and gender are not supported by the simple dictionary; add a small helper if a string needs them.
