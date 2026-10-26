# ADR 0004: Coordination of parallel agents

- Status: accepted
- Date: 2026-10-26

## Context

The developer asked for 3 permanent parallel agents, with models assigned by role, coordinated by the main session. The developer's global CLAUDE.md requires explicit "yes" for parallel agents and worktrees. On 2026-10-26 the developer authorized **3 agents without worktrees**.

## Decision

| Agent | Model | Role |
|---|---|---|
| Reviewer | Claude Opus 5.5 | Review and audit of what was done; research that requires judgment |
| Implementer | Claude Sonnet 5.5 | Code, scripts, technical integration |
| Writer | Claude Haiku 5.5 | i18n, documentation, text, tests, balancing and ad-hoc simulations |

- The main session (Opus 5.5) plans, delegates, integrates and makes all commits.
- Subagents finish each task and stand by; they receive the next one via `SendMessage` with preserved context ("standby").
- Each agent touches one distinct set of files at a time; none commits.
- No `git worktree` unless explicitly requested again.

## Alternatives

- 3 worktrees: full isolation, but rebase and merge cost at every group, and little gain in documentation phases.
- Sequential work only: slower.

## Consequences

- Edit conflicts are avoided by splitting files, not by branches.
- Every agent output is reviewed by the coordinator before the commit.

## Amendment (2026-10-26, 20:30)

At the developer's request after the first playtest, a fourth agent was added:

| Agent | Model | Role |
|---|---|---|
| QA playtester | Claude Opus 5.5 | Plays the game repeatedly through Playwright (real clicks, several viewports and parties), captures screenshots and writes prioritised findings to `docs/reports/*-qa-playtest-*.md`; implements fixes only when the coordinator assigns them |

The coordinator still integrates and commits; the QA agent's first pass is read-only on `src/` while the rendering overhaul is in progress.
