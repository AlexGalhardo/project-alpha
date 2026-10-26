# Digest das referências do desenvolvedor

Fontes lidas: `references/chatgpt/conversation.md` (3074 linhas, inteiro), `references/concept-arts/*.png` (24), `references/wireframes/*.png` (13), e o repositório `AlexGalhardo/zeta-c` via `gh`.

## Resumo

1. O material de referência se chama **DARKEON** (ChatGPT, concepts, wireframes). Nome do projeto novo ainda não confirmado (ver Contradições).
2. Combate por turnos em fileira: 3 heróis à esquerda, 3 a 5 inimigos à direita, HUD superior, mão de cartas embaixo, botão Fim do Turno.
3. Roster de referência (concepts 23 a 27): Guerreiro, Mago, Curandeiro, Artilharia, Arqueiro. A equipe de combate tem 3 heróis.
4. Cartas com custo em energia (3 por turno no padrão), recarga de habilidades em turnos, status (Sangria, Veneno, Fraqueza, Corrupção, Marcado, Queimadura).
5. Mapa de progressão: trilha de nós com caveiras e chefe final (batle-2, batle-6, batle-7).
6. Metaprogressão: árvores de maestria por herói, árvore de pactos de equipe ("Eclipse dos Três") e árvore radial permanente ("Legado do Abismo", com fragmentos).
7. Economia: Ouro (moeda de loja), Vida como custo de pacto, Fragmentos (metaprogressão), Relíquias.
8. Lojas: Mercador (grade 3x3), Arsenal (equipamento, comparação), Relicário (pactos de risco).
9. A UI é consistente entre telas: mesmas faixas, painéis de pedra escura, botões retangulares com borda dourada no foco.
10. Os wireframes técnicos (1920x1080, coordenadas em px) são a fonte numérica; os concepts são referência visual. A ideia de "geometria numérica vence arte" está no ChatGPT e é boa.

## Ideias do ChatGPT

Organizado por tema. Itens com "(ChatGPT)" são propostas literais; itens com "(contradição)" estão em outra seção.

### Conceito e tom

- Roguelite + deckbuilding + RPG, dark fantasy, pixel art 2D lateral, universo original.
- Inspirações citadas: Darkest Dungeon (silhueta, atmosfera), Slay the Spire 2 (mão, legibilidade), DOOM The Dark Ages (metal, escala), Warhammer 40k e Space Marine 2 (arquitetura, corrupção), Alien/Predator (horror biomecânico). Ver Contradições: nomes de obras de terceiros aparecem no texto.
- Tom: gótico opressivo, medieval-industrial, horror alienígena antigo, maquinaria oculta.

### Heróis e classes

- Três heróis fixos na equipe: **Dreadguard** (tanque, escudo retangular, espada serrilhada), **Blood Huntress** (DPS/assassina, duas lâminas, máscara óssea), **Void Inquisitor** (mago/suporte, cajado espinhoso, máscara sem rosto).
- Ordem visual: Inquisidor, Caçadora, Dreadguard (Dreadguard mais perto dos inimigos).
- Cinco classes para detalhes (concepts 23 a 27), nível 25 de exemplo:
  - Guerreiro: vida 420, ataque 62, defesa 115; bloqueio e provocação.
  - Mago: vida 180, ataque mágico 125, defesa 28; dano em área e controle.
  - Curandeiro: vida 240, cura 135, defesa 42; cura, purificação, ressurreição, escudo.
  - Artilharia: vida 310, ataque 110, defesa 70; dano em área, canhão medieval-industrial, queimadura.
  - Arqueiro: vida 230, ataque 105, defesa 32; crítico, marcação, veneno.
- Cada herói tem seis habilidades (I a VI) com custo de energia e recarga em turnos.
- Atributos listados: vida, mana, ataque, defesa, força/destreza/inteligência/fé (conforme classe), crítico, velocidade, bloqueio, resistências (físico, fogo, gelo, veneno, vazio). Pontos disponíveis: 3.
- Slots de equipamento: capacete, armadura, arma, escudo/canhão/arco/cajado, amuleto, anel.

### Combate

- Mão de seis cartas visíveis como referência; energia 3/3 no início; energia usada para jogar cartas.
- Posições: heróis à esquerda com barras individuais; inimigos em slots fixos (5 centros: 1098, 1250, 1402, 1554, 1706 em wireframe).
- Intenção do inimigo mostrada (ataque, defesa, maldição, invocação). Telegrafia de área (veneno, ovo de invocação).
- Efeitos e status: Sangria, Veneno, Fraqueza, Corrupção, Marcado, Queimadura, Fortalecimento, Escudo/Bloqueio.
- Ataque em cadeia: "LÂMINA GIRATÓRIA" atinge 3 inimigos (linha de alvo).
- Elite: 20% de chance de encontro elite, como regra de encontro (não fixo por fase). Elite com barra própria e rótulo.
- Corrupção de carta: carta da mão corrompida; PURIFICAR cancela.
- Combo de relíquia: carta dispara relíquia (COMBO x3) com conexão visual dourada.
- Chefe em fases (3 fases, pontos de fase); barra de HP de chefe com 10.000 de vida.
- Recursos de combate: Ruptura, Marcado (+ dano), Fraqueza (carta de Fraqueza).
- Cartas de exemplo (nome, custo, efeito): Golpe Devoto (1, causa 8), Sangria (1, causa 4 e aplica 3 Sangria), Bomba Ácida (1, causa 6 e Veneno 2), Selo Maldito (aplica 3 Fraqueza, compra 1), Guarda de Aço (concede 8 Bloqueio, compra 1); Cataclismo do Vazio (3, causa 60 em um alvo, +30 se marcado; versão de área 24 em concept 27).
- Última carta de emergência: ÚLTIMO SACRAMENTO (2, restaura 40 de vida, adiciona Maldição ao baralho).
- Pila de descarte e baralho visíveis com contagem; "Terminar Turno" em destaque.

