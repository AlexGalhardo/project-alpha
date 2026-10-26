# AGENTS.md

**project-alpha** (nome provisório): roguelite + deckbuilding + RPG em dark fantasy grimdark, pixel art, Phaser 4, web primeiro (Electron e Android só no fim da Beta). Estrutura de Darkest Dungeon e Slay the Spire; tom de horror gótico-militar, sem copiar nomes ou símbolos de outras obras.

## Início de toda sessão

1. Carregue as skills `karpathy-guidelines` e `caveman`.
2. Leia `PLAN.md` → seção **Status atual** (fase, grupo, próximo passo).
3. Leia as regras em `.claude/rules/` que tocam a tarefa.

## Documentação

| Assunto | Onde |
|---|---|
| Plano, fases, checklists | `PLAN.md` (tarefa 5) |
| Design do jogo (fonte da verdade) | `docs/gdd.md` (tarefa 3) |
| Direção de arte, paleta, specs de pixel art | `docs/art-bible.md` (tarefa 3) |
| Specs por sistema (requisitos, aceite, testes) | `docs/sdd/` (tarefa 4) |
| Decisões de arquitetura | `docs/adrs/` |
| Pesquisa e brainstorming | `docs/web-research.md`, `docs/research/`, `docs/brainstorming.md` (tarefa 2) |
| Regras para agentes | `.claude/rules/` (engenharia, design, assets, IP e tom, git) |

## Destaques obrigatórios

- **Pixel art:** skill `.claude/skills/pixel-logic/` + `docs/books/pixel-logic.md` antes de criar, gerar ou revisar qualquer asset visual.
- **Game design:** skill `.claude/skills/art-of-game-design/` + `docs/books/art-of-game-design.md` antes de criar ou mudar mecânica, carta, classe, inimigo ou economia.
- **Phaser 4:** skills oficiais em `.claude/skills/` (`scenes`, `sprites-and-images`, `v4-new-features`...). Nunca aplicar padrões do Phaser 3.

## Workflow

1. Pegue a próxima microtarefa do `PLAN.md`; lógica de `src/core/` com teste primeiro.
2. Valide: `bun run lint`, `bun run lint:md`, `bun run typecheck`, teste afetado (`bun test <arquivo>`).
3. Microcommit em Conventional Commits (inglês) a cada microtarefa; marque `[x]` no `PLAN.md`.
4. Fim do grupo: `bun run ci` verde → `bun run release` (push para `main` + release no GitHub). Atualize **Status atual**.
5. Mudou convenção, comando ou arquitetura: atualize este arquivo, o ADR e o `CHANGELOG.md` (gerado pelo git-cliff).

## Boas práticas

- Bun para tudo; versões exatas e estáveis; dependência nova só com aprovação do desenvolvedor.
- Núcleo determinístico: RNG com seed, sem `Math.random`/`Date` em `src/core/`.
- Número de balanceamento em `src/data/`; texto do jogador em `src/i18n/` (EN e PT-BR).
- Geração paga (PixelLab, ElevenLabs) só após aprovação de lista e custo.
- Não sabe? Pergunte. Não invente dados; marque "não verificado".
- Agentes paralelos: o coordenador (sessão principal) delega a 3 agentes fixos (Opus revisão, Sonnet código, Haiku textos/i18n/testes/simulações), integra e commita. Sem worktrees salvo pedido explícito.
