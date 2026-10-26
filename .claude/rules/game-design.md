# Regras de game design

Fonte da verdade: `docs/gdd.md` (depois da tarefa 3 do `PLAN.md`). Princípios: skill `art-of-game-design` e `docs/books/art-of-game-design.md`.

## Antes de criar ou mudar uma mecânica

1. Ela reforça os pilares e a fantasia do jogador definidos no GDD? Se não, não entra.
2. Rode as lenses da tarefa (índice na skill `art-of-game-design`) e responda por escrito no PR/commit ou na spec.
3. Ela cabe no escopo da fase atual do `PLAN.md`? Se não, anote em `docs/brainstorming.md` (seção "Ideias fora de escopo") e siga.
4. Atualize o GDD e a spec em `docs/sdd/` no mesmo commit do código.

## Invariantes do jogo

- Acerto é garantido. Não existe porcentagem de acerto nem de crítico escondida.
- Intenção inimiga e ordem de turno estão sempre visíveis antes da decisão do jogador.
- Toda carta e habilidade mostra prévia do resultado (dano final já com modificadores) antes de confirmar.
- O jogador nunca sofre dano de fonte que não podia ver antes de decidir.
- Toda moeda, item e recompensa alimenta uma decisão do jogador.
- Metaprogressão dá opções novas, não poder bruto que substitui habilidade (teto definido no GDD).
- Uma run tem duração-alvo definida no GDD; regra que alonga combate ou run precisa de simulação que a justifique.

## Balanceamento

- Só se balanceia o que já é jogável.
- Valor que parece errado é dobrado ou dividido por dois, depois refinado. Nunca ajuste de 10% às cegas.
- Mudança de número vem com simulação headless antes e depois, e relatório em `docs/reports/`.
- Estratégia dominante (uma opção sempre melhor) é defeito de prioridade alta.

## Interface

- Uma UI, pensada para toque e mouse. Nada depende de hover: tooltip abre por toque/clique longo também.
- Resposta visual a todo input em até 100 ms.
- Informação nunca é passada só por cor: cor + forma, ícone ou padrão.
- Auto battle e velocidade 1x/2x/3x existem desde o protótipo e nunca mudam o resultado lógico de um combate com a mesma seed.

## Escopo

- Dúvida de design que o GDD não responde: parar e perguntar ao desenvolvedor.
- Ideia boa fora da fase: anotar em `docs/brainstorming.md`, não implementar.
