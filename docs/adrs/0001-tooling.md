# ADR 0001: Quality tooling (Bun, Biome, markdownlint, commitlint)

- Status: accepted
- Date: 2026-10-26

## Context

The developer asked for Bun 1.4.4 as the main tool, Biome v2 for TypeScript, markdownlint for Markdown, Conventional Commits, and a check for "typos and errors" using only tools that actually exist in the latest Bun and Biome releases.

## Verification

| Tool | Version | Verified command | What it does |
|---|---|---|---|
| Bun | 1.4.4 (`bun --version`) | `bun check` (listed in `bun --help`: "Type check a TypeScript project") | Type-checks the project via `tsconfig.json` |
| Bun | 1.4.4 | `bun audit` | Vulnerabilities in dependencies |
| Biome | 2.6.3 (npm, latest stable on 2026-10-26) | `biome ci` | Formatting + lint + import organization, read-only, for CI |
| Biome | 2.6.3 | `biome check --write` | Fixes formatting and lint locally |
| markdownlint-cli2 | 0.24.0 | `markdownlint-cli2 "**/*.md"` | Markdown lint |

Neither Bun nor Biome has a native spell checker (typos): no subcommand in `bun --help` or `biome --help` does this. Type errors are covered by `bun check`, code errors by `biome ci`.

## Decision

- `bun run typecheck` → `bun check`; `bun run lint` → `biome ci .`; `bun run format` → `biome check --write .`; `bun run lint:md` → markdownlint-cli2.
- `bun run ci` (`scripts/ci.ts`) chains everything; steps without input yet (no `tsconfig.json`, `tests/`, `index.html`) are skipped with a warning until the STRUCTURE phase.
- commitlint + husky (`.husky/commit-msg`) validate Conventional Commits locally.
- All versions exact in `package.json`, without `^`/`~`.

## Alternatives

- `typos-cli` (crate-ci) or `cspell` for spelling: useful, but they are new dependencies and the in-game text is bilingual (EN/PT-BR). Proposed for the STRUCTURE phase, subject to approval.
- Direct `tsc --noEmit`: `bun check` does the same without calling the compiler separately; `typescript` 7.0.2 stays installed for the editor and tools.

## Consequences

- Typos in text are not caught automatically until the `typos-cli`/`cspell` decision.
- The GitHub and local CI run the same script.
