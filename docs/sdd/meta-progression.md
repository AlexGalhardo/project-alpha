# SDD-10 Meta-progression

| Field | Value |
|---|---|
| Status | Draft, 2026-10-26 |
| Owner | Sonnet |
| Phase | PROTOTYPE (tally only) / ALPHA (spending) / BETA (Rites) |
| Depends on | SDD-07, SDD-11 |
| References | GDD §13 (Embers, skill tree, Rites), B21, B22, B27; `.claude/rules/game-design.md` (options, not raw power) |

## 1. Goal

Grant Embers at the end of every run, store them in the meta profile, and (Alpha) spend them on skill-tree nodes that add options; (Beta) unlock the 10 Rites.

## 2. Non-goals

- Any stat bonus that carries between runs (forbidden).
- Spending in the prototype (tally only).

## 3. Requirements

- R-1 `embers = 2 × roundsCleared + 5 × elitesWon + 15 × bossesWon`, granted on victory and on defeat (GDD §13.1).
- R-2 The meta profile (separate from the run save) stores `embersTotal`, `embersSpent`, unlocked node ids, unlocked Rite level, run history (last 20 summaries).
- R-3 Prototype: Embers are shown in the run summary and stored; no spending UI.
- R-4 Alpha: per hero 3 branches × 4 nodes, costs 10 / 20 / 35 / 50; a node requires the previous node of its branch; node effects are limited to: add a card to the hero's pool, a card variant, a starter-deck swap, a hero variant.
- R-5 Beta: Rites 1–10 unlocked one at a time by winning at the previous Rite; cumulative modifiers exactly as GDD §13.3.
- R-6 A data lint fails if any node effect changes HP, damage, energy or another flat stat.

## 4. Design

- `src/core/progression/embers.ts` (`embersFor(summary)`), `src/core/progression/tree.ts` (Alpha), `src/core/progression/rites.ts` (Beta).
- Meta profile persistence in SDD-11 (`profile` key, own schema version).

## 5. Acceptance criteria

- AC-1 Given a lost run that cleared 6 rounds with 1 elite, then embers = 2 × 6 + 5 × 1 = 17.
- AC-2 Given a won Act 1 (10 rounds, 2 elites, 1 boss), then embers = 20 + 10 + 15 = 45.
- AC-3 Given a run ends, when the page reloads, then `embersTotal` includes that run.
- AC-4 (Alpha) Given 30 Embers and node 2 of a branch without node 1, then buying node 2 is illegal.
- AC-5 (Alpha) Given the data lint, then every tree node effect is of an allowed kind.
- AC-6 (Beta) Given Rite 3 active, then the run starts with 30 gold and elites have +20% HP and common enemies +15% damage.

## 6. Edge cases

- Abandoning a run from pause counts as a defeat with the rounds cleared so far.
- A corrupted profile never blocks play: reset to an empty profile and keep a backup copy (SDD-11).
- Rounds cleared counts the boss round only if the boss was beaten.

## 7. Test strategy

- Unit: formula, profile persistence, tree rules (Alpha), Rite stacking (Beta).
- Data lint for "options, not raw power".

## 8. Verification

```sh
bun test tests/unit/meta
```
