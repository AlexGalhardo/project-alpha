# ADR 0003: CI/CD with GitHub Actions and Vercel deployment

- Status: accepted (deployment pending the developer's configuration)
- Date: 2026-10-26

## Context

Web deployment on Vercel at `alpha.lekzera.xyz` during the prototype phase, triggered by GitHub Actions.

## Decision

- `.github/workflows/ci.yml`: push to `main` and PR → `bun install --frozen-lockfile` → `bun run ci`. Bun pinned to `1.4.4`, actions pinned by commit SHA (`actions/checkout` v7.0.1, `oven-sh/setup-bun` v2.2.0), `permissions: contents: read`, secrets only in the steps that use them.
- `.github/workflows/deploy.yml`: push to `main` → CI → `vercel pull/build/deploy --prebuilt --prod` with `vercel@65.3.1` pinned. The job only runs when `index.html` exists (the game is created in the STRUCTURE phase).
- Required repository secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.
- Domain `alpha.lekzera.xyz` added to the Vercel project, and CNAME `alpha` → `cname.vercel-dns.com` in the DNS of `lekzera.xyz`.

## Developer to-dos

1. Create the Vercel project (framework: Vite; build: `bun run build`; output: `dist`).
2. Add the 3 secrets to GitHub (`gh secret set VERCEL_TOKEN`, etc.).
3. Configure the domain and DNS.

## Alternatives

- Vercel's native Git integration: simpler, but it deploys without going through `bun run ci`.
- GitHub Pages: no per-project domain as simple, and no previews.

## Consequences

- A deploy only goes out with green CI.
- Cost: the Vercel Hobby plan covers the prototype (commercial use not verified; Hobby is for non-commercial use under Vercel's terms, so re-evaluate before monetizing).