### Mapa e progressão de run

- Batalhas com "ROUND XX/10". Atos (ATO I) e nomes de locais: Catedral Abandonada, Pântano Biomecânico, Necrópole de Ferro, Campo de Guerra, Floresta do Sangue, Cidadela do Desespero, Forja Obsidiana, Catedral do Vazio (chefe).
- Trilha de nós com ícones de caveira e coroa no fim (progresso da run).
- Pré-chefe: "Cidadela do Desespero / Aproximação da Sala do Trono".

### Cartas e baralho

- Tipos de carta: Ataque, Defesa, Habilidade (com cor de faixa). Raridades: Comum, Incomum, Rara, Épica, Lendária.
- Filtros no deckbuilder: por classe, raridade, tipo (TODAS, ATAQUE, DEFESA, HABILIDADE, SUPORTE, UTILIDADE conforme tela), busca.
- Limite de baralho: 30 cartas (24/30 no exemplo). Cópias: x1, x2, x3 por carta.
- Métricas do baralho: custo médio (1,5), energia base, curva média.
- Sinergia de classe: cartas de Magia do Vazio.
- AUTO-ORGANIZAR no grimório.

### Economia e loja

- Ouro: moeda de loja (exemplos: 150, 180, 350, 420, 850).
- Lojas: Mercador (compra e venda, grade 3x3, painel de detalhe, COMPRAR), Arsenal (equipamento, comparação atual x selecionado, EQUIPAR/COMPRAR), Relicário (ofertas de relíquia com custo em ouro ou vida).
- Pacto de Sangue: custa 20 de Vida e dá +2 energia no primeiro turno e +1 Corrupção.
- Regra de moeda do ChatGPT: "Toda moeda e todo item alimenta uma decisão do jogador" (alinhado ao GDD).

### Metaprogressão e árvores

- Árvore de maestria (individual): três ramos por herói, nós 1/5 a 5/5, pontos de habilidade, APRENDER.
  - Guardião: Bastião (defesa), Executor (dano), Juramento (proteção/sacrifício).
  - Caçadora e Inquisidor: ramos próprios (concept 17 mostra as três abas).
- Árvore de equipe ("Pactos de Guerra"): triângulo com um vértice por herói; nós híbridos entre vértices; ultimate "Eclipse dos Três" (todos os heróis atacam o mesmo alvo; requer 3 vínculos; custo 3 pontos).
- Árvore permanente ("Legado do Abismo"): radial, núcleo "Núcleo Eterno", quatro ramos (Sobrevivência, Arsenal, Conhecimento, Profanação), custo em Fragmentos (1.250 disponíveis), nível do legado.
- Fragmentos e Nível do Legado: moedas entre runs.
- Morte de unidade: não aparece no ChatGPT; ver Lacunas.

### Menu e navegação

- Menu principal: CONTINUAR, NOVA JORNADA, PERSONAGENS/HERÓIS/COLEÇÃO, OPÇÕES, SAIR. Versão 0.1.0 no canto.
- Três direções de menu (Fortaleza, Sala do Trono, Portal Alienígena). A recomendação do ChatGPT é a Fortaleza (Main Menu 01).
- Menu de pausa: PAUSA, CONTINUAR, CONFIGURAÇÕES, REINICIAR RUN, MENU PRINCIPAL; aviso "O PROGRESSO DA RUN PODE SER PERDIDO"; ESC retoma.
- Configurações: categorias GERAL, VÍDEO, ÁUDIO, JOGABILIDADE, INTERFACE, ACESSIBILIDADE; resolução, modo de tela, VSync, limite de FPS, escala de interface, escala de pixel (inteira), efeitos, partículas, tremor de tela.
- Gestão de equipe: formação de 3 posições, ALTERAR FORMAÇÃO, CONFIRMAR EQUIPE; arrastar herói para posição.

### Arte e direção

- Estilo: ortográfico lateral, pixels quadrados sem anti-aliasing, sem 3D, sem pintura, sem gradiente sobre pixel; dithering leve no fundo.
- Paleta de produção (ChatGPT): #111018 (carvão), #252331 (sombra/painel), #464256 (pedra/subpainel), #DDD3C0 (osso/texto), #A92F39 (carmim), #E05B38 (laranja infernal), #A9CD4B (verde ácido), #7B58AB (violeta espectral), #D1A052 (dourado relíquia).
- Tipografia: gótica só em títulos; texto funcional em fonte pixel legível.
- Cores por função: vermelho ataque, azul-aço defesa, violeta magia, verde veneno, dourado destaque.
- Proposta de estrutura de assets: characters/heroes, enemies, bosses, npcs; backgrounds/combat, menu, shops; ui/cards, panels, buttons, icons, status-effects; items; vfx.

### Escopo e processo (do ChatGPT)

