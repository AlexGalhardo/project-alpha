# ADR 0007: Immutability through structured cloning (no Immer)

- Status: accepted
- Date: 2026-10-26

## Context

The core treats state as an immutable value (ADR 0005). We need a way to produce a new state without mutating the old one, with a small dependency footprint.

## Decision

- State types are `readonly`. Updates create new objects with explicit copies of the changed paths.
- Where a deep copy is simpler and cheap enough, use the platform's `structuredClone`.
- No Immer or similar library. Adding a dependency needs the developer's approval, and no approval was given.
- Measure the cost of cloning in the simulation before optimizing; the sim runs thousands of combats.

## Alternatives

- Immer: convenient, but a new dependency and a hidden proxy layer in the rules.
- Mutable state with snapshots: easy to get wrong and hard to test for purity.

## Consequences

- Rules are pure functions over plain data, easy to serialize for saves.
- If clone cost becomes a bottleneck, the fix is narrower copies in the hot path, not a library, unless the developer approves one.
