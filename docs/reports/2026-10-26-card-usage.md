# Card usage report (2026-10-26)

Bot runs: 2000 (3 acts, all 10 party compositions, 200 runs each, seed 1). Win rate: 36.2% of all runs. Measured in 108.2 s by a scratch script that calls the core commands the bot issues.

## Method

- Offered: a card shown in a reward offer (3 cards per combat), in a shop (5 cards on arrival), or as the camp card. Counted once per offer.
- Picked: taken from one of those offers.
- Plays per combat: total plays of the card divided by the combats it was in the deck for.
- Win % took it / not: share of runs that beat the final boss, split by whether the run ever took the card (starter cards excluded).
- Lift: win % took it minus win % not. Only cards taken in at least 30 runs are ranked by lift.

## Bot bias (read before using these numbers)

- The bot always picks by its own greedy rule. A card the bot never picks may be good for a human player, and a card it picks often may be only good for the bot.
- Lift measures correlation, not cause. A run that takes a card also takes other cards and reaches different rooms.
- One seed set, one bot, no human judgement. Rankings move with the seed; use this to find outliers, not to set numbers.

## Top 10 by pick rate

| Card | Offered | Picked | Pick rate | Plays per combat (owned) | Runs took it | Win % took it | Win % not | Lift (pts) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `shb_last_bastion` | 5142 | 2623 | 51.0 | 0.22 | 1047 | 37.4 | 34.8 | 2.6 |
| `mrk_killshot` | 4759 | 2241 | 47.1 | 0.68 | 996 | 32.4 | 39.9 | -7.5 |
| `arc_rift_rupture` | 4970 | 2178 | 43.8 | 0.77 | 958 | 39.8 | 32.9 | 6.9 |
| `bmb_siege_mortar` | 5044 | 2136 | 42.3 | 0.96 | 965 | 39.0 | 33.6 | 5.3 |
| `cnf_rekindle` | 6559 | 2706 | 41.3 | 0.15 | 1121 | 59.5 | 6.5 | 53.0 |
| `shb_bulwark` | 4584 | 1744 | 38.0 | 0.38 | 943 | 38.1 | 34.5 | 3.5 |
| `mrk_hunters_focus` | 4729 | 1699 | 35.9 | 0.83 | 919 | 31.7 | 40.1 | -8.4 |
| `arc_firestorm` | 4610 | 1655 | 35.9 | 0.44 | 900 | 36.9 | 35.6 | 1.3 |
| `shb_vow_of_iron` | 4872 | 1748 | 35.9 | 0.76 | 912 | 38.2 | 34.6 | 3.6 |
| `mrk_volley` | 4311 | 1536 | 35.6 | 0.64 | 871 | 31.6 | 39.8 | -8.2 |

## Bottom 10 by pick rate (offered at least once)

| Card | Offered | Picked | Pick rate | Plays per combat (owned) | Runs took it | Win % took it | Win % not | Lift (pts) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `cnf_litany` | 7399 | 303 | 4.1 | 1.01 | 277 | 51.6 | 33.7 | 17.9 |
| `cnf_rebuke` | 7487 | 309 | 4.1 | 1.23 | 287 | 58.5 | 32.5 | 26.1 |
| `bmb_incendiary` | 6260 | 302 | 4.8 | 1.03 | 271 | 32.8 | 36.7 | -3.9 |
| `cnf_absolve` | 7583 | 373 | 4.9 | 0.61 | 333 | 43.8 | 34.7 | 9.2 |
| `arc_cinder_lance` | 5981 | 295 | 4.9 | 0.68 | 276 | 36.6 | 36.1 | 0.5 |
| `arc_channel` | 5908 | 297 | 5.0 | 0.77 | 273 | 33.7 | 36.6 | -2.9 |
| `shb_shield_slam` | 6387 | 336 | 5.3 | 0.35 | 314 | 36.6 | 36.1 | 0.5 |
| `mrk_pinning_shot` | 5758 | 308 | 5.3 | 0.58 | 285 | 31.9 | 36.9 | -5.0 |
| `bmb_reload` | 6017 | 328 | 5.5 | 1.37 | 284 | 33.5 | 36.7 | -3.2 |
| `mrk_quick_draw` | 5749 | 317 | 5.5 | 0.71 | 284 | 29.6 | 37.3 | -7.7 |

