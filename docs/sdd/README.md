# Specs (SDD)

Spec-driven development for **Ossuary** (`project-alpha`). Every system has one spec here. A spec is a contract: requirements (`R-n`), testable acceptance criteria (`AC-n`, Given/When/Then), edge cases, test strategy and the commands that verify it. Rules and numbers come from `docs/gdd.md` (rules of play) and `docs/art-bible.md` (visual and audio numbers); a spec never invents a number, it points to the GDD section that owns it.

Format modelled on [agentic-personal-finances/docs/specs](https://github.com/AlexGalhardo/agentic-personal-finances/tree/main/docs/specs).

## Reading order before implementing a spec

1. `AGENTS.md` and the `.claude/rules/` files that touch the task.
2. `docs/gdd.md` sections named in the spec header.
3. The ADRs named in the spec header (`docs/adrs/`).
4. The spec itself, including **Non-goals**.

## Loop

```text
1. READ    the spec and the files it names; if "Current state" is wrong, stop and report.
2. TEST    write the failing tests for the ACs first (src/core is test-first).
3. BUILD   the smallest change that meets the ACs; only the files the spec lists.
4. VERIFY  the commands in the spec's "Verification" section + `bun run ci`.
5. UPDATE  the GDD/Art Bible if a number changed (with a simulation report), and PLAN.md.
6. COMMIT  one Conventional Commit per spec step, e.g. `feat(core): resolve hit damage (SDD-03 AC-2)`.
```

Rules: no scope creep (write follow-ups instead); never weaken a test; English only; Bun only.

## Spec template

| Section | Content |
|---|---|
| Header table | Status, owner, phase, depends on, references (GDD §, Art Bible §, ADRs) |
| 1. Goal | One paragraph |
| 2. Non-goals | What this spec must not do |
| 3. Requirements | `R-n`, one testable sentence each |
| 4. Design | Files, types, functions, data shapes |
| 5. Acceptance criteria | `AC-n` in Given / When / Then |
| 6. Edge cases | Inputs and states that break naive code |
| 7. Test strategy | Unit, integration, property, e2e, manual |
| 8. Verification | Commands to run |

## Ownership

| Area | Owner (agent) |
|---|---|
| `src/core/`, `src/data/`, `scripts/sim*.ts` | Sonnet (implementation) |
| `src/scenes/`, `src/view/`, `src/platform/`, `scripts/assets/` | Coordinator (main session) |
| `src/i18n/`, simulation reports, QA reports | Haiku (text, i18n, simulations) |
| Review of every spec delivery | Opus (review) |

## Index

| Id | Spec | Owner | Phase |
|---|---|---|---|
| SDD-01 | [architecture](architecture.md) | Coordinator | STRUCTURE |
| SDD-02 | [rng-and-determinism](rng-and-determinism.md) | Sonnet | STRUCTURE |
| SDD-03 | [combat](combat.md) | Sonnet | PROTOTYPE |
| SDD-04 | [cards-and-deck](cards-and-deck.md) | Sonnet | PROTOTYPE |
| SDD-05 | [status-and-stress](status-and-stress.md) | Sonnet | PROTOTYPE |
| SDD-06 | [enemies-and-intents](enemies-and-intents.md) | Sonnet | PROTOTYPE |
| SDD-07 | [map-and-run](map-and-run.md) | Sonnet | PROTOTYPE |
| SDD-08 | [rewards-and-economy](rewards-and-economy.md) | Sonnet | PROTOTYPE |
| SDD-09 | [heroes-and-equipment](heroes-and-equipment.md) | Sonnet | PROTOTYPE |
| SDD-10 | [meta-progression](meta-progression.md) | Sonnet | PROTOTYPE (tally) / ALPHA |
| SDD-11 | [save-and-versioning](save-and-versioning.md) | Sonnet (core) + Coordinator (platform) | PROTOTYPE |
| SDD-12 | [ui-hud-and-input](ui-hud-and-input.md) | Coordinator | PROTOTYPE |
| SDD-13 | [audio](audio.md) | Coordinator | PROTOTYPE |
| SDD-14 | [i18n](i18n.md) | Haiku | STRUCTURE |
| SDD-15 | [settings-autobattle-speed](settings-autobattle-speed.md) | Sonnet (policy) + Coordinator (view) | PROTOTYPE |
| SDD-16 | [assets-pipeline](assets-pipeline.md) | Coordinator | STRUCTURE / PROTOTYPE |
| SDD-17 | [balancing-sim](balancing-sim.md) | Sonnet (sim) + Haiku (reports) | PROTOTYPE |
| SDD-18 | [testing-and-qa](testing-and-qa.md) | All | STRUCTURE onward |
| SDD-19 | [release-and-deploy](release-and-deploy.md) | Coordinator | STRUCTURE |

Human QA script: [`docs/qa/human-qa.md`](../qa/human-qa.md).
