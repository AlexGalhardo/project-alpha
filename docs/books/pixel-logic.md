# Pixel Logic aplicado ao project-alpha

Resumo operacional de *Pixel Logic* (Michael Azzi, 2022) para este jogo: roguelite deckbuilder em visão lateral, heróis em fileira contra inimigos, cartas e HUD em pixel art. O conhecimento completo do livro (regras, tabelas de decisão, checklists por capítulo, glossário) está na skill [`.claude/skills/pixel-logic/SKILL.md`](../../.claude/skills/pixel-logic/SKILL.md). Os valores numéricos do jogo (resolução base, tamanhos, paleta em hex, fps) moram em `docs/art-bible.md`; este documento diz **como decidir**, a Art Bible diz **o valor escolhido**.

## Quando usar

| Situação | O que ler |
|---|---|
| Vai criar ou gerar um sprite, ícone, carta ou peça de UI | Skill: *Core rules* + tabela *Decision rules* da escolha em questão |
| Vai escrever prompt para PixelLab | Skill: *Workflow*; declare tela, perspectiva, contorno e orçamento de cores |
| Vai revisar asset (manual ou gerado) | Skill: *Checklist* de cada capítulo relevante; nomeie defeitos com os termos do livro |
| Dúvida de animação | Skill: capítulo 9 (Animation) |

## As 8 regras centrais (resumo)

1. Controle total: todo pixel é intencional; escala só inteira; nada de mixels nem pixels rotacionados.
2. Linhas consistentes: espessura única (normalmente 1 px); degraus de diagonal regulares; sem *jaggies*.
3. Sem *banding* nem *pillow shading*.
4. Antialias com parcimônia, só por dentro do sprite.
5. Paletas pequenas com hue shift (luz para amarelo, sombra para roxo); cerca de 16 cores por sprite; sem preto puro.
6. Legibilidade primeiro: silhueta clara, 1 cor principal + 1 de contraste, testar em 1× sobre o fundo real.
7. (Isométrico, não se aplica ao combate lateral; vale só se houver mapa isométrico.)
8. Animação vive nos quadros-chave: loops com no mínimo 3 quadros; sub-pixel só em in-betweens, nunca no rosto.

## Aplicação a este gênero

- **Combate lateral em fileiras (estilo Darkest Dungeon / Slay the Spire):** heróis à esquerda virados para a direita, inimigos à direita virados para a esquerda. Um único ângulo (perfil 3/4) para todas as unidades, conferido lado a lado.
- **Tamanho do sprite:** dimensione pelo menor traço que identifica a classe (arma, elmo, capuz). A silhueta sozinha precisa identificar classe e facção. Inimigo elite e chefe são maiores, não só recoloridos.
- **Contorno:** sprites se movem sobre fundos variados, então use contorno escuro colorido (não preto puro) ou contorno sombreado. Contorno seletivo só em elementos sobre fundo sempre escuro (painéis de UI).
- **Cartas:** a arte da carta é uma ilustração própria em tela fixa, não o sprite de batalha reduzido. Sprite de batalha, retrato, ícone e arte de carta da mesma entidade têm proporções diferentes e são desenhados separadamente.
- **Ícones de status e intenção:** devem ler em 1× no menor tamanho da Art Bible; forma + cor, nunca só cor.
- **Fundos:** menos contraste e saturação que as unidades, para separar planos. Dithering é permitido em fundos e céus, proibido em unidades.
- **Protótipo sem animação:** sprites estáticos devem ter pose de "pronto para agir", com leitura de arma e direção. Quando houver animação: idle de 2 extremos a 1 px de distância; ataque com antecipação curta (ação do jogador) e smear de 1 quadro.
- **Saída de IA (PixelLab):** é rascunho. Conferir escala de pixel, contagem de cores, palette lock na paleta-mestra, contorno e silhueta; limpar à mão.

## Checklist rápido de revisão

- [ ] Tela e escala inteira conforme Art Bible
- [ ] Contagem de cores ≤ limite; paleta-mestra; sem `#000000`
- [ ] Sem mixels, jaggies, banding, pillow shading
- [ ] Silhueta identifica classe ou inimigo em 1× e desfocada
- [ ] Contraste correto contra o fundo real do ato
- [ ] Chave e dimensões iguais às do placeholder
