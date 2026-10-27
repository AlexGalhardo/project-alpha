# Card usage report (2026-10-26)

Bot runs: 2000 (3 acts, all 10 party compositions, 200 runs each, seed 1). Win rate: 17.2% of all runs. Measured in 86.6 s by a scratch script that calls the core commands the bot issues.

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
| `shb_last_bastion` | 4647 | 2381 | 51.2 | 0.20 | 1024 | 21.3 | 12.9 | 8.4 |
| `mrk_killshot` | 4226 | 2014 | 47.7 | 0.63 | 957 | 15.5 | 18.8 | -3.3 |
| `arc_rift_rupture` | 4239 | 1932 | 45.6 | 0.79 | 929 | 15.6 | 18.6 | -3.0 |
| `bmb_siege_mortar` | 4469 | 1945 | 43.5 | 0.98 | 919 | 23.0 | 12.3 | 10.7 |
| `cnf_rekindle` | 5650 | 2436 | 43.1 | 0.00 | 1105 | 26.5 | 5.7 | 20.8 |
| `shb_bulwark` | 4321 | 1635 | 37.8 | 0.34 | 922 | 21.1 | 13.8 | 7.3 |
| `shb_vow_of_iron` | 4604 | 1684 | 36.6 | 0.66 | 887 | 22.5 | 12.9 | 9.6 |
| `mrk_volley` | 4034 | 1462 | 36.2 | 0.62 | 851 | 13.5 | 19.9 | -6.4 |
| `mrk_hunters_focus` | 4392 | 1581 | 36.0 | 0.76 | 884 | 14.4 | 19.4 | -5.1 |
| `arc_unseal` | 4276 | 1528 | 35.7 | 0.00 | 881 | 14.3 | 19.5 | -5.2 |

## Bottom 10 by pick rate (offered at least once)

| Card | Offered | Picked | Pick rate | Plays per combat (owned) | Runs took it | Win % took it | Win % not | Lift (pts) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `cnf_litany` | 6737 | 298 | 4.4 | 1.01 | 272 | 22.1 | 16.4 | 5.6 |
| `cnf_rebuke` | 6763 | 310 | 4.6 | 1.26 | 287 | 30.3 | 15.0 | 15.3 |
| `bmb_incendiary` | 5780 | 300 | 5.2 | 1.06 | 266 | 19.9 | 16.8 | 3.1 |
| `cnf_absolve` | 6840 | 369 | 5.4 | 0.66 | 330 | 18.8 | 16.9 | 1.9 |
| `arc_cinder_lance` | 5376 | 291 | 5.4 | 0.60 | 270 | 13.7 | 17.7 | -4.0 |
| `arc_channel` | 5348 | 299 | 5.6 | 0.00 | 272 | 12.5 | 17.9 | -5.4 |
| `shb_shield_slam` | 6017 | 337 | 5.6 | 0.34 | 314 | 18.2 | 17.0 | 1.1 |
| `bmb_reload` | 5536 | 317 | 5.7 | 0.00 | 282 | 14.9 | 17.6 | -2.7 |
| `shb_iron_stance` | 5675 | 331 | 5.8 | 0.51 | 289 | 25.6 | 15.8 | 9.8 |
| `mrk_pinning_shot` | 5416 | 317 | 5.9 | 0.56 | 292 | 12.0 | 18.1 | -6.1 |

## Top 10 by win lift (taken in 30+ runs)

