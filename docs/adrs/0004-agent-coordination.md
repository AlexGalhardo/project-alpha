# ADR 0004: Coordenação de agentes paralelos

- Status: aceito
- Data: 2026-10-26

## Contexto

O desenvolvedor pediu 3 agentes paralelos permanentes, com modelos por função, coordenados pela sessão principal. O CLAUDE.md global dele exige "sim" explícito para agentes paralelos e worktrees. Em 2026-10-26 ele autorizou **3 agentes sem worktree**.

## Decisão

| Agente | Modelo | Função |
|---|---|---|
| Revisor | Claude Opus 5.5 | Revisão e auditoria do que foi feito; pesquisa que exige julgamento |
| Implementador | Claude Sonnet 5.5 | Código, scripts, integração técnica |
| Redator | Claude Haiku 5.5 | i18n, documentação, textos, testes, balanceamentos e simulações pontuais |

- A sessão principal (Opus 5.5) planeja, delega, integra e faz todos os commits.
- Subagentes terminam cada tarefa e ficam em espera; recebem a próxima via `SendMessage` com o contexto preservado ("standby").
- Cada agente toca um conjunto de arquivos distinto por vez; nenhum faz commit.
- Sem `git worktree` salvo novo pedido explícito.

## Alternativas

- 3 worktrees: isolamento total, mas custo de rebase e merge a cada grupo e pouco ganho em fases de documentação.
- Trabalho só sequencial: mais lento.

## Consequências

- Conflito de edição é evitado por divisão de arquivos, não por branches.
- Toda saída de agente é revisada pelo coordenador antes do commit.
