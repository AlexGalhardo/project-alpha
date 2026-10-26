# ADR 0003: CI/CD com GitHub Actions e deploy na Vercel

- Status: aceito (deploy pendente de configuração do desenvolvedor)
- Data: 2026-10-26

## Contexto

Deploy web na Vercel em `alpha.lekzera.xyz` durante a fase protótipo, disparado pelo GitHub Actions.

## Decisão

- `.github/workflows/ci.yml`: push em `main` e PR → `bun install --frozen-lockfile` → `bun run ci`. Bun fixado em `1.4.4`, `permissions: contents: read`.
- `.github/workflows/deploy.yml`: push em `main` → CI → `vercel pull/build/deploy --prebuilt --prod` com `vercel@65.3.1` fixado. O job só roda quando `index.html` existe (o jogo nasce na fase ESTRUTURA).
- Segredos do repositório exigidos: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.
- Domínio `alpha.lekzera.xyz` adicionado ao projeto Vercel e CNAME `alpha` → `cname.vercel-dns.com` no DNS de `lekzera.xyz`.

## Pendências do desenvolvedor

1. Criar o projeto na Vercel (framework: Vite; build: `bun run build`; output: `dist`).
2. Cadastrar os 3 segredos no GitHub (`gh secret set VERCEL_TOKEN` etc.).
3. Configurar o domínio e o DNS.

## Alternativas

- Integração Git nativa da Vercel: mais simples, mas faz deploy sem passar pelo `bun run ci`.
- GitHub Pages: sem domínio por projeto tão simples e sem previews.

## Consequências

- Deploy só sai com o CI verde.
- Custo: plano Hobby da Vercel cobre o protótipo (não verificado para uso comercial; o Hobby é para uso não comercial pelos termos da Vercel, então reavaliar antes de monetizar).
