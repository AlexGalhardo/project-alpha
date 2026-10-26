# Regras de git e release

## Commits

- Conventional Commits 1.0.0, em inglês: `feat`, `fix`, `docs`, `test`, `refactor`, `perf`, `revert`, `style`, `chore`, `build`, `ci`. Escopo opcional (`feat(combat): ...`).
- Microcommit por microtarefa concluída. Código, teste e doc da mesma mudança no mesmo commit.
- Nunca usar `--no-verify`. Hook que falha indica defeito a corrigir.
- Nunca versionar `.env`, PDFs, `references/`, `node_modules/`, `dist/`.

## Push e release

- Push para `main` só ao fim de cada grupo de tarefas do `PLAN.md`, com os asserts do grupo verificados e `bun run ci` verde.
- Cada push gera uma release no GitHub por `bun run release` (ver `docs/adrs/0002-release-format.md`): bump de versão, `CHANGELOG.md` regenerado pelo git-cliff, tag `vX.Y.Z`, notas = seção da versão no changelog.
- Versão: `0.0.x` na Alpha (cada push incrementa o patch), `0.1.x` na Beta, `1.0.0` no lançamento.

## CI/CD

- GitHub Actions: `ci.yml` roda `bun run ci` em push e PR; `deploy.yml` publica a build na Vercel (alpha.lekzera.xyz) em push para `main`.
- O portão local continua obrigatório: `bun run ci` antes de todo push.

## Trabalho paralelo

- Sem worktrees salvo pedido explícito do desenvolvedor. Agentes paralelos tocam arquivos distintos; o coordenador (sessão principal) integra e commita.
- Se houver branch: rebase sobre `main` antes de integrar; resolver conflito lendo os dois lados, nunca descartando um.

## Operações destrutivas

- `git reset --hard`, `push --force`, apagar branch ou tag: só com pedido explícito do desenvolvedor.
