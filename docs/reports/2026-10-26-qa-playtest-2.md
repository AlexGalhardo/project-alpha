# QA playtest 2 (2026-10-26)

Tester: QA playtester agent. Build: `vite build` snapshot of `main` after v0.0.7 (Sanctum on, enrage, Vanguard, native art for Acts 1–3, 1920×1080 render), plus the uncommitted view fixes listed under "Fixed in this pass". Played with Playwright clicking the canvas (`playwright-core`, Chromium) and the fixed scripted player (see playtest 1 errata). Screenshots: `test-results/qa/` (gitignored).

## Runs

| Run | Viewport | Party (rank 1→3) | Mode, speed | Rite | Sanctum pick | Result | Wall time |
|---|---|---|---|---|---|---|---|
| p2a | 1920×1080 | Shieldbearer, Confessor, Marksman | mix, 3x | 0 | Temper (2 cards picked) | defeat A2R7 elite (Chain Golem + Flesh Organ, 13 turns) | 3 min 03 s |
| p2b | 1920×1080 | Confessor, Arcanist, Bombardier | auto, 3x | 0 | Purge (2 cards picked) | defeat A2R7 (Chain Golem, 19 turns) | 2 min 27 s |
| p2c | 1920×1080 | Shieldbearer, Marksman, Bombardier | mix, 3x | **3** | — | defeat A1R7 elite (Calcified Ossified Brute, 17 turns) | 1 min 05 s |
| p2d | 1366×768 | Shieldbearer, Confessor, Arcanist | manual (scored), 2x | 0 | Tithe | defeat A2R6 | 4 min 08 s |
| p2e | 844×390, DPR 3 | Confessor, Marksman, Bombardier | auto, 3x | 0 | Rest ×2 | defeat A3R7 elite (Calcified Sepulchre Knight, 13 turns) | 3 min 36 s |
| p2f | 1920×1080 | Shieldbearer, Confessor, Marksman | auto, 3x | 0 | Tithe ×2 | defeat A3R6 | 4 min 32 s |
| finale | 1920×1080 | Shieldbearer, Confessor, Marksman | bot to the final boss, then scene auto battle | 0 | bot | **victory**: Rift Mother phases 2 and 3, epilogue, `music.ending` | — |

Console errors in every run: **0**. Simulation for comparison (`bun run sim -- --runs 200 --seed 1`, 3 acts, greedy bot): run win 34.5%, Act 1 cleared 84.1%, parties without the Shieldbearer 29.4%, Confessor in 93.2% of winning parties; median turns common 4 / elite 6 / boss 8, elite p90 11.

## Verdict

The three-act loop, the Sanctum and the finale all work end to end with no errors at any viewport. The finale lands: `music.boss.final` during the fight, a phase banner per phase ("THE SEPULCHRE OPENS"), the three-paragraph epilogue and `music.ending` on the summary. The weak spots are pacing and one balance trend: **Calcified elites and the Chain Golem make fights of 11–19 turns** (target elite 5–7, common 3–6), which is where 5 of the 6 driver runs ended, and the **Confessor is now in 93% of winning parties**.

## Findings

### P1

**P1-1 Act 2 enemies and the Act 2 boss drawn three times too large (fixed).** Act 2 art is 3× (192×240 for a 64×80 unit, 400×360 for the boss) but had no logical size, so `standing()` showed it at texture size: the Bone Lancer covered the whole hero line and the intent strip (`r9-combat-common-a2.png`). Fix: logical sizes for the ten Act 2 enemies and `gilded_penitent` in `src/view/placeholders.ts` (also gives them placeholders if a file is missing). Verified: `p2a-combat-common-a2.png`, `p2a-combat-elite-a2.png`.

### P2

**P2-1 Calcified elites and the Chain Golem stall fights (open, data).** Turn counts at the defeat points: A1R7 Calcified Ossified Brute 10–17 turns (p2c Rite 3, p2e), A2 Chain Golem fights 11, 13, 15, 16 and 19 turns (p2a, p2b, p2d, p2f), A3R7 Calcified Sepulchre Knight 13 turns (p2e). Calcified (−2 per hit) hard-counters the multi-hit and splash cards of the Marksman and Bombardier, and the Chain Golem's 52 HP × act scaling × elite multiplier outlasts the enrage ramp. Proposal for the data owner (simulate first): Calcified −2 → −1 per hit, or Chain Golem HP 52 → 40; target elite median 6, p90 ≤ 9.

**P2-2 Confessor dominance (open, design).** Sim: Confessor in 93.2% of winning parties (85% before the Vanguard rule). Every driver run that reached Act 3 had a Confessor. Logged in `docs/brainstorming.md` (front-rank rule); the next balance pass should look at healing, not Block.

**P2-3 Pop-ups for one unit overlapped (fixed).** A Collapse, a heal and a stress gain on the same hero printed on top of each other ("Co+6se", `finale-t2.png`). Pops on the same unit within 350 ms now stack upwards by 16 px (`CombatScene.popFor`).

### P3

- **Rift Mother HP 100** on screen; GDD §23.4 says 160 (final). Data owner to confirm which is current (open).
- **Act 3 enemies used placeholders** in the first runs of the day; native art landed during this pass (`8de7efe`); spot-checked, no scale issue.
- **Combat backdrops**: the floor-line lift works for the stitched Act 1–3 backgrounds; units stand on the flagstones in every act (`p2a-combat-common-a2.png`, `finale-0.png`).
- **"Your turn" / "Enemy turn" banner** sits over the centre gap and can overlap the H1 sprite for 0.5 s; acceptable, left as is.
- **844×390 (DPR 3)**: full run with no error; text is small but readable at DPR 3; touch targets unchanged.

## Sanctum value

All four options were taken through the UI (Temper and Purge with two picker choices each, Rest, Tithe). Outcome text shows real numbers ("Shieldbearer 19 → 66", "+60 gold (you will have 174)"). Rest was the pick the party needed in p2e (two heroes under 50%); Tithe left p2f entering Act 3 at 23/25/1 HP and it died there, which is the intended tension. No UI defects.

## Pacing per act (3x, scripted player)

| Act | Combats per act | Median turns (common / elite / boss) | Notes |
|---|---|---|---|
| 1 | 7–8 | 4 / 7 / 8 | Row 7 elite is the first wall |
| 2 | 6–7 | 5 / 8 / 7 | Chain Golem fights 11–19 turns |
| 3 | 5–6 | 5 / 9 / — | Calcified knight at row 7 ends runs |

A full 3-act run is about 4–5 min at 3x with auto battle. At 1x with manual play this projects to roughly 60–75 min (an estimate, not measured), inside the GDD target of 20–30 min per act; the 11–19-turn elite fights are the outliers that make an act feel long.

## Fixed in this pass (my files)

| Change | Files |
|---|---|
| Act 2 enemy and Act 2 boss logical sizes | `src/view/placeholders.ts` |
| Pops on one unit stack instead of overlapping | `src/scenes/CombatScene.ts` |
| Vanguard tag next to the rank-1 hero's statuses, tap = tooltip with `RULES.vanguardBlock` | `src/scenes/CombatScene.ts`, `src/i18n/en.ts`, `src/i18n/pt-BR.ts` |

## Not checked

Audio by ear, real phones, Safari/Firefox, Rite levels above 3, PT-BR text fit on the new Act 3 screens.
