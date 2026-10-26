# SDD-09 Heroes and equipment

| Field | Value |
|---|---|
| Status | Draft, 2026-10-26 |
| Owner | Sonnet |
| Phase | PROTOTYPE |
| Depends on | SDD-03, SDD-04 |
| References | GDD §8 (roster, data model), §12 (equipment rules, 8 items), §4.4 (swap), §5.6 (injury); Art Bible §5 (hero bands) |

## 1. Goal

Model the 5 heroes, the party of 3 with ranks, the camp swap, injuries, and equipment with 2 slots per hero, a stash, and modifiers that feed card numbers and previews.

## 2. Non-goals

- Skill tree and hero variants (SDD-10, Alpha).
- Personal names and backstories (GDD Q-HERO).

## 3. Requirements

- R-1 Roster (GDD §8.1): `shieldbearer` 60 HP, `marksman` 42, `arcanist` 38, `confessor` 44, `bombardier` 48; each has 9 cards (3 starter rows, 4 starter instances).
- R-2 Party select: exactly 3 distinct heroes with ranks H1–H3; default suggestion Shieldbearer H1, Confessor H2, Marksman H3.
- R-3 Hero state: `id`, `maxHP`, `HP`, `stress`, `injured`, `rank`, `weapon`, `relic` (GDD §8.2).
- R-4 Swap at camp (30 gold): the incoming hero joins at full HP, 0 stress, with its 4 starters, in the leaving hero's rank; the leaving hero's cards leave the deck; its equipment moves to the stash.
- R-5 Reorder ranks at camp: free; any permutation of the 3 heroes.
- R-6 Equipment: 2 slots (weapon, relic), any hero can equip any item; equip/unequip at camp and after rewards; stash max 6.
- R-7 The 8 prototype items and effects exactly as GDD §12.2; weapon effects modify the owner's card numbers (damage per hit, Block values) or add on-play effects; relics are passives with explicit triggers.
- R-8 Max-HP changes (Bone Reliquary +6, injury −25%) recompute HP as: gain raises HP by the same amount; loss clamps HP to the new max.
- R-9 The card detail panel and preview use modified numbers (SDD-04 R-9).

## 4. Design

- `src/data/heroes.ts`, `src/data/items.ts` (keys `eq_*`).
- `src/core/progression/equipment.ts`: `equip`, `unequip`, `modifiers(hero) -> CardModifiers`, relic triggers registered by event type (`CombatStarted`, `TurnStarted`, `AttackPlayed`, `CombatWon`).

## 5. Acceptance criteria

- AC-1 Given party select with 2 heroes, then `StartRun` is not legal; with 3 distinct heroes and ranks, it is.
- AC-2 Given Notched Blade on the Marksman, then Aimed Shot previews 7 and Volley previews 5 ×2 per enemy.
- AC-3 Given Heavy Pavise on the Shieldbearer, then Brace gives 8 Block to self and 2 to others (only the owner's Block values +2).
- AC-4 Given Iron Rosary, then the owner has 6 Block when a combat starts (before the first draw).
- AC-5 Given Bell Clapper and any hero at ≥ 7 stress at turn start, then energy +1 once that turn.
- AC-6 Given a swap of an equipped hero with 2 items, then both items are in the stash; if the stash would exceed 6, then the swap requires choosing items to discard first (command carries the choice).
- AC-7 Given an injured hero (max 44 → 33) equipping Bone Reliquary, then max = 39 and HP +6.

## 6. Edge cases

- Unequip a Bone Reliquary from a hero at full HP: HP clamps to the new max.
- Ember Focus "first attack each turn": a multi-hit counts as one attack; the Burn applies once.
- Hunter's Lens "first attack each combat": a random-target attack applies Marked to the first enemy hit.
- Swapping back a hero swapped out earlier in the run: returns fresh (full HP, 0 stress, starters only); cards taken earlier for it are not restored.

## 7. Test strategy

- Unit: each item effect, swap, reorder, stash limit, max-HP math.
- Integration: a run with each hero composition (10 compositions) completes with the greedy policy (no errors).
- Simulation: party composition parity (GDD §20 #4) in SDD-17.

## 8. Verification

```sh
bun test tests/unit/heroes
bun test tests/unit/equipment
```
