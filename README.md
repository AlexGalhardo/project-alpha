# Ossuary (working title)

A roguelite deckbuilder with RPG progression, in pixel art, for the web first. You command a party of three condemned heroes on a descent into the Rift, a growing biomechanical wound beneath a ruined militant order's cathedral-fortress. Cards decide what happens; ranks decide who acts and who is hit.

> Screenshot placeholder: gameplay capture to be added once the Act 1 build is playable.

## Status

Prototype in progress. Web build only (Phaser 4, TypeScript, Bun). Electron and Android come at the end of the Beta. The working title is not cleared for release (see `docs/gdd.md`, Q-NAME-CHECK).

## Quick start

Requires [Bun](https://bun.sh) 1.4.4 or newer.

```bash
bun install
bun run dev          # local dev server
bun test             # unit tests (tests/unit)
bun run build        # production build
bun run sim          # headless balancing simulation (planned, see docs/sdd/balancing.md)
bun run test:smoke   # Playwright smoke test against the production build
```

## Controls

| Input | Action |
|---|---|
| Tap/click card | Select, open detail panel, show preview on valid targets |
| Tap/click valid target | Confirm play |
| Tap card again / tap empty space / `Esc` | Cancel selection |
| Long-press (400 ms) / right-click | Tooltip for any icon, status, intent or keyword |
| Drag card onto target (optional) | Play |
| Keys `1`–`9`, `0` | Select hand card 1–10 |
| `Tab` / arrows | Cycle valid targets |
| `Enter` | Confirm |
| `Space` | End turn |
| `A` | Toggle auto battle |
| `S` | Cycle game speed |
| `Esc` (nothing selected) | Pause |

## Documentation map

| Document | Purpose |
|---|---|
| `PLAN.md` | Phases, task groups, current status |
| `AGENTS.md` | Rules and workflow for coding agents |
| `docs/gdd.md` | Game design document (source of truth for design) |
| `docs/art-bible.md` | Art direction, palette, pixel specs (in progress) |
| `docs/sdd/` | Engineering specs per system |
| `docs/adrs/` | Architecture decision records |
| `docs/brainstorming.md` | Decisions (B-ids) and open questions |
| `docs/web-research.md` | Research on genre, Phaser 4 and tools |
| `docs/glossary.md` | One word per concept |

## Tech stack

| Package | Version |
|---|---|
| phaser | 4.2.1 |
| typescript | 7.0.2 |
| vite | 8.3.5 |
| @types/bun | 1.4.4 |
| @playwright/test | 1.64.1 |
| @biomejs/biome | 2.6.3 |
| markdownlint-cli2 | 0.24.0 |
| husky | 9.1.7 |
| git-cliff | 2.14.2 |
| @commitlint/cli, @commitlint/config-conventional | 21.2.4 |

Pixel fonts: Jersey 10, 15, 20, 25 and Tiny5, SIL Open Font License 1.1. Verify terms from the font files before shipping (ADR 0010).

## License

All rights reserved (decision pending).

## Contributing

- Commits follow [Conventional Commits](https://www.conventionalcommits.org/) in English (`feat`, `fix`, `docs`, `test`, `refactor`, `perf`, `chore`, `build`, `ci`, `style`, `revert`).
- Before every push, run `bun run ci` and make sure it is green.
- Repository content is in English. Portuguese appears only as in-game localization (`src/i18n/`).
