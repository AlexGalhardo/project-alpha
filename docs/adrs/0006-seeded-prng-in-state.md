# ADR 0006: Seeded PRNG kept in the state

- Status: accepted
- Date: 2026-10-26

## Context

Every random choice (map generation, encounter selection, shuffles, rewards, enemy cycle start) must reproduce from the run seed, must survive a save and reload, and must not depend on the Phaser runtime.

## Decision

- The core uses its own small PRNG (mulberry32 or sfc32, chosen when implemented and fixed by a test vector).
- The PRNG state is part of the run state, so saving and loading preserves the exact sequence.
- Independent streams per domain (map, combat, rewards, camp) avoid coupling: an extra reward roll must not change the map.
- `Math.random`, `Date`, `performance.now` and timers are forbidden in `src/core/`.

## Alternatives

- `Phaser.Math.RandomDataGenerator`: couples the core to Phaser and makes unit tests depend on the engine.
- Global mutable RNG: breaks the immutability rule (ADR 0007) and reproducibility.

## Consequences

- A seed is enough to reproduce a run in a bug report.
- The PRNG has a test vector; changing the algorithm is a save-format change and needs a migration (ADR 0011).
