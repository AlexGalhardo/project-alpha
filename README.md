# Ossuary (working title)

A roguelite deckbuilder with RPG progression, in pixel art, for the web first. You command a party of three condemned heroes on a descent into the Rift, a growing biomechanical wound beneath a ruined militant order's cathedral-fortress. Cards decide what happens; ranks decide who acts and who is hit.

Screenshots are not committed. After `bunx playwright test tests/e2e/screens.spec.ts`, captures of each scene are written to `test-results/screens/`.

## Status

- Prototype (Act 1, web): feature-complete with generated pixel art (PixelLab batch 1) and generated audio (ElevenLabs, 4 music loops and 35 SFX). Manual QA is pending; see `docs/reports/2026-10-26-qa-prototype.md`.
- Alpha in progress: Act 2, event and treasure nodes, the Legacy skill tree. Specs in `docs/sdd/` (SDD-20 to SDD-22).
- Web build only (Phaser 4, TypeScript, Bun). Electron and Android come at the end of the Beta. The working title is not cleared for release (see `docs/gdd.md`, Q-NAME-CHECK).

## Quick start

Requires [Bun](https://bun.sh) 1.4.4 or newer.

```bash
bun install
bun run dev          # local dev server
bun test             # unit tests (tests/unit)
bun run build        # production build
bun run ci           # lint, typecheck, unit tests, markdown lint, build
```

## Commands

| Command | What it does |
|---|---|
| `bun run sim -- --runs 1000 --seed 1 --party shieldbearer,confessor,marksman` | Headless balance simulation. Flags: `--runs`, `--seed`, `--party` (default: all 10 compositions), `--enemy-hp`, `--enemy-dmg`, `--hero-hp` (multipliers), `--json`. Dev only: `--set PATH=VALUE`. |
| `bunx playwright test --project=desktop-1280x720` | E2E on 1280×720 at DPR 1 (`tests/e2e`, `tests/smoke`). |
| `bunx playwright test --project=mobile-landscape-844x390` | E2E on 844×390 at DPR 3, touch. |
| `bun run test:smoke` | Boot smoke test against the production build. |
| `bunx playwright test tests/e2e/screens.spec.ts` | Writes scene captures to `test-results/screens/`. |
| `bun run typecheck` / `bun run lint` / `bun run lint:md` | Typecheck, Biome, markdownlint. |

Asset scripts (`scripts/assets/`). They read API keys from the environment; keys are never printed, logged or committed.

| Script | Environment variable | Use |
|---|---|---|
| `bun scripts/assets/elevenlabs.ts [--only <key>]` | `ELEVEN_LABS_API_KEY` | Music and SFX; idempotent; writes `public/assets/audio/` and `art-src/audio/`. |
| `bun scripts/assets/pixellab.ts [--group heroes\|enemies\|boss\|cards\|backgrounds\|icons\|all] [--only <key>] [--force]` | `PIXELLAB_KEY_OVERRIDE` or `PIXELLAB_API_KEY` | Pixel art; idempotent; writes `art-src/pixellab/` and `public/assets/sprites/`. |
| `bun scripts/assets/sheet.ts <prefix> [scale] [cols] [out]` | `SHEET_DIR` (optional) | Contact sheet of generated sprites for review. |
| `bun scripts/assets/prompts-doc.ts` | none | Renders `docs/assets-prompts-used.md` from the generation logs. Rerun after each batch. |

Generated assets live in `public/assets/`. Generation logs (prompts, parameters, dates, status) and raw takes live in `art-src/`.

Colour-vision audit: `bun scripts/a11y/colorblind.ts` writes `docs/reports/2026-10-26-colorblind.md`.

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
| `docs/assets-prompts-used.md` | Every generation prompt, parameters and output, rendered from the logs |
| `docs/reports/` | QA, simulation and audit reports, dated |
| `docs/qa/human-qa.md` | Human QA script (manual items) |

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

UI font: Roboto (Google Fonts), SIL Open Font License 1.1, copyright 2011 The Roboto Project Authors. Checked against the font licence file in google/fonts (`ofl/roboto/OFL.txt`) on 2026-10-26. Jersey and Tiny5 are no longer used (B40).

## License

All rights reserved (decision pending).

## Contributing

- Commits follow [Conventional Commits](https://www.conventionalcommits.org/) in English (`feat`, `fix`, `docs`, `test`, `refactor`, `perf`, `chore`, `build`, `ci`, `style`, `revert`).
- Before every push, run `bun run ci` and make sure it is green.
- Repository content is in English. Portuguese appears only as in-game localization (`src/i18n/`).
