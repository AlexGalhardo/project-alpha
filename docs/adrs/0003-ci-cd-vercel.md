# ADR 0003: CI and deployment to Vercel

- Status: accepted, amended 2026-10-26 (supersedes the GitHub Actions deploy path of the first version of this ADR)
- Date: 2026-10-26

## Context

The web build deploys to `alpha.lekzera.xyz`. The first version of this ADR planned to deploy from GitHub Actions after the CI job passed, with three repository secrets. On 2026-10-26 the Vercel project was created through the Vercel MCP with the GitHub integration, which makes Vercel build every push itself. The quality gate stays local.

## Decision

- Vercel project `alpha.lekzera.xyz` in team PROJETOS, linked to `AlexGalhardo/project-alpha`. Production branch `main`. Framework preset `vite`. Install command `bun install --frozen-lockfile`. Build command `bun run build`. Output directory `dist`. Domain `alpha.lekzera.xyz` verified.
- Every push to `main` deploys to production through the Vercel Git integration.
- The quality gate is local: `bun run ci` runs before every push, and the release script (`bun run release`) runs it again before it tags. Nothing deploys a commit that fails that gate on the developer's machine, provided the gate was run.
- `.github/workflows/ci.yml` stays: on push and pull request it runs `bun install --frozen-lockfile` and `bun run ci` with Bun 1.4.4, actions pinned by commit SHA, `permissions: contents: read`.
- `.github/workflows/deploy.yml` stays as an optional path (`vercel pull/build/deploy --prebuilt --prod`, `vercel@65.3.1`). It skips without the three Vercel secrets and without `index.html`. With the Git integration active, it is not the production path.

## Verification status

The Vercel project settings above are recorded from the coordinator's report of 2026-10-26. They were not re-read in this session. Check them in the Vercel dashboard or with the Vercel MCP before relying on them.

## Alternatives

- GitHub Actions deploy after CI (first version of this ADR): deploys wait for the GitHub gate, but need three secrets and a workflow that runs on every push. Kept as the optional path.
- GitHub Pages: no per-project domain as simple, and no per-push previews.

## Consequences

- Deploys do not wait for GitHub CI. A push that breaks `bun run ci` on GitHub can still deploy. The gate relies on running `bun run ci` before every push; `bun run release` enforces it for releases only.
- Every push to `main` is a production deploy. Use a branch and a preview deploy for work that is not ready.
- The `deploy.yml` workflow can deploy a second time with the same commit if its secrets are set. Remove the secrets or the workflow when the Git integration is the only path.
- Cost: the Vercel Hobby plan covers the prototype. Commercial use is not verified; Hobby is for non-commercial use under Vercel's terms, so re-evaluate before monetizing.
