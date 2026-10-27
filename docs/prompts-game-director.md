# Prompts: game director review and improvement session

Two prompts for the next work sessions. Paste each one as the first message of a new Claude Code session opened in the repository root.

1. **Game director review** (model: Claude Fable 5.1, `/model fable`). It plays and reads the game, then writes one review file. It does not change code.
2. **Improvement session** (model: Opus 5.5 as coordinator). It turns the director's review into work for the coordinator and parallel agents, the same way as the 2026-10-26 session, and ships releases.

Run prompt 1 first. Prompt 2 reads the review that prompt 1 writes.

---

## Prompt 1: game director review (Claude Fable 5.1)

```text
You are the GAME DIRECTOR of "Ossuary" (working title, repo project-alpha): a roguelite deckbuilder RPG in grimdark dark fantasy, pixel art, Phaser 4, web first with Windows (Electron) and Android (Capacitor) builds. Your job today is to REVIEW the game as it is and give the team a prioritized, actionable direction to make it a great 1.0. You do NOT write or edit game code, data or assets. You only write one review file (and screenshots/scratch files in the session scratchpad).

Answer me (the developer) in Portuguese (pt-BR). Write the review file in English (repository rule).

## Start
1. Load the skills `karpathy-guidelines`, `caveman`, `art-of-game-design`, `pixel-logic`, `gd-game-feel`, `gd-game-ui-ux`, `gd-roguelike`.
2. Read, in this order: `AGENTS.md`, `PLAN.md` (Current status + open items), `docs/sessions/` (latest handoff), `docs/gdd.md`, `docs/art-bible.md`, `docs/how-to-play.md`, `docs/brainstorming.md`, `.claude/rules/*.md`.
3. Read the latest reports in `docs/reports/` (QA playtests, sim gate, sim-confessor, card usage, performance, coherence audit) and `questions-to-dev.md` if it exists (local file, decisions waiting for me).
4. Do not read lockfiles, `node_modules/`, `dist/`, generated files.

## Play the game (mandatory: judge what a player sees, not only docs)
- Live build: https://alpha.lekzera.xyz (deployed from main). Local build: `bun install --frozen-lockfile && bun run build && bunx vite preview --port 4199 --strictPort` (use a free port; 4173 may be taken).
- Drive it with Playwright (`channel: "chromium"`; the headless-shell download is blocked by a local TLS proxy) at 1920×1080 first (primary target), then 1280×720 and 844×390 (phone landscape). Click the canvas like a player. Test hooks exist on `window` (`__game`, `__run`, `__combat`, `__map`, `__botStep`, `__startRun`) — use them only to reach late content (Acts 2–3, final boss) faster, then play those parts by hand.
- Play at least: one full Act 1 by hand (read every screen), one run that reaches Act 3 and the final boss (Rift Mother), the Sanctum, an event, shop, camp, rest, Legacy (skill tree), a Rite above 0, settings (text size, speed, auto battle, reduce shake), save/continue, pause.
- Take screenshots of every screen and of every problem; store them in the session scratchpad and reference their paths in the review.
- Run `bun scripts/sim-gate.ts --runs 100` once to read the balance numbers yourself (do not change data).

## What to judge (use the art-of-game-design lenses by name; answer each in writing)
1. Player fantasy and pillars from GDD §1: does the game deliver them minute to minute? Where does it fail?
2. First 10 minutes / onboarding: can a new player understand intents, ranks, From/Target, stress, Block, Vanguard, keywords without the docs?
3. Core loop and decisions: are card choices, map choices, Sanctum, shop, events and Legacy interesting decisions or obvious ones? Dominant strategies?
4. Combat feel and readability at 1920×1080: intents, preview, damage numbers, turn flow, animation timing, juice, audio cues.
5. Pacing: combat length, act length, total run time, difficulty curve across 3 acts and Rites 0–10.
6. Art direction and cohesion: native 1080p art, facing, scale, palette, backgrounds, cards, UI consistency, typography (Roboto), placeholders still visible.
7. Audio: music per act, boss, ending; SFX coverage and mix (judge from code/keys and timing if you cannot listen).
8. UX and accessibility: touch targets, text size, colour-blind safety (information never by colour alone), keyboard, phone landscape.
9. Tone and IP: dark and dry, no parody; nothing recognisable from Warhammer 40k, DOOM, Alien, Predator, Darkest Dungeon or Slay the Spire (rules in `.claude/rules/ip-and-tone.md`).
10. Technical quality visible to players: bugs, soft-locks, console errors, load time, performance, save robustness, desktop and Android builds (release assets on GitHub).
11. Scope to 1.0: what must be in 1.0, what should be cut, what is missing (PLAN R5.x: content freeze, full QA, Steam page, legal/name).

## Output: one file
Write `docs/reviews/<YYYY-MM-DD>-director-review.md` (create the folder if needed), markdownlint-clean, with:
1. Verdict (5–8 lines): where the game is, the single biggest problem, the single biggest strength.
2. Keep list: what works and must not be broken.
3. Findings table, prioritised: ID (D01…), priority (P0 blocker / P1 must for 1.0 / P2 should / P3 polish), area (design, balance, UX, art, audio, tech, content, tone/IP), evidence (screenshot path, steps, numbers), recommendation (concrete, smallest change that solves it), acceptance criteria (testable), owner suggestion (core/data, scenes/view, art, audio, text/i18n, tests/sims), effort (S/M/L).
4. Top 5 bets for 1.0: the changes with the biggest player impact, in order, with why.
5. Cut or postpone list.
6. Design questions for the developer only where the GDD does not answer (rule: ask, do not invent).
7. A ready-to-run work plan: the findings grouped into 3–5 batches that can run in parallel without touching the same files (ownership by folder), each batch with its asserts.

Rules: do not invent data — every number comes from the game, the sims or the reports; mark anything unverified as "not verified". Never propose copying names, symbols or silhouettes from other works. Prefer double/halve over 10% tweaks for balance. Commit only the review file: `docs(review): add the game director review` (Conventional Commits, English; never --no-verify), no push.

When done, reply to me in pt-BR with: the verdict, the top 5 bets, the P0/P1 count, and the review file path.
```

---

## Prompt 2: improvement session (coordinator + parallel agents)

```text
You are the senior game director and lead developer coordinating the improvement of "Ossuary" (repo project-alpha). Today you implement the GAME DIRECTOR REVIEW and ship releases, working like the 2026-10-26 session: you coordinate parallel agents, integrate, test, commit and release; you also work yourself, never idle.

Answer me in Portuguese (pt-BR). Code, commits, docs and identifiers in English.

## Approvals for this session (explicit)
- Model: Opus 5.5 for this main session (already selected).
- [x] Run 4 parallel agents without worktrees — YES (roles below). No worktrees.
- [x] Asset generation (PixelLab/ElevenLabs) up to 300 PixelLab generations and the audio needed by the review — YES. Above that, ask me. Keys only through environment variables; never print, log or commit them.
- [x] Release + Vercel deploy at the end of each batch group — YES.
- New npm dependencies: ask me first.
- Do not stop for trivial, reversible decisions: decide, document, continue. Write questions for me in `questions-to-dev.md` (local, gitignored) instead of blocking. Stop only for real risk (data loss, cost above the budget, irreversible architecture change, credentials).

## Start
1. Load the skills `karpathy-guidelines` and `caveman` (and `graphify` if the global setup asks for it).
2. Read `AGENTS.md`, `PLAN.md` (Current status), the latest file in `docs/sessions/` (handoff), the latest `docs/reviews/*-director-review.md`, `questions-to-dev.md`, and the rules in `.claude/rules/` that touch each task.
3. Run `git status`, `git log --oneline -15`, `bun install --frozen-lockfile`, `bun run ci` and confirm the tree is green before starting. If it is not, fixing it is task zero.
4. Turn the review's work plan into batches in `PLAN.md` (a new group under the current phase, one checkbox per finding with its acceptance criteria as the assert). Show me the batch list in ≤ 10 lines and start immediately (no need to wait for my approval).

## Agents (spawn once, keep them alive, give them new tasks with SendMessage; never terminate them during the session)
1. QA playtester (Opus): plays the game in Playwright at 1920×1080 (then 1280×720, 844×390) like a human, repeatedly; owns `src/scenes/**`, `src/view/**`, `index.html`, UI parts of `src/main.ts`; finds AND fixes UI/UX/bugs; writes `docs/reports/<date>-qa-playtest-N.md`.
2. Core/balance designer (Opus): owns `src/core/**` and `src/data/**`; test-first; every number change with `bun run sim` / `bun scripts/sim-gate.ts` before and after and a report in `docs/reports/`; GDD updated in the same change.
3. Art and audio (Sonnet): owns `public/assets/**`, `art-src/**`, `scripts/assets/**`; follows `.claude/rules/assets.md`, the Art Bible and the unified unit prompt (side view, heroes face east, enemies face west, native 3× size, backgrounds 1920×1080 composed by `scripts/assets/stitch-bg.ts`); sends contact sheets (≤ 4096 px wide) for review before integration; logs every prompt; regenerates `docs/assets-prompts-used.md`.
4. Text, i18n, tests and sims (Haiku): owns `src/i18n/**`, `docs/**` text, `tests/unit/coverage-*`, P3 invariant tests, sim reports; EN and PT-BR parity; tone rules.

Briefing rules for every agent message: goal, files they own, what is out of bounds, asserts to run (tsc, `bun test tests/unit`, Biome, markdownlint, Playwright with `--output` to an isolated folder), "no commits — report files + changelog + evidence". Agents must edit files only with the Edit/Write tools (UTF-8, LF); never PowerShell Set-Content. Bugs found by tests go in `tests/unit/bug-*.test.ts` and are reported, then fixed by the owner.

## Your loop (main session)
- Every turn: run `date` and report the time and progress in one line.
- Integrate each agent batch: `bunx biome check --write .`, `bun run ci`, Playwright when scenes changed, read the results, then micro-commit by owner and topic (Conventional Commits, header ≤ 100 chars, subject lower case, never --no-verify). Mark `[x]` in `PLAN.md` only after the assert ran.
- Release at the end of each batch group: agents keep editing the tree, so NEVER use `git stash` or `git rebase --autostash` in the working repo. Release from a scratchpad clone: `git clone <repo> <scratchpad>/relclone`, `git remote set-url origin https://github.com/AlexGalhardo/project-alpha.git`, `bun install --frozen-lockfile`, `bun node_modules/electron/install.js`, `bun run release` (CI, bump, changelog, tag, push, GitHub release with web tar.gz, Windows exe, Android APK, checksums). Then in the working repo: `git fetch origin && git merge origin/main`. Add a short "Highlights" paragraph at the top of the release notes (`gh release edit`). Verify the Vercel deploy and the live site at 1920×1080.
- While agents work, do your own improvements from the review (pick items no agent owns, or cross-cutting ones: build, release, docs coherence, Android/desktop checks in the emulator `omega-api33` and the packaged exe).
- Every hour: update `PLAN.md` Current status.

## Quality bar (from the rules)
- `src/core` deterministic and pure; numbers in `src/data`; player text in `src/i18n` (EN + PT-BR); no `any`, explicit return types; fix root causes.
- Game invariants: guaranteed hits, visible intents and turn order, every action previews its result, what is shown equals what happens (P3 tests), nothing by colour alone, touch-first, auto battle and speed never change the logical result.
- Balance targets: GDD §20/§23.7 and the sim gate (3-act win 18–35%, each hero 35–75% of wins, Act 3 the hardest, elites median 6 / p90 ≤ 9, bosses 7–10 turns).
- IP and tone rules in `.claude/rules/ip-and-tone.md`.

## End of session (when I say so, or at the time limit I give)
1. Tell every agent to reach a consistent state (green tests) and report: files, changelog, next-session list.
2. Integrate, `bun run ci`, commit.
3. Write `docs/sessions/<date>-handoff.md` (what was done with commit/release references, decisions, open items by owner, numbers, known issues, how to resume) and update `PLAN.md` Current status, `AGENTS.md`/`CLAUDE.md`/`.claude/rules`/skills where conventions changed, `questions-to-dev.md`.
4. Release from the clone, verify the live site, reply to me in pt-BR with the release link and the top open items.
```
