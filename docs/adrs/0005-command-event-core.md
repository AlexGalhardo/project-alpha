# ADR 0005: Command/event core with a pure reducer

- Status: accepted
- Date: 2026-10-26

## Context

The game is turn-based, must be deterministic (same seed + same commands = same state), must run the same rules for the player, the auto battle and the balancing simulation, and must be presented by Phaser without the rules living inside scenes.

## Decision

- `src/core/` exposes a pure function `apply(state, command) -> { state, events }`. `legalActions(state, seat)` lists the commands a seat may issue.
- The state is an immutable value. A command never mutates its input.
- The view (`src/scenes/`, `src/view/`) consumes the returned events and animates them. It never decides a rule.
- Policies (player input, auto battle, simulation bot) all emit commands from `legalActions`.

## Alternatives

- ECS: adds a framework and indirection for a game with a small number of entities per combat.
- Mutable state inside Phaser scenes: couples the rules to the presentation and breaks determinism tests.

## Consequences

- Rules are testable with `bun test` without a browser.
- Auto battle and the simulator reuse the same policy interface (see the balancing simulation plan).
- Every new rule needs a command, an event and a test before the view changes.
