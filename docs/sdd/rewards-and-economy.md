# SDD-08 Rewards and economy

| Field | Value |
|---|---|
| Status | Draft, 2026-10-26 |
| Owner | Sonnet |
| Phase | PROTOTYPE |
| Depends on | SDD-04, SDD-07, SDD-09 |
| References | GDD §11 (gold, card rewards, pity, equipment drops), §4.4 (camp), §4.5 (rest), §4.6 (shop); `.claude/rules/game-design.md` (every coin feeds a decision) |

## 1. Goal

Implement gold income, card rewards with rarity weights and pity, equipment drops, the camp after every round, the rest node and the shop node, all seeded and all previewable.

## 2. Non-goals

- Events and treasure (Alpha); Embers (SDD-10).
- Price tuning (simulation in SDD-17 changes numbers in `src/data` with reports).

## 3. Requirements

- R-1 Gold: start 50; combat won 10 + int(0..6); elite 28 + int(0..8); boss 75 (GDD §11.1); rolls on the `reward` stream.
- R-2 Card reward after every won fight: 3 distinct cards from the pools of the heroes currently in the party, rarity weights per source (combat 65/30/5, elite 40/45/15, boss 3 rares); the player takes 1 or skips.
- R-3 Pity: each offer without a rare adds +2 percentage points to the rare chance (max +20), moved from common; reset when a rare is offered. Pity is per run and saved.
- R-4 Equipment drops: elite 1 item (common 50 / uncommon 40 / rare 10); boss 1 legendary (GDD §11.3).
- R-5 Camp (after every round except the boss): swap a hero 30; 1 card for sale (35 / 55 / 90 by rarity); 1 equipment (50 / 85); 1 service 12 (seeded: Bind wounds = heal 15% max HP every hero, or Vigil = −3 stress one hero); reorder ranks free; any affordable subset; offers on the `camp` stream.
- R-6 Rest (row 9): exclusive Recover (heal 30% max HP floor, clear injury) / Temper (upgrade 1 card) / Pray (−5 stress every hero).
- R-7 Shop node: 5 cards (3 common, 1 uncommon, 1 rare) priced in range (common 40–48, uncommon 62–75, rare 110–130, seeded); 2 equipment (55 / 90 / 140 by rarity); card removal once per visit at 50 + 25 × removals bought this run.
- R-8 Purchases: illegal when gold < price; each offer can be bought once; buying emits `GoldChanged` and the item event; double commands within one state are impossible (the offer disappears).
- R-9 All prices and weights live in `src/data/economy.ts`.

## 4. Design

- `src/core/run/rewards.ts` (`rollGold`, `offerCards`, `applyPity`, `rollEquipment`).
- `src/core/run/camp.ts`, `rest.ts`, `shop.ts`; offers have stable `OfferId`s.

## 5. Acceptance criteria

- AC-1 Given a combat won, then gold increases by a value in [10, 16]; over 10 000 rolls every value appears.
- AC-2 Given an offer, then its 3 cards are distinct and all owned by party heroes.
- AC-3 Given 4 consecutive offers without a rare, then the 5th offer's rare chance is 5% + 8 pp = 13%; after a rare appears, it resets to 5%.
- AC-4 Given 30 gold at camp, then Swap is legal; with 29, illegal.
- AC-5 Given two removals already bought this run, then the next removal costs 100.
- AC-6 Given Recover on a hero with HP 10, base max 44, injured (current max 33), then the injury clears first (max 44) and the heal uses the restored max: HP = 10 + floor(44 × 0.3) = 23.
- AC-7 Given a shop visit, then exactly 5 cards (3/1/1 by rarity) and 2 equipment are offered, each priced inside its range.
- AC-8 Given a bought offer, then a second `Buy` with the same `OfferId` is not in `legalCommands`.

## 6. Edge cases

- Fewer than 3 distinct eligible cards (tiny pools after heavy picks): offer fewer, never duplicates.
- Boss reward: 3 rares from the party pools; if fewer rares exist, fill with uncommons (log a data warning).
- Recover on a hero at full HP: heals 0 but still clears injury.
- Temper with every card upgraded: option disabled in `legalCommands`.
- Stash full (6) when an equipment drops: the player must equip, replace or discard (SDD-09).

## 7. Test strategy

- Unit: each rule and AC; distribution tests on 10 000 rolls with tolerance ±2 pp.
- Simulation: gold flow per act and "afford about half of what they want" target (GDD §11.1) in SDD-17 reports.

## 8. Verification

```sh
bun test tests/unit/economy
bun run sim -- --seeds 1000 --policy greedy --report economy
```
