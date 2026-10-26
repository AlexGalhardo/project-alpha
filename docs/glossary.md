# Glossary

Single source for the game's terms. The GDD, specs, code and text (`src/i18n/`) use these names. When a concept has another name somewhere, correct it to the term here.

Conventions:

- **PT-BR term**: the name shown to the player in Portuguese (the PT-BR localization reference, `src/i18n/pt-BR`).
- **term EN**: English identifier, in `snake_case` or lowercase, used in code, data keys and i18n keys. The English display name is the definition column.
- **Decided (Bxx, Kxx)**: fixed in docs/brainstorming.md (decision or kickoff ID given in parentheses).
- **Open**: not decided yet. The item names its open question ID (Q-xxx, listed in the Open questions section of docs/brainstorming.md), or says that it is to be defined in the GDD.
- Names of mechanics from other games are not used as names of modes or systems.

## Run, act and map

| PT-BR term | term EN | Definition | Example |
|---|---|---|---|
| Run | run | A complete play session, from the start until the group wins or is defeated. | "A run ends when the group falls or the last boss is beaten." |
| Ato | act | A map block of 10 rounds (one per map row); the last round is the boss (decided, B08). | "Act 1: rounds 1 to 10, boss at round 10." |
| Transição de ato | act_transition | After the act boss, every hero heals 50 % of max HP and loses injuries; the next act map starts at row 1 (GDD 22.1). | "The descent continues. Act 2." |
| Rodada | round | One encounter on the route, i.e. one map node the player chooses; 10 per act, boss at round 10 (decided by the developer). Not a combat turn; see Combat round. | "Round 4 of Act 1: normal combat." |
| Linha do mapa | map_row | One of the 10 rows of an act; each row offers 2 to 3 nodes and the player picks one (B08). | "Row 9: rest or shop." |
| Nó | node | A point on the map that the player chooses to visit; it is one round of the run (B09). | "Treasure node at round 5." |
| Rota | route | The sequence of nodes the player picks from the start of the act to the boss. | "The route through the shop has one rest fewer." |
| Acampamento | camp | Screen opened after every round (B10): swap a hero for gold and buy 3 camp items. The full shop is a separate map node. Gold cost and item numbers: open (Q-CAMP). | "Camp: swap Huntress for Archer (costs gold)." |
| Semente | seed | The value that defines all randomness of a run. The same seed and the same commands produce the same state. | "Seed 4821 reproduces the same map." |
| Fenda | rift | The growing biomechanical wound beneath the cathedral-fortress. Premise: an expedition into the Rift; each run is a descent (B34). | "Expedition to the Rift." |
| Nível de dificuldade | difficulty_tier | A 10-level cumulative ladder, unlocked by wins in Beta (B27). The prototype only has developer-set multipliers for simulation. | "Level 3 raises elite HP." |

## Node types

Prototype node types are decided (B14): combat, elite, rest, shop and boss. Event and treasure nodes are in Alpha.

| PT-BR term | term EN | Definition | Example |
|---|---|---|---|
| Combate normal | normal | Standard battle; 1–2 enemies in rounds 1–3, up to 4 later; each combat introduces a new enemy type until all 10 have appeared (B11). | "Two enemies and a knight." |
| Elite | elite | Optional elite node in rounds 4 and 7, beside a normal fight: 0 to 2 elites per run, by choice (B12). | "Elite with 420 HP and 25% dodge." |
| Descanso | rest | Exclusive choice (B15): heal about 30% of party HP, or upgrade 1 card, or relieve stress. | "Rest: heal or upgrade a card." |
| Evento | event | Text with choices and consequences, with no mandatory battle. In Alpha (B14). | "A shrine offers health in exchange for gold." |
| Tesouro | treasure | A fixed reward, with no combat. In Alpha (B14). | "Treasure with one relic." |
| Loja | shop | The full shop: cards, card removal and relics. A map node, separate from the camp (B10). | "Shop with three cards and one relic." |
| Chefe | boss | The final battle of an act, at round 10 (decided), with 2 phases (B13). | "Act 1 boss, phase 2 of 2." |

## Combat