- Gerar primeiro o Gameplay 01 como imagem-mestra, depois as outras batalhas com o mesmo elenco.
- Prioridade: P0 combate 01, 03, 10; P1 loja 01 e árvore 01; P2 menu 01 e árvore 03; P3 o resto.
- Vertical slice antes de todas as cartas: 3 heróis, 3 inimigos, 6 cartas, turnos completos, status.
- Dois sistemas concorrentes a decidir: habilidades do herói como ação, carta ou passiva (o próprio ChatGPT marca isso como decisão pendente).
- Concept arts são referência; cenário, sprites, cartas, botões, VFX e HUD devem ser camadas separadas no Phaser 4.
- Geometria: canvas 1920x1080 de referência, produção nativa 960x540 com escala 2x (ver Contradições: conflita com o projeto).
- Espaçamento base 8 px; espaçamentos 4, 8, 12, 16, 24, 32, 48; margem externa 32; área clicável mínima 48x48; títulos 36 px, subtítulo 24, texto 20, compacto 16, secundário 14.
- Painéis com borda 2 ou 4 px; divisórias 2 px; raio 0 a 8 px.
- Layout padrão de batalha: ~65% da altura para cenário e personagens, ~35% para cartas e controles.

## Concept arts

Todas as imagens são 1672x941 (exceto menu-settings 1672x940). Cores: amostragem automática quantizada em 3 bits por canal deu resultado dominado por preto e azul-escuro; não é confiável para hex. Por isso as cores abaixo são impressão visual, marcadas como "estimado".

