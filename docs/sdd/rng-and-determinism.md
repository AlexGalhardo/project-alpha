# SDD-02 RNG and determinism

| Field | Value |
|---|---|
| Status | Draft, 2026-10-26 |
| Owner | Sonnet |
| Phase | STRUCTURE |
| Depends on | SDD-01 |
| References | GDD §4.2, §4.3, §10.1, §11, §18.1; ADR 0006; `.claude/rules/engineering.md` |

## 1. Goal

All randomness in a run comes from one seed through a small PRNG stored in the state, split into independent streams per domain, so that the same seed and the same commands always give the same run, saves resume the exact sequence, and changing one random draw never shifts another domain.

## 2. Non-goals

- No cryptographic randomness.
- No `Phaser.Math.RandomDataGenerator` in the core.
- No daily-seed sharing service (Beta idea).

## 3. Requirements

- R-1 PRNG: a 32-bit generator (mulberry32 or sfc32), chosen once and pinned by a test vector (first 10 outputs for seed 1).
- R-2 The PRNG state is a plain number tuple inside `RunState.rng` and is serialized with the save.
- R-3 Streams: `map`, `encounter`, `combat` (shuffles, cycle start, random targets), `reward` (cards, equipment, gold rolls), `camp` (offers, service), `shop`. Each stream is derived from the run seed with a fixed salt (e.g. `hash(seed, 'map')`).
- R-4 Helper API: `next(stream) -> [value, stream']`, `int(stream, min, max)`, `pick(stream, list)`, `shuffle(stream, list)` (Fisher–Yates), `weighted(stream, entries)`; all pure.
- R-5 The run seed is a 32-bit unsigned integer shown to the player as 8 hex characters; a typed seed parses to the same integer.
- R-6 Ties in every rule (turn queue, policy scores, encounter selection) are broken deterministically: by an explicit rule first, then by a seeded pick from the relevant stream.
- R-7 Iteration order over collections in the core is defined (arrays, or keys sorted); no reliance on object key insertion order from external data.

## 4. Design

```typescript
export type RngState = readonly [number, number, number, number]; // sfc32 a,b,c,d (or [number] for mulberry32)
export type StreamId = 'map' | 'encounter' | 'combat' | 'reward' | 'camp' | 'shop';
export interface Rng { readonly streams: Readonly<Record<StreamId, RngState>> }

export function createRng(seed: number): Rng;
export function int(rng: Rng, stream: StreamId, min: number, max: number): { readonly value: number; readonly rng: Rng };
export function shuffle<T>(rng: Rng, stream: StreamId, list: readonly T[]): { readonly value: readonly T[]; readonly rng: Rng };
export function hashState(state: RunState): string; // stable JSON with sorted keys → FNV-1a 64-bit hex
```

## 5. Acceptance criteria

- AC-1 Given seed 1, when the PRNG produces 10 values, then they equal the pinned test vector.
- AC-2 Given a run, when an extra `reward` draw is inserted, then the map generated for the same seed is unchanged.
- AC-3 Given seed S and command list L, when the run is replayed 3 times, then `hashState` of the final state is identical each time.
- AC-4 Given a save taken at the start of turn T, when it is loaded and the same commands are replayed, then the draws and intents of turn T are identical to the original run (no save scumming).
- AC-5 Given the seed text "0000002A", when parsed, then the seed is 42, and formatting 42 gives "0000002A".
- AC-6 Given `int(rng, s, a, b)` over 100 000 draws, then every value in [a, b] appears and each frequency is within ±5% of uniform.

## 6. Edge cases

- Seed 0 and seed 0xFFFFFFFF must work.
- `pick` and `shuffle` on an empty list return the list and an unchanged stream.
- `weighted` with all weights 0 is a programmer error: throw in tests, never in production data (data integrity test checks weights).

## 7. Test strategy

- Unit: test vector, ranges, empty inputs, stream independence (AC-1, AC-2, AC-5, AC-6).
- Integration: replay and save/load determinism over 100 seeds (AC-3, AC-4).
- Speed parity lives in SDD-15 and uses `hashState`.

## 8. Verification

```sh
bun test tests/unit/rng.test.ts
bun test tests/integration/determinism.test.ts
```
