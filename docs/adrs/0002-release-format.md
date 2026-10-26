# ADR 0002: Formato de releases no GitHub

- Status: aceito
- Data: 2026-10-26

## Contexto

O desenvolvedor exige uma release por push, com qualidade igual à de <https://github.com/AlexGalhardo/vukem/releases>. Análise de `v0.32.0` e `v0.31.0` daquele repositório (via `gh release view`) e da configuração `.config/cliff.toml` dele:

- Título = tag (`v0.32.0`).
- Corpo = seção da versão no `CHANGELOG.md`, sem o cabeçalho `## [x.y.z]`, agrupada em `### Added`, `### Changed`, `### Fixed`, `### Security` (Keep a Changelog 1.1.0).
- Cada linha: `- **scope:** Mensagem com inicial maiúscula ([sha7](link do commit))`.
- Gerado pelo git-cliff a partir de Conventional Commits; `docs`/`test`/`ci`/`build`/`chore`/`style` são omitidos.
- Assets binários (GoReleaser, checksums, SBOM, assinatura cosign): específicos de uma CLI em Go.

## Decisão

- `cliff.toml` replica o template do vukem (linhas, links de commit, rodapé de comparação entre versões).
- Diferença deliberada: `docs` entra como grupo `### Documentation`, porque nas fases de planejamento os documentos são a entrega principal e sem isso a release sairia vazia.
- `bun run release [patch|minor|major]` (`scripts/release.ts`): exige branch `main` e árvore limpa → `bun run ci` → bump no `package.json` (a primeira release usa a versão atual, `0.0.1`) → `CHANGELOG.md` regenerado → commit `chore(release): vX.Y.Z` → tag anotada → `git push --follow-tags` → `gh release create` com as notas da versão.
- Assets na release: nenhum até existir build web. A partir da fase PROTÓTIPO, anexar `project-alpha-web-vX.Y.Z.zip` + `checksums.txt` (tarefa no `PLAN.md`).
- Versionamento: `0.0.x` Alpha, `0.1.x` Beta, `1.0.0` estável.

## Alternativas

- Workflow `release.yml` no GitHub Actions: descartado por ora; o script local é o caminho único e roda o mesmo portão de CI.
- `release-please` / `semantic-release`: dependências maiores e formato diferente do vukem.

## Consequências

- Commit sem tipo releasable (`feat`/`fix`/`perf`/`refactor`/`revert`/`docs`) desde a última tag faz o script falhar com mensagem clara.
- O `CHANGELOG.md` nunca é editado à mão; corrigir mensagem de commit corrige o changelog.