| PT-BR term | term EN | Definition | Example |
|---|---|---|---|
| Batalha | battle | A single combat between the party and the enemies of a round, until one side falls. | "Battle of round 3 of the act." |
| Rodada de combate | combat_turn | A cycle within a battle in which each hero and each enemy acts once (English: combat turn). Not the same as Rodada, which is a route node. Common combat: 3 to 6 turns at 1x (B24). | "The battle lasts 4 combat rounds." |
| Turno | turn | The team's turn (one hand for the whole party, B03), then the enemies act in queue order. | "Team turn, then the enemy turn." |
| Fila de turnos | turn_order | The visible queue of enemy actions in the turn; always shown (B03, game rule). | "Queue: Enemy 1, Enemy 2, Enemy 3." |
| Energia | energy | The only card resource (B06). 3 per turn (B07). No mana, no cooldowns. | "Energy 3/3 at the start of the turn." |
| Compra | draw | Taking cards from the draw pile into the hand. 5 per turn (B07). | "Draw 5 cards at the start of the turn." |
| Mão | hand | The cards available in the turn, with a limit of 10 (B07). | "Hand of 6 cards." |
| Pilha de compra | draw_pile | Cards not yet drawn. Order hidden, count visible. | "Draw pile: 12 cards." |
| Pilha de descarte | discard_pile | Cards used this turn; they return to the draw pile when it runs out. | "Discard: 7 cards." |
| Pilha de exaustão | exhaust_pile | Cards removed until the end of the battle. | "Exhaust: 2 cards." |
| Exaustão | exhaust | Removing a card from the battle when it is played. | "Exhausted card: gone until the end of the battle." |
| Intenção | intent | The enemy action announced before its turn, with an icon and a number. Always visible (game rule). | "Intent: attack 12." |
| Bloqueio | block | Reduction of damage a unit takes until its next turn. | "Guardian with 8 block." |
| Posição | rank | A unit's row. 3 rows for heroes, up to 4 for enemies (B04). A card declares origin and target ranks; push and pull effects move units. | "Huntress in rank 2, hitting ranks 3 and 4." |
| Alvo | target | The unit a card hits. Each card declares its valid targets. | "Target: an enemy in rank 1 or 2." |
| Colapso | collapse | State at stress 10 (B17): the hero loses 1 energy on the next turn and stress resets to 5. | "Huntress collapses; stress back to 5." |
| Herói caído | fallen_hero | A hero at 0 HP (B16): their cards are unplayable; the hero returns next round at 1 HP with an injury (−max HP) until a rest. | "Dreadguard falls; returns at 1 HP next round." |
| Ferido | injured | Lasting −max HP on a hero who returned from a fall, until a rest (B16). | "Injured: max HP 120 → 108." |
| Efeito de estado | status | A temporary effect on a unit, positive or negative. | "Poison applied to the enemy." |
| Buff | buff | A positive status effect. | "Strength +2 until the end of the turn." |
| Debuff | debuff | A negative status effect. | "Weakness: deals 25% less damage." |
| Acúmulos | stacks | The amount of one status on a unit. | "Poison with 3 stacks." |
| Estresse | stress | A hero's tension, 0 to 10 pips (B17). Some cards and intents add stress. At 10, Collapse. Full DD2-style stress (banter, relationships) is post-prototype. | "Stress 7/10." |
| Batalha automática | auto_battle | Plays the party's turn with the greedy one-step AI; the player can take over between commands at any time (B23). Available from the prototype (K09). | "Auto battle on; tap to take over." |
| Velocidade de jogo | game_speed | Presentation speed: 1x, 2x or 3x (K09). Never changes the result of a battle with the same seed. | "Speed 2x." |

## Cards

| PT-BR term | term EN | Definition | Example |
|---|---|---|---|
| Carta | card | A playable unit that costs energy and has an effect. Owned by one hero (B05). | "Heavy Blow, cost 1." |
| Custo | cost | The energy spent to play the card. | "Cost 2." |
| Melhoria | upgrade | An improved version of a card, obtained at a rest or in the shop. | "Heavy Blow+." |
| Raridade | rarity | 4 tiers: common, uncommon, rare, legendary; legendary is boss-only. Frame shape differs per tier, plus color (B20). | "Rare: gold frame with a cut corner." |
| Palavra-chave | keyword | A term with its own rule, explained by a tooltip. | "Exhaust is a keyword." |
| Maldição | curse | A negative card that enters the deck through an effect and cannot be played usefully. | "Curse: takes a hand slot and does nothing." |
| Baralho | deck | The party's single shared deck; every card is owned by a hero, and swapping a hero swaps their cards (B05). | "Deck of 18 cards." |
| Coleção | collection | All unlocked cards, outside the run. | "Collection with 60 cards." |
| Relíquia | relic | A passive item. One of a hero's 2 equipment slots (B19). | "Relic: +1 energy on the first turn." |

## RPG and heroes

