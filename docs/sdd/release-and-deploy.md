# SDD-19 Release and deploy

| Field | Value |
|---|---|
| Status | Draft, 2026-10-26 |
| Owner | Coordinator |
| Phase | STRUCTURE |
| Depends on | SDD-18 |
| References | ADR 0001 (tooling), 0002 (release format), 0003 (CI/CD Vercel); `.claude/rules/git-and-release.md`; `scripts/release.ts`, `cliff.toml`, `.github/workflows/ci.yml`, `deploy.yml` |

## 1. Goal

Every push to `main` produces a versioned GitHub release with notes generated from Conventional Commits, and the web build deploys to Vercel (alpha.lekzera.xyz) through the Git integration on every push to `main`. The gate is local (`bun run ci` before every push); deploys do not wait for GitHub CI (ADR 0003).

## 2. Non-goals

- Store builds (Electron, Capacitor, Steam) before the end of Beta.
- A release workflow in GitHub Actions (the local script is the single path, ADR 0002).

## 3. Requirements

- R-1 Versions: `0.0.x` in Alpha (every push bumps the patch), `0.1.x` in Beta, `1.0.0` at launch; the first release shipped `0.0.1`.
- R-2 `bun run release` (from `main`, clean tree): runs `bun run ci` → bumps `package.json` → regenerates `CHANGELOG.md` with git-cliff → commits `chore(release): vX.Y.Z` → annotated tag → `git push --follow-tags` → `gh release create` with the version's notes.
- R-3 Release notes follow the vukem format (ADR 0002): sections Added / Changed / Fixed / Security / Documentation, lines `- **scope:** Message ([sha7](link))`.
- R-4 The release script is resumable: if it fails after the tag (push or `gh release`), re-running at the tagged HEAD skips the bump and finishes the missing steps.
- R-5 CI (`ci.yml`): on push and PR, Bun 1.4.4, `bun install --frozen-lockfile`, `bun run ci`.
- R-6 Production deploy: the Vercel Git integration (project `alpha.lekzera.xyz`, production branch `main`, `bun run build`, output `dist`) deploys every push to `main`. The gate is local: `bun run ci` before every push (ADR 0003, amended 2026-10-26). `deploy.yml` is an optional path with `vercel@65.3.1`; token passed through `env`, not the command line.
- R-7 The build footer shows the version from `package.json`; the deployed URL serves it.
- R-8 From the PROTOTYPE phase, attach `project-alpha-web-vX.Y.Z.zip` + `checksums.txt` to each release (ADR 0002).

## 4. Design

Files: `scripts/release.ts`, `cliff.toml`, `.github/workflows/ci.yml`, `.github/workflows/deploy.yml` (optional path), `.husky/commit-msg` (commitlint). Vercel project settings: ADR 0003 (install `bun install --frozen-lockfile`, build `bun run build`, output `dist`).

## 5. Acceptance criteria

- AC-1 Given a push with `feat` and `fix` commits since the last tag, when `bun run release` runs, then a tag `v0.0.(n+1)` exists on GitHub with notes containing Added and Fixed sections.
- AC-2 Given only `chore`/`test` commits since the last tag, then the release script exits with "no releasable commits" and changes nothing.
- AC-3 Given `gh release create` fails after the push, when the script re-runs, then it creates only the missing release (no new version).
- AC-4 Given the deploy workflow without the three Vercel secrets, then the workflow is valid and the deploy steps are skipped (gate step output false). Given a push to `main`, then Vercel builds and deploys it through the Git integration (not verified in this session).
- AC-5 Given a deployed build, then the version in the footer equals the latest tag.

## 6. Edge cases

- `main` behind `origin/main`: the script stops before bumping.
- Minor/major bump requested while in `0.0.x`: refused unless an explicit flag is passed (`.claude/rules/git-and-release.md`).
- Windows paths for the notes file: built with `join(tmpdir(), …)` and deleted after use.

## 7. Test strategy

- Unit: version bump function, notes extraction.
- Dry run: `bun run release -- --dry-run` prints the next version and notes without side effects (to add).
- Workflow lint: `actionlint` when available (not a dependency; manual run).

## 8. Verification

```sh
bun run ci
bun run release -- --dry-run
```
