# PLAN.md — Ossuary (project-alpha)

The onboarding document for every session and agent. Read **Current status** first, then the current group. Design truth: [`docs/gdd.md`](docs/gdd.md). Look: [`docs/art-bible.md`](docs/art-bible.md). Engineering specs: [`docs/sdd/`](docs/sdd/). Decisions: [`docs/adrs/`](docs/adrs/), [`docs/brainstorming.md`](docs/brainstorming.md). Rules: [`AGENTS.md`](AGENTS.md), [`.claude/rules/`](.claude/rules/).

## Current status

| Field | Value |
|---|---|
| Phase | 2 PROTOTYPE — Act 1 playable end to end in the browser with placeholder art and synthesized SFX |
| Current group | A3 Alpha content (Act 2, events, skill tree done; Rites in progress) |
| Version | 0.0.5 (live at <https://alpha.lekzera.xyz>) |
| Last change | Render overhaul (B40, 2026-10-26): FIT scaling, Roboto, 2× art. ADR 0015 pending (Opus). Scene footer credit in `MenuScene.ts` still names Jersey and Tiny5 (coordinator to fix). |
| Next step | Balance pass to GDD §20 targets (`docs/reports/`), then asset generation once `docs/asset-request.md` is approved |
| Blockers | Paid asset generation waits for developer approval (`docs/asset-request.md`, `questions-to-dev.md` local only); Vercel secrets missing (no deploy); 1.0 RC items (Acts 2–3, Electron, Android, Steam) are later phases |

Update this table at the end of every group (it is part of the group's assert).

## 1. How to work

### 1.1 Hierarchy

Phase → group (one push + one release) → task → micro-task (one commit). Each micro-task is a checkbox. A checkbox is marked `[x]` only after its assert was run and read.

### 1.2 Commands

| Purpose | Command |
|---|---|
| Install | `bun install --frozen-lockfile` |
| Dev server | `bun run dev` |
| Unit + integration tests | `bun test` (fast; every micro-task) |
| Type check | `bun run typecheck` (`bun check`) |
| Lint | `bun run lint` (Biome), `bun run lint:md` |
| Build | `bun run build` (Vite → `dist/`) |
| Local CI gate | `bun run ci` (before every push) |
| Balance simulation | `bun run sim -- --runs 1000 --seed 1` (end of phase, and before/after any ⚖ change) |
| Smoke / e2e | `bun run test:smoke`, `bun run test:e2e` (Playwright; end of phase) |
| Human QA script | `docs/qa/human-qa.md` (end of phase) |
| Release | `bun run release` (push + GitHub release; end of group) |

### 1.3 Quality rhythm

- During work: unit tests of the touched module, typecheck, lint.
- End of group: `bun run ci` green, release.
- End of phase: `bun run ci:full` = CI + simulation matrix + smoke + e2e + human QA, report in `docs/reports/`.

### 1.4 Versions

`0.0.x` during STRUCTURE/PROTOTYPE/ALPHA (one patch per push), `0.1.x` BETA, `1.0.0` RC accepted.

### 1.5 Agents

Coordinator (main session) + Opus (review/audit), Sonnet (code), Haiku (text, i18n, tests, sims). See ADR 0004.

## 2. Phase 0 — SETUP (done)

- [x] Repository, Bun 1.4.4, Biome, markdownlint, commitlint, git-cliff, release script, CI and deploy workflows (v0.0.1)
- [x] Task 1 research `docs/web-research.md` (v0.0.2)
- [x] Task 2 brainstorming `docs/brainstorming.md` + glossary (v0.0.3)
- [x] Task 3 `docs/gdd.md`
- [x] Task 3 `docs/art-bible.md` — assert: markdownlint clean, no TBD without owner/date
- [x] Task 4 `docs/sdd/*.md` + ADRs 0005+ — assert: one spec per system with requirements, acceptance, edge cases, tests
- [x] Task 5 `PLAN.md` (this file)

## 3. Phase 1 — STRUCTURE

### S1.1 Review of agent setup

- [ ] Re-read every skill, rule, workflow and doc for coherence with the GDD (Opus) — assert: audit report with 0 blockers
- [ ] Decide typo checker (ADR 0001 alternative) — assert: ADR updated

### S1.2 Project skeleton

- [x] `tsconfig.json` strict, `src/{core,data,i18n,scenes,view,platform}` — assert: `bun run typecheck` green
- [x] Layer rule test: `src/core` imports nothing from Phaser/DOM — assert: `bun test tests/unit/layers.test.ts`
- [x] `index.html` + `src/main.ts` with Phaser 4.2.1, `pixelArt: true`, 640×360, `Scale.NONE` + device-pixel integer zoom — assert: `bun run build` exit 0
- [x] Playwright config recreated (`playwright.config.ts`) + smoke test boots the game — assert: `bun run test:smoke`

## 4. Phase 2 — PROTOTYPE (playable Act 1)

Goal: a new player finishes or fails Act 1 in 20–30 min and wants another run (GDD §20).

### P2.1 Combat core (`src/core`, TDD)

- [x] Seeded RNG (sfc32/mulberry32) in state — assert: same seed ⇒ same sequence test
- [ ] Data tables in `src/data` (heroes, 45 cards, enemies, encounters, economy, equipment) — assert: schema test (counts 5/45/10/12/8)
- [x] Combat: turn structure, energy, draw, piles, ranks, From/Target — assert: unit tests
- [x] Damage/Block/heal formulas, 8 statuses — assert: unit tests per GDD §5.5, §6
- [x] Stress + Collapse, fall + injury — assert: unit tests §5.6, §7
- [x] Enemy intents, targeting, elites, boss phases — assert: unit tests §10
- [x] `preview(state, cmd)` == `apply` result — assert: property test 200 seeds
- [x] Auto policy `chooseAutoCommand` — assert: bot finishes a combat with no illegal command

### P2.2 Run layer

- [x] Map generation §4.2 — assert: invariants test (reachability, no crossing, elites rows 4/7, rest/shop row 9, boss row 10) on 500 seeds
- [ ] Encounter selection §4.3 — assert: all 10 enemy types seen by row 8 on ≥ 6-combat paths — measured 72.6% with strict tiers; decision 2026-10-26: keep tiers (GDD §4.3)
- [x] Rewards (rarity odds + pity), camp, shop, rest, equipment, embers — assert: unit tests §4.4–§4.6, §11–§13
- [x] Save/load with schema version + migration — assert: round-trip test + corrupt-save test
- [x] `bun run sim` CLI — assert: prints GDD §20 metrics for 1000 seeds

### P2.3 Presentation (Phaser scenes, placeholders)

- [x] Boot/Preload with procedural placeholder textures (same keys and sizes as final art) — assert: smoke loads with 0 console errors
- [x] Title ("tap to begin" unlocks audio) + Main menu + Settings + Pause — assert: e2e navigates every button
- [x] Party select (3 of 5, ranks) — assert: e2e
- [x] Map scene — assert: e2e selects a node
- [x] Combat scene: units row, intents, HUD, hand, detail panel, preview, targeting, End turn — assert: e2e plays a full combat
- [x] Auto battle toggle + speed 1x/2x/3x in HUD and Settings — assert: e2e same seed same result at 1x/3x
- [x] Reward, camp, shop, rest, run summary — assert: e2e full Act 1 with auto battle at 3x
- [x] i18n EN/PT-BR wired (`src/i18n`) — assert: test every key exists in both locales; language switch e2e
- [ ] Code-driven feedback (flash, shake, lunge, number pop) scaled by speed — assert: visual check + reduce-shake setting test

### P2.4 Prototype assets (static, cost gate)

Assets for rounds 1–10 only: 5 heroes, 10 enemies, 1 boss (static, no animation), ~8 combat VFX, items/icons, UI, menu, HUD, audio.

| Asset group | Count | Tool | Generations (×3 tries) | Estimated cost |
|---|---|---|---|---|
| Heroes (side view, 1 pose) | 5 | PixelLab | 15 | in subscription |
| Enemies (1 pose) | 10 | PixelLab | 30 | in subscription |
| Boss (2-slot) | 1 | PixelLab | 5 | in subscription |
| Elite frames/auras | 2 | hand / Aseprite | 0 | 0 |
| Combat VFX | ~8 | PixelLab `vfx_workbench` + hand | ~24 | in subscription |
| Icons (statuses 8, intents ~8, keywords, equipment 8, energy, gold) | ~30 | PixelLab + hand cleanup | ~90 | in subscription |
| UI (panels 9-slice, buttons, card frames ×4 rarities, bars, pips) | ~15 | PixelLab `create_ui_asset` + hand | ~45 | in subscription |
| Backgrounds (title, menu, map, combat Act 1) | 4 | PixelLab | ~12 | in subscription |
| Card art (45) | 45 | PixelLab (small 56×40) | ~135 | in subscription |
| Music loops | 4 | ElevenLabs Music | — | ≈ US$ 0.60–2.40 (1–4 min each at US$ 0.15/min) |
| SFX | ~35 | ElevenLabs SFX | ~70 tries | ≈ 3,000–6,000 credits (40 credits/s × 1–2 s) |

Total PixelLab ≈ 356 generations (≈ 11% of the 3,400 remaining the developer reported; the MCP showed the subscription as expired on 2026-10-25 — confirm). ElevenLabs fits the developer's current credits. Estimated cash cost if paying from zero: PixelLab entry plan ≈ US$ 10–12/month (not verified) + ElevenLabs Starter ≈ US$ 5–6/month ⇒ **≈ US$ 20 for the prototype** (estimate, `docs/web-research.md` §13).

- [x] Present the asset list + estimate and get approval (cost gate) — assert: approval noted in `docs/brainstorming.md` — approved by the developer 2026-10-26 ~19:16 (`docs/asset-request.md`)
- [ ] Generate, clean at 1×, log prompts in `art-src/` — assert: every key in Art Bible list present, ≤ color budget — done for units, boss, 4 backgrounds, 45 cards (88 generations); icons are 32×32 masters awaiting the hand pass
- [x] Audio generated, loudness-normalized, ogg + mp3 — assert: loops seamless (listen) + game works muted

### P2.5 Prototype gate (end of phase)

- [x] Simulation matrix report `docs/reports/<date>-sim-prototype.md` — assert: GDD §20 targets 2–6
- [ ] Smoke + e2e green, human QA script run — assert: report in `docs/reports/` — automated part done (`docs/reports/2026-10-26-qa-prototype.md`, 43 of 203 items automated); human run pending
- [ ] Deploy to alpha.lekzera.xyz (after Vercel secrets) — assert: URL loads on phone + desktop — BLOCKED: Vercel project and secrets (developer)
- [ ] Go/no-go decision by the developer

## 5. Phase 3 — ALPHA

- [x] A3.1 Act 2 content (10 enemies, 2 elites, boss) and act scaling §4.3 — done 2026-10-26 (art generated; run win 29.4% over 2 acts, `docs/reports/2026-10-26-sim-prototype.md`)
- [x] A3.2 Events and treasure nodes, 12 events EN/PT-BR + treasure — GDD §22.4 lists all 12; i18n EN and PT-BR for all 12 and treasure; tests/unit/events.test.ts, tests/unit/i18n.test.ts, tests/e2e/alpha.spec.ts (event, treasure)
- [x] A3.3 Skill tree + Embers spending (§13.2) — skill tree v1 (GDD §22.5): Legacy screen, Veteran start, tests/unit/meta.test.ts + tests/e2e/legacy.spec.ts
- [ ] A3.4 Animations (idle, attack, hit) per Art Bible
- [ ] A3.5 Text scale + colorblind check — colorblind audit done (`docs/reports/2026-10-26-colorblind.md`), text scale pending
- [ ] A3.6 Alpha gate: sim matrix, e2e, human QA, deploy

## 6. Phase 4 — BETA

- [ ] B4.1 Act 3 + final boss
- [x] B4.2 Difficulty ladder (10 Rites, §13.3) — done: tests/unit/rites.test.ts, Party selector, sim `--rite`
- [ ] B4.3 Polish pass (VFX, juice, audio mix)
- [x] B4.4 Desktop build with Electron (pinned stable) — assert: installer runs on Windows — done: `bun run desktop:build` → portable exe, launched via Playwright Electron, Title scene, 0 errors (ADR 0016)
- [x] B4.5 Android build with Capacitor (pinned stable) — assert: APK runs on a device — done: debug APK installed on the Android 13 emulator (omega-api33), immersive landscape, Title → Menu by touch, 0 JS errors in logcat; real phone not tested
- [ ] B4.6 Beta gate: sim matrix, e2e, human QA on web/desktop/Android

## 7. Phase 5 — 1.0 RC

- [ ] R5.1 Content freeze, bug-fix only
- [ ] R5.2 Full QA (human script + e2e + perf 60 fps target on low-end)
- [ ] R5.3 Steam page, build upload, legal (name/trademark cleared)
- [ ] R5.4 Release 1.0.0

## 8. Quality plan

| Level | Tool | When | Covers |
|---|---|---|---|
| Unit | `bun test` | every micro-task | core rules, formulas, data schemas, i18n keys |
| Integration | `bun test tests/integration` | every group | full run with the auto policy, save/load |
| Smoke | Playwright | end of group with UI changes | game boots, menu, one combat, no console errors |
| E2E | Playwright + agent-browser | end of phase | every screen and button, full Act 1 at 3x, language switch, refresh mid-combat |
| Simulation | `bun run sim` | end of phase + any ⚖ change | win rate, turns, damage, pick rates, dominant strategy, speed parity |
| Human QA | `docs/qa/human-qa.md` (212-item script) | end of phase | all buttons, mechanics, errors, edge cases, fallbacks |

Simulation matrix (end of phase): policies random/greedy/competent × enemy HP ×0.5/×1/×2 × enemy damage ×0.5/×1/×2 × 10 party compositions × speed 1x/3x parity, ≥ 1000 seeds per cell.
