# ADR 0014: Procedural placeholders with the final asset keys

- Status: accepted
- Date: 2026-10-26

## Context

The prototype has to run before the art and audio budget is approved (cost gate, `.claude/rules/assets.md`). Screens still need readable sprites, card frames, icons and sound-free feedback, and the code must not change when real assets arrive.

## Decision

- `src/view/placeholders.ts` draws every visual asset of the prototype procedurally at startup or at build time, using the final asset keys (for example `hero.shieldbearer.idle`, `icon.status.block`).
- A placeholder has the same dimensions and key as the final asset (asset rules). Swapping it for a sprite touches no logic.
- Placeholders use shape and color together, so states are readable without the art.
- Audio stays silent or uses short synthesized cues until the audio budget is approved; the game works without audio (GDD §17).
- Generation through paid tools (PixelLab, ElevenLabs) starts only after the developer approves the list and the cost.

## Alternatives

- Waiting for final art: blocks the prototype.
- Ad-hoc drawings inside each scene: the key contract would break on every swap.

## Consequences

- Asset keys are part of the contract from day one; renaming a key is a breaking change.
- Placeholder code is throwaway in spirit but kept small and tested for key coverage.
