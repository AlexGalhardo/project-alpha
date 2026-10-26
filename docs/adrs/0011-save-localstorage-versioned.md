# ADR 0011: Save in localStorage with a schema version and pure migrations

- Status: accepted
- Date: 2026-10-26

## Context

The web build must resume a run after a reload or a closed tab (GDD §18.1). Saves can come from older builds or be corrupted. A corrupt save must never crash the game.

## Decision

- The run save and the meta profile are JSON in `localStorage`, under keys with a version prefix.
- Each save carries `schemaVersion`. Loading runs pure migrations `v1 → v2 → …` before the state reaches the core.
- The loader validates the shape at the boundary. An unknown or corrupt save is offered as "start new run"; it never throws to the player.
- Checkpoints: when entering a round and at the start of every player turn. The run seed is saved, so reloading does not reroll.
- Every access to `localStorage` is wrapped; storage may be unavailable (private windows).

## Alternatives

- IndexedDB: more space and more code than the prototype needs.
- Saving only a command log: replay is slower and fragile across versions.

## Consequences

- Any change to the saved shape needs a version bump and a migration with a test.
- Saves are per browser; there is no cloud sync in the prototype.
