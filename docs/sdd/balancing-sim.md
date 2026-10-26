# SDD-17 Balancing simulation

| Field | Value |
|---|---|
| Status | Draft, 2026-10-26 |
| Owner | Sonnet (`scripts/sim.ts`, policies in `src/core/ai`); Haiku (running matrices and writing reports) |
| Phase | PROTOTYPE |
| Depends on | SDD-03..SDD-10, SDD-15 |
| References | GDD §5.7, §11.1, §19 (smells), §20 (acceptance targets), every ⚖ section; `.claude/rules/game-design.md` (balancing); skill `ccgs-balance-check`; `docs/books/art-of-game-design.md` |

## 1. Goal

Run thousands of seeded headless runs through the real core with fixed policies, measure the GDD acceptance targets, detect dominant strategies, and produce dated reports before and after every number change.

## 2. Non-goals

- A separate rules engine for simulation (the sim uses `src/core` only).
- Machine-learned policies.

## 3. Requirements

- R-1 Same rules, same code: the sim imports `apply`, `legalCommands`, `preview` from `src/core`; no timers, no Phaser.
- R-2 Policies (pure, seeded tie-breaks): `random` (uniform legal command), `damage` (max damage per energy, lowest-HP target), `block` (max Block/heal, most threatened hero), `greedy` (the auto battle policy, SDD-15). Non-combat choices (route, rewards, camp, rest) use a fixed documented rule per policy.
- R-3 Policies never read hidden information (draw pile order, future intents beyond the revealed one).
- R-4 Factors via CLI multipliers applied to `src/data` values at load: `--enemy-hp`, `--enemy-dmg`, `--hero-hp` (0.5 / 1 / 2 only: double-or-halve rule), `--energy` (3 / 4), `--party` (one of the 10 compositions or `all`).
- R-5 Metrics: Act 1 win rate, win rate per row, turns per combat by type, damage taken per combat, party HP at the boss, Collapses per run, card offer pick rate, win-rate delta per card (≥ 500 runs per card), gold earned/spent per act, hero presence in winning parties, core errors (must be 0).
- R-6 Acceptance targets (GDD §20): Act 1 greedy win rate 35–60% over 1000 seeds; common combat 3–6 turns (median); every hero in ≥ 15% of winning parties; ≥ 1 Collapse in ≥ 40% of runs; speed parity (SDD-15 AC-1).
- R-7 Dominant-strategy signals (each is a high-priority defect): a simple policy (`damage` or `block`) beats `greedy` by > 5 pp; a card picked > 60% of the times offered (GDD §19 smell); a combat longer than 8 turns in > 10% of combats; a hero never in a winning party.
- R-8 Report: `docs/reports/<YYYY-MM-DD>-sim-<topic>.md` with command, build version, seeds, policies, cells, runtime, verdict (PASS / FAIL / INCONCLUSIVE / NOT ASSESSED — NO DATA), results per cell, signals, top/bottom cards, economy, proposed changes. NOT ASSESSED when an input is missing (no estimates).
- R-9 A number change in `src/data` lands only with a "before" and an "after" report.

## 4. Design

```text
bun run sim -- --seeds 1000 --policy greedy --enemy-hp 1 --enemy-dmg 1 --hero-hp 1 --energy 3 --party all --out docs/reports/2026-11-02-sim-base.md
bun run sim -- --matrix base          # base cell + one-factor cells + 2×2 enemy HP × damage
bun run sim -- --check-speed --seeds 100
```

- Seeds: the same fixed list (`seed = i` for i in 1..N) in every cell for paired comparison.
- Output: Markdown report to `--out`, JSON summary to stdout; non-zero exit on core errors or speed mismatch.
- Budget: measure run time in the first prototype; if the base matrix exceeds 30 minutes, use 500 seeds per cell for iteration and 1000 at phase close.

## 5. Acceptance criteria

- AC-1 Given `--seeds 100 --policy greedy`, then the sim completes with 0 core errors and writes a report with every R-5 metric.
- AC-2 Given the same command twice, then the two JSON summaries are identical.
- AC-3 Given `--check-speed --seeds 100`, then it exits 0 when hashes match at 1x/2x/3x and non-zero on any mismatch.
- AC-4 Given a data file missing (e.g. no encounters), then the report verdict is NOT ASSESSED — NO DATA for affected metrics.
- AC-5 Given a multiplier other than 0.5, 1 or 2 for HP/damage factors, then the CLI rejects it.

## 6. Edge cases

- A policy that loops forever (no EndTurn): the sim caps each combat at 50 turns and reports it as a defect.
- Runs that end in row 1: included in every rate; win-rate per row uses runs that reached the row.

## 7. Test strategy

- Unit: each policy chooses only legal commands; CLI parsing.
- Integration: AC-1..AC-3 in CI with 100 seeds (fast subset); the full matrix runs at the end of each phase.

## 8. Verification

```sh
bun run sim -- --seeds 100 --policy greedy
bun run sim -- --check-speed --seeds 100
```
