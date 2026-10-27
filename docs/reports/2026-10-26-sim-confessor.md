# Sim report: Confessor dominance, elite and Rift Mother length, 2026-10-26

Goals (coordinator, QA playtest 2): every hero's share of winning parties within 35–75%, 3-act win 18–35%; elites median 6, p90 ≤ 9; Rift Mother p90 ≤ 14. Baseline uses the improved auto-battle policy (`src/core/auto.ts`, committed today); `scripts/sim.ts` and the bot (`chooseBotCommand`) play combat with that policy.

## Setup

`bun run sim -- --runs 400 --seed 1` (4,000 runs), Sanctum on, Rite 0. Per-boss turns: scratch script over the same bot, 40 runs per composition. Sweeps at 200 runs.

## Finding the source (200 runs, before)

| Variant | Win | Confessor share |
|---|---|---|
| Baseline (new auto policy) | 34.5% | 93.2% |
| Rekindle cost 3 | 33.6% | 93.0% |
| Rekindle revives at 1% | 31.5% | 92.5% |
| Sanctuary 10 → 5 Block | 26.4% | 92.0% |
| Confessor heals halved | 21.4% | 90.2% |
| Confessor stress relief removed | 28.5% | 92.6% |
| Every Confessor heal, Block and relief set to 0 | 13.7% | 76.6% |
| Post-win heal 20% for all (rule probe) | 68.8% | 73.5% |

Rekindle's +53-point lift in the card-usage report is correlation (it is only taken in Confessor runs). The Confessor's edge is structural: all his cards play from H1–3, while Marksman, Arcanist and Bombardier cards are H2–3, so a party without Shieldbearer or Confessor had a back-liner with dead cards in rank 1. Raising difficulty in any way (damage, HP, act scaling) brought the dominance back, because those parties fail first.

## Fix sweep (Vanguard any-rank play on, Vanguard Block 4)

| Enemy damage scale | Calcified | Sanctuary | Win | No SB | Confessor share | Elite mean / median / p90 |
|---|---|---|---|---|---|---|
| 1.0 | −2 | 10 | 71.5% | 82.0% | 69.3% | — |
| 1.2 | −2 | 10 | 40.8% | 50.4% | 77.7% | 6.1 / 5 / 9 |
| 1.25 | −1 | 10 | 32.5% | 41.8% | 75.8% | 5.8 / 5 / 9 |
| 1.25 | −1 | 5 | 30.5% | 39.4% | 74.3% | — |

## Final (shipped, 400 runs)

| Metric | Before | After | Target |
|---|---|---|---|
| 3-act win | 34.5% (200 runs) | 29.6% | 18–35% |
| Share of wins SB / Mk / Ar / Cf / Bb | 66 / 47 / 52 / 93 / 42% | 49 / 56 / 61 / 74 / 60% | 35–75% each |
| No Shieldbearer | 29.4% | 37.8% | ≥ 20% |
| Act 1 / 2 / 3 clear | 84 / 83 / 50% | 86.5 / 77.8 / 44.1% | Act 3 hardest |
| Elite turns mean / median / p90 | 6.6 / 6 / 11 | 5.7 / 5 / 9 | median 6, p90 ≤ 9 |
| Boss turns mean / median / p90 | 8.1 / 8 / 12 | 7.9 / 8 / 11 | 7–10 |
| Rift Mother turns mean / median / p90 | 10.2 / 9 / 18 | 8.0 / 7 / 13 | p90 ≤ 14 |
| Sim gate (Rite 0 / 3 / 6 / 10, 200 runs) | — | 30.5 / 20.3 / 16.3 / 3.8% | — |

Data: `RULES.vanguardAnyRank = true`, `RULES.enemyDamageMul = 1.25`, `ELITE.calcifiedReduction = 1`, Sanctuary 5 Block (8 upgraded). The Rift Mother needed no change of her own: the higher enemy damage shortens fights on both sides (p90 18 → 13). Chain Golem HP was left at 52; the Calcified change alone brought elite p90 to 9.

## Open

- Bell-Maw p90 12 is the longest boss now; within target.
- Rite 10 wins 3.8%: the ladder top is very steep after the damage scale (Rite numbers unchanged).
