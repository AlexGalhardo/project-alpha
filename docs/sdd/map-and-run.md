# SDD-07 Map and run

| Field | Value |
|---|---|
| Status | Draft, 2026-10-26 |
| Owner | Sonnet |
| Phase | PROTOTYPE |
| Depends on | SDD-01, SDD-02, SDD-06 |
| References | GDD §3, §4 (definitions, map generation, encounter selection, camp, rest, shop), §2 (scope); Art Bible §11.4 |

## 1. Goal

Generate the 10-row act map from the run seed, drive the run through rounds (node → resolve → rewards → camp), select encounters so all 10 enemy types appear, and end the run in victory or defeat.

## 2. Non-goals

- Events and treasure nodes (Alpha); Acts 2–3 (Alpha/Beta).
- Shop prices and rewards (SDD-08), camp offers (SDD-08), hero swap rules (SDD-09).

## 3. Requirements

- R-1 Map rows and node types exactly as GDD §4.2 (row 1: 2 combats; row 4 and 7: 1 elite + 1–2 combats; rows 5 and 8: shop + combats; row 9: rest + shop; row 10: boss).
- R-2 Edges: node i of row r connects to 1–2 nodes of row r+1 with index i or i±1; edges never cross; every node is reachable from row 1 and reaches row 10.
- R-3 Elite nodes always have a combat sibling in the same row.
- R-4 Round = row; every node counts; the player chooses one reachable node of the next row; no going back.
- R-5 Encounter selection: Tier A pool for rows 1–3, Tier B for rows 4–8; pick the encounter with the most unseen enemy types; ties → seeded pick (`encounter` stream).
- R-6 Round flow: resolve node → if combat won: rewards → camp (every round except the boss) → next row.
- R-7 Run start: party of 3 (heroes chosen with ranks), gold 50, seed fixed; run end: boss won → `RunWon`; party wiped → `RunLost`; both lead to the summary with Embers (SDD-10).
- R-8 The whole map is visible from the start; the state exposes reachable nodes for the view.

## 4. Design

- `src/core/run/map.ts`: `generateMap(rng): ActMap` with `rows: readonly Row[]`, `edges`.
- `src/core/run/round.ts`: node resolution dispatch; `src/core/run/encounters.ts`.
- Map generation uses only the `map` stream; encounter picks only the `encounter` stream.

## 5. Acceptance criteria

- AC-1 Given 10 000 seeds, then every generated map satisfies R-1, R-2 and R-3 (validator).
- AC-2 Given any path through any map with ≥ 6 combats, then all 10 enemy types appear by row 8 (exhaustive over the 10 000 maps × all paths).
- AC-3 Given the same seed, then the map is identical, regardless of rewards taken (stream independence).
- AC-4 Given the player is on row 3 node 1, then `legalCommands` contains `ChooseNode` only for row 4 nodes connected to it.
- AC-5 Given a boss victory, then the run ends with `RunWon` and no camp opens.
- AC-6 Given a won non-boss combat, then the order of events is `CombatWon` → `RewardOffered` → (after reward) `CampOpened`.

## 6. Edge cases

- A row with 3 nodes where the middle connects to all three next nodes: edges still must not cross.
- Shop rows (5, 8, 9) when the player has 0 gold: the node is still enterable.
- A path that takes both shops (rows 5 and 8): rows 1, 2, 3 and 6 are combat-only and rows 4 and 7 are combat or elite, so every path has at least 6 fights (4 combats + 2 combat-or-elite). The validator asserts this minimum; AC-2 counts elites as fights.
- Defeat during the boss: `RunLost`, Embers still granted (SDD-10).

## 7. Test strategy

- Unit: map validator, reachability, encounter selection.
- Exhaustive/property: AC-1, AC-2 over 10 000 seeds (tagged `@slow`, runs at the end of each phase and in `bun run sim`).
- Integration: full-run flow with the greedy policy for 100 seeds.

## 8. Verification

```sh
bun test tests/unit/run
bun test tests/integration/map-exhaustive.test.ts
```
