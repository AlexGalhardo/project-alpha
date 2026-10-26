# ADR 0001: Ferramentas de qualidade (Bun, Biome, markdownlint, commitlint)

- Status: aceito
- Data: 2026-10-26

## Contexto

O desenvolvedor pediu Bun 1.4.4 como ferramenta principal, Biome v2 para TypeScript, markdownlint para Markdown, Conventional Commits e verificação de "typos e erros" com as ferramentas que existirem de fato na última release de Bun e Biome.

## Verificação feita

| Ferramenta | Versão | Comando verificado | O que faz |
|---|---|---|---|
| Bun | 1.4.4 (`bun --version`) | `bun check` (listado em `bun --help`: "Type check a TypeScript project") | Type check do projeto via `tsconfig.json` |
| Bun | 1.4.4 | `bun audit` | Vulnerabilidades em dependências |
| Biome | 2.6.3 (npm, última estável em 2026-10-26) | `biome ci` | Formatação + lint + organize imports, sem escrever, para CI |
| Biome | 2.6.3 | `biome check --write` | Corrige formatação e lint localmente |
| markdownlint-cli2 | 0.24.0 | `markdownlint-cli2 "**/*.md"` | Lint de Markdown |

Nem Bun nem Biome têm verificador ortográfico (typos) nativo: nenhum subcomando em `bun --help` ou `biome --help` faz isso. Erros de tipo são cobertos por `bun check` e erros de código por `biome ci`.

## Decisão

- `bun run typecheck` → `bun check`; `bun run lint` → `biome ci .`; `bun run format` → `biome check --write .`; `bun run lint:md` → markdownlint-cli2.
- `bun run ci` (`scripts/ci.ts`) encadeia tudo; etapas sem entrada ainda (sem `tsconfig.json`, `tests/`, `index.html`) são puladas com aviso até a fase ESTRUTURA.
- commitlint + husky (`.husky/commit-msg`) validam Conventional Commits localmente.
- Todas as versões exatas no `package.json`, sem `^`/`~`.

## Alternativas

- `typos-cli` (crate-ci) ou `cspell` para ortografia: úteis, mas são dependência nova e o texto é bilíngue (PT-BR/EN). Fica como proposta para a fase ESTRUTURA, sujeita à aprovação.
- `tsc --noEmit` direto: `bun check` faz o mesmo sem chamar o compilador separadamente; `typescript` 7.0.2 continua instalado para o editor e ferramentas.

## Consequências

- Typos em texto não são pegos automaticamente até a decisão sobre `typos-cli`/`cspell`.
- O CI do GitHub e o local rodam o mesmo script.
