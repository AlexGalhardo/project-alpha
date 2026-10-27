# Sim report: three-act balance with the Sanctum, 2026-10-26

Goal (coordinator, PLAN A/B): with the between-act Sanctum on, a 3-act run wins 18–35% and Act 3 is the hardest act. Act 2 should clear about 60%.

## Setup

- `bun run sim -- --runs 400 --seed 1` (4,000 runs, all 10 party compositions), `ACT_RULES.sanctum = true`, Rite 0.
- Code at HEAD `7dd82c6` plus the working tree: Sanctum core, P2-8 hero buffs, turn-limit enrage, Rite 2 tweak, and the Act 3 changes below.
- Act clear rate = runs that cleared the act ÷ runs that entered it, from the sim's defeat-by-row table.

## Before

v0.0.6 Act 3 data (damage × 0.50 of the first draft), Sanctum off, 200 runs: win 21.0%, Act 1 64.7%, Act 2 48.1%, Act 3 67.5%. Act 3 was the easiest act, Act 2 the hardest.

## Act 3 damage sweep (Sanctum on)

| Act 3 damage (× first draft) | Win | Act 1 | Act 2 | Act 3 |
|---|---|---|---|---|
| 0.55 | 27.8% | 71.4% | 61.4% | 63.5% |
| **0.65 (shipped)** | **21.3%** | 71.4% | 61.4% | **48.5%** |
| 0.75 | 15.4% | 71.4% | 61.4% | 35.3% |

Act 2 needed no change: with the Sanctum and today's Act 1–2 changes it clears 61.4%. Scaling levers tried and dropped (200 runs, Act 3 at 0.65): `hpPerAct` 0.1 → win 25.1%, Act 2 66.7%, Act 3 53.2%; `dmgPerAct` 0.05 → win 24.7%, Act 2 67.4%, Act 3 51.6%. Both make Act 2 too easy relative to the 60% target.

## After (shipped)

| Metric | Value | Target |
|---|---|---|
| 3-act run win | 21.3% | 18–35% |
| Act 1 / Act 2 / Act 3 clear | 71.4% / 61.4% / 48.5% | Act 2 ≈ 60%, Act 3 hardest |
| Turns per combat (mean / median / p90) | common 4.3 / 4 / 7; elite 6.6 / 6 / 11; boss 10.4 / 9 / 15 | 3–6 / 5–7 / 7–10 |
| Parties without the Shieldbearer | 6.4% | ≥ 25% (open, hero-side) |

Act 3 numbers changed (first-draft damage × 0.65): Toll-Hammer 6, Snap 3 ×2, Rend 3, Ember 4, Etch 5, Execution 12, Drip 3, Drag 3, Lash 4, Cleave 5, Rift Mother Embrace 9, Rend the Veil 4, Devour 12 / 13, Unmaking 5. HP unchanged (× 0.75, boss 160).

## Open

- Parties without the Shieldbearer win 6.4% (target ≥ 25%): a hero-balance item, not an act item.
- Boss fights average 10.4 turns (target 7–10), mostly the three-phase Rift Mother.
