# The Art of Game Design aplicado ao project-alpha

Resumo operacional de *The Art of Game Design: A Book of Lenses* (Jesse Schell, 1ª edição, 100 lenses) para este jogo: roguelite deckbuilder com progressão de RPG. O conhecimento completo (frameworks, tabela de decisões, índice de lenses por tarefa, resumo por capítulo) está na skill [`.claude/skills/art-of-game-design/SKILL.md`](../../.claude/skills/art-of-game-design/SKILL.md).

## Como usar

1. Escolha as lenses da tarefa no *Lens index by design task* da skill.
2. Responda cada pergunta por escrito contra o design real (na spec em `docs/sdd/` ou no relatório).
3. Toda resposta fraca vira mudança ou questão em aberto em `docs/brainstorming.md`.
4. Cite pelo número e nome do autor: "Lens #33 Triangularity".

## Lenses obrigatórias por tipo de trabalho

| Trabalho | Lenses mínimas |
|---|---|
| Nova carta ou relíquia/item | #28 Expected Value, #32 Meaningful Choices, #33 Triangularity, #43 Elegance |
| Nova classe de herói | #30 Fairness, #44 Character, #47 Balance, #76 Character Function |
| Novo inimigo, elite ou chefe | #31 Challenge, #52 The Puzzle, #57 Feedback, #73 Collusion |
| Mapa e estrutura da run | #39 Time, #49 Visible Progress, #50 Parallelism, #61 The Interest Curve |
| Economia, loja, metaprogressão | #5 Endogenous Value, #40 Reward, #41 Punishment, #46 Economy |
| UI, HUD, feedback | #56 Transparency, #57 Feedback, #58 Juiciness, #59 Channels and Dimensions, #60 Modes |
| Revisão de feature pronta | #1 Essential Experience, #3 Fun, #9 Unification, #15 Toy |

## Aplicação a este gênero

- **Cartas = escolhas com valor esperado.** Compare cartas pelo valor esperado em energia (dano/bloqueio por ponto de energia) contra o HP real dos inimigos daquele ato. Overkill não conta como valor. Cada carta precisa de um motivo para ser escolhida *e* um motivo para ser recusada (Lens #32).
- **Triangularidade em toda recompensa:** oferecer opção segura-pequena e arriscada-grande de valor esperado próximo: elite vs. caminho comum, carta forte com custo de estresse etc. (Lens #33).
- **Acerto garantido:** sem porcentagem de acerto. O acaso vem da ordem de compra, das recompensas e do mapa, nunca de "errou o golpe" (Lens #29; percepção de probabilidade, Lens #28).
- **Intenção inimiga visível:** o combate é um quebra-cabeça de informação completa por turno: primeiro passo óbvio, progresso visível, rampa gradual (Lens #52). Esconder a intenção vira frustração.
- **Classes = balanceamento assimétrico.** Pontue atributos de cada classe (Baixo 1 / Médio 2 / Alto 3), some, jogue, reequilibre o que vence ou perde sempre. Classe que todo mundo escolhe é estratégia dominante (Lenses #30, #47).
- **Curva de interesse da run:** gancho no primeiro combate, alívio, picos crescentes (elites) com descansos (fogueira, loja, evento), clímax no chefe do ato, resolução curta (recompensa). Fractal: vale para combate, ato e run (Lens #61).
- **Punição compreensível:** morte de herói e perda de run precisam ser previsíveis e deixar algo para a próxima run. Metaprogressão dá opções, não poder bruto (Lenses #41, #46).
- **Economia endógena:** ouro, materiais e pontos de habilidade só existem se alimentam uma decisão. Moeda ignorada pelos jogadores é defeito (Lens #5).
- **Brinquedo antes do jogo:** jogar uma carta, ver o número subir, o inimigo reagir e o som tocar deve ser satisfatório sem objetivo nenhum (Lens #15). Isso é o primeiro marco do protótipo.
- **Balanceamento:** só do que é jogável; dobre ou divida por dois, depois refine; nunca ajuste de 10% às cegas.
- **Processo:** prototipe o maior risco primeiro (a diversão do combate) e meça uma classe e um ato completos antes de se comprometer com contagens de conteúdo.