| Card | Offered | Picked | Pick rate | Plays per combat (owned) | Runs took it | Win % took it | Win % not | Lift (pts) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `cnf_steadfast_hymn` | 5346 | 1779 | 33.3 | 0.90 | 947 | 29.0 | 6.6 | 22.5 |
| `cnf_mass_mend` | 5214 | 1815 | 34.8 | 0.76 | 948 | 28.8 | 6.7 | 22.0 |
| `cnf_rekindle` | 5650 | 2436 | 43.1 | 0.00 | 1105 | 26.5 | 5.7 | 20.8 |
| `cnf_rebuke` | 6763 | 310 | 4.6 | 1.26 | 287 | 30.3 | 15.0 | 15.3 |
| `bmb_concussion_round` | 5701 | 345 | 6.1 | 0.81 | 307 | 26.7 | 15.5 | 11.2 |
| `bmb_powder_keg` | 4461 | 1452 | 32.5 | 0.66 | 841 | 23.5 | 12.6 | 10.9 |
| `bmb_siege_mortar` | 4469 | 1945 | 43.5 | 0.98 | 919 | 23.0 | 12.3 | 10.7 |
| `shb_iron_stance` | 5675 | 331 | 5.8 | 0.51 | 289 | 25.6 | 15.8 | 9.8 |
| `shb_vow_of_iron` | 4604 | 1684 | 36.6 | 0.66 | 887 | 22.5 | 12.9 | 9.6 |
| `shb_last_bastion` | 4647 | 2381 | 51.2 | 0.20 | 1024 | 21.3 | 12.9 | 8.4 |

## Bottom 10 by win lift (taken in 30+ runs)

| Card | Offered | Picked | Pick rate | Plays per combat (owned) | Runs took it | Win % took it | Win % not | Lift (pts) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `arc_burn_hex` | 5477 | 367 | 6.7 | 0.72 | 328 | 10.7 | 18.5 | -7.8 |
| `mrk_volley` | 4034 | 1462 | 36.2 | 0.62 | 851 | 13.5 | 19.9 | -6.4 |
| `mrk_pinning_shot` | 5416 | 317 | 5.9 | 0.56 | 292 | 12.0 | 18.1 | -6.1 |
| `arc_firestorm` | 4130 | 1471 | 35.6 | 0.51 | 844 | 13.9 | 19.6 | -5.8 |
| `arc_channel` | 5348 | 299 | 5.6 | 0.00 | 272 | 12.5 | 17.9 | -5.4 |
| `arc_unseal` | 4276 | 1528 | 35.7 | 0.00 | 881 | 14.3 | 19.5 | -5.2 |
| `mrk_quick_draw` | 5304 | 312 | 5.9 | 0.64 | 281 | 12.8 | 17.9 | -5.1 |
| `mrk_hunters_focus` | 4392 | 1581 | 36.0 | 0.76 | 884 | 14.4 | 19.4 | -5.1 |
| `mrk_piercing_bolt` | 5551 | 352 | 6.3 | 0.50 | 318 | 13.2 | 18.0 | -4.7 |
| `arc_cinder_lance` | 5376 | 291 | 5.4 | 0.60 | 270 | 13.7 | 17.7 | -4.0 |

## Dead cards: offered but never picked (0)

None.

## Never offered (10)

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

## Bot blind spots: cards with zero plays

The bot's combat policy (`src/core/auto.ts`, `scoreCardPlay`) scores a play by damage, Block, healing, stress relieved, status stacks and kills. A card with none of these scores zero or below and is never played, even when it is playable. Measured: `arc_channel` was playable in hand 549 times in 40 runs and never played. Cards with zero plays per combat:

- `arc_channel`: next-turn energy only. Playable, never played by the bot.
- `bmb_reload`: draw and a bonus on the next attack. Never played.
- `arc_unseal`: draw plus 1 Dread. Dread costs stress, so the score is negative. Never played.
- `cnf_rekindle`: only a fallen hero can be the target. The bot has no fallen target most of the time, so 0 plays is expected in a few runs; it is not a bot decision problem alone.

These four cards are not evidence that the cards are weak. Judge them by hand in a playtest. Their pick rate reflects the bot's pick rule (it scores offers by its own rule), not how a human would value them.

## Recommendations (not applied)

- Dead cards: if a card is never picked by the bot, check first whether the bot can use it at all (for example, Rite-free runs or upgrade gates). Do not change numbers from this report alone.
- Win-lift outliers: a large positive lift can mean the card is strong or that the bot takes it late, in good runs. Confirm with a human playtest before changing its numbers.
- Any number change follows the double/halve rule, and a simulation before and after (`bun run sim`).