## Top 10 by win lift (taken in 30+ runs)

| Card | Offered | Picked | Pick rate | Plays per combat (owned) | Runs took it | Win % took it | Win % not | Lift (pts) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `cnf_rekindle` | 6559 | 2706 | 41.3 | 0.15 | 1121 | 59.5 | 6.5 | 53.0 |
| `cnf_mass_mend` | 5795 | 1950 | 33.6 | 0.76 | 992 | 60.4 | 12.4 | 48.0 |
| `cnf_steadfast_hymn` | 5898 | 1947 | 33.0 | 0.91 | 997 | 59.6 | 13.0 | 46.6 |
| `cnf_rebuke` | 7487 | 309 | 4.1 | 1.23 | 287 | 58.5 | 32.5 | 26.1 |
| `cnf_litany` | 7399 | 303 | 4.1 | 1.01 | 277 | 51.6 | 33.7 | 17.9 |
| `cnf_absolve` | 7583 | 373 | 4.9 | 0.61 | 333 | 43.8 | 34.7 | 9.2 |
| `bmb_powder_keg` | 4797 | 1545 | 32.2 | 0.63 | 869 | 40.2 | 33.2 | 7.0 |
| `arc_rift_rupture` | 4970 | 2178 | 43.8 | 0.77 | 958 | 39.8 | 32.9 | 6.9 |
| `shb_iron_stance` | 6019 | 334 | 5.5 | 0.52 | 293 | 41.0 | 35.4 | 5.6 |
| `bmb_siege_mortar` | 5044 | 2136 | 42.3 | 0.96 | 965 | 39.0 | 33.6 | 5.3 |

## Bottom 10 by win lift (taken in 30+ runs)

| Card | Offered | Picked | Pick rate | Plays per combat (owned) | Runs took it | Win % took it | Win % not | Lift (pts) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `mrk_piercing_bolt` | 6083 | 358 | 5.9 | 0.50 | 321 | 25.2 | 38.3 | -13.1 |
| `mrk_hunters_focus` | 4729 | 1699 | 35.9 | 0.83 | 919 | 31.7 | 40.1 | -8.4 |
| `mrk_volley` | 4311 | 1536 | 35.6 | 0.64 | 871 | 31.6 | 39.8 | -8.2 |
| `mrk_quick_draw` | 5749 | 317 | 5.5 | 0.71 | 284 | 29.6 | 37.3 | -7.7 |
| `mrk_killshot` | 4759 | 2241 | 47.1 | 0.68 | 996 | 32.4 | 39.9 | -7.5 |
| `arc_burn_hex` | 6056 | 371 | 6.1 | 0.80 | 332 | 31.6 | 37.1 | -5.5 |
| `mrk_pinning_shot` | 5758 | 308 | 5.3 | 0.58 | 285 | 31.9 | 36.9 | -5.0 |
| `bmb_barrage` | 4698 | 1630 | 34.7 | 0.98 | 921 | 33.9 | 38.2 | -4.3 |
| `bmb_incendiary` | 6260 | 302 | 4.8 | 1.03 | 271 | 32.8 | 36.7 | -3.9 |
| `bmb_reload` | 6017 | 328 | 5.5 | 1.37 | 284 | 33.5 | 36.7 | -3.2 |

## Dead cards: offered but never picked (0)

None.

## Never offered (10)

Expected: these are Legacy skill-tree unlocks (GDD 22.5). The sim runs have no meta profile, so they are never added to the reward pool. Not a data problem.

