# The Art of Game Design applied to project-alpha

Operational summary of *The Art of Game Design: A Book of Lenses* (Jesse Schell, 1st edition, 100 lenses) for this game: a roguelite deckbuilder with RPG progression. The full knowledge (frameworks, decision table, lens index per task, chapter summaries) is in the skill [`.claude/skills/art-of-game-design/SKILL.md`](../../.claude/skills/art-of-game-design/SKILL.md).

## How to use

1. Choose the task's lenses in the *Lens index by design task* of the skill.
2. Answer each question in writing against the actual design (in the spec in `docs/sdd/` or in the report).
3. Every weak answer becomes a change or an open question in `docs/brainstorming.md`.
4. Cite by number and author's name: "Lens #33 Triangularity".

## Mandatory lenses by type of work

| Work | Minimum lenses |
|---|---|
| New card or relic/item | #28 Expected Value, #32 Meaningful Choices, #33 Triangularity, #43 Elegance |
| New hero class | #30 Fairness, #44 Character, #47 Balance, #76 Character Function |
| New enemy, elite or boss | #31 Challenge, #52 The Puzzle, #57 Feedback, #73 Collusion |
| Map and run structure | #39 Time, #49 Visible Progress, #50 Parallelism, #61 The Interest Curve |
| Economy, shop, meta-progression | #5 Endogenous Value, #40 Reward, #41 Punishment, #46 Economy |
| UI, HUD, feedback | #56 Transparency, #57 Feedback, #58 Juiciness, #59 Channels and Dimensions, #60 Modes |
| Review of a finished feature | #1 Essential Experience, #3 Fun, #9 Unification, #15 Toy |

## Application to this genre

- **Cards = choices with expected value.** Compare cards by expected value per energy point (damage/block per energy point) against the real HP of that act's enemies. Overkill does not count as value. Each card needs a reason to be chosen *and* a reason to be refused (Lens #32).
- **Triangularity in every reward:** offer a small-safe option and a large-risky option with close expected value: elite vs. the common path, a strong card with a stress cost, etc. (Lens #33).
- **Guaranteed hits:** no hit percentage. Chance comes from draw order, rewards and the map, never from "missed the hit" (Lens #29; probability perception, Lens #28).
- **Visible enemy intent:** combat is a full-information puzzle each turn: an obvious first step, visible progress, a gradual ramp (Lens #52). Hiding intent turns into frustration.
- **Classes = asymmetric balance.** Score each class's attributes (Low 1 / Medium 2 / High 3), sum them, play, and rebalance whatever always wins or loses. A class everyone picks is a dominant strategy (Lenses #30, #47).
- **Run interest curve:** a hook in the first combat, relief, rising peaks (elites) with rests (campfire, shop, event), a climax at the act's boss, and a short resolution (reward). Fractal: it applies to combat, act and run (Lens #61).
- **Understandable punishment:** hero death and run loss must be predictable and leave something for the next run. Meta-progression gives options, not raw power (Lenses #41, #46).
- **Endogenous economy:** gold, materials and skill points only exist if they feed a decision. A currency players ignore is a defect (Lens #5).
- **Toy before game:** playing a card, seeing the number go up, the enemy react and the sound play should be satisfying with no objective at all (Lens #15). This is the first milestone of the prototype.
- **Balancing:** only what is playable; double or halve, then refine; never blind 10% adjustments.
- **Process:** prototype the biggest risk first (the fun of combat) and measure one complete class and one complete act before committing to content counts.
