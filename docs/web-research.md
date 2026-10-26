# Pesquisa web: roguelite + deckbuilding + RPG grimdark em pixel art (Phaser 4, web)

> Pesquisa consolidada. Data da coleta: 2026-10-26. Toda afirmação relevante traz URL inline.
> "não verificado" = não consegui confirmar em fonte primária nesta coleta. Nada aqui foi inventado.
> Valores de StS referem-se a Slay the Spire 1 salvo indicação "StS2".

---

## 1. Resumo executivo

- Slay the Spire 1 (StS) define o núcleo de turno: **3 energia, compra de 5 cartas por turno**, descarte da mão no fim do turno, pilha de exaustão ([StS2 Mechanics](https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Mechanics), [Exhaust](https://slaythespire.wiki.gg/wiki/Exhaust)).
- Darkest Dungeon (DD1) define a camada de RPG sombrio: side-view com **ranks** (posição limita habilidades), estresse 0–200 com teste de resolução em 100 e ataque cardíaco em 200 ([Wikipedia DD](https://en.wikipedia.org/wiki/Darkest_Dungeon), [Stress](https://darkestdungeon.wiki.gg/wiki/Stress)).
- Darkest Dungeon II (DD2) **removeu a precisão: acertos são garantidos** (salvo efeitos específicos), estresse virou escala 0–10, e adicionou relações entre heróis e a carruagem/estrada ([DD2 wiki](https://darkestdungeon.wiki.gg/wiki/Darkest_Dungeon_II), [Stress DD2](https://darkestdungeon.wiki.gg/wiki/Stress_(Darkest_Dungeon_II))). Isso valida nosso invariante "acerto é garantido".
- Economia de StS é bem documentada: combate normal 10–20 ouro, elite 25–35, chefe 95–105; remoção de carta 75 + 25 por uso ([Gold](https://slaythespire.wiki.gg/wiki/Gold), [Merchant](https://slaythespire.wiki.gg/wiki/Merchant)).
- Balanceamento da MegaCrit foi guiado por métricas desde cedo (palestra GDC 2019) ([GDC Vault](https://www.gdcvault.com/play/1025731/-Slay-the-Spire-Metrics), [Game Developer](https://www.gamedeveloper.com/design/learn-i-slay-the-spire-i-s-metrics-driven-approach-to-game-balancing-at-gdc-2019)).
- StS2 está em **Early Access desde 5 mar 2026** (Steam), motor Godot, atualizações em beta semanal/quinzenal até ago–set 2026 ([Steam appdetails](https://store.steampowered.com/app/2868840/Slay_the_Spire_2/), [Wikipedia StS](https://en.wikipedia.org/wiki/Slay_the_Spire)).
- Phaser 4 é estável: **v4.0.0 em 2026-04-10**, última estável **v4.2.1 em 2026-07-09** ([GitHub releases API](https://api.github.com/repos/phaserjs/phaser/releases)).
- Para pixel art no Phaser: `pixelArt: true` = `antialias: false` + `roundPixels: true` ([RenderConfig](https://docs.phaser.io/api-documentation/typedef/types-core#renderconfig)); escala inteira é responsabilidade nossa (calcular `zoom`).
- ElevenLabs: SFX até 30 s por geração, loop sem emenda, 40 créditos/s quando a duração é fixada; Music API com limite de 5 min ([SFX docs](https://elevenlabs.io/docs/overview/capabilities/sound-effects), [API pricing](https://elevenlabs.io/pricing/api)).
- Risco de IP: GW aplica política de IP restritiva (proíbe fan films/animações sem licença desde 2021, segundo cobertura secundária); evitar qualquer termo/símbolo listado nas regras do projeto.

---

## 2. Câmera e enquadramento

| Jogo | Enquadramento | Fatos | Fonte |
|---|---|---|---|
| DD1 | Side-view 2D, mesmo plano para exploração e combate | Side-view escolhido para reduzir assets; a mesma vista foi reaproveitada na exploração | [Wikipedia DD – Development](https://en.wikipedia.org/wiki/Darkest_Dungeon) |
| DD1 | Ranks (fileiras) aliados à esquerda, inimigos à direita | Ranks inspirados em *The Bard's Tale*; frente = melee forte e mais dano recebido; trás = protegido e ataques mais fracos; inimigos podem puxar/empurrar heróis de posição | [Wikipedia DD](https://en.wikipedia.org/wiki/Darkest_Dungeon) |
| DD1 | Número de ranks | 4 por lado (ranks 1–4): a Arbalest "só é efetiva do 3º e 4º ranks"; a Hag ocupa os ranks 3 e 4 e o caldeirão os ranks 1 e 2. Party de 4 heróis no DD1 é inferida (1 herói por rank); explícita só no DD2 | [Heroes (DD)](https://darkestdungeon.wiki.gg/wiki/Heroes_(Darkest_Dungeon)), [Hag](https://darkestdungeon.wiki.gg/wiki/Hag) |
| DD2 | Side-view com modelos 3D estilizados | Party nunca passa de 4 heróis | [DD2 wiki – Combat](https://darkestdungeon.wiki.gg/wiki/Darkest_Dungeon_II) |
| StS | Side-view: jogador à esquerda, inimigos à direita, mão de cartas na parte de baixo | Layout descrito pela própria wiki (pilhas, ícone de exaustão "no lado direito da tela") | [StS2 Mechanics – Piles](https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Mechanics) |

Implicações:

- Side-view 2D é o enquadramento mais barato para pixel art: um sprite por unidade voltado para um lado (espelhamento para o lado inimigo é opcional).
- Ranks transformam posição em decisão sem precisar de grid — compatível com toque (alvos grandes, poucos).
- Mão de cartas embaixo + unidades em cima exige reservar ~35–40% da altura para a mão em 480×270 (estimativa de layout nossa, não de fonte).
- Inimigos à direita com intenção acima da cabeça (StS) é convenção do gênero; manter.

---

## 3. Visual e direção de arte

### 3.1 Referências

| Jogo | Direção | Fonte |
|---|---|---|
| DD1 | Arte de Chris Bourassa; visual de **xilogravura (woodcut) e manuscrito iluminado**, influência de Albrecht Dürer, Mike Mignola, Guy Davis, Chris Bachalo; motor caseiro | [Wikipedia DD – Influences](https://en.wikipedia.org/wiki/Darkest_Dungeon) |
| DD2 | Migração para **3D (Unity)** mantendo o estilo; meta declarada: "emular a arte de marketing que desenhei para DD1" (Bourassa) | [NME](https://www.nme.com/features/darkest-dungeon-2-how-redhook-studios-are-reinventing-their-roguelike-classic-3085987), [Epic interview](https://store.epicgames.com/en-US/news/darkest-dungeon-2-early-access-interview), [TheGamer](https://www.thegamer.com/darkest-dungeon-2-3d-combat/) (link quebrado em 2026-10-26) |
| DD2 | Motivo do 3D: público "dessensibilizado" à arte 2D já consumida; usar 3D só onde reforça o estilo | [Gamebanshee (reprint PC Gamer)](https://www.gamebanshee.com/3hqup) |
| StS1 | Arte desenhada à mão, motor libGDX (Java) | [Wikipedia StS](https://en.wikipedia.org/wiki/Slay_the_Spire) |
| StS2 | Motor Godot (migração de Unity após a polêmica de runtime fee) | [Wikipedia StS – Sequel](https://en.wikipedia.org/wiki/Slay_the_Spire), [Game Developer](https://gamedeveloper.com/business/slay-the-spire-devs-followed-through-on-abandoning-unity) |

### 3.2 Considerações de pixel art (base 480×270 como hipótese; decisão na tarefa 2)

- 480×270 × 4 = 1920×1080; × 3 = 1440×810; × 2 = 960×540 — todos inteiros (aritmética).
- Phaser `pixelArt: true` liga nearest-neighbor e arredonda posições ([RenderConfig](https://docs.phaser.io/api-documentation/typedef/types-core#renderconfig)).
- Phaser 4 (rc.3) adicionou `vertexRoundMode` por objeto (`off`, `safe`, `safeAuto` padrão, `full`, `fullAuto`) — `full` pode fazer sprites "tremerem" em rotação ([releases](https://github.com/phaserjs/phaser/releases)).
- Phaser 4 adicionou filtro `Blocky` (pixeliza preservando paleta) — útil para transições/efeitos, não para a arte base ([releases](https://github.com/phaserjs/phaser/releases)).
- `smoothPixelArt` (WebGL) mantém pixels blocados mas suaviza bordas entre pixels quando escalado — **não usar** se a regra do projeto é "sem antialias" ([RenderConfig](https://docs.phaser.io/api-documentation/typedef/types-core#renderconfig)).
- Legibilidade: silhueta por classe; DD1 resolve leitura de posição pelos ranks e pela pose (Wikipedia DD). Para nós: contorno seletivo + 1 luz, conforme regras de assets do projeto.
- Rotação/escala fracionária quebra pixel art; evitar tweens de `scale` não inteiros em sprites de unidade (prática geral; consequência direta de `roundPixels`/nearest).

---

## 4. Áudio

| Ponto | Fato | Fonte |
|---|---|---|
| Narrador DD1 | Wayne June, narrador sardônico; Bourassa o conheceu pelas leituras de Lovecraft; a voz foi considerada "elemento necessário" após o trailer | [Wikipedia DD](https://en.wikipedia.org/wiki/Darkest_Dungeon) |
| Narrador DD2 | Wayne June também narra DD2 (The Academic); faleceu em 2025, homenagem da Red Hook em 30 jan | [DD wiki – Wayne June](https://darkestdungeon.wiki.gg/wiki/Wayne_June) |
| Música do hub | A música do Hamlet chama-se "The Hamlet" | [DD wiki – Hamlet](https://darkestdungeon.wiki.gg/wiki/Hamlet) |
| Música dinâmica DD/StS | Camadas por intensidade — **não verificado** nesta coleta | — |
| Bark/estresse DD2 | Banter negativo aumenta com estresse (0–3 sem banter negativo, 4–6 algum) e gera mais estresse | [Stress DD2](https://darkestdungeon.wiki.gg/wiki/Stress_(Darkest_Dungeon_II)) |

Implicações (regra do projeto: sem dublagem):

- Substituir o narrador por **texto curto + stinger sonoro** (sino, corda grave) em eventos críticos (meltdown, morte, crítico).
- SFX como canal de feedback primário: impacto, bloqueio, carta jogada, carta exaurida, ganho de estresse.
- Música: loop de exploração, loop de combate, variação de chefe; ElevenLabs Music gera até 5 min por faixa ([API pricing](https://elevenlabs.io/pricing/api)).
- Web: áudio só depois de gesto do usuário (ver seção 12).

---

## 5. UI/HUD e UX

### 5.1 Intenções e previsibilidade (StS)

- Inimigos mostram **intenção** por ícone: ataque (ícone de arma muda conforme o dano), defesa (Block), buff, ataque+buff, ataque+defesa, debuff, desconhecido etc. ([Intent](https://slaythespire.wiki.gg/wiki/Intent)).
- Alguns inimigos usam o ícone de buff para **cura** (Mystic, Time Eater, Darklings) — ambiguidade documentada ([Intent](https://slaythespire.wiki.gg/wiki/Intent)). Lição: um ícone por efeito, sem reaproveitar.
- Pilha de compra pode ser vista, mas **ordenada por raridade, não pela ordem real** ([StS2 Mechanics – Piles](https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Mechanics)). Lição: transparência sem matar a incerteza do embaralhamento.
- Pilha de exaustão tem ícone com contador; clicar mostra as cartas ([StS2 Mechanics](https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Mechanics)).

### 5.2 Ordem de turno e posição (DD)

- DD2 mantém **ordem de turno, velocidade, HP e status** como dimensões táticas ([DD2 wiki](https://darkestdungeon.wiki.gg/wiki/Darkest_Dungeon_II)).
- Ranks exigem destacar quais posições cada habilidade alcança (convenção de DD; layout exato **não verificado**).

### 5.3 Cartas e palavras-chave

- Palavras-chave com tooltip: *Exhaust* ("Removida até o fim do combate"), *Ethereal*, *Unplayable* — wiki mostra a mesma estrutura nome + frase curta ([Exhaust](https://slaythespire.wiki.gg/wiki/Exhaust), [Ascension – Ascender's Bane](https://slaythespire.wiki.gg/wiki/Ascension)).
- Molduras de raridade: o jogo só tem cor de moldura para comum, incomum, raro e chefe; relíquias de loja/evento usam a moldura de raro ([Relics – Notes](https://slaythespire.wiki.gg/wiki/Relics)). Lição: poucas cores de raridade, reforçadas por forma.

### 5.4 Toque

- Requisitos do projeto (sem hover, resposta ≤ 0,1 s) não são cobertos por fontes externas; StS2 tem requisitos mínimos de PC (Windows 10 64-bit, dual-core 2 GHz, 4 GB RAM) e não é mobile na Steam ([Steam appdetails](https://store.steampowered.com/app/2868840/Slay_the_Spire_2/)).
- Padrão sugerido (nosso): toque 1 = selecionar e mostrar prévia; toque 2 no alvo = confirmar; long-press = tooltip. Substitui hover.

---

## 6. Categoria/gênero e mercado

| Item | Dado | Fonte |
|---|---|---|
| StS1 lançamento | 23 jan 2019 (1.0), Mega Crit | [Steam appdetails 646570](https://store.steampowered.com/app/646570/) |
| StS1 EA | EA em nov 2017 vendeu ~2000 cópias nas primeiras semanas; virou após streamer chinês; 2º mais vendido da Steam na semana até 21 jan 2018 | [Wikipedia StS – Reception](https://en.wikipedia.org/wiki/Slay_the_Spire) |
| StS1 vendas | >1 milhão até jun 2018; 1,5 milhão até mar 2019 | [Wikipedia StS](https://en.wikipedia.org/wiki/Slay_the_Spire) |
| StS1 papel no gênero | "Considerado o jogo que popularizou" roguelike deckbuilders — Wikipedia marca *citation needed* → **não verificado** | [Wikipedia StS](https://en.wikipedia.org/wiki/Slay_the_Spire) |
| StS2 | EA desde **5 mar 2026**, Mega Crit, gêneros Indie/Strategy/Early Access, 22,99 € (preço regional visto) | [Steam 2868840](https://store.steampowered.com/app/2868840/Slay_the_Spire_2/) |
| StS2 conteúdo | Ironclad, Silent, Defect + Necrobinder e Regent; co-op até 4 jogadores; Godot | [Wikipedia StS – Sequel](https://en.wikipedia.org/wiki/Slay_the_Spire) |
| StS2 status | Beta patch v0.111.0 em 14 ago 2026; Neowsletter set/2026: equipe volta de pausa, trabalha em Ato 2 alternativo, novo personagem, modos | [Steam news API](https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=2868840), [PCGamesN](https://www.pcgamesn.com/slay-the-spire-2/neowsletter-september-2026) |
| StS2 e Godot | Mega Crit patrocinadora Platinum do Godot (~36 k€/ano) desde abr 2026 | [GamingOnLinux](https://gamingonlinux.com/2026/04/godot-gets-a-funding-boost-from-slay-the-spire-2-devs-mega-crit) |
| DD1 | Lançado 19 jan 2016, Red Hook; "gothic roguelike turn-based RPG about the psychological stresses of adventuring"; Kickstarter fev 2014: meta US$ 75 mil batida em 2 dias, >US$ 313 mil de ~10 mil apoiadores | [Steam DD](https://store.steampowered.com/app/262060/Darkest_Dungeon/), [Wikipedia DD](https://en.wikipedia.org/wiki/Darkest_Dungeon) |
| DD2 | 1.0 em 8 mai 2023 (Steam + Epic), US$ 39,99; "roguelike road trip of the damned"; modo Kingdoms com 3 módulos | [Steam DD2](https://store.steampowered.com/app/1940340/Darkest_Dungeon_II/), [Game Developer PR](https://www.gamedeveloper.com/press-release/darkest-dungeon-ii-exits-early-access-launches-into-10-on-steam-epic-game-store-today) |
| Outros do gênero (Monster Train, Balatro, Inscryption etc.) | Números de mercado **não verificados** nesta coleta | — |

Leitura: o nicho "deckbuilder + party com posição + estresse" (cruzamento DD×StS) não tem líder evidente nas fontes coletadas — **não verificado** como lacuna de mercado; tratar como hipótese.

---

## 7. Jogabilidade e loop de combate

### 7.1 Núcleo de cartas (StS)

| Regra | Valor | Fonte |
|---|---|---|
| Energia por turno | 3 | [StS2 Mechanics – Turns](https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Mechanics), [Energy](https://slaythespire.wiki.gg/wiki/Energy) |
| Compra por turno | 5 | idem |
| Pilhas | Compra, Mão, Descarte, Exaustão | [StS2 Mechanics – Piles](https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Mechanics) |
| Fim de turno | Cartas sem *Retain* vão ao descarte | idem |
| Exhaust | Carta vai à pilha de exaustão até o fim do combate | [Exhaust](https://slaythespire.wiki.gg/wiki/Exhaust) |
| Ethereal | Exaurida se estiver na mão no fim do turno | [Ascension](https://slaythespire.wiki.gg/wiki/Ascension) |
| Turnos | Jogador, depois grupo inimigo; turno termina manualmente | [StS2 Mechanics](https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Mechanics) |
| Limite de mão | 10; compra excedente fica na pilha de compra e carta criada excedente vai ao descarte | [Mechanics – Hand Size Limit](https://slaythespire.wiki.gg/wiki/Mechanics) |
| Deck inicial Ironclad | 5 Strike, 4 Defend, 1 Bash (10 cartas) | [Cards](https://slaythespire.wiki.gg/wiki/Cards) |
| Deck inicial Silent | 5 Strike, 5 Defend, Neutralize, Survivor (12) — último item truncado na coleta | [Cards](https://slaythespire.wiki.gg/wiki/Cards) |
| HP máx. inicial | Ironclad 80 (75 em A14), Silent 70 (66), Defect 75 (71), Watcher 72 (68) | [Ironclad](https://slaythespire.wiki.gg/wiki/Ironclad), [Silent](https://slaythespire.wiki.gg/wiki/Silent), [Defect](https://slaythespire.wiki.gg/wiki/Defect), [Watcher](https://slaythespire.wiki.gg/wiki/Watcher) |
| Cap de HP (StS2) | 999.999.999 | [StS2 Mechanics – Health](https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Mechanics) |

### 7.2 Estrutura de run (StS)

| Item | Valor | Fonte |
|---|---|---|
| Atos | 3 + Ato 4 opcional (3 chaves) com o chefe final | [Wikipedia StS – Gameplay](https://en.wikipedia.org/wiki/Slay_the_Spire) |
| Tipos de nó | 7: Monstro, Elite, Descanso, Desconhecido, Tesouro, Mercador, Chefe | [Map Locations](https://slaythespire.wiki.gg/wiki/Map_Locations) |
| Antes do chefe | Último nó antes do chefe nos Atos 1–3 é sempre descanso | [Rest Sites](https://slaythespire.wiki.gg/wiki/Rest_Site) |
| Descanso | Curar 30% do HP máx. **ou** melhorar 1 carta (Smith) | [Rest Sites](https://slaythespire.wiki.gg/wiki/Rest_Site) |
| Andares por ato | 17; até 6 nós por andar; cada sala tem 1–3 caminhos de entrada e de saída. Andar 1 = combates fáceis; andar 9 = tesouro; andar 15 = descanso; andar 16 = chefe (página marcada "em construção" pela wiki) | [Map Generation](https://slaythespire.wiki.gg/wiki/Map_Generation) |
| Chefe dos Atos 1–2 | 95–105 ouro, escolha de 3 cartas raras; o andar seguinte tem baú com escolha de 3 relíquias de chefe | [Map Locations](https://slaythespire.wiki.gg/wiki/Map_Locations) |

### 7.3 DD1: posição, estresse, aflição

| Regra | Valor | Fonte |
|---|---|---|
| Barra de estresse | 0–200; em 100 testa resolução | [Stress](https://darkestdungeon.wiki.gg/wiki/Stress) |
| Virtude vs aflição | Chance base de virtude 25%, decidida antes do histórico | [Affliction](https://darkestdungeon.wiki.gg/wiki/Affliction) |
| Virtude | Reseta estresse para 40–45 | [Stress](https://darkestdungeon.wiki.gg/wiki/Stress) |
| 200 de estresse | Ataque cardíaco → Death's Door, ou morte se já estiver nele | [Stress](https://darkestdungeon.wiki.gg/wiki/Stress) |
| Aflição | −15% em várias resistências, −10% HP máx.; ações forçadas ("act-outs"), ex.: Fearful 31,5% (10,5% estresse ao grupo / recuar / passar turno) | [Affliction](https://darkestdungeon.wiki.gg/wiki/Affliction) |
| Barks de aflição | 6 de estresse ao grupo ou a um aliado | [Affliction](https://darkestdungeon.wiki.gg/wiki/Affliction) |
| Histórico | Cada aflição tem peso 4; +2 cada vez obtida (personalidade emerge) | [Affliction](https://darkestdungeon.wiki.gg/wiki/Affliction) |
| Ranks | Habilidades exigem rank; deslocamento é estratégia | [Wikipedia DD](https://en.wikipedia.org/wiki/Darkest_Dungeon) |

### 7.4 DD2: estresse 0–10, relações, estrada

| Regra | Valor | Fonte |
|---|---|---|
| Estresse | 0–10; 0–3 sem banter negativo; 4–6 algum | [Stress DD2](https://darkestdungeon.wiki.gg/wiki/Stress_(Darkest_Dungeon_II)) |
| Em 10 | 80% Meltdown (HP vai a 10%, perde afinidade) / 20% Resolute (cura 50%, buffs) | [Stress DD2](https://darkestdungeon.wiki.gg/wiki/Stress_(Darkest_Dungeon_II)) via [busca](https://darkestdungeon.wiki.gg/wiki/Meltdown) |
| Precisão | **Sem precisão**; acerto garantido salvo efeitos específicos | [DD2 wiki – Combat](https://darkestdungeon.wiki.gg/wiki/Darkest_Dungeon_II) |
| Habilidades | Dependem de skills (Mastery Trainer em cada Inn), não de arma/armadura | idem |
| Party | Escolhida na Crossroads; máximo 4 | idem |
| Relações | Mesma decisão em nós dá +1 afinidade; itens de Inn alteram afinidade (ex.: 67% positiva / 33% negativa) | [Relationships](https://darkestdungeon.wiki.gg/wiki/Relationships) |
| Carruagem | Rodas e Armadura perdem nível em certas estradas; reparo 8 Baubles cada; sem elas, emboscada | [Stagecoach DD2](https://darkestdungeon.wiki.gg/wiki/Stagecoach) |
| Kingdoms | Regiões de 40 léguas / 3 nós | [Kingdoms](https://darkestdungeon.wiki.gg/wiki/Kingdoms) |

---

## 8. Progressão

### 8.1 Dentro da run vs meta

| Jogo | Dentro da run | Meta | Fonte |
|---|---|---|---|
| StS1 | Cartas, relíquias, poções, upgrades, ouro | Pontos por run desbloqueiam personagens, cartas e relíquias; 20 níveis de Ascensão | [Wikipedia StS](https://en.wikipedia.org/wiki/Slay_the_Spire) |
| DD1 | Provisões, loot, luz, estresse | Hamlet com 8 prédios (Abbey, Blacksmith, Guild, Nomad Wagon, Sanitarium, Stage Coach, Survivalist, Tavern) melhorados com heranças | [Hamlet](https://darkestdungeon.wiki.gg/wiki/Hamlet) |
| DD1 heranças | Heranças (meta) | Bust, Portrait, Deed, Crest; pilhas na masmorra: Crest 12, Bust/Deed 6, Portrait 3 | [Heirlooms](https://darkestdungeon.wiki.gg/wiki/Heirlooms) |
| DD2 | Itens, relações, carruagem, skills por Inn | **Altar of Hope** pago com **Candles of Hope** (ganhas por expedição + Hero Goals + Region Goals); desbloqueia heróis, upgrades da carruagem | [Altar of Hope](https://darkestdungeon.wiki.gg/wiki/Altar_of_Hope), [DD2 wiki](https://darkestdungeon.wiki.gg/wiki/Darkest_Dungeon_II) |

### 8.2 Ascensão (StS1)

- Desbloqueio: vencer o chefe do Ato 3 com o personagem; cada vitória libera o nível seguinte ([Ascension](https://slaythespire.wiki.gg/wiki/Ascension)).

| Nível | Efeito | Fonte |
|---|---|---|
| A1 | ~60% mais elites | [Ascension](https://slaythespire.wiki.gg/wiki/Ascension) |
| A2/A3/A4 | Normais / elites / chefes causam mais dano | idem |
| A5 | Cura pós-chefe 75% do HP perdido (antes 100%) | idem |
| A6 | Começa a run com −10% de HP | idem |
| A7/A8/A9 | Normais / elites / chefes com mais HP e às vezes mais Block | idem |
| A10 | Começa com a maldição Ascender's Bane (impossível de remover) | idem |
| A11 | Um espaço de poção a menos | idem |
| A12 | Cartas melhoradas aparecem com metade da frequência nos Atos 2 e 3 | idem |
| A13 | Chefes dão 25% menos ouro (71–79) | idem, [Gold](https://slaythespire.wiki.gg/wiki/Gold) |
| A14 | HP máx. −5 (Ironclad) / −4 (demais) | idem |
| A15 | Eventos com resultados piores | idem |
| A16 | Loja 10% mais cara | idem, [Merchant](https://slaythespire.wiki.gg/wiki/Merchant) |
| A17/A18/A19 | Normais / elites / chefes com movesets mais difíceis | idem |
| A20 | Dois chefes no fim do Ato 3 | idem |

- Os modificadores são cumulativos e cada personagem tem a própria escada ([Ascension](https://slaythespire.wiki.gg/wiki/Ascension)). No StS2 a escada tem **10 níveis** ([StS2 Mechanics – Ascension](https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Mechanics)).

### 8.3 Modo Dam (DD2)

- Modificadores opcionais: botão de recuar (+2 Loathing, +2 estresse), venda ao Hoarder, montanha em toda Inn, mais modificadores de batalha, Atos 1/2 estendidos ([Altar of Hope – The Dam](https://darkestdungeon.wiki.gg/wiki/Altar_of_Hope)). Mostra "dificuldade à la carte" em vez de escada única.

---

## 9. Economia

### 9.1 StS1 — ouro

| Fonte de ouro | Valor | Fonte |
|---|---|---|
| Combate normal | 10–20 | [Gold](https://slaythespire.wiki.gg/wiki/Gold) |
| Elite | 25–35 | idem |
| Chefe | 95–105 (71–79 em A13+) | idem |
| Ouro inicial | 99 (StS1 e StS2) | [Gold](https://slaythespire.wiki.gg/wiki/Gold), [StS2 Mechanics – Gold](https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Mechanics) |

### 9.2 StS1 — loja (Merchant)

| Item | Preço (A16+) | Fonte |
|---|---|---|
| 5 cartas coloridas (2 ataques, 2 skills, 1 power; 1 com −50%) | Comum 45–55 (50–61); Incomum 68–83 (75–91); Rara 135–165 (149–182) | [Merchant](https://slaythespire.wiki.gg/wiki/Merchant) |
| 2 incolores (1 incomum, 1 rara; +20%) | 81–99 (89–109); 162–198 (178–218) | idem |
| 3 relíquias (direita sempre relíquia de loja) | Loja/Comum 143–158 (157–173); pesos 50/33/17% comum/incomum/rara | idem |
| Remoção de carta | 75, +25 a cada uso; 1 por loja; Smiling Mask fixa em 50 | [Merchant](https://slaythespire.wiki.gg/wiki/Merchant), [Gold](https://slaythespire.wiki.gg/wiki/Gold) |

### 9.3 StS1 — recompensas de carta e relíquia

| Contexto | Rara / Incomum / Comum | Fonte |
|---|---|---|
| Combate normal (base, antes do offset) | 3% / 37% / 60% | [Cards – Card Distribution](https://slaythespire.wiki.gg/wiki/Cards) |
| Loja (base) | 9% / 37% / 54% | idem |
| Relíquias (maioria das fontes) | Comum 50% / Incomum 33% / Rara 17% | [Relics – Rarity](https://slaythespire.wiki.gg/wiki/Relics) |
| Baú pequeno / médio / grande | C 75/35/0; I 25/50/75; R 0/15/25 | idem |
| Cartas oferecidas por recompensa | 3 (normal e elite; elite com mais chance de rara/incomum); chefe dos Atos 1–2 oferece 3 raras | [Map Locations](https://slaythespire.wiki.gg/wiki/Map_Locations) |
| Loja (composição) | 5 cartas do personagem, 2 incolores, 3 relíquias, 3 poções e 1 remoção por loja | idem |

Nota: existe "offset" de raridade (pity) que só é afetado por recompensas de carta, não pela loja ([Cards](https://slaythespire.wiki.gg/wiki/Cards)).

### 9.4 DD1 — ouro e sumidouros

- Ouro vem de loot, gemas vendidas no fim e recompensa de expedição; venda de trinkets ([DD Gold](https://darkestdungeon.wiki.gg/wiki/Gold)).
- Sumidouros: estresse (Abbey, Tavern), provisões, Blacksmith, Guild, Survivalist, Sanitarium, Nomad Wagon ([DD Gold](https://darkestdungeon.wiki.gg/wiki/Gold)).
- Radiant: estresse ocioso na cidade 5 → 10; provisões devolvidas rendem um pouco mais ([Game Modes](https://darkestdungeon.wiki.gg/wiki/Game_Modes)).

### 9.5 DD1 — trinkets

- Tabela por raridade e DLC existe (ex.: Ancestral 9 base, Trophy 9 base + 3 CC, Crimson Court 34+2), mas a wiki avisa que não inclui *The Fire's Edge* ([Trinkets](https://darkestdungeon.wiki.gg/wiki/Trinkets)). Total consolidado **não verificado**.

---

## 10. Balanceamento

| Ponto | Fato | Fonte |
|---|---|---|
| Palestra | "'Slay the Spire': Metrics Driven Design and Balance", GDC 2019, Anthony Giovannetti | [GDC Vault](https://www.gdcvault.com/play/1025731/-Slay-the-Spire-Metrics), [GDC news](https://gdconf.com/news/learn-slay-spires-successful-metrics-driven-approach-game-balancing-gdc-2019) (link quebrado em 2026-10-26) |
| Escopo | Foco em métricas desde cedo e durante todo o EA; uso do feedback da comunidade mantendo feel e dificuldade "ao longo de um ano de mudanças" | [Game Developer](https://www.gamedeveloper.com/design/learn-i-slay-the-spire-i-s-metrics-driven-approach-to-game-balancing-at-gdc-2019) |
| Método | Muitos playtesters + métricas reportadas pelo cliente para decidir quais cartas tinham bom design e quais remover; testers vindos da comunidade de *Netrunner* | [Wikipedia StS – Development](https://en.wikipedia.org/wiki/Slay_the_Spire) |
| Ferramenta | Ferramenta de analytics caseira registrando cada partida; "jogadores escolhem esta carta X% das vezes" (entrevista Edge) | [PressReader/Edge](https://www.pressreader.com/australia/edge/20190620/282351156287993) — conteúdo via resumo de busca, **não lido na íntegra** |
| Canal Slack + servidor de métricas | Citado apenas em resumo gerado por IA de podcast → **não verificado** | [Podwise](https://podwise.ai/episodes/1459444) |
| StS2 hoje | Patches beta experimentais, inclusive revertendo reworks (jul 2026) | [PCGamesN](https://www.pcgamesn.com/slay-the-spire-2/patch-notes-july-31-2026) |
| Ascensão | Escada cumulativa de 20 níveis (seção 8.2) | [Ascension](https://slaythespire.wiki.gg/wiki/Ascension) |
| DD1 modos | Darkest (normal); Radiant (menos grind, mesmos stats, permadeath); Stygian: +20% HP inimigo, +3% crítico, mais estresse, luz drena 7 por passo em vez de 6, derrota em **86 semanas ou 12 mortes** (save apagado); Bloodmoon: 100 semanas / 16 mortes | [Game Modes](https://darkestdungeon.wiki.gg/wiki/Game_Modes) (Stygian % via resumo de busca da mesma página) |
| DD2 | Dam: dificuldade por modificadores; Kingdoms usa tiers de Escalation | [Altar of Hope](https://darkestdungeon.wiki.gg/wiki/Altar_of_Hope), [Kingdoms](https://darkestdungeon.wiki.gg/wiki/Kingdoms) |

---

## 11. Diversão e heurísticas

| Heurística | Evidência nos jogos | Fonte |
|---|---|---|
| Tensão/alívio | Descanso obrigatório antes de cada chefe (Atos 1–3) | [Rest Sites](https://slaythespire.wiki.gg/wiki/Rest_Site) |
| Escolha significativa | Descanso: curar 30% **ou** melhorar carta — troca direta | idem |
| Risco/recompensa | Elite 25–35 ouro vs normal 10–20, mais relíquia; A1 aumenta elites em ~60% | [Gold](https://slaythespire.wiki.gg/wiki/Gold), [Ascension](https://slaythespire.wiki.gg/wiki/Ascension) |
| Diluição de deck | Pegar carta nem sempre é bom; remover custa ouro | [Wikipedia StS – Gameplay](https://en.wikipedia.org/wiki/Slay_the_Spire) |
| Visibilidade | Intenções inimigas visíveis | [Intent](https://slaythespire.wiki.gg/wiki/Intent) |
| Incerteza controlada | Pilha de compra visível, ordem oculta | [StS2 Mechanics](https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Mechanics) |
| Bola de neve emocional | Banter negativo gera estresse e reduz afinidade ("snowballing") | [Stress DD2](https://darkestdungeon.wiki.gg/wiki/Stress_(Darkest_Dungeon_II)) |
| Perda com legado | Aflições moldam personalidade via histórico de pesos | [Affliction](https://darkestdungeon.wiki.gg/wiki/Affliction) |
| Duração de run | DD2 Kingdoms encurtou regiões para 3 nós; DD1 Radiant cortou grind — ambos sinalizam que o público pediu sessões mais curtas | [Kingdoms](https://darkestdungeon.wiki.gg/wiki/Kingdoms), [Game Modes](https://darkestdungeon.wiki.gg/wiki/Game_Modes) |
| Duração típica de run StS em minutos | **não verificado** | — |
| Mesma seed para todos | Daily challenge de StS com seed fixa | [Wikipedia StS](https://en.wikipedia.org/wiki/Slay_the_Spire) |

---

## 12. Técnico Phaser 4 web

### 12.1 Status de versão

| Versão | Data | Pre-release | Fonte |
|---|---|---|---|
| v4.2.1 | 2026-07-09 | não | [GitHub API](https://api.github.com/repos/phaserjs/phaser/releases) |
| v4.2.0 | 2026-06-19 | não | idem |
| v4.1.0 | 2026-04-30 | não | idem |
| v4.0.0 | 2026-04-10 | não — "reconstrução do renderer WebGL do zero, mantendo a API" | [v4.0.0](https://github.com/phaserjs/phaser/releases/tag/v4.0.0) |
| v4.0.0-rc.7 | 2026-03-25 | sim | [GitHub API](https://api.github.com/repos/phaserjs/phaser/releases) |

→ Fixar `"phaser": "4.2.1"` (sem `^`), conforme regra do projeto. Docs oficiais em docs.phaser.io estavam em "v4.1.0" na coleta ([RenderConfig](https://docs.phaser.io/api-documentation/typedef/types-core#renderconfig)).

### 12.2 Config de pixel art

| Opção | Padrão | Efeito | Fonte |
|---|---|---|---|
| `pixelArt` | false | Seta `antialias: false` e `roundPixels: true`; "melhor configuração para pixel art" | [RenderConfig](https://docs.phaser.io/api-documentation/typedef/types-core#renderconfig) |
| `antialias` | true | false = nearest-neighbor; também desliga AA do canvas escalado | idem |
| `roundPixels` | false | Desenha objetos de textura só em posições inteiras | idem |
| `smoothPixelArt` | false | Pixels blocados com borda suavizada (WebGL) — evitar | idem |
| `vertexRoundMode` | `safeAuto` | Arredondamento por objeto quando a câmera tem `roundPixels` | [releases](https://github.com/phaserjs/phaser/releases) |

### 12.3 Escala

- Modos: `NONE`, `FIT` (mantém proporção, pode sobrar borda), `ENVELOP` (cobre, pode cortar), `WIDTH_CONTROLS_HEIGHT` etc.; `zoom` = tamanho do canvas = game size × zoom; `autoCenter: CENTER_BOTH` ([Scale Manager](https://docs.phaser.io/phaser/concepts/scale-manager)).
- `FIT` escala fracionário → quebra a regra "escala sempre inteira". Abordagem: `mode: NONE`, `width: 480, height: 270`, e recalcular `zoom = max(1, floor(min(innerWidth/480, innerHeight/270)))` no resize; centralizar via CSS. Modo de escala inteira: a skill local `scale-and-responsive` documenta `Phaser.Scale.MAX_ZOOM` (zoom automático: maior inteiro que cabe no pai), `setMaxZoom()` e `getMaxZoom()` (fonte: skill local `.claude/skills/scale-and-responsive/SKILL.md`, não é URL). Comportamento com `FIT` e DPR fracionário: em teste (ver §12.7).
- Fix relevante: ScaleManager não redimensionava ao container pai (#7213), corrigido numa release v4 ([releases](https://github.com/phaserjs/phaser/releases)).

### 12.4 Texturas e atlas

- `load.spritesheet()` = células uniformes; `load.atlas()` = frames livres; `load.multiatlas()` = várias imagens; aceita formato TexturePacker "Phaser 3" ([Textures](https://docs.phaser.io/phaser/concepts/textures)).
- SVG é rasterizado pelo navegador ao criar a textura ([Textures](https://docs.phaser.io/phaser/concepts/textures)) → nossos placeholders SVG precisam ser carregados já no tamanho final (sem escala do navegador) para não ganharem antialias.
- Fix v4: `DynamicTexture` ficava preta ao redimensionar de potência de 2 para não potência de 2 ([releases](https://github.com/phaserjs/phaser/releases)).

### 12.5 Áudio na web

- A maioria dos navegadores não toca som até clique/toque; checar `this.sound.locked`; Phaser tenta retomar o AudioContext no primeiro gesto; `this.sound.unlock()` disponível ([Audio](https://docs.phaser.io/phaser/concepts/audio)).
- Aviso do Chrome "The AudioContext was not allowed to start" é normal ([Audio](https://docs.phaser.io/phaser/concepts/audio)); referência MDN: [Autoplay guide](https://developer.mozilla.org/en-US/docs/Web/Media/Autoplay_guide).
- Fix v4: áudio de data URI Base64 não carregava ([releases](https://github.com/phaserjs/phaser/releases)).

### 12.6 Performance

- `BatchHandler` em v4 cria buffers WebGL próprios: ~5 MB de RAM e VRAM num jogo básico ([releases](https://github.com/phaserjs/phaser/releases)).
- `TimeStep#stepLimitFPS` corrigido para descartar menos frames; limite de FPS só é necessário para rodar abaixo da taxa do monitor ([releases](https://github.com/phaserjs/phaser/releases)).
- Blend modes vazavam entre irmãos em `Container` — corrigido ([releases](https://github.com/phaserjs/phaser/releases)).
- FPS de animação de DD/StS: **não verificado**. Para pixel art, 8–12 fps por animação de unidade é convenção do meio, não fonte.

---

### 12.7 Spike local (2026-10-26)

Fonte: experimento local, não URL. Stack: Phaser 4.2.1, Vite 8.3.5, Bun 1.4.4, playwright-core 1.64.1 com chrome-headless-shell. Resumo em `scratchpad/phaser-spike/FINDINGS.md` (22 casos, 8 capturas de tela). Limite: só Chromium headless com DPR emulado; sem iOS Safari, Firefox ou WebKit reais; o atlas de BitmapText era um substituto.

Escala:

- `pixelArt: true` com `scale.mode: Phaser.Scale.NONE` e zoom inteiro recalculado no `resize` (`game.scale.setZoom()`). Letterbox por CSS.
- Nas 8 capturas (480×270 e 640×360, zoom 1 a 4), zero blocos NxN irregulares: pixel exato.
- O invariante é número inteiro de pixels de dispositivo por pixel de jogo, e não inteiro em px CSS. Fórmula: `zoom = max(1, floor(fit × dpr)) / dpr`.

| Viewport | DPR | Base 480×270 | Base 640×360 |
|---|---|---|---|
| 1280×720 | 1 | zoom 2 → 960×540 | zoom 2 → 1280×720 |
| 1920×1080 | 1 | zoom 4 → 1920×1080 | zoom 3 → 1920×1080 |
| 390×844 (retrato) | 3 | 320×180 (2 px de dispositivo por px de jogo) | 213,33×120 (1 px de dispositivo) |
| 844×390 (paisagem) | 3 | 640×360 | 640×360 |

Gotcha: com zoom 1, o Phaser não escreve `canvas.style`; ler `getBoundingClientRect()` em vez de assumir o tamanho.

Texto:

- BitmapText de 1 bit: 2 cores únicas por linha de texto.
- `Text` de 8 px: 143 cores únicas; de 10 px: 156. O antialias do navegador aparece mesmo com `pixelArt`.
- Regra adotada: todo texto de UI em BitmapText, com charset EN e PT-BR acentuado. `Text` só em depuração.

Áudio:

- Antes do gesto, `sound.locked === true` e o contexto fica suspenso. Depois do clique, `unlocked` dispara uma vez.
- Iniciar a música em `sound.once('unlocked', ...)`.

Velocidade (fator global):

- Aplicar `time.timeScale = f`, `tweens.timeScale = f` e `anims.globalTimeScale = f`.
- Progresso de tween após cerca de 1,5 s: 0,25 (1x), 0,494 (2x), 0,742 (3x).
- Ticks de timer: 3, 5 e 8 (ideal 3, 6 e 9). Ou seja, o timer não escala de forma linear.
- Armadilhas: `scene.restart()` reseta só `tweens.timeScale` para 1 (reaplicar em todo `create()`); os fatores se multiplicam (relógio × evento de timer; tween × tween); `Timeline.timeScale` não afeta os tweens dela; `timeScale = 0` não congela de fato (usar `paused`). O núcleo nunca lê esse fator.

## 13. Skills, plugins, regras e prompts

### 13.1 Skills disponíveis neste ambiente Claude Code (fonte: lista de skills da sessão local, sem URL)

| Área | Skills |
|---|---|
| Phaser 4 | `v4-new-features`, `game-setup-and-config`, `scale-and-responsive`, `loading-assets`, `sprites-and-images`, `animations`, `tweens`, `cameras`, `scenes`, `input-keyboard-mouse-touch`, `audio-and-sound`, `text-and-bitmaptext`, `filters-and-postfx`, `particles`, `render-textures` |
| Design | `art-of-game-design`, `gd-roguelike`, `gd-rpg`, `gd-game-feel`, `gd-game-ui-ux`, `gd-procedural-gen`, `gd-save-systems` |
| Balanceamento/QA | `ccgs-balance-check`, `ccgs-playtest-report`, `ccgs-qa-plan`, `ccgs-perf-profile`, `ccgs-localize` |
| Arte | `pixel-logic`, `aseprite-pixel-assets`, `alpha-art-assets`, `asset-animation`, `game-assets`, `inkscape-vector-assets` |
| Áudio | `alpha-audio-assets`, `gd-audio-design` |
| MCP | PixelLab MCP: `create_character`, `animate_character`, `create_ui_asset`, `create_sidescroller_tileset`, `create_portrait_character`, `reduce_colors`, `pixelart_workbench`, `vfx_workbench` (lista de ferramentas da sessão) |

### 13.2 PixelLab

- Produto: personagens com 4 ou 8 rotações, animações, tilesets, tiles isométricos, objetos de mapa, edição (inpaint, rotate, resize, style transfer); API REST assíncrona por job ([PixelLab API llms.txt](https://api.pixellab.ai/v2/llms.txt)).
- Endpoints: `create-character-v3` (8 rotações), `create-character-pro`, `animate-character`, `create-character-state`, `create-character-with-4-directions` ([idem](https://api.pixellab.ai/v2/llms.txt)).
- Site: geração de UI (botões, barras de vida, menus) com referência de estilo; inpainting "que entende a imagem original" ([pixellab.ai](https://www.pixellab.ai/)).
- Modelo de cobrança: assinatura mensal; gerações e créditos restantes visíveis na conta; upgrade no meio do mês cobra só os dias restantes; uso comercial permitido, exceto treinar novos modelos com as imagens ([PixelLab FAQ](https://www.pixellab.ai/docs/faq)).
- **Valores: não verificado** — `pixellab.ai/pricing` e `/plans` retornam 404 e a home não lista preços; terceiros divergem (Apprentice US$ 10 ou 12/mês; Architect US$ 50/mês) ([G2](https://ai.g2.com/marketplace/tools/pixellab), [Cinevva](https://app.cinevva.com/guides/ai-pixel-art-generators)). Usar `get_balance` do MCP antes de lotes.
- Verificação de 2026-10-26: `https://www.pixellab.ai/pricing` (link quebrado em 2026-10-26), `https://pixellab.ai/pricing` (link quebrado em 2026-10-26) e `https://api.pixellab.ai/docs` (link quebrado em 2026-10-26) retornaram HTTP 404; a home carrega "Loading subscription plans..." sem preço.

Planos e custos (só fontes de terceiros; oficial não verificado):

| Plano | Preço | Créditos / gerações | Uso comercial | Fonte (acesso 2026-10-26) |
|---|---|---|---|---|
| Free trial | US$ 0 | 40 rápidas, depois 5 lentas por dia | não verificado | [Knowara](https://knowara.com/ai-tools/image/pixellab-review/) |
| Entrada ("Hobbyist"/"Apprentice") | cerca de US$ 10 a 12/mês | 1.000 a 2.000 imagens/mês (fontes divergem) | incluído nos planos pagos (página diz "cleared for commercial use in shipped games") | [Knowara](https://knowara.com/ai-tools/image/pixellab-review/), [G2](https://ai.g2.com/marketplace/tools/pixellab) |
| Intermediário ("Pro") | cerca de US$ 29 a 35/mês | cerca de 3.000/mês | idem | [Knowara](https://knowara.com/ai-tools/image/pixellab-review/) |
| Topo ("Architect"/"Team") | cerca de US$ 50/mês | 6.000/mês | idem | [G2](https://ai.g2.com/marketplace/tools/pixellab) |
| API | cobrada à parte, por chamada | não verificado | não verificado | [Knowara](https://knowara.com/ai-tools/image/pixellab-review/) |

Custo por tipo de asset (personagem, objeto, UI, imagem): **não verificado**. Proxy usado no orçamento de `scratchpad/asset-pricing.md`: US$ 0,010 a 0,012 por geração, derivado da cota de terceiros (hipótese, não preço oficial).

Dados verificados da conta (fonte: MCP PixelLab `get_balance`, 2026-10-26; informados pelo coordenador, não consultados nesta tarefa):

| Item | Valor |
|---|---|
| Cota do plano do desenvolvedor | 5.000 gerações por período de cobrança |
| Uso informado pelo desenvolvedor (2026-10-26) | 1.600 de 5.000 usadas; cerca de 3.400 restantes |
| `get_balance` (MCP, 2026-10-26) | assinatura expirou em 2026-10-25; gerações congeladas até a renovação em `pixellab.ai/account` |
| Saldo pay-as-you-go | US$ 0,05 |

Divergência a confirmar em `pixellab.ai/account`: o desenvolvedor relata cerca de 3.400 gerações restantes, mas o `get_balance` do mesmo dia indica assinatura expirada e gerações congeladas. Até a confirmação, não está claro se a geração está bloqueada.

Implicação: a necessidade do protótipo (68 assets × 3 tentativas ≈ 204 gerações) cabe na cota restante informada pelo desenvolvedor, desde que a assinatura esteja ativa. Se a expiração for real, a geração fica bloqueada até a renovação.

### 13.3 ElevenLabs

| Recurso | Fato | Fonte |
|---|---|---|
| SFX duração | 0,1–30 s; padrão automático | [SFX docs](https://elevenlabs.io/docs/overview/capabilities/sound-effects) |
| SFX custo | 40 créditos/s quando a duração é especificada | idem |
| SFX loop | Loop sem início/fim perceptível | idem |
| SFX formatos | MP3 sempre; WAV 48 kHz para não-loop | idem |
| SFX prompt influence | Alto = literal; baixo = criativo | idem |
| API pay-as-you-go | SFX US$ 0,12/min; Music US$ 0,15/min, limite 5 min, licença comercial a partir do Starter, 44,1 kHz 128–192 kbps | [API pricing](https://elevenlabs.io/pricing/api) |
| Music | Instrumental ou com voz; edição por seção; "liberado para quase todos os usos comerciais, incluindo games" | [Music docs](https://elevenlabs.io/docs/overview/capabilities/music), [Music terms](https://elevenlabs.io/music-terms) |
| Plano Creator | US$ 22/mês (US$ 11 no 1º mês) | [API pricing](https://elevenlabs.io/pricing/api) |

Planos (página de planos, acesso 2026-10-26, [pricing](https://elevenlabs.io/pricing)):

| Plano | Preço mensal | Créditos/mês | Uso comercial | Fonte |
|---|---|---|---|---|
| Free | US$ 0 | 10.000 | não verificado | [pricing](https://elevenlabs.io/pricing) |
| Starter | **conflito: US$ 1 (tabela) x US$ 6 (FAQ)** | 30.000 | sim: "Commercial License" e "Music commercial use" a partir do Starter | [pricing](https://elevenlabs.io/pricing) |
| Creator | **conflito: US$ 11 (tabela) x US$ 22 (FAQ)** | 121.000 | herda do Starter | [pricing](https://elevenlabs.io/pricing) |
| Pro | US$ 99 | 600.000 | herda do Creator | [pricing](https://elevenlabs.io/pricing) |
| Scale | US$ 299 | 1.800.000 | herda do Pro (3 assentos) | [pricing](https://elevenlabs.io/pricing) |
| Business | US$ 990 | 6.000.000 | herda do Scale (10 assentos) | [pricing](https://elevenlabs.io/pricing) |

Conflito de Starter: a tabela e a FAQ da mesma página dão valores diferentes; o valor conservador (US$ 6) é o usado no orçamento. Não resolvido. Conflito de custo de SFX: a página de planos cita 200 créditos por geração; a página de capacidades cita 40 créditos/s com duração definida. Não resolvido; a regra de 13.4 usa 40 créditos/s.

### 13.4 Regras úteis para `.claude/rules` (derivadas das fontes)

- "Toda nova palavra-chave de carta tem nome + frase curta ≤ 12 palavras e ícone próprio" (seção 5.3).
- "Um ícone de intenção por tipo de efeito; nunca reutilizar ícone de buff para cura" (Intent).
- "Prompt de geração lista paleta, tamanho em px, direção de luz e contorno; nunca nome de obra/artista" (regra de IP do projeto).
- "Lote de geração mostra custo estimado: SFX = segundos × 40 créditos; música = minutos × US$ 0,15" (13.3).

### 13.5 Prompts de exemplo (sem "no estilo de")

Pixel art — unidade:

```text
Side-view pixel art sprite, 48x48 px canvas, character facing right.
Armored templar with tall rectangular shield and flanged mace, hooded helm.
Limited palette of 12 colors: ash grey, bone white, rust red, tarnished brass, deep slate (no pure black).
Single light source from upper left, selective dark-brown outline, no anti-aliasing on outer edge, no dithering.
Transparent background. Readable silhouette at 1x.
```

Pixel art — inimigo:

```text
Side-view pixel art enemy, 64x64 px, facing left.
Gaunt hollow preacher in tattered robes, iron cage over the head, candle stubs fused to shoulders.
Palette: 14 colors, cold desaturated greens and wax yellow, deep violet shadows, no pure black.
Light from upper right, crisp 1px outline, transparent background, no anti-aliasing.
```

Moldura de carta:

```text
Pixel art card frame, 64x88 px, portrait orientation.
Weathered iron border with rivets, parchment inner panel, small circular cost gem top-left.
Three variants by rarity distinguished by shape AND color: plain iron (common), iron with chain trim (uncommon), iron with thorned crown crest (rare).
Palette 10 colors, no gradients, no anti-aliasing, transparent outside the frame.
```

UI:

```text
Pixel art UI kit, 9-slice panel 32x32 px with 8px corners, dark slate stone with ember-orange edge highlight.
Also: health bar 64x6 px (frame + fill), stress pips 5x5 px in 3 states (empty, filled, overflow) distinct by shape.
Consistent palette with the panel, no anti-aliasing, transparent background.
```

SFX (ElevenLabs):

```text
Heavy mace hitting a wooden shield, short dull thud with splintering crack, dry room, 0.6 seconds, no reverb tail.
```

```text
Playing card slid across rough parchment then slapped on a stone table, 0.4 seconds, close mic.
```

```text
Low cracked church bell single toll with distant wind, ominous, 2.5 seconds, fade out.
```

Música (loop):

```text
Instrumental dark ambient loop for a turn-based battle, 90 BPM, D minor.
Low cello ostinato, muffled war drums, sparse detuned harpsichord, choir pad without words.
Tense but steady, no melody climax, 60 seconds, seamless loop start and end, no vocals.
```

---

## 14. Riscos de IP

| Risco | Fato | Fonte |
|---|---|---|
| Política de IP da GW | Atualização de 2021 vetou fan films/animações não licenciadas; série *TTS* entrou em hiato | [Vice](https://vice.com/en/article/warhammer-40k-fans-in-revolt-over-zero-tolerance-fan-animation-policy), [Know Your Meme](https://knowyourmeme.com/news/warhammer-fan-series-tts-announces-indefinite-hiatus-in-protest-of-games-workshops-new-strict-copyright-policies) |
| Página oficial | games-workshop.com/en-US/Intellectual-Property-Policy retornou HTTP 405 nesta coleta → texto atual **não verificado** | [GW IP Policy](https://www.games-workshop.com/en-US/Intellectual-Property-Policy) |
| Marcas registradas | Lista de terceiros inclui "40,000", "40K", "Adeptus Custodes", "Adeptus Mechanicus", "Blood Bowl", "Black Library", "Citadel" | [MyMiniFactory](https://creator.myminifactory.com/registered-trademarks-from-games-workshop) |
| Precedente | 2007: GW bloqueou o fan film *Damnatus* | [Slashdot](https://games.slashdot.org/story/07/07/11/1536240/games-workshop-forbids-warhammer-fan-films/interesting-comments) |

Como evocar o tom sem copiar (alinhado a `.claude/rules/ip-and-tone.md`):

- Usar tropos genéricos (fé militarizada, tecnologia como relíquia, império em decadência) e o vocabulário do GDD.
- Heráldica própria: formas geométricas simples (anel partido, chama em coroa de espinhos) em vez de águias, caveiras aladas ou cruzes estilizadas reconhecíveis.
- Silhuetas de armadura sem ombreiras gigantes arredondadas e sem capacete com grade frontal característica — evitar a "assinatura" visual de um universo.
- DD é também referência protegida: não copiar classes com nomes deles (Plague Doctor, Highwayman, Crusader como pacote), nem o "Ancestor"/mansão como premissa. Ranks, estresse e meltdown são mecânicas de gênero, não expressão protegida (mecânica não é protegida por copyright em geral — análise jurídica **não verificada**).
- Prompts de geração nunca citam obra, artista ou estúdio (regra do projeto).
- Checar todo nome novo por busca web antes de fixar.

---

## 15. O que isso significa para o nosso jogo

1. **Energia 3 / compra 5 como ponto de partida**, depois dobrar/dividir por simulação; é o par mais testado do gênero (§7.1).
2. **Acerto garantido**: DD2 provou que tirar precisão funciona em RPG sombrio; manter o invariante e mover a incerteza para compra de cartas e intenções (§7.4).
3. **Ranks 1–4 por lado** em side-view: habilidade/carta declara ranks de origem e alvo; deslocamento é efeito de carta (§2, §7.3).
4. **Estresse em escala curta (0–10)** como DD2, não 0–200: cabe em pips legíveis em 480×270 e num toque (§7.4).
5. Em 10 de estresse: resultado binário anunciado antes (ex.: meltdown vs resolve) com chance exibida na prévia — respeita "dano visível antes de decidir" (§7.3, §7.4).
6. **Intenção inimiga com ícone por efeito + número**, sem reaproveitar ícones; forma distinta além de cor (§5.1).
7. **Pilha de compra visível, ordem oculta**, contador de exaustão clicável (§5.1).
8. **Palavras-chave com tooltip por long-press**; nome + frase curta (§5.3, §13.4).
9. **Raridade por cor + forma de moldura**, máximo 4 níveis (§5.3, §13.5).
10. **Mapa de nós com 7 tipos** (normal, elite, descanso, evento, tesouro, loja, chefe) e descanso garantido antes do chefe (§7.2, §11).
11. **Descanso = escolha excludente** (curar ~30% ou melhorar carta/skill) (§7.2).
12. **Ouro: normal < elite < chefe** na proporção aproximada 1 : 2 : 7 de StS (15 / 30 / 100) como âncora inicial (§9.1).
13. **Remoção de carta com custo crescente** (75 +25 em StS) — sumidouro de ouro e decisão de diluição (§9.2).
14. **Pity de raridade** nas recompensas (offset de StS) para evitar runs sem raras (§9.3).
15. **Equipamento com raridade** usando pesos 50/33/17 como ponto de partida (§9.3).
16. **Relações entre heróis (DD2) como camada opcional da Beta**: +1 afinidade em decisões compartilhadas; fora do Alpha (§7.4).
17. **Meta-progressão dá opção, não poder bruto**: Altar de DD2 desbloqueia heróis e slots; seguir o teto do GDD §8 (§8.1).
18. **Dificuldade em escada cumulativa** (Ascensão) + modificadores opcionais (Dam) para jogadores que querem ajustar (§8.2, §8.3).
19. **Métricas desde o primeiro jogável**: log de escolha/pick rate por carta e taxa de vitória por nó; é o método documentado da MegaCrit e casa com `bun run sim` (§10).
20. **Seed diária** compartilhada — trivial com RNG injetado já exigido pelo núcleo (§11).
21. **Phaser fixado em 4.2.1**, `pixelArt: true`, `Scale.NONE` + zoom inteiro calculado no resize (§12.1–12.3).
22. **Placeholders SVG rasterizados no tamanho final**, nunca escalados pelo navegador (§12.4).
23. **Áudio desbloqueado no primeiro toque** ("Toque para começar"); jogo funciona com `sound.locked` (§12.5).
24. **Sem narrador falado**: texto curto + stinger sonoro em eventos de estresse/morte (§4).
25. **Orçamento de áudio** previsível: ~40 SFX × 2 s × 40 créditos ≈ 3.200 créditos; 6 faixas × 1 min × US$ 0,15 ≈ US$ 0,90 (cálculo a partir de §13.3; confirmar plano antes).
26. **Preço PixelLab não verificado** → consultar `get_balance` e mostrar estimativa no portão de custo (§13.2).
27. **Sessões curtas**: regiões de ~3 nós (Kingdoms) e runs de 3 atos — mirar runs que caibam numa sessão web (§11).
28. **IP**: nenhum termo GW/DD/FFT; heráldica geométrica própria; busca web obrigatória para nome novo (§14).
29. **Todo texto de UI em BitmapText; zoom inteiro por pixel de dispositivo** (§12.7).

---

## 15b. Referências do desenvolvedor (resumo)

Digest completo, imagem por imagem: [`docs/research/developer-references.md`](research/developer-references.md). Fontes: `references/chatgpt/conversation.md`, 24 concept arts, 13 wireframes (12 telas distintas; `wireframe-10` = `wireframe-12`) e o repositório <https://github.com/AlexGalhardo/zeta-c>.

- Conceito de referência chamado **DARKEON**: combate lateral por turnos, 3 heróis à esquerda contra 3 a 5 inimigos à direita, HUD superior, mão de cartas embaixo, botão "Terminar Turno".
- Roster de referência com 5 classes (Guerreiro, Mago, Curandeiro, Artilharia, Arqueiro) e equipe de 3 em combate; 6 habilidades por herói com custo de energia e recarga.
- Metaprogressão proposta: árvore de maestria por herói, árvore de pactos de equipe e árvore permanente com fragmentos.
- Economia proposta: Ouro, Fragmentos, Relíquias e Vida como custo de pacto; 3 lojas (Mercador 3×3, Arsenal, Relicário).
- UI consistente: painéis de pedra escura, borda dourada no foco; wireframes técnicos em 1920×1080 com coordenadas em px.
- Estrutura do zeta-c a replicar: `PLAN.md` com fases → grupos → checkboxes e "Pronto quando", `.claude/rules` + `.claude/skills`, hooks Biome + markdownlint + Conventional Commits, scripts de simulação, smoke e balanceamento, `CHANGELOG.md` com `[Unreleased]`.

**Contradições a decidir no brainstorming (tarefa 2):**

| # | Tema | Conflito |
|---|---|---|
| 1 | Nome | DARKEON (referências) × "project-alpha" × vocabulário herdado do projeto anterior |
| 2 | Resolução | 1920×1080 com produção 960×540 (ChatGPT) × base 480×270 (regras herdadas) |
| 3 | Mão | 5 × 6 cartas entre telas |
| 4 | Duração do combate | "ROUND XX/10" × 5 a 8 rodadas |
| 5 | Acerto | "25% ESQUIVA" e chance de condição × invariante de acerto garantido |
| 6 | Fila de turnos | ausente nos concepts × exigida pelas regras |
| 7 | Recursos | mana + energia + recarga sobrepostos (o próprio ChatGPT aponta o risco) |
| 8 | Nomes de heróis e classes | 4 conjuntos diferentes entre telas |
| 9 | IP | "Imperador do Vazio", "Inquisidor" e citações de obras de terceiros no texto do ChatGPT |

## 15c. Imagens de referência dos 4 jogos

Pasta local, fora do git (`references/` está no `.gitignore`). Cada pasta tem `images/` e `images.md` com arquivo, URL de origem e descrição.

| Jogo | Pasta | Imagens | Origem |
|---|---|---|---|
| Darkest Dungeon | `references/darkest-dungeon/` | 23 | Steam (screenshots oficiais): combate 9, hub 5, ficha de herói 2, evento 2, loot 2, acampamento 1, mapa 1, loja 1 |
| Darkest Dungeon II | `references/darkest-dungeon-2/` | 20 | Steam: evento 6, combate 5, exploração 4, acampamento 2, mapa 1, bestiário 1, hub 1 |
| Slay the Spire | `references/slay-the-spire/` | 55 | Steam (6) + frames do Launch Trailer oficial (24) + slaythespire.wiki.gg (25: notas de patch, menus, sprites, ícones). Capturas reais de jogo: 30. Categorias das capturas: combate 12, menu 11, sprite 5, evento 5, loot 4, chefe 4, deck 3, loja 3, mapa 3, ícone 3, bestiário 1, arte 1. Removidos 8 arquivos de ferramenta/template. Nenhuma captura de descanso (rest site) encontrada para StS1 ou StS2 |
| Slay the Spire 2 | `references/slay-the-spire-2/` | 51 | Steam (6) + frames do Gameplay Trailer oficial (14) + Steam News (6) + slaythespire.wiki.gg (24 cartas, ícones e artes) + 1 marketing; 26 capturas in-game |

Curadoria visual feita em 2026-10-26: cada `images.md` traz categoria, URL de origem, descrição e "Padrões observados". Nenhuma duplicata encontrada (MD5 + dHash).

## 16. Fontes

Slay the Spire (wiki oficial e dados)

- <https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Mechanics>
- <https://slaythespire.wiki.gg/wiki/Energy>
- <https://slaythespire.wiki.gg/wiki/Exhaust>
- <https://slaythespire.wiki.gg/wiki/Merchant>
- <https://slaythespire.wiki.gg/wiki/Gold>
- <https://slaythespire.wiki.gg/wiki/Ascension>
- <https://slaythespire.wiki.gg/wiki/Cards>
- <https://slaythespire.wiki.gg/wiki/Relics>
- <https://slaythespire.wiki.gg/wiki/Intent>
- <https://slaythespire.wiki.gg/wiki/Rest_Site>
- <https://slaythespire.wiki.gg/wiki/Map_Locations>
- <https://slaythespire.wiki.gg/wiki/Map_Generation>
- <https://slaythespire.wiki.gg/wiki/Mechanics>
- <https://slaythespire.wiki.gg/wiki/Ironclad>
- <https://slaythespire.wiki.gg/wiki/Silent>
- <https://slaythespire.wiki.gg/wiki/Defect>
- <https://slaythespire.wiki.gg/wiki/Watcher>
- <https://en.wikipedia.org/wiki/Slay_the_Spire>
- <https://store.steampowered.com/app/646570/>
- <https://store.steampowered.com/app/2868840/Slay_the_Spire_2/>
- <https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=2868840>
- <https://www.pcgamesn.com/slay-the-spire-2/neowsletter-september-2026>
- <https://www.pcgamesn.com/slay-the-spire-2/patch-notes-july-31-2026>
- <https://gamingonlinux.com/2026/04/godot-gets-a-funding-boost-from-slay-the-spire-2-devs-mega-crit>
- <https://gamedeveloper.com/business/slay-the-spire-devs-followed-through-on-abandoning-unity>
- <https://www.gdcvault.com/play/1025731/-Slay-the-Spire-Metrics>
- <https://gdconf.com/news/learn-slay-spires-successful-metrics-driven-approach-game-balancing-gdc-2019> (link quebrado em 2026-10-26)
- <https://www.gamedeveloper.com/design/learn-i-slay-the-spire-i-s-metrics-driven-approach-to-game-balancing-at-gdc-2019>
- <https://www.pressreader.com/australia/edge/20190620/282351156287993>
- <https://podwise.ai/episodes/1459444>

Darkest Dungeon 1 e 2

- <https://darkestdungeon.wiki.gg/wiki/Stress>
- <https://darkestdungeon.wiki.gg/wiki/Affliction>
- <https://darkestdungeon.wiki.gg/wiki/Hamlet>
- <https://darkestdungeon.wiki.gg/wiki/Heirlooms>
- <https://darkestdungeon.wiki.gg/wiki/Trinkets>
- <https://darkestdungeon.wiki.gg/wiki/Gold>
- <https://darkestdungeon.wiki.gg/wiki/Heroes_(Darkest_Dungeon)>
- <https://darkestdungeon.wiki.gg/wiki/Hag>
- <https://darkestdungeon.wiki.gg/wiki/Game_Modes>
- <https://darkestdungeon.wiki.gg/wiki/Wayne_June>
- <https://darkestdungeon.wiki.gg/wiki/Darkest_Dungeon_II>
- <https://darkestdungeon.wiki.gg/wiki/Stress_(Darkest_Dungeon_II)>
- <https://darkestdungeon.wiki.gg/wiki/Meltdown>
- <https://darkestdungeon.wiki.gg/wiki/Relationships>
- <https://darkestdungeon.wiki.gg/wiki/Altar_of_Hope>
- <https://darkestdungeon.wiki.gg/wiki/Stagecoach>
- <https://darkestdungeon.wiki.gg/wiki/Kingdoms>
- <https://en.wikipedia.org/wiki/Darkest_Dungeon>
- <https://store.steampowered.com/app/262060/Darkest_Dungeon/>
- <https://store.steampowered.com/app/1940340/Darkest_Dungeon_II/>
- <https://www.gamedeveloper.com/press-release/darkest-dungeon-ii-exits-early-access-launches-into-10-on-steam-epic-game-store-today>
- <https://www.nme.com/features/darkest-dungeon-2-how-redhook-studios-are-reinventing-their-roguelike-classic-3085987>
- <https://store.epicgames.com/en-US/news/darkest-dungeon-2-early-access-interview>
- <https://www.thegamer.com/darkest-dungeon-2-3d-combat/> (link quebrado em 2026-10-26)
- <https://www.gamebanshee.com/3hqup>

Phaser

- <https://api.github.com/repos/phaserjs/phaser/releases>
- <https://github.com/phaserjs/phaser/releases>
- <https://github.com/phaserjs/phaser/releases/tag/v4.0.0>
- <https://docs.phaser.io/api-documentation/typedef/types-core#renderconfig>
- <https://docs.phaser.io/phaser/concepts/scale-manager>
- <https://docs.phaser.io/phaser/concepts/textures>
- <https://docs.phaser.io/phaser/concepts/audio>
- <https://developer.mozilla.org/en-US/docs/Web/Media/Autoplay_guide>

Ferramentas de geração

- <https://api.pixellab.ai/v2/llms.txt>
- <https://www.pixellab.ai/>
- <https://www.pixellab.ai/docs/faq>
- <https://ai.g2.com/marketplace/tools/pixellab>
- <https://app.cinevva.com/guides/ai-pixel-art-generators>
- <https://www.pixellab.ai/pricing> (HTTP 404, acesso 2026-10-26; link quebrado em 2026-10-26)
- <https://pixellab.ai/pricing> (HTTP 404, acesso 2026-10-26; link quebrado em 2026-10-26)
- <https://api.pixellab.ai/docs> (HTTP 404, acesso 2026-10-26; link quebrado em 2026-10-26)
- <https://knowara.com/ai-tools/image/pixellab-review/> (acesso 2026-10-26; "verificado em setembro de 2026" segundo a página)
- <https://elevenlabs.io/pricing> (acesso 2026-10-26)
- <https://elevenlabs.io/docs/overview/capabilities/sound-effects>
- <https://elevenlabs.io/docs/overview/capabilities/music>
- <https://elevenlabs.io/pricing/api>
- <https://elevenlabs.io/music-terms>

IP

- <https://www.games-workshop.com/en-US/Intellectual-Property-Policy>
- <https://vice.com/en/article/warhammer-40k-fans-in-revolt-over-zero-tolerance-fan-animation-policy>
- <https://knowyourmeme.com/news/warhammer-fan-series-tts-announces-indefinite-hiatus-in-protest-of-games-workshops-new-strict-copyright-policies>
- <https://creator.myminifactory.com/registered-trademarks-from-games-workshop>
- <https://games.slashdot.org/story/07/07/11/1536240/games-workshop-forbids-warhammer-fan-films/interesting-comments>
