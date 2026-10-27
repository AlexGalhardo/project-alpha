# Sim report: Vanguard rule and boss length, 2026-10-26

Goals (coordinator): parties without the Shieldbearer win ≥ 20%, every hero ≥ 15% share of wins, 3-act win 18–35%; boss fights 7–10 turns. Rule design and lenses: GDD §5.2, §8.3; idea record B41.

## Setup

`bun run sim -- --runs 400 --seed 1` (4,000 runs over the 10 compositions), Sanctum on, Rite 0. Per-boss turns: a scratch script over the same bot (40 runs per composition). Act clear rate = cleared ÷ entered.

## Vanguard sweeps (200 runs, Act 3 damage × 0.65, old bosses)

| Vanguard Block, any rank-1 hero | Win | No Shieldbearer |
|---|---|---|
| 0 | 21.3% | 6.9% |
| 1 | 27.2% | 14.1% |
| 2 | 35.0% | 22.6% |
| 3 | 43.3% | 36.5% |
| 4 | 47.7% | 45.1% |

Block for every rank-1 hero also strengthens Shieldbearer parties, so the no-Shieldbearer rate stays about half the overall rate: both targets cannot hold together. Restricting Vanguard to heroes that are not natural front-liners (`frontOrder > 1`) helps the no-tank parties only:

| Non-tank Vanguard | Act 3 damage | Win | No Shieldbearer |
|---|---|---|---|
| 4 | × 0.9 | 36.8% | 36.1% |
| 3 | × 0.9 | 31.1% | 23.3% |
| **4** | **× 1.0** | **28.3%** | **26.6%** |

## Boss length (per boss, before → after)

| Boss | Before (mean / median / p90) | After |
|---|---|---|
| Bell-Maw (Act 1, unchanged) | 9.3 / 9 / 13 | 9.6 / 9 / 14 |
| Gilded Penitent 140 → 110 HP | 11.0 / 10 / 16 | 8.7 / 8 / 12 |
| Rift Mother 160 → 100 HP, heal 15 → 8, damage up | 16.2 / 15 / 26 | 10.2 / 9 / 18 |

## Final (shipped, 400 runs)

| Metric | Before (v0.0.7 candidate) | After | Target |
|---|---|---|---|
| 3-act win | 21.3% | 26.8% | 18–35% |
| No Shieldbearer | 6.4% | 24.3% | ≥ 20% |
| Share of wins (SB / Mk / Ar / Cf / Bb) | 88 / 45 / 41 / 90 / 37% | 64 / 51 / 54 / 92 / 39% | each ≥ 15% |
| Act 1 / 2 / 3 clear | 71.4 / 61.4 / 48.5% | 83.7 / 78.8 / 40.7% | Act 3 hardest |
| Boss turns mean / median / p90 | 10.4 / 9 / 15 | 8.1 / 8 / 12 | 7–10 |

Data: `RULES.vanguardBlock = 4`; Act 3 non-boss damage back to the first draft (HP × 0.75 kept); Gilded Penitent HP 110 (phase 2 ≤ 55); Rift Mother HP 100 (phases ≤ 66, ≤ 33), Heartbeat heal 8, Embrace 12, Rend the Veil 5, Devour 15 / 16, Unmaking 6.

## Open

- The Confessor is in 92% of wins: sustain dominance (next item).
- Rift Mother p90 is still 18 turns (healing plus Block in phase 3 for strong-defence parties).