Paleta geral observada (estimado): fundo quase preto arroxeado (#14121a aprox.), painel carvão (#26232f aprox.), pedra cinza-violeta (#4a4658 aprox.), texto osso (#ddd3c0), dourado (#d1a052), carmim (#a92f39), vermelho vivo nas luzes (#c83a3a aprox.), laranja de brasa (#e05b38 aprox.), violeta (#7b58ab aprox.), verde ácido (#a9cd4b aprox.).

| Arquivo | Tela | Layout / HUD | Heróis / inimigos | Paleta (estimado) | Câmera / texto |
|---|---|---|---|---|---|
| batle-1.png | Combate, Rodada 7, Ouro 128, Baralho 19, Energia 3/3 | Topo: logo DARKEON, relíquias, Rodada, Ouro, Baralho, Energia, "Turno do Jogador". Esquerda: 3 retratos empilhados com HP e status. Embaixo: 5 cartas, "Mão 5/5", Descarte 0, Fim do Turno, poções na direita | Heróis: Valgrin, Morzeth, Kaelis. Inimigos: 5 (mound de carne 96/120, sacerdote 38/38, aranha 26/26, criatura alta 24/24, escudeiro 39/45 à esquerda do inimigo) | Vermelho, laranja, verde ácido, violeta, osso | Lateral, fileira. Título serifado; corpo pixel |
| batle-2.png | Necrópole de Ferro, Round 03/10, Ouro 320 | Trilha de 6 nós no topo com coroa no fim; Round no topo direito; mão em arco com carta ampliada (LÂMINA GIRATÓRIA) com linhas de alvo; energia 3/3 em disco dourado à esquerda; baralho 12, descarte 0; TERMINAR TURNO | 3 heróis, 5 inimigos (caveiras com escudo, cavaleiro, drone-esfera). Ícones de intenção: espadas vermelhas (ataque), símbolo violeta (maldição) | Dourado e laranja forte, carvão, carmim | Lateral, fileira; HUD com molduras de metal |
| batle-3.png | Catedral do Vazio, Rodada 10/10, CHEFÃO | Nome do chefe no topo central; barra de HP do chefe 6.400/10.000 com "FASE 2/3" e três marcadores; hand de 6 cartas com carta selecionada elevada; energia 3/3 em anel violeta; ENCERRAR TURNO | 3 heróis; chefe enorme à direita (Abyss Sovereign); 2 servos com 320/320 e 280/280 | Violeta dominante, lua vermelha, osso | Lateral, chefe ocupa metade direita |
| batle-4.png | Ato I, Round 01/10, Ouro 150 | Topo: logo, Ato, Round, Ouro, Relíquias, "Turno do Jogador", pausa. Esquerda: 3 retratos com HP. Embaixo: 6 cartas, Energia 3/3, Mão 6/6, Descartar 0, TERMINAR TURNO, poções | Heróis: Inquisidor do Vazio, Caçadora de Sangue, Dreadguard. Inimigos: 4 visíveis (cavaleiro-esqueleto, carne, sacerdote com coroa, caveira) | Carmim e vermelho dominantes, violeta, dourado | Lateral; vitrais atrás |
| batle-5.png | Floresta do Sangue, Rodada 07/10, Combate | Topo esquerdo: nome da região; topo direito: Rodada; barras de HP com Mana (azul) sob heróis; elite com rótulo ELITE e 25% ESQUIVA; mão de 6; energia 2/3 em anel violeta; ENCERRAR TURNO | 3 heróis; 3 inimigos (elite 420/420, besta 280/280, atirador 240/240) | Vermelho-sangue, lua vermelha, violeta | Lateral; linha de mira vermelha do arqueiro ao elite |
| batle-6.png | Cidadela do Desespero, Round 09/10 | Trilha de nós no topo; Ouro 180; mão de 6 com ÚLTIMO SACRAMENTO elevada; energia 2/3 em disco dourado; Baralho 6; Descarte 0; caveira 3; TERMINAR TURNO | Heróis com HP baixo (18/100, 34/85, 62/90). Inimigos 5 (cavaleiro 120/120, sacerdote 90/90, esfera 70/70, cavaleiro 110/110, besta 200/200) | Carvão, dourado, carmim | Lateral; escadaria do trono ao fundo |
| batle-7.png | A Forja Obsidiana, Ato I, Round 08/10 | Topo: logo, Ato, Round, Ouro 420; relíquias no centro do topo com linhas até as cartas (Coração da Forja, Medalhão de Cinzas, Núcleo Profano); COMBO x3; energia 1/3 em disco azul-chama; Baralho 14; Descarte 6; TERMINAR TURNO | 3 heróis; 5 inimigos (robôs de ferro 75/75, golem 180/180, etc.) | Laranja e fogo dominantes, carvão, azul-chama na energia | Lateral; forja |
| deckbuilding-menu.png | Grimório de Guerra (deckbuilder) | Cabeçalho com Baralho 24/30, Energia base 3, Curva média 1,5; coluna esquerda MEU BARALHO (24) com 3 filtros de herói e lista com x2/x1, filtros de tipo, AUTO-ORGANIZAR, VOLTAR, SALVAR BARALHO; centro COLEÇÃO DE CARTAS (grade 4x3 com filtros e busca); direita DETALHES DA CARTA com carta grande, custo, causa, ADICIONAR/REMOVER | Não aplicável | Carvão, dourado, bordas coloridas por classe | Frontal de interface |
| hero-menu.png | Companhia dos Condenados (equipe) | Logo no topo esquerdo; lista de heróis à esquerda com HP; cena central com 3 heróis e marcadores POSIÇÃO 1/2/3; painel direito com atributos, equipamentos, pontos; botões ALTERAR FORMAÇÃO, VOLTAR, CONFIRMAR EQUIPE | Dreadguard (nível 12), Blood Huntress (11), Void Inquisitor (10) | Vermelho lua, carvão, dourado | Lateral; cena com profundidade |
| hero-warrior-menu.png | Herói Guerreiro (Dreadguard, O Bastião de Ferro) | Esquerda: sprite, nível 25, XP, equipamentos (capacete, armadura, arma, escudo, amuleto, anel). Centro: ATRIBUTOS e RESISTÊNCIAS. Direita: 6 habilidades (grade 3x2) e detalhe da selecionada com APRIMORAR. Rodapé: VOLTAR, EQUIPAMENTOS, ÁRVORE DE HABILIDADES | Dreadguard | Carvão, dourado, carmim | Frontal; texto pixel |
| hero-mage-menu.png | Herói Mago (Void Arcanist) | Mesmo layout de três colunas; nível 25 com barra de XP violeta; slots em duas colunas ao redor do sprite; 6 habilidades (1 a 3 de custo) com detalhe e APRIMORAR | Void Arcanist | Violeta dominante, dourado | Frontal |
| hero-healer-menu.png | Herói Curandeiro (Ashen Saint) | Mesmo layout; seletor de herói no topo direito (3 miniaturas); slots com bônus (+5, +6, +7); 6 habilidades; APRIMORAR em dourado cheio | Ashen Saint | Osso, verde-claro, dourado | Frontal |
| hero-archer-menu.png | Herói Arqueiro (Bone Warden) | Mesmo layout; barra de XP vermelha; slots CAPUZ, ALJAVA, ARCO, ARMADURA, AMULETO, ANEL; 6 habilidades | Bone Warden | Vermelho, verde ácido (veneno), dourado | Frontal |
| hero-bombardier-menu.png | Herói Artilharia (Iron Bombardier) | Mesmo layout; equipamento CANHÃO e MUNIÇÃO; 6 habilidades | Iron Bombardier | Carvão, vermelho, laranja | Frontal |
| menu-1.png | Menu principal, Fortaleza (Main Menu 01) | Logo no alto central; menu vertical à esquerda: CONTINUAR (selecionado em dourado), NOVA JORNADA, PERSONAGENS, OPÇÕES, SAIR; VERSÃO 0.1.0 no canto inferior direito | 3 heróis de costas num penhasco | Roxo-cinza, vermelho lua, dourado no logo | Panorâmica; logo serifado com ornamentos |
| menu-2.png | Menu principal, Sala do Trono (Main Menu 02) | Logo no topo; menu à esquerda inferior: NOVA JORNADA (selecionado), CONTINUAR, HERÓIS, OPÇÕES, SAIR com ícones; subtítulo "O ABISMO AGUARDA" | 3 heróis à esquerda, trono vazio à direita | Vermelho e carvão, velas | Panorâmica |
| menu-3.png | Menu principal, Portal (Main Menu 03) | Logo no topo; menu vertical à direita: CONTINUAR (selecionado em violeta), NOVA JORNADA, COLEÇÃO, OPÇÕES, SAIR; VERSÃO 0.1.0 | 3 heróis pequenos na base do portal | Violeta dominante, osso, carvão | Panorâmica |
| menu-settings.png | Configurações, aba VÍDEO | Título CONFIGURAÇÕES no topo central; coluna esquerda com 6 categorias (VÍDEO selecionado em dourado); painel com linhas: resolução, modo de tela, VSync, FPS, escala da interface (slider), escala de pixel (INTEIRA), efeitos, partículas, tremor; rodapé RESTAURAR PADRÃO, CANCELAR, APLICAR | Não aplicável | Carvão, carmim, dourado | Frontal; texto serifado |
| shop-menu-1.png | Mercador (Cursed Merchant) | Topo: abas MERCADOR (ativa) e INVENTÁRIO; OURO 350; SAIR. Esquerda: NPC grande. Direita: grade 3x3 de itens com cor por raridade, preço em ouro. Abaixo: painel de detalhe com ESPADA DO VAZIO (Épico, 180) e COMPRAR | NPC: Cursed Merchant (encapuzado com máscara de bico) | Carvão, violeta, dourado, verde/azul/vermelho nas bordas por raridade | Frontal |
| shop-menu-2.png | Arsenal Infernal | Topo: ATO I, ARSENAL INFERNAL, OURO 850. Esquerda: DREADGUARD com slots (capacete, armadura, arma, escudo, amuleto, anel). Centro: abas TODOS, ARMAS, ARMADURAS, ACESSÓRIOS e grade 4x2. Direita: COMPARAÇÃO com ATUAL x SELECIONADO e EQUIPAR/COMPRAR | Dreadguard; ferreiro grande ao fundo | Carvão, laranja de forja, dourado | Frontal; forja em destaque |
| shop-menu-3.png | Relicário Proibido (Veiled Oracle) | Topo esquerdo: título; topo direito: OURO 420, VIDA 85/100. Centro: 3 cartas de relíquia (CORAÇÃO ABISSAL 150 ouro, PACTO DE SANGUE 20 vida, OLHO DO ESQUECIMENTO 250 ouro); direita: detalhe do pacto e palavras-chave; base: ACEITAR PACTO e VOLTAR | Oracle sentada num trono | Violeta, carmim, carvão | Frontal |
| skill-tree-1.png | Maestria dos Heróis (Guardião) | Abas GUARDIÃO, CAÇADORA, INQUISIDOR no topo. Esquerda: Dreadguard, nível 12, vida, defesa, força, pontos. Centro: três colunas (BASTIÃO azul, EXECUTOR vermelho, JURAMENTO dourado) com nós em árvore e cadeados. Direita: nó selecionado e APRENDER | Dreadguard | Azul-aço, vermelho, dourado | Frontal; nós com ícone pixel |
| skill-tree-2.png | Pactos de Guerra (Eclipse dos Três) | Topo: abas Jornada, Coleção, Pactos de Guerra, Relíquias, Diário; Pontos de pacto 4; três retratos (Dreadguard, Blood Huntress, Void Inquisitor). Centro: triângulo com nós (azul, vermelho, violeta) e ultimate central. Direita: detalhe e DESBLOQUEAR | Três heróis nos vértices | Azul, vermelho, violeta, dourado | Frontal; grafo triangular |
| skill-tree-3.png | Legado do Abismo (permanente) | Esquerda: título, FRAGMENTOS 1.250, Nível do legado 12 (450/1000). Centro: árvore radial com NÚCLEO ETERNO e quatro ramos (SOBREVIVÊNCIA, ARSENAL, CONHECIMENTO, PROFANAÇÃO). Direita: SANGUE RESISTENTE (nível 2/5), custo 200 fragmentos, MELHORAR, VOLTAR | Silhueta de guardião à esquerda | Verde, vermelho, violeta, azul, dourado | Frontal; grafo radial |

Notas sobre concepts:

- Não há fila de turnos visível em nenhum concept (ver Contradições).
- Nomes de heróis divergem entre telas (ver Contradições).
- Fonte do corpo: as telas de herói e de loja usam serifa estilo gótico no corpo de texto, não pixel. O ChatGPT pede pixel no texto funcional. Divergência observada.

## Wireframes

Ordem e identificação conferidas pelo checksum: wireframe-10 e wireframe-12 são bytes idênticos (mesmo md5). Os demais são distintos.

| Arquivo | Tela | Layout / coordenadas | Observações |
|---|---|---|---|
| wireframe-2.png | Sistema de coordenadas | 1920x1080 de referência; HEADER, LEFT, MAIN CONTENT, RIGHT, FOOTER; 960x540 como alternativa 50%; 8 px de unidade | Diagrama de conceito, sem medidas de componente |
| wireframe-3.png | Batalha, diagrama simplificado | Topo: RUN/ROUND, RECURSOS e RELÍQUIAS, PAUSA. Meio: 3 HERÓIS e 3 A 5 INIMIGOS. Base: ENERGIA, DECK/DESCARTE, TURNO e 6 cartas #1 a #6 | Fluxo de leitura, sem números |
| wireframe-4.png | Batalha, HUD técnico (WF01) | Cabeçalho 0,0,1920x104 com run-info (32,20,300x64), recursos (380,20,760x64), status (1192,20,360x64), pausa (1776,20,112x64). Área de batalha 0,104,1920x626: heróis em 80,220,810x456, inimigos em 1030,220,810x456 com 5 centros (1098, 1250, 1402, 1554, 1706). Ação: energia 32,816,224x228; baralho/descarte 280,816,208x228; mão 530,762,860x292 com cartas 132x204; painel direito 1432,816,456x228; FIM DO TURNO 1616,942,264x88 | Rótulos com IDs (carta-2 e carta-3 repetidos, inimigo-N, inimigo-5sprtus: erros de rotulagem). Atalhos: Pausar [P], Ver inimigos [TAB], Fim do turno [ESPAÇO]. Mão 860x292 aqui; o ChatGPT corrige para 864x292 em outro trecho |
| wireframe-5.png | Menu principal (WF02) | Logo 680x180 em 620,96; botões 512x72 em x=704, y=364, 452, 540, 628, 716 (gap 16); rodapé info 32,1020,480x28 e versão 1632,1020,256x28. Estados: default, hover (violeta), pressed (fill violeta), disabled (texto #6B6458), focused (borda dourada 4px) | Rodapé diz "© 2025" e "Build 2025.08.24", data anterior ao corrente |
| wireframe-6.png | Mercador (WF03) | Cabeçalho 0,0,1920x104 (título 32,32; moeda 1392,20,304x64; fechar 1776,20,112x64). Painel NPC 32,128,440x872; inventário 496,128,888x872 com 4 abas (192x56, gap 16) e grade 3x3 de itens 264x208 (x 520/800/1080; y 240/464/688); detalhe 1408,128,480x872; paginação 760,920,360x48; rodapé 32,1024,1856x40 | Estados de item: normal, hover, selecionado, comprado, indisponível (sem moeda) |
| wireframe-7.png | Árvore de habilidades (WF04) | Sidebar 32,128,336x872 (avatar 240x240, tabs 288x56); viewport do grafo 392,128,1000x872 com grade de nós (colunas 496 a 1296 de 160 px; linhas 256, 400, 544, 688, 832 de 144 px); nós 64x64 com área de toque 80x80; conectores 4 px (ativo #D1A052, inativo #464256); inspector 1416,128,472x872 | Três modos de grafo (ramo, triângulo, radial); controles de pan e zoom 100% |
| wireframe-8.png | Configurações (WF05) | Categorias 320x72 (gap 12), ativa em dourado; painel principal 408,128,1088x872 com linhas 1040x72 (rótulo x=456, controle x=1008); help 1520,128,368x872; botões RESTAURAR 432,920,240x64, CANCELAR 952,920,240x64, APLICAR 1208,920,264x64 | Escala de pixel 2x e FPS ilimitado aqui; concept menu-settings mostra escala INTEIRA e FPS 60. Divergência |
| wireframe-9.png | Deckbuilder (WF06), variante "Defesa Sólida" | Sidebar 32,128,376x872 com seleção de herói (88x88), lista de 8 entradas 328x56; grade 4x3 de cartas 204x208 (x 456/700/944/1188; y 264/496/728); inspetor 1464,128,424x872 com carta grande 240x336 e botões ADICIONAR 1488,816 e REMOVER 1688,816 (176x64) e SALVAR 1488,904 (376x64) | Carta com faixa de raridade, tipo e custo |
| wireframe-10.png | Equipe (WF07), "Companhia dos Condenados" | Roster 32,128,320x872 (linhas 288x128); showcase 376,128,952x872 com 3 slots 256x464, sprite 224x400 e linha de base y=744; formação 208x88; inspector 1352,128,536x872; equipamento em grade 3x2 de 64x64 e slot vazio 208x128 | Nomes: Branwen (Guerreiro), Nyssa (Maga), Cael (Curandeiro). Ver Contradições |
| wireframe-11.png | Deckbuilder (WF06), variante "Tiro Preciso" | Sidebar com filtros ARQUEIRO, MAGO, CURANDEIRO (88x88); grade 4x3 de 204x208 (gap 40 horizontal, 24 vertical); carta grande 240x336 com custo; ADICIONAR (A) e REMOVER (R) | Mostra 8 entradas de baralho com x1/x2/x3/x4 |
| wireframe-12.png | Igual a wireframe-10 | Byte a byte idêntico | Duplicata |
| wireframe-13.png | Detalhes do herói (WF08), ARDEN (Guerreiro) | Cabeçalho com nome, nível 12, moeda e diamante; painel do personagem 32,128,624x872 (sprite 416x416); atributos 680,128,560x872 com 7 linhas de 48 px; habilidades 1264,128,624x872 (grade 2x3 de 264x112); detalhe com APRIMORAR 1288,888,576x72; rodapé 0,1024,1920x56 | Mostra valores (força 24, agilidade 16, inteligência 12, vitalidade 28) |
| wireframe-hero-menu.png | Detalhes do herói, esboço genérico | Três colunas: painel de personagem (esquerda), atributos (centro, 9 valores), habilidades I a VI (direita); rodapé VOLTAR, EQUIPAMENTOS, ÁRVORE DE HABILIDADES | Placeholder da concept 23 (vida 245, mana 80, ataque 42, defesa 64, crítico 12%, velocidade 18) |

Padrões de wireframe: todos seguem canvas 1920x1080, origem no canto superior esquerdo, cabeçalho de 104 px, margem 32, painéis com padding 24, rodapé de 40 a 56 px, cartas 132x204 (batalha) e 204x208 (coleção).

## Padrões inferidos de UI/HUD e paleta

Repetidos em concepts e wireframes:

- Cabeçalho de 104 px com logo ou título à esquerda, recursos no centro, pausa ou fechar à direita.
- Combate: heróis à esquerda com HP e status (ícones pequenos sob a barra), inimigos à direita com HP e intenção (ícone sobre o inimigo), mão embaixo, energia num disco circular à esquerda, baralho e descarte com contagem, TERMINAR TURNO à direita.
- Cartas: faixa de custo (círculo azul ou dourado) no canto superior esquerdo, nome em faixa, tipo (ATAQUE, HABILIDADE, DEFESA), ilustração, texto de efeito, raridade por cor de moldura. A carta selecionada sobe e ganha moldura em brilho.
- Telas de herói e de loja: três colunas (34/32/34 %) ou (624/560/624 px). Esquerda: retrato grande, equipamento em grade. Centro: atributos e resistências. Direita: habilidades e detalhe.
- Botões: retângulos de metal escuro com borda, destaque em dourado para ação principal; vermelho para ação destrutiva ou fechar; violeta para estado pressionado.
- Painéis: carvão com bordas de metal ornamentadas (dourado ou pedra).
- Coordenadas do menu principal: botões alinhados à esquerda ou à direita.
- Ícones de atributo: coração (vida), espada (ataque), escudo (defesa), gota azul (mana), estrela (crítico), bota (velocidade).
- Ícones de status: caveira (veneno ou sangramento), chama (queimadura), floco (gelo), olho (marcação ou corrupção).

Cores de função (consistentes):

- Vermelho/carmim: ataque, sangue, perigo.
- Azul-aço: defesa, bloqueio.
- Violeta: magia do vazio, corrupção, ultimate.
- Verde ácido: veneno, cura (em alguns casos).
- Dourado: destaque, selecionado, moeda.

Divergências de paleta: a energia muda de cor entre telas (dourado, violeta, azul-chama, verde). Não há cor fixa para energia.

Acessibilidade de cor: os wireframes e concepts usam forma e ícone junto da cor em status e raridade; isso atende à regra do projeto (informação não só por cor). Não verificado se todas as cartas de raridade têm forma além da cor.

## Estrutura do zeta-c a replicar

Fonte: subagente que leu o repo via `gh` (somente leitura, nada gravado). Não verificado: tsconfig.json, biome.json, bunfig.toml, vite.config.ts, .editorconfig, .markdownlint-cli2.jsonc, conteúdo completo de docs/agent-workflow.md e docs/git-and-versioning.md.

Árvore resumida:

```text
AGENTS.md          (regras; CLAUDE.md contém apenas "@AGENTS.md")
PLAN.md            (fonte da verdade: fases, grupos, tarefas com checkbox, "Pronto quando")
CHANGELOG.md       (Keep a Changelog, seção [Unreleased] no topo)
BUGS.md
package.json       (version única; scripts: check, typecheck, test, lint, lint:md, build, balance, release)
biome.json, bunfig.toml, tsconfig.json, vite.config.ts, .editorconfig
.claude/
  rules/           (karpathy, code-architecture, content-and-assets, git-release-docs, caveman, platform)
  skills/          (≈70: núcleo do projeto + skills genéricas de game dev)
.githooks/         (pre-commit: biome + typecheck + markdownlint; commit-msg: Conventional Commits)
.github/workflows/ (ci.yml, deploy.yml, release.yml, dependabot.yml)
docs/              (agent-workflow, architecture, balancing, decisions, git-and-versioning, quality-assurance, release-checklist, visual, audio, ...; README.md é índice)
scripts/           (balance.ts, sim.ts, smoke.ts, qa*.ts, release.ts, build-*.ts, lib/)
src/
  logic/           (núcleo puro: rng, save, run, score, ai/, ... ; legalActions(state, seat) e apply(state, action, rng))
  data/            (todos os números de balanceamento)
  i18n/            (en, pt-BR)
  config/          (palette.ts, constants, ui)
  scenes/          (uma cena por tela)
  ui/              (componentes)
  core/            (camada de plataforma)
  view/            (apresentação)
tests/             (um arquivo por área: <área>.test.ts; describe('<feature> (<ID do PLAN>)'))
```

Convenções que valem replicar:

- PLAN.md: seção de visão, decisões com IDs (D-xx), arquitetura, especificação de regras, style bible, testes e gates, git e release, depois fases. Formato `## FASE N — Nome (versão)`, grupos `### PA1 — Nome · versão`, tarefas `- [x] ID` com subitens e linha `**Pronto quando:**` como critério de aceite. Marcação `[x]` ao concluir.
- Núcleo puro sem Phaser, por comandos: `legalActions(state, seat)` e `apply(state, action, rng)`. RNG com seed injetado.
- Números em `data/`, textos em `i18n/` (EN e PT-BR juntos), cores em `config/palette.ts`.
- Biome e formato com TAB (o zeta-c usa TAB 4). Neste repo, `biome.json` usa `indentStyle: tab` e `indentWidth: 4` (YAML com 2 espaços).
- Gates: `check`, `typecheck`, `test` a cada commit; `build` antes de push. `balance` (bot com faixa-alvo de vitória, seeds fixas) e `sim` (headless) são úteis ao roguelite. O zeta-c não tem script `ci` no package.json; o gate é encadeado. Não verificado se existe `ci` fora do package.json.
- Hooks: `pre-commit` roda biome, typecheck e markdownlint nos arquivos staged; `commit-msg` rejeita mensagem fora de Conventional Commits (tipos feat, fix, docs, test, refactor, perf, chore, build, ci, style, revert; escopo opcional; `!` aceito). Ativado pelo `prepare` do package.json (`core.hooksPath .githooks`).
- CHANGELOG: entradas em negrito por escopo, cada commit atualiza [Unreleased].
- Versão: campo único no package.json; tag e release só por pedido.
- Versões exatas: o zeta-c não segue a própria regra (phaser, typescript, vite e @types/bun usam ^). Replicar a regra do project-alpha (sem ^), não o package.json do zeta-c.
- Testes: `tests/<área>.test.ts`, `bun test`, fixtures em `tests/fixtures/`.

Não replicar (específico do jogo do zeta-c): regras de truco, manilha, vira, Manhas, companheiros, Campeonatos, nomes de NPC, scripts de balance e sim específicos do truco, qa-web, store-shots, site Next.js, trailer (Remotion), integrações Steam, Poki, Google Play, itch.io, ElevenLabs e PixelLab específicos, estilo visual híbrido (flat.ts, retratos pixel, Rubik), escopos de commit do truco.

Diferenças de regra a manter com cuidado: o project-alpha tem regras próprias de camadas, IP e assets (ver `.claude/rules/` do project-alpha). Não copiar as regras do zeta-c sem conferir.

## Contradições e lacunas

### Contradições entre referências e regras do projeto

1. **Nome do jogo**: ChatGPT e todos os concepts usam DARKEON. O repositório herdou vocabulário de um projeto anterior ("Ashen Vanguard"), já removido das regras e skills. Nome final decidido na tarefa 2.
2. **Resolução e escala**: ChatGPT propõe 1920x1080 com produção 960x540 e escala 2x. As regras herdadas fixavam base 480x270; hoje `assets.md` delega resolução e tamanhos à Art Bible. Decisão na tarefa 2.
3. **Tamanho da mão**: ChatGPT fala em seis cartas; batle-1 mostra 5 cartas (Mão 5/5), batle-2 mostra 5 na mão em leque. Outras telas mostram 6.
4. **Nomes de heróis**: ChatGPT e hero-menu usam Dreadguard, Blood Huntress, Void Inquisitor. batle-1 usa Valgrin, Morzeth, Kaelis. wireframe-10 usa Branwen, Nyssa, Cael. wireframe-13 usa Arden (Guerreiro). batle-4 usa nomes em PT (Inquisidor do Vazio, Caçadora de Sangue).
5. **Nomes de classe**: ChatGPT usa Guerreiro, Mago, Curandeiro, Artilharia, Arqueiro. Grimório e árvore de maestria usam Guardião, Caçadora, Inquisidor. Wireframe-11 usa Arqueiro, Mago, Curandeiro. Não há roster único.
6. **Duração de batalha**: concepts mostram "ROUND XX/10" em batalha comum. A regra herdada de 5 a 8 rodadas foi removida; a duração-alvo será definida no GDD.
7. **Chance de acerto**: regra do projeto diz "acerto é garantido; não existe porcentagem de acerto". Concepts mostram "25% ESQUIVA" (batle-5 e hero-archer) e "Tem 20% de chance de aplicar a condição" (wireframe-11, Tiro Preciso). Esquiva é uma porcentagem de evitar acerto. Conflito a decidir.
8. **Turn order**: regra do projeto exige fila de turnos sempre visível. Nenhum concept mostra fila explícita; batle-2 tem trilha de nós no topo, que é de mapa, não de turno. Ausente.
9. **Mana vs energia**: ChatGPT pede decisão sobre mana (RPG) x energia (cartas). Os heróis mostram barra de mana junto com HP (batle-3, batle-5), e as habilidades têm custo em energia e recarga em turnos. Sistemas sobrepostos, que o próprio ChatGPT marca como risco.
10. **Cor da energia**: dourado, violeta, azul-chama e verde mudam de tela para tela.
11. **Elite**: ChatGPT diz 20% de chance de encontro elite, como regra de sistema. Os exemplos de concept usam rodadas 5 e 7 e um elite mostrado em tela. Coerente, mas os rótulos nas telas não são uniformes.
12. **Escala de pixel e FPS**: menu-settings mostra escala INTEIRA e FPS 60. wireframe-8 mostra escala 2x e FPS ilimitado.
13. **Duplicatas**: wireframe-10 e wireframe-12 são idênticos. A pasta tem 13 arquivos com 12 telas distintas.
14. **Contagem de concepts**: ChatGPT fala em 19 prompts e depois em 27 (23 a 27 são heróis; 20, 21 e 22 são settings, deckbuilding e team, mas os prompts 20 a 22 não aparecem no texto, só como referências na tabela de wireframes). Existem 24 PNG de concept e não 27.
15. **Wireframes de herói**: ChatGPT lista 5 classes com 6 habilidades, mas wireframe-hero-menu usa números e rótulos I a VI genéricos.
16. **Ano no rodapé**: wireframe-5 diz "© 2025". Data de hoje: 2026.

### Riscos de IP (regra de ip-and-tone do projeto)

- O texto do ChatGPT cita como inspiração Warhammer 40,000, Space Marine 2, Darkest Dungeon, Slay the Spire 2, DOOM The Dark Ages, Alien/Predator, Blasphemous, Dungeon Rushers e "Jake Thayne / Primal Hunter" (no link de referência do arqueiro). Não pode ir a nenhum texto, nome de arquivo, prompt ou asset do projeto. Usar apenas como referência interna, sem copiar termos.
- Subtítulo de chefe "IMPERADOR DO VAZIO" (batle-3) e "demon-emperor" no prompt do chefe: combina com a regra de não usar o Imperador como deus-cadáver em trono. Revisar.
- Classe "Inquisidor" (Void Inquisitor, skill-tree-1 e 2): a regra proíbe "Inquisition" como organização. Como nome de classe, provavelmente permitido, mas precisa de revisão.
- Trono de caveiras, lua vermelha, sala do trono e altar de catedral: tropos genéricos, permitidos.
- Prompts do ChatGPT pedem "No recognizable copyrighted iconography" e "Original universe": bom, mas não garante.

### Lacunas (não verificado ou ausente)

- Morte de unidade: a regra do projeto diz que nunca atravessa runs e sempre deixa algo. Nada no ChatGPT ou nos concepts trata disso.
- Teto de poder permanente (GDD seção 8): não lido aqui (fora do escopo). Árvore radial e fragmentos precisam ser checados contra o teto.
- Estrutura do mapa (nós, tipos de nó, ramos): só aparece como trilha linear com caveiras (batle-2, 6, 7). Não há mapa ramificado.
- Lojas e eventos: nada sobre preço por rodada, reroll ou quantidade por loja além das telas.
- Cartas: não há tabela de custos e efeitos completa; só exemplos.
- Balanceamento: os números de HP e dano nos concepts são exemplos, o próprio ChatGPT avisa.
- Inimigos: não há lista completa com intenções, nem família de criaturas definida em texto (só descrições por concept).
- Save e continuidade de run: não tratado.
- Não há concept nem wireframe de tela de morte/derrota, vitória de ato ou recompensa de batalha.
- Não há tela de seleção de classe antes da run, nem de mapa.
- Áudio, input por toque e acessibilidade: só aparece nas configurações (categoria ACESSIBILIDADE sem conteúdo).
- Fontes: nenhuma fonte específica é definida; o texto diz "pixel legível" e "gótica só em títulos", mas as telas mostram serifas no corpo.
- Paleta: os hex do ChatGPT e os "estimados" de concept não são medidos (amostragem automática deu resultado grosseiro, dominado por preto).