- `shb_rampart` (Rampart)
- `shb_riposte` (Riposte)
- `mrk_ricochet` (Ricochet)
- `mrk_deadeye` (Deadeye)
- `arc_cinder_ward` (Cinder Ward)
- `arc_inferno` (Inferno)
- `cnf_penance` (Penance)
- `cnf_last_rites` (Last Rites)
- `bmb_shrapnel` (Shrapnel)
- `bmb_flashbang` (Flashbang)

## All cards

| Card | Offered | Picked | Pick rate | Plays per combat (owned) | Runs took it | Win % took it | Win % not | Lift (pts) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `arc_burn_hex` | 6056 | 371 | 6.1 | 0.80 | 332 | 31.6 | 37.1 | -5.5 |
| `arc_channel` | 5908 | 297 | 5.0 | 0.77 | 273 | 33.7 | 36.6 | -2.9 |
| `arc_cinder_lance` | 5981 | 295 | 4.9 | 0.68 | 276 | 36.6 | 36.1 | 0.5 |
| `arc_cinder_ward` | 0 | 0 | 0.0 | 0.00 | 0 | 0.0 | 36.2 | -36.2 |
| `arc_firestorm` | 4610 | 1655 | 35.9 | 0.44 | 900 | 36.9 | 35.6 | 1.3 |
| `arc_inferno` | 0 | 0 | 0.0 | 0.00 | 0 | 0.0 | 36.2 | -36.2 |
| `arc_rift_rupture` | 4970 | 2178 | 43.8 | 0.77 | 958 | 39.8 | 32.9 | 6.9 |
| `arc_unseal` | 4756 | 1642 | 34.5 | 1.50 | 887 | 37.9 | 34.9 | 3.0 |
| `bmb_barrage` | 4698 | 1630 | 34.7 | 0.98 | 921 | 33.9 | 38.2 | -4.3 |
| `bmb_concussion_round` | 6144 | 351 | 5.7 | 0.80 | 312 | 37.5 | 36.0 | 1.5 |
| `bmb_flashbang` | 0 | 0 | 0.0 | 0.00 | 0 | 0.0 | 36.2 | -36.2 |
| `bmb_incendiary` | 6260 | 302 | 4.8 | 1.03 | 271 | 32.8 | 36.7 | -3.9 |
| `bmb_powder_keg` | 4797 | 1545 | 32.2 | 0.63 | 869 | 40.2 | 33.2 | 7.0 |
| `bmb_reload` | 6017 | 328 | 5.5 | 1.37 | 284 | 33.5 | 36.7 | -3.2 |
| `bmb_shrapnel` | 0 | 0 | 0.0 | 0.00 | 0 | 0.0 | 36.2 | -36.2 |
| `bmb_siege_mortar` | 5044 | 2136 | 42.3 | 0.96 | 965 | 39.0 | 33.6 | 5.3 |
| `cnf_absolve` | 7583 | 373 | 4.9 | 0.61 | 333 | 43.8 | 34.7 | 9.2 |
| `cnf_last_rites` | 0 | 0 | 0.0 | 0.00 | 0 | 0.0 | 36.2 | -36.2 |
| `cnf_litany` | 7399 | 303 | 4.1 | 1.01 | 277 | 51.6 | 33.7 | 17.9 |
| `cnf_mass_mend` | 5795 | 1950 | 33.6 | 0.76 | 992 | 60.4 | 12.4 | 48.0 |
| `cnf_penance` | 0 | 0 | 0.0 | 0.00 | 0 | 0.0 | 36.2 | -36.2 |
| `cnf_rebuke` | 7487 | 309 | 4.1 | 1.23 | 287 | 58.5 | 32.5 | 26.1 |
| `cnf_rekindle` | 6559 | 2706 | 41.3 | 0.15 | 1121 | 59.5 | 6.5 | 53.0 |
| `cnf_steadfast_hymn` | 5898 | 1947 | 33.0 | 0.91 | 997 | 59.6 | 13.0 | 46.6 |
| `mrk_deadeye` | 0 | 0 | 0.0 | 0.00 | 0 | 0.0 | 36.2 | -36.2 |
| `mrk_hunters_focus` | 4729 | 1699 | 35.9 | 0.83 | 919 | 31.7 | 40.1 | -8.4 |
| `mrk_killshot` | 4759 | 2241 | 47.1 | 0.68 | 996 | 32.4 | 39.9 | -7.5 |
| `mrk_piercing_bolt` | 6083 | 358 | 5.9 | 0.50 | 321 | 25.2 | 38.3 | -13.1 |
| `mrk_pinning_shot` | 5758 | 308 | 5.3 | 0.58 | 285 | 31.9 | 36.9 | -5.0 |
| `mrk_quick_draw` | 5749 | 317 | 5.5 | 0.71 | 284 | 29.6 | 37.3 | -7.7 |
| `mrk_ricochet` | 0 | 0 | 0.0 | 0.00 | 0 | 0.0 | 36.2 | -36.2 |
| `mrk_volley` | 4311 | 1536 | 35.6 | 0.64 | 871 | 31.6 | 39.8 | -8.2 |
| `shb_bulwark` | 4584 | 1744 | 38.0 | 0.38 | 943 | 38.1 | 34.5 | 3.5 |
| `shb_iron_stance` | 6019 | 334 | 5.5 | 0.52 | 293 | 41.0 | 35.4 | 5.6 |
| `shb_last_bastion` | 5142 | 2623 | 51.0 | 0.22 | 1047 | 37.4 | 34.8 | 2.6 |
| `shb_rampart` | 0 | 0 | 0.0 | 0.00 | 0 | 0.0 | 36.2 | -36.2 |
| `shb_riposte` | 0 | 0 | 0.0 | 0.00 | 0 | 0.0 | 36.2 | -36.2 |
| `shb_shield_slam` | 6387 | 336 | 5.3 | 0.35 | 314 | 36.6 | 36.1 | 0.5 |
| `shb_shove` | 5967 | 376 | 6.3 | 0.64 | 340 | 33.8 | 36.7 | -2.9 |
| `shb_vow_of_iron` | 4872 | 1748 | 35.9 | 0.76 | 912 | 38.2 | 34.6 | 3.6 |

