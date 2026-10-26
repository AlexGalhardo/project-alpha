# Simulation report: Act 1 prototype balance pass

Date: 2026-10-26. Tool: `bun run sim` (`scripts/sim.ts`), greedy bot of GDD 14.1 (`chooseBotCommand`), full Act 1 per run.
Sample: 10 party compositions x 1000 runs, seeds 1-1000 (10 000 runs). Control sample with seeds 5001-6000 gives the same result within noise (see the end).
Rule applied (`.claude/rules/game-design.md`): double or halve first, then refine; sim before and after.

## Result against GDD 20

| Metric | Target | Before | After |
|---|---|---|---|
| Run win rate (bot) | 35-60% | 30.0% | **51.5%** |
| Parties without the Shieldbearer | >= 25% | 9.6% | **28.4%** |
| Runs with at least 1 Collapse | >= 40% | 62.9% | 53.8% |
| Common combat, turns (mean / median / p90) | 3-6 | 4.0 / 3 / 6 | 4.0 / 4 / 6 |
| Elite combat, turns | 5-7 | 9.0 / 8 / 14 | **6.8** / 6 / 11 |
| Boss combat, turns | 7-10 | 14.7 / 14 / 19 | **8.9** / 9 / 12 |
| Hero share of winning parties, lowest | >= 15% | 39.4% (arcanist) | 48.2% (arcanist, bombardier) |
| Hero falls per run | none set | 2.95 | 2.20 |
| Embers per run | none set | 22.1 | 27.6 |

Hero share of winning parties and win rate when present, after:

| Hero | Share of wins | Win rate when present | Before: share / win rate |
|---|---|---|---|
| Shieldbearer | 77.9% | 66.8% | 87.2% / 43.6% |
| Confessor | 74.2% | 63.6% | 83.5% / 41.8% |
| Marksman | 51.5% | 44.2% | 48.1% / 24.1% |
| Arcanist | 48.2% | 41.3% | 39.4% / 19.7% |
| Bombardier | 48.2% | 41.3% | 41.8% / 20.9% |

Win rate by composition, before and after:

| Party (rank order) | Before | After |
|---|---|---|
| shieldbearer + confessor + marksman | 80.7% | 93.4% |
| shieldbearer + confessor + bombardier | 70.5% | 89.1% |
| shieldbearer + confessor + arcanist | 61.0% | 87.3% |
| shieldbearer + marksman + arcanist | 18.4% | 45.5% |
| shieldbearer + marksman + bombardier | 18.1% | 45.3% |
| shieldbearer + arcanist + bombardier | 13.0% | 40.4% |
| confessor + marksman + arcanist | 14.5% | 40.4% |
| confessor + marksman + bombardier | 12.5% | 38.9% |
| confessor + arcanist + bombardier | 11.3% | 32.8% |
| marksman + arcanist + bombardier | 0.1% | 1.6% |

Defeats by round after: 4:404, 5:396, 6:668, 7:1455, 8:970, 10:960 (before: 4:1133, 5:776, 6:800, 7:1537, 8:681, 10:2072).

## Data changes (all in `src/data/`)

| Value | File | Before | After |
|---|---|---|---|
| Bell-Maw HP | `enemies.ts` (`ENEMIES.bell_maw.hp`) | 160 | 100 |
| Bell-Maw phase 2 threshold | `enemies.ts` (`ENEMIES.bell_maw.phase2Hp`) | 80 (50%) | 50 (50%) |
| Elite HP multiplier | `enemies.ts` (`ELITE.hpMul`) | 1.75 | 1.25 |
| Tier A encounter A5 (new) | `enemies.ts` (`ENCOUNTERS.A5`) | - | chitter_swarm, lantern_leech (24 HP) |
| Tier A encounter A6 (new) | `enemies.ts` (`ENCOUNTERS.A6`) | - | husk_penitent, choir_thing (44 HP) |

Resulting elite HP: Templar Captain 34 x 1.25 = 43 (was 60), Calcified Brute 46 x 1.25 = 58 (was 81). Elite damage multiplier stays 1.25.

Hero HP, card values and enemy damage were not changed. Elite constants moved from four separate exports into one object `ELITE` (`hpMul`, `damageMul`, `calcifiedReduction`, `oathwallBlock`) so the sim can patch them (`--set`).

## How the numbers were reached

Order of levers (200 runs per composition per step, seed 1, the 10 compositions):

| Step | Win | No Shieldbearer | Elite turns | Boss turns |
|---|---|---|---|---|
| Start (new encounter rule, A5 and A6) | 29.3% | 10.2% | 8.8 | 14.6 |
| Boss HP 160 to 80, phase at 40 (halve) | 44.8% | 23.9% | 8.8 | 7.1 |
| Boss 100 / 50 and elite x1.25 (chosen) | 50.7% | 28.4% | 6.8 | 9.0 |
| Same + non-tank max HP +5% | 53.4% | 32.1% | 6.8 | 8.9 |
| Same + non-tank max HP +10% | 56.4% | 38.5% | 6.8 | 8.9 |

Boss at 80 HP gave 7.1 turns, the edge of the 7-10 band, and a human plays better than the bot, so 100 was chosen to centre the band. Raising non-tank HP was not needed: the Shieldbearer gap was probably the long boss (it cost parties without a front tank their HP before the end), and the remaining gap is the front-rank rule, not HP. No starter Guard change was needed.

## Known issues and open points

- Parties with three back-line heroes (marksman + arcanist + bombardier) still win about 2%: nobody can hold H1 and the front hero is hit by every default intent. It is a legal composition; options are a Party select warning or a front-rank hint, not a number change.
- The Shieldbearer is still in 78% of winning parties (it was 87%); every other hero is at 48% or more.
- Encounter coverage (GDD 4.3): with strict tiers all 10 enemy types are seen by row 8 on about 72% of the paths with at least 6 combats (35% before A5 and A6). Letting an encounter of the other tier compete (`ENCOUNTER_RULES.offTierWeight`, 0 today) gives 98%, but then Tier A is never drawn in rows 1-3. The default keeps the difficulty ramp. Tests: `tests/unit/run.test.ts`.
- The bot never uses Rest "Temper" cleverly, buys by a simple rule and plays Powers at a flat value of 6; a human is expected to win more often than the numbers above.

## Reproduce

```text
bun run sim -- --runs 1000 --seed 1
bun run sim -- --runs 200 --party shieldbearer,confessor,marksman
bun run sim -- --runs 200 --set ELITE.hpMul=1.5 --set ENEMIES.bell_maw.hp=120
```

`--set path=value` patches one numeric data value in memory (dev only). One worker runs per composition; 10 000 runs take about 30 s.

Control sample (seeds 5001-6000): win 52.0%, no Shieldbearer 28.3%, Collapse 55.5%, turns 4.0 / 6.6 / 8.9.
