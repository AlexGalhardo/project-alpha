# Game design rules

Source of truth: `docs/gdd.md` (after task 3 of `PLAN.md`). Principles: the `art-of-game-design` skill and `docs/books/art-of-game-design.md`.

## Before creating or changing a mechanic

1. Does it reinforce the pillars and the player fantasy defined in the GDD? If not, it does not enter.
2. Run the task's lenses (index in the `art-of-game-design` skill) and answer in writing in the PR, commit or spec.
3. Does it fit the current phase of `PLAN.md`? If not, note it in `docs/brainstorming.md` (section "Ideas out of scope") and move on.
4. Update the GDD and the spec in `docs/sdd/` in the same commit as the code.

## Game invariants

- Hits are guaranteed. There is no hidden hit or critical percentage.
- Enemy intent and turn order are always visible before the player decides.
- Every card and ability shows a preview of its result (final damage, with modifiers) before confirmation.
- The player never takes damage from a source they could not see before deciding.
- Every coin, item and reward feeds a player decision.
- Meta-progression grants new options, not raw power that replaces skill (ceiling defined in the GDD).
- A run has a target duration defined in the GDD; any rule that lengthens combat or a run needs a simulation that justifies it.

## Balancing

- Only balance what is already playable.
- A value that looks wrong is doubled or halved, then refined. Never blind 10% adjustments.
- A number change comes with a headless simulation before and after, and a report in `docs/reports/`.
- A dominant strategy (one option that is always better) is a top-priority defect.

## Interface

- One UI, designed for touch and mouse. Nothing depends on hover: tooltips also open with a touch or long click.
- Visual response to every input within 100 ms.
- Information is never conveyed by color alone: color + shape, icon or pattern.
- Auto battle and speed 1x/2x/3x exist from the prototype on and never change the logical result of a battle with the same seed.

## Scope

- A design question the GDD does not answer: stop and ask the developer.
- A good idea outside the phase: note it in `docs/brainstorming.md`, do not implement it.