## Auto policy change: before and after

The bot is the auto policy (`chooseBotCommand` uses `chooseAutoCommand`). The scoring in `src/core/auto.ts` gained four terms: energy for next turn (`ENERGY_VALUE` 6 per point), a value per card drawn (`CARD_VALUE` 4), a Reload bonus worth 0.8 of its size when the owner has an attack in hand, a Rekindle return value (15 plus 0.8 of the HP restored), and a 50-point penalty for a Dread play that collapses its owner.

| Measure | Before | After |
| --- | --- | --- |
| 3-act win rate (all runs) | 17.2% | 36.2% |
| Plays per combat: `arc_channel` | 0.00 | 0.77 |
| Plays per combat: `bmb_reload` | 0.00 | 1.37 |
| Plays per combat: `arc_unseal` | 0.00 | 1.50 |
| Plays per combat: `cnf_rekindle` | 0.00 | 0.15 |
| Win % of runs that took `cnf_rekindle` | 26.5% | 59.5% |

The win rate roughly doubled. The change in scoring is large, and this run does not isolate the cause. Rekindle's win rate among runs that took it moved most (26.5% to 59.5%), so the return value probably drives many more hero returns. Treat 36.2% as the new baseline only after checking the cause. Every balance number and every sim gate tuned under the old 17% bot (`docs/reports/2026-10-26-sim-gate.md`, `2026-10-26-sim-rites.md`) needs a re-run.

The four cards that had zero plays under the old policy are no longer blind spots. The blind-spot note in the first version of this report is superseded.

## Recommendations (not applied)

- Dead cards: if a card is never picked by the bot, check first whether the bot can use it at all (for example, Rite-free runs or upgrade gates). Do not change numbers from this report alone.
- Win-lift outliers: a large positive lift can mean the card is strong or that the bot takes it late, in good runs. Confirm with a human playtest before changing its numbers.
- Any number change follows the double/halve rule, and a simulation before and after (`bun run sim`).