| PT-BR term | term EN | Definition | Example |
|---|---|---|---|
| Herói | hero | A playable character. The roster has 5 heroes; the player takes 3 per run, chosen at the start menu (B02, decided). | "Hero 1 of 5 in the prototype." |
| Classe | class | One of 5 hero roles: tank (rank 1), arcanist, healer or support, artillery, marksman; original generic names (B35). Names: open (Q-HERO). | "Tank in rank 1." |
| Grupo | party | The 3 heroes on the field in a run (B02). | "Party: Dreadguard, Huntress, Inquisitor." |
| Elenco | roster | The 5 heroes available to choose from (B02). | "Roster of 5 heroes." |
| Troca de herói | hero_swap | Exchanging a party hero for a roster hero at the camp between rounds (costs gold, B02/B10). | "Swap Archer for Mage at camp." |
| Atributo | stat | A hero's base number, such as health, attack or defense. | "Defense 42." |
| Vida | hp | A hero's hit points. Reaching zero makes the hero fall (B16). | "HP 120/150." |
| Nível | level | A milestone of the hero's progression. | "Level 12." |
| Experiência | xp | Points that raise the hero's level. | "XP 420/1,200." |
| Árvore de maestria | mastery_tree | Per-hero skill tree: 3 short branches of 3 to 4 nodes, paid with the legacy currency; nodes unlock cards and hero variants, never raw power. Alpha, not in the prototype (B21). | "Branch Bastion, node 2 of 4." |
| Pontos de maestria | mastery_points | Points spent in the mastery tree. | "Points available: 3." |
| Habilidade | skill | An active hero action. Whether it is a card or a separate action: open, no question ID yet (to be raised in brainstorming.md). | "Iron Wall, cost 2." |
| Slot de equipamento | equipment_slot | One of a hero's 2 slots: weapon (changes that hero's card numbers) or relic (passive) (B19). | "Weapon slot: Ash Blade." |
| Chefe | boss | An end-of-act enemy. See Node types. | "Act 1 boss." |
| Fase | phase | A boss stage. 2 phases, switching at 50% HP by intent pattern; signalled by flash, shake and text (B13). | "Phase 2 of 2." |

## Economy

| PT-BR term | term EN | Definition | Example |
|---|---|---|---|
| Ouro | gold | The run's currency, spent in the shop and at camp. | "Gold 150." |
| Preço | price | The amount of gold an item costs. | "Price: 120 gold." |
| Recompensa | reward | A choice after a battle: pick 1 of 3 cards from the heroes on the field, or skip (B18). Elites and the boss drop equipment. | "Reward: choose one of three cards." |
| Remoção | removal | Removing a card from the deck in the shop. The cost rises with each use. Cost values: open (economy GDD). | "Removal: 75 gold, then 100." |

## Meta-progression

| PT-BR term | term EN | Definition | Example |
|---|---|---|---|
| Desbloqueio | unlock | Unlocking a hero, card or option between runs. | "Unlock: Huntress." |
| Metaprogressão | meta_progression | Progress that persists between runs. Every run, won or lost, grants legacy currency; no stat bonuses (B22). | "Meta-progression unlocks cards and hero variants." |
| Moeda de legado | legacy_currency | Currency granted by every run (won or lost), spent on skill-tree branches, new cards and hero variants. Name: open (Q-LEGACY-NAME). No stat bonuses (B22). | "Legacy: 450 of 1,000." |
| Brasas banked | embers_banking | Embers are added to the profile once per run seed, when the run ends (won or lost). Repeating the summary never adds them twice. Shown as "Brasas" in PT-BR (see Q-LEGACY-NAME). | "A finished run banks its Embers once." |
| Tela de Legado | legacy_screen | Main-menu screen where banked Embers buy skill-tree nodes, per hero, in order. Nodes add options only (GDD 22.5). | "Buy Shieldbearer node I for 10 Embers." |
| Início veterano | veteran_start | Option from skill-tree node III: at party select, the hero starts with card A in place of one starter Strike. | "Veteran start: Marksman begins with Ricochet." |

## Interface

| PT-BR term | term EN | Definition | Example |
|---|---|---|---|
| Dica | tooltip | Explanatory text shown on a long touch, with no hover. | "Poison tooltip: deals damage at the start of the turn." |
| Prévia | preview | Shows the result of an action before confirmation. Mandatory (game rule). | "Preview: deals 14 damage to 2 enemies." |
| Confirmação | confirm | A second tap on the target that executes the action. | "Tap 1 shows the preview; tap 2 confirms." |
| Resolução base | base_resolution | 640×360 logical layout, drawn through a ×3 camera on a 1920×1080 canvas and FIT-scaled to the viewport (B40; replaces the integer zoom of B28). | "Base 640×360 at ×3 = 1920×1080." |
| Título do jogo | game_title | Working title: "Ossuary" (B39). Trademark and domain are not verified; checks open (Q-NAME-CHECK). | "Ossuary" |
