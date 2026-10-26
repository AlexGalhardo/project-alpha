# Digest of the developer's references

Sources read: `references/chatgpt/conversation.md` (3,074 lines, in full), `references/concept-arts/*.png` (24), `references/wireframes/*.png` (13), and the repository `AlexGalhardo/zeta-c` via `gh`.

Quoted in-game strings are kept in Portuguese (PT-BR) where they are the actual text shown in the concepts; the English gloss is given in parentheses.

## Summary

1. The reference material is called **DARKEON** (ChatGPT, concepts, wireframes). The new project's name is not confirmed yet (see Contradictions).
2. Turn-based combat in ranks: 3 heroes on the left, 3 to 5 enemies on the right, top HUD, card hand at the bottom, End Turn button.
3. Reference roster (concepts 23 to 27): Warrior, Mage, Healer, Artillery, Archer. The combat party has 3 heroes.
4. Cards with energy cost (3 per turn by default), ability cooldowns in turns, statuses (Bleed, Poison, Weakness, Corruption, Marked, Burn).
5. Progression map: a node trail with skulls and a final boss (batle-2, batle-6, batle-7).
6. Meta-progression: mastery trees per hero, a team-pact tree ("Eclipse of the Three") and a permanent radial tree ("Legacy of the Abyss", with fragments).
7. Economy: Gold (shop currency), Health as a pact cost, Fragments (meta-progression), Relics.
8. Shops: Merchant (3x3 grid), Arsenal (equipment, comparison), Reliquary (risky pacts).
9. The UI is consistent across screens: same bands, dark-stone panels, rectangular buttons with a gold border on focus.
10. The technical wireframes (1920x1080, pixel coordinates) are the numeric source; the concepts are visual references. The ChatGPT's idea that "numeric geometry beats art" is good.

## Ideas from ChatGPT

Organized by theme. Items marked "(ChatGPT)" are literal proposals; items marked "(contradiction)" are in another section.

### Concept and tone

- Roguelite + deckbuilding + RPG, dark fantasy, 2D side-view pixel art, original universe.
- Cited inspirations: Darkest Dungeon (silhouette, atmosphere), Slay the Spire 2 (hand, legibility), DOOM The Dark Ages (metal, scale), Warhammer 40k and Space Marine 2 (architecture, corruption), Alien/Predator (biomechanical horror). See Contradictions: third-party work names appear in the text.
- Tone: oppressive gothic, medieval-industrial, ancient alien horror, occult machinery.

### Heroes and classes

- Three fixed heroes in the party: **Dreadguard** (tank, rectangular shield, serrated sword), **Blood Huntress** (DPS/assassin, two blades, bone mask), **Void Inquisitor** (mage/support, spiked staff, faceless mask).
- Visual order: Inquisitor, Huntress, Dreadguard (Dreadguard nearest the enemies).
- Five classes for the detail screens (concepts 23 to 27), example at level 25:
  - Warrior: health 420, attack 62, defense 115; block and taunt.
  - Mage: health 180, magic attack 125, defense 28; area damage and control.
  - Healer: health 240, healing 135, defense 42; healing, purification, revival, shield.
  - Artillery: health 310, attack 110, defense 70; area damage, medieval-industrial cannon, burn.
  - Archer: health 230, attack 105, defense 32; crit, mark, poison.
- Each hero has six abilities (I to VI) with energy cost and cooldown in turns.
- Attributes listed: health, mana, attack, defense, strength/dexterity/intelligence/faith (per class), crit, speed, block, resistances (physical, fire, ice, poison, void). Points available: 3.
- Equipment slots: helmet, armor, weapon, shield/cannon/bow/staff, amulet, ring.

### Combat

- Hand of six visible cards as the reference; energy 3/3 at the start; energy spent to play cards.
- Positions: heroes on the left with individual bars; enemies in fixed slots (5 centers: 1098, 1250, 1402, 1554, 1706 in the wireframe).
- Enemy intent shown (attack, defense, curse, summon). Area telegraphs (poison, summoning egg).
- Effects and statuses: Bleed, Poison, Weakness, Corruption, Marked, Burn, Fortify, Shield/Block.
- Chain attack: "LÂMINA GIRATÓRIA" (WHIRLING BLADE) hits 3 enemies (target line).
- Elite: 20% chance of an elite encounter, as an encounter rule (not fixed per stage). Elite with its own bar and label.
- Card corruption: a card in hand is corrupted; PURIFICAR (PURIFY) cancels it.
- Relic combo: a card triggers a relic (COMBO x3) with a gold visual link.
- Boss in phases (3 phases, phase markers); boss HP bar with 10,000 HP.
- Combat resources: Rupture, Marked (+ damage), Weakness (a Weakness card).
- Example cards (name, cost, effect): Devoted Strike (1, deals 8), Bleed (1, deals 4 and applies 3 Bleed), Acid Bomb (1, deals 6 and Poison 2), Cursed Seal (applies 3 Weakness, draws 1), Iron Guard (grants 8 Block, draws 1); Void Cataclysm (3, deals 60 to one target, +30 if marked; area version 24 in concept 27).
- Last-resort card: ÚLTIMO SACRAMENTO (LAST SACRAMENT) (2, restores 40 health, adds a Curse to the deck).
- Discard pile and draw pile visible with counts; "Terminar Turno" (End Turn) highlighted.

### Map and run progression

- Battles labeled "ROUND XX/10". Acts (ATO I) and location names: Abandoned Cathedral, Biomechanical Swamp, Iron Necropolis, Field of War, Blood Forest, Citadel of Despair, Obsidian Forge, Void Cathedral (boss).
- Node trail with skull icons and a crown at the end (run progress).
- Pre-boss: "Cidadela do Desespero / Aproximação da Sala do Trono" (Citadel of Despair / Approach to the Throne Room).

### Cards and deck

- Card types: Attack, Defense, Skill (with a colored band). Rarities: Common, Uncommon, Rare, Epic, Legendary.
- Deckbuilder filters: by class, rarity, type (ALL, ATTACK, DEFENSE, SKILL, SUPPORT, UTILITY depending on the screen), search.
- Deck limit: 30 cards (24/30 in the example). Copies: x1, x2, x3 per card.
- Deck metrics: average cost (1.5), base energy, average curve.
- Class synergy: Void Magic cards.
- AUTO-ORGANIZE in the grimoire.

### Economy and shops

- Gold: shop currency (examples: 150, 180, 350, 420, 850).
- Shops: Merchant (buy and sell, 3x3 grid, detail panel, BUY), Arsenal (equipment, current vs. selected comparison, EQUIP/BUY), Reliquary (relic offers costing gold or health).
- Blood Pact: costs 20 Health and gives +2 energy on the first turn and +1 Corruption.
- ChatGPT's currency rule: "Every coin and every item feeds a player decision" (aligned with the GDD).

### Meta-progression and trees

- Mastery tree (individual): three branches per hero, nodes 1/5 to 5/5, skill points, LEARN.
  - Guardian: Bastion (defense), Executor (damage), Oath (protection/sacrifice).
  - Huntress and Inquisitor: their own branches (concept 17 shows the three tabs).
- Team tree ("Pactos de Guerra", War Pacts): a triangle with one vertex per hero; hybrid nodes between vertices; ultimate "Eclipse dos Três" (all heroes attack the same target; requires 3 links; costs 3 points).
- Permanent tree ("Legado do Abismo", Legacy of the Abyss): radial, core "Núcleo Eterno" (Eternal Core), four branches (Survival, Arsenal, Knowledge, Profanation), cost in Fragments (1,250 available), legacy level.
- Fragments and Legacy Level: currencies between runs.
- Unit death: not mentioned by ChatGPT; see Gaps.

### Menu and navigation

- Main menu: CONTINUAR (CONTINUE), NOVA JORNADA (NEW JOURNEY), PERSONAGENS/HERÓIS/COLEÇÃO (CHARACTERS/HEROES/COLLECTION), OPÇÕES (OPTIONS), SAIR (QUIT). Version 0.1.0 in a corner.
- Three menu directions (Fortress, Throne Room, Alien Portal). ChatGPT's recommendation is the Fortress (Main Menu 01).
- Pause menu: PAUSA (PAUSE), CONTINUAR, CONFIGURAÇÕES (SETTINGS), REINICIAR RUN (RESTART RUN), MENU PRINCIPAL (MAIN MENU); warning "O PROGRESSO DA RUN PODE SER PERDIDO" (RUN PROGRESS MAY BE LOST); ESC resumes.
- Settings: categories GERAL (GENERAL), VÍDEO (VIDEO), ÁUDIO (AUDIO), JOGABILIDADE (GAMEPLAY), INTERFACE, ACESSIBILIDADE (ACCESSIBILITY); resolution, screen mode, VSync, FPS limit, interface scale, pixel scale (integer), effects, particles, screen shake.
- Team management: 3-position formation, ALTERAR FORMAÇÃO (CHANGE FORMATION), CONFIRMAR EQUIPE (CONFIRM TEAM); drag a hero into a position.

### Art and direction

- Style: side-view orthographic, square pixels with no antialiasing, no 3D, no painting, no gradients over pixels; light dithering in the background.
- Production palette (ChatGPT): #111018 (charcoal), #252331 (shadow/panel), #464256 (stone/subpanel), #DDD3C0 (bone/text), #A92F39 (crimson), #E05B38 (infernal orange), #A9CD4B (acid green), #7B58AB (spectral violet), #D1A052 (relic gold).
- Typography: gothic only for titles; functional text in a readable pixel font.
- Colors by function: red for attack, steel blue for defense, violet for magic, green for poison, gold for emphasis.
- Proposed asset structure: characters/heroes, enemies, bosses, npcs; backgrounds/combat, menu, shops; ui/cards, panels, buttons, icons, status-effects; items; vfx.

### Scope and process (from ChatGPT)

- Generate Gameplay 01 first as the master image, then the other battles with the same cast.
- Priority: P0 combat 01, 03, 10; P1 shop 01 and tree 01; P2 menu 01 and tree 03; P3 the rest.
- Vertical slice before all cards: 3 heroes, 3 enemies, 6 cards, full turns, statuses.
- Two competing systems to decide: hero abilities as an action, a card, or a passive (ChatGPT itself marks this as a pending decision).
- Concept arts are references; scenery, sprites, cards, buttons, VFX and HUD must be separate layers in Phaser 4.
- Geometry: 1920x1080 reference canvas, native production at 960x540 with 2x scale (see Contradictions: it conflicts with the project).
- Base spacing 8 px; spacing 4, 8, 12, 16, 24, 32, 48; outer margin 32; minimum tap area 48x48; titles 36 px, subtitle 24, text 20, compact 16, secondary 14.
- Panel borders 2 or 4 px; dividers 2 px; radius 0 to 8 px.
- Default battle layout: ~65% of the height for scenery and characters, ~35% for cards and controls.

## Concept arts

All images are 1672x941 (except menu-settings, 1672x940). Colors: an automatic 3-bit-per-channel quantized sample came out dominated by black and dark blue; it is not reliable for hex values. So the colors below are visual estimates, marked "estimated".

Overall palette observed (estimated): near-black purplish background (~#14121a), charcoal panel (~#26232f), grey-violet stone (~#4a4658), bone text (#ddd3c0), gold (#d1a052), crimson (#a92f39), bright red in the lights (~#c83a3a), ember orange (~#e05b38), violet (~#7b58ab), acid green (~#a9cd4b).

| File | Screen | Layout / HUD | Heroes / enemies | Palette (estimated) | Camera / text |
|---|---|---|---|---|---|
| batle-1.png | Combat, Round 7, Gold 128, Deck 19, Energy 3/3 | Top: DARKEON logo, relics, Round, Gold, Deck, Energy, "Turno do Jogador" (Player's Turn). Left: 3 stacked portraits with HP and statuses. Bottom: 5 cards, "Mão 5/5" (Hand 5/5), Discard 0, End Turn, potions on the right | Heroes: Valgrin, Morzeth, Kaelis. Enemies: 5 (flesh mound 96/120, priest 38/38, spider 26/26, tall creature 24/24, shield-bearer 39/45 left of the enemy line) | Red, orange, acid green, violet, bone | Side view, in rows. Serif title; pixel body |
| batle-2.png | Iron Necropolis, Round 03/10, Gold 320 | Trail of 6 nodes at the top with a crown at the end; Round at the top right; hand in an arc with an enlarged card (LÂMINA GIRATÓRIA) with target lines; energy 3/3 in a gold disc on the left; draw pile 12, discard 0; TERMINAR TURNO | 3 heroes, 5 enemies (shielded skulls, knight, sphere drone). Intent icons: red swords (attack), violet symbol (curse) | Strong gold and orange, charcoal, crimson | Side view, in rows; HUD with metal frames |
| batle-3.png | Void Cathedral, Round 10/10, BOSS | Boss name at the top center; boss HP bar 6,400/10,000 with "FASE 2/3" and three markers; hand of 6 cards with the selected card raised; energy 3/3 in a violet ring; ENCERRAR TURNO | 3 heroes; huge boss on the right (Abyss Sovereign); 2 minions with 320/320 and 280/280 | Dominant violet, red moon, bone | Side view, boss fills the right half |
| batle-4.png | Act I, Round 01/10, Gold 150 | Top: logo, Act, Round, Gold, Relics, "Turno do Jogador", pause. Left: 3 portraits with HP. Bottom: 6 cards, Energy 3/3, Hand 6/6, Discard 0, TERMINAR TURNO, potions | Heroes: Void Inquisitor, Blood Huntress, Dreadguard. 4 visible enemies (skeleton knight, flesh, crowned priest, skull) | Dominant crimson and red, violet, gold | Side view; stained glass behind |
| batle-5.png | Blood Forest, Round 07/10, Combat | Top left: region name; top right: Round; HP bars with Mana (blue) under heroes; elite with an ELITE label and 25% DODGE; hand of 6; energy 2/3 in a violet ring; ENCERRAR TURNO | 3 heroes; 3 enemies (elite 420/420, beast 280/280, archer 240/240) | Blood red, red moon, violet | Side view; red aiming line from the archer to the elite |
| batle-6.png | Citadel of Despair, Round 09/10 | Trail of nodes at the top; Gold 180; hand of 6 with ÚLTIMO SACRAMENTO raised; energy 2/3 in a gold disc; Deck 6; Discard 0; skull 3; TERMINAR TURNO | Heroes with low HP (18/100, 34/85, 62/90). 5 enemies (knight 120/120, priest 90/90, sphere 70/70, knight 110/110, beast 200/200) | Charcoal, gold, crimson | Side view; throne staircase in the background |
| batle-7.png | The Obsidian Forge, Act I, Round 08/10 | Top: logo, Act, Round, Gold 420; relics at the top center with lines to the cards (Forge Heart, Ash Medallion, Profane Core); COMBO x3; energy 1/3 in a blue-flame disc; Deck 14; Discard 6; TERMINAR TURNO | 3 heroes; 5 enemies (iron robots 75/75, golem 180/180, etc.) | Dominant orange and fire, charcoal, blue flame for energy | Side view; forge |
| deckbuilding-menu.png | Grimoire of War (deckbuilder) | Header with Deck 24/30, base energy 3, average curve 1.5; left column MY DECK (24) with 3 hero filters and a list with x2/x1, type filters, AUTO-ORGANIZAR, VOLTAR, SALVAR BARALHO; center COLLECTION (4x3 grid with filters and search); right CARD DETAILS with a large card, cost, effect, ADICIONAR/REMOVER | Not applicable | Charcoal, gold, class-colored borders | Interface, front-on |
| hero-menu.png | Company of the Damned (team) | Logo at the top left; hero list on the left with HP; central scene with 3 heroes and POSIÇÃO 1/2/3 markers; right panel with attributes, equipment, points; buttons ALTERAR FORMAÇÃO, VOLTAR, CONFIRMAR EQUIPE | Dreadguard (level 12), Blood Huntress (11), Void Inquisitor (10) | Red moon, charcoal, gold | Side view; scene with depth |
| hero-warrior-menu.png | Warrior hero (Dreadguard, The Iron Bastion) | Left: sprite, level 25, XP, equipment (helmet, armor, weapon, shield, amulet, ring). Center: ATRIBUTOS and RESISTÊNCIAS. Right: 6 abilities (3x2 grid) and the selected one's detail with APRIMORAR. Footer: VOLTAR, EQUIPAMENTOS, ÁRVORE DE HABILIDADES | Dreadguard | Charcoal, gold, crimson | Front-on; pixel text |
| hero-mage-menu.png | Mage hero (Void Arcanist) | Same three-column layout; level 25 with a violet XP bar; slots in two columns around the sprite; 6 abilities (cost 1 to 3) with detail and APRIMORAR | Void Arcanist | Dominant violet, gold | Front-on |
| hero-healer-menu.png | Healer hero (Ashen Saint) | Same layout; hero selector at the top right (3 thumbnails); slots with bonuses (+5, +6, +7); 6 abilities; APRIMORAR in solid gold | Ashen Saint | Bone, light green, gold | Front-on |
| hero-archer-menu.png | Archer hero (Bone Warden) | Same layout; red XP bar; slots CAPUZ (HOOD), ALJAVA (QUIVER), ARCO (BOW), ARMADURA (ARMOR), AMULETO, ANEL (RING); 6 abilities | Bone Warden | Red, acid green (poison), gold | Front-on |
| hero-bombardier-menu.png | Artillery hero (Iron Bombardier) | Same layout; equipment CANHÃO (CANNON) and MUNIÇÃO (AMMO); 6 abilities | Iron Bombardier | Charcoal, red, orange | Front-on |
| menu-1.png | Main menu, Fortress (Main Menu 01) | Logo at the top center; vertical menu on the left: CONTINUAR (selected in gold), NOVA JORNADA, PERSONAGENS, OPÇÕES, SAIR; VERSÃO 0.1.0 in the bottom-right corner | 3 heroes seen from behind on a cliff | Grey-violet, red moon, gold logo | Panoramic; serif logo with ornaments |
| menu-2.png | Main menu, Throne Room (Main Menu 02) | Logo at the top; menu at the bottom left: NOVA JORNADA (selected), CONTINUAR, HERÓIS, OPÇÕES, SAIR with icons; subtitle "O ABISMO AGUARDA" (THE ABYSS AWAITS) | 3 heroes on the left, empty throne on the right | Red and charcoal, candles | Panoramic |
| menu-3.png | Main menu, Portal (Main Menu 03) | Logo at the top; vertical menu on the right: CONTINUAR (selected in violet), NOVA JORNADA, COLEÇÃO, OPÇÕES, SAIR; VERSÃO 0.1.0 | 3 small heroes at the base of the portal | Dominant violet, bone, charcoal | Panoramic |
| menu-settings.png | Settings, VIDEO tab | CONFIGURAÇÕES title at the top center; left column with 6 categories (VÍDEO selected in gold); panel with rows: resolution, screen mode, VSync, FPS, interface scale (slider), pixel scale (INTEIRA = integer), effects, particles, shake; footer RESTAURAR PADRÃO, CANCELAR, APLICAR | Not applicable | Charcoal, crimson, gold | Front-on; serif text |
| shop-menu-1.png | Merchant (Cursed Merchant) | Top: MERCADOR (active) and INVENTÁRIO tabs; OURO 350; SAIR. Left: large NPC. Right: 3x3 grid of items with rarity color and gold price. Below: detail panel with ESPADA DO VAZIO (Epic, 180) and COMPRAR | NPC: Cursed Merchant (hooded, beaked mask) | Charcoal, violet, gold, green/blue/red borders by rarity | Front-on |
| shop-menu-2.png | Infernal Arsenal | Top: ATO I, ARSENAL INFERNAL, OURO 850. Left: DREADGUARD with slots (helmet, armor, weapon, shield, amulet, ring). Center: tabs TODOS, ARMAS, ARMADURAS, ACESSÓRIOS and a 4x2 grid. Right: COMPARAÇÃO with ATUAL x SELECIONADO and EQUIPAR/COMPRAR | Dreadguard; large smith in the background | Charcoal, forge orange, gold | Front-on; forge highlighted |
| shop-menu-3.png | Forbidden Reliquary (Veiled Oracle) | Top left: title; top right: OURO 420, VIDA 85/100. Center: 3 relic cards (CORAÇÃO ABISSAL 150 gold, PACTO DE SANGUE 20 health, OLHO DO ESQUECIMENTO 250 gold); right: pact detail and keywords; bottom: ACEITAR PACTO and VOLTAR | Oracle seated on a throne | Violet, crimson, charcoal | Front-on |
| skill-tree-1.png | Hero Mastery (Guardian) | Tabs GUARDIÃO, CAÇADORA, INQUISIDOR at the top. Left: Dreadguard, level 12, health, defense, strength, points. Center: three columns (BASTIÃO blue, EXECUTOR red, JURAMENTO gold) with tree nodes and locks. Right: selected node and APRENDER | Dreadguard | Steel blue, red, gold | Front-on; pixel-icon nodes |
| skill-tree-2.png | War Pacts (Eclipse of the Three) | Top: tabs Jornada, Coleção, Pactos de Guerra, Relíquias, Diário; Pact points 4; three portraits (Dreadguard, Blood Huntress, Void Inquisitor). Center: triangle with nodes (blue, red, violet) and a central ultimate. Right: detail and DESBLOQUEAR | Three heroes at the vertices | Blue, red, violet, gold | Front-on; triangular graph |
| skill-tree-3.png | Legacy of the Abyss (permanent) | Left: title, FRAGMENTOS 1,250, Legacy Level 12 (450/1,000). Center: radial tree with NÚCLEO ETERNO and four branches (SOBREVIVÊNCIA, ARSENAL, CONHECIMENTO, PROFANAÇÃO). Right: SANGUE RESISTENTE (level 2/5), cost 200 fragments, MELHORAR, VOLTAR | Guardian silhouette on the left | Green, red, violet, blue, gold | Front-on; radial graph |

Notes on the concepts:

- No turn-order queue is visible in any concept (see Contradictions).
- Hero names differ across screens (see Contradictions).
- Body font: the hero and shop screens use a gothic serif for body text, not pixel font. ChatGPT asks for pixel font in functional text. Observed divergence.

## Wireframes

Order and identification checked by checksum: wireframe-10 and wireframe-12 are byte-identical (same md5). The others are distinct.

| File | Screen | Layout / coordinates | Notes |
|---|---|---|---|
| wireframe-2.png | Coordinate system | 1920x1080 reference; HEADER, LEFT, MAIN CONTENT, RIGHT, FOOTER; 960x540 as a 50% alternative; 8 px unit | Concept diagram, no component measurements |
| wireframe-3.png | Battle, simplified diagram | Top: RUN/ROUND, RESOURCES and RELICS, PAUSE. Middle: 3 HEROES and 3 TO 5 ENEMIES. Bottom: ENERGY, DECK/DISCARD, TURN and 6 cards #1 to #6 | Reading flow, no numbers |
| wireframe-4.png | Battle, technical HUD (WF01) | Header 0,0,1920x104 with run-info (32,20,300x64), resources (380,20,760x64), status (1192,20,360x64), pause (1776,20,112x64). Battle area 0,104,1920x626: heroes at 80,220,810x456, enemies at 1030,220,810x456 with 5 centers (1098, 1250, 1402, 1554, 1706). Action: energy 32,816,224x228; deck/discard 280,816,208x228; hand 530,762,860x292 with 132x204 cards; right panel 1432,816,456x228; END TURN 1616,942,264x88 | Labels with IDs (carta-2 and carta-3 repeated, inimigo-N, inimigo-5sprtus: labeling errors). Shortcuts: Pause [P], View enemies [TAB], End turn [SPACE]. Hand 860x292 here; ChatGPT corrects it to 864x292 elsewhere |
| wireframe-5.png | Main menu (WF02) | Logo 680x180 at 620,96; buttons 512x72 at x=704, y=364, 452, 540, 628, 716 (gap 16); info footer 32,1020,480x28 and version 1632,1020,256x28. States: default, hover (violet), pressed (violet fill), disabled (text #6B6458), focused (4px gold border) | Footer says "© 2025" and "Build 2025.08.24", a date before the current one |
| wireframe-6.png | Merchant (WF03) | Header 0,0,1920x104 (title 32,32; currency 1392,20,304x64; close 1776,20,112x64). NPC panel 32,128,440x872; inventory 496,128,888x872 with 4 tabs (192x56, gap 16) and a 3x3 grid of 264x208 items (x 520/800/1080; y 240/464/688); detail 1408,128,480x872; pagination 760,920,360x48; footer 32,1024,1856x40 | Item states: normal, hover, selected, purchased, unavailable (no currency) |
| wireframe-7.png | Skill tree (WF04) | Sidebar 32,128,336x872 (avatar 240x240, tabs 288x56); graph viewport 392,128,1000x872 with a node grid (columns 496 to 1296 at 160 px; rows 256, 400, 544, 688, 832 at 144 px); nodes 64x64 with an 80x80 tap area; connectors 4 px (active #D1A052, inactive #464256); inspector 1416,128,472x872 | Three graph modes (branch, triangle, radial); pan and zoom controls at 100% |
| wireframe-8.png | Settings (WF05) | Categories 320x72 (gap 12), active in gold; main panel 408,128,1088x872 with 1040x72 rows (label x=456, control x=1008); help 1520,128,368x872; buttons RESTAURAR 432,920,240x64, CANCELAR 952,920,240x64, APLICAR 1208,920,264x64 | Pixel scale 2x and unlimited FPS here; the menu-settings concept shows INTEGER scale and FPS 60. Divergence |
| wireframe-9.png | Deckbuilder (WF06), "Defesa Sólida" variant | Sidebar 32,128,376x872 with hero selection (88x88), list of 8 entries 328x56; 4x3 card grid of 204x208 (x 456/700/944/1188; y 264/496/728); inspector 1464,128,424x872 with a large card 240x336 and buttons ADICIONAR 1488,816 and REMOVER 1688,816 (176x64) and SALVAR 1488,904 (376x64) | Card with rarity band, type and cost |
| wireframe-10.png | Team (WF07), "Companhia dos Condenados" | Roster 32,128,320x872 (rows 288x128); showcase 376,128,952x872 with 3 slots 256x464, sprite 224x400 and baseline y=744; formation 208x88; inspector 1352,128,536x872; equipment grid 3x2 of 64x64 and an empty slot 208x128 | Names: Branwen (Warrior), Nyssa (Mage), Cael (Healer). See Contradictions |
| wireframe-11.png | Deckbuilder (WF06), "Tiro Preciso" variant | Sidebar with filters ARQUEIRO, MAGO, CURANDEIRO (88x88); 4x3 grid of 204x208 (40 px horizontal gap, 24 px vertical); large card 240x336 with cost; ADICIONAR (A) and REMOVER (R) | Shows 8 deck entries with x1/x2/x3/x4 |
| wireframe-12.png | Same as wireframe-10 | Byte-for-byte identical | Duplicate |
| wireframe-13.png | Hero details (WF08), ARDEN (Warrior) | Header with name, level 12, currency and gem; character panel 32,128,624x872 (sprite 416x416); attributes 680,128,560x872 with 7 rows of 48 px; abilities 1264,128,624x872 (2x3 grid of 264x112); detail with APRIMORAR 1288,888,576x72; footer 0,1024,1920x56 | Shows values (strength 24, agility 16, intelligence 12, vitality 28) |
| wireframe-hero-menu.png | Hero details, generic sketch | Three columns: character panel (left), attributes (center, 9 values), abilities I to VI (right); footer VOLTAR, EQUIPAMENTOS, ÁRVORE DE HABILIDADES | Placeholder for concept 23 (health 245, mana 80, attack 42, defense 64, crit 12%, speed 18) |

Wireframe patterns: all follow a 1920x1080 canvas, origin at the top left, 104 px header, 32 margin, panels with 24 padding, footers of 40 to 56 px, cards 132x204 (battle) and 204x208 (collection).

## Inferred UI/HUD patterns and palette

Repeated across concepts and wireframes:

- A 104 px header with logo or title on the left, resources in the center, pause or close on the right.
- Combat: heroes on the left with HP and statuses (small icons under the bar), enemies on the right with HP and intent (icon above the enemy), hand at the bottom, energy in a circular disc on the left, deck and discard with counts, END TURN on the right.
- Cards: a cost badge (blue or gold circle) at the top left, name in a band, type (ATTACK, SKILL, DEFENSE), illustration, effect text, rarity by frame color. The selected card rises and gets a glowing frame.
- Hero and shop screens: three columns (34/32/34 %) or (624/560/624 px). Left: large portrait, equipment in a grid. Center: attributes and resistances. Right: abilities and detail.
- Buttons: dark metal rectangles with a border; gold highlight for the main action; red for destructive actions or close; violet for the pressed state.
- Panels: charcoal with ornamented metal borders (gold or stone).
- Main menu coordinates: buttons aligned to the left or right.
- Attribute icons: heart (health), sword (attack), shield (defense), blue drop (mana), star (crit), boot (speed).
- Status icons: skull (poison or bleeding), flame (burn), snowflake (ice), eye (mark or corruption).

Functional colors (consistent):

- Red/crimson: attack, blood, danger.
- Steel blue: defense, block.
- Violet: void magic, corruption, ultimate.
- Acid green: poison, healing (in some cases).
- Gold: emphasis, selected, currency.

Palette divergences: energy changes color across screens (gold, violet, blue flame, green). There is no fixed color for energy.

Color accessibility: the wireframes and concepts pair shape and icon with color for status and rarity; this meets the project rule (information not conveyed by color alone). Not verified whether every rarity card has a shape beyond color.

## zeta-c structure to replicate

Source: a subagent that read the repository via `gh` (read-only, nothing written). Not verified: tsconfig.json, biome.json, bunfig.toml, vite.config.ts, .editorconfig, .markdownlint-cli2.jsonc, full content of docs/agent-workflow.md and docs/git-and-versioning.md.

Summary tree:

```text
AGENTS.md          (rules; CLAUDE.md contains only "@AGENTS.md")
PLAN.md            (source of truth: phases, groups, checkbox tasks, "Ready when")
CHANGELOG.md       (Keep a Changelog, [Unreleased] section at the top)
BUGS.md
package.json       (single version; scripts: check, typecheck, test, lint, lint:md, build, balance, release)
biome.json, bunfig.toml, tsconfig.json, vite.config.ts, .editorconfig
.claude/
  rules/           (karpathy, code-architecture, content-and-assets, git-release-docs, caveman, platform)
  skills/          (≈70: project core + generic game-dev skills)
.githooks/         (pre-commit: biome + typecheck + markdownlint; commit-msg: Conventional Commits)
.github/workflows/ (ci.yml, deploy.yml, release.yml, dependabot.yml)
docs/              (agent-workflow, architecture, balancing, decisions, git-and-versioning, quality-assurance, release-checklist, visual, audio, ...; README.md is the index)
scripts/           (balance.ts, sim.ts, smoke.ts, qa*.ts, release.ts, build-*.ts, lib/)
src/
  logic/           (pure core: rng, save, run, score, ai/, ... ; legalActions(state, seat) and apply(state, action, rng))
  data/            (all balancing numbers)
  i18n/            (en, pt-BR)
  config/          (palette.ts, constants, ui)
  scenes/          (one scene per screen)
  ui/              (components)
  core/            (platform layer)
  view/            (presentation)
tests/             (one file per area: <area>.test.ts; describe('<feature> (<PLAN ID>)'))
```

Conventions worth replicating:

- PLAN.md: a vision section, decisions with IDs (D-xx), architecture, rules specification, style bible, tests and gates, git and release, then phases. Format `## FASE N — Name (version)`, groups `### PA1 — Name · version`, tasks `- [x] ID` with sub-items and a `**Pronto quando:**` (Ready when) line as the acceptance criterion. Mark `[x]` when done.
- A pure core without Phaser, driven by commands: `legalActions(state, seat)` and `apply(state, action, rng)`. RNG with an injected seed.
- Numbers in `data/`, text in `i18n/` (EN and PT-BR together), colors in `config/palette.ts`.
- Biome and TAB formatting (zeta-c uses TAB 4). In this repo, `biome.json` uses `indentStyle: tab` and `indentWidth: 4` (YAML with 2 spaces).
- Gates: `check`, `typecheck`, `test` on every commit; `build` before a push. `balance` (a bot with a target win band, fixed seeds) and `sim` (headless) are useful for the roguelite. zeta-c has no `ci` script in package.json; the gate is chained. Not verified whether a `ci` exists outside package.json.
- Hooks: `pre-commit` runs biome, typecheck and markdownlint on the staged files; `commit-msg` rejects messages outside Conventional Commits (types feat, fix, docs, test, refactor, perf, chore, build, ci, style, revert; optional scope; `!` accepted). Enabled by the `prepare` script in package.json (`core.hooksPath .githooks`).
- CHANGELOG: entries in bold by scope; every commit updates [Unreleased].
- Version: a single field in package.json; tag and release only on request.
- Exact versions: zeta-c does not follow its own rule (phaser, typescript, vite and @types/bun use ^). Replicate project-alpha's rule (no ^), not zeta-c's package.json.
- Tests: `tests/<area>.test.ts`, `bun test`, fixtures in `tests/fixtures/`.

Do not replicate (specific to zeta-c's game): Truco rules, manilha, vira, Manhas, companions, Championships, NPC names, Truco-specific balance and sim scripts, qa-web, store-shots, the Next.js site, the trailer (Remotion), Steam, Poki, Google Play, itch.io integrations, ElevenLabs and PixelLab specifics, the hybrid visual style (flat.ts, pixel portraits, Rubik), Truco commit scopes.

Rule differences to keep in mind: project-alpha has its own rules for layers, IP and assets (see project-alpha's `.claude/rules/`). Do not copy zeta-c's rules without checking them.

## Contradictions and gaps

### Contradictions between the references and the project rules

1. **Game name**: ChatGPT and all the concepts use DARKEON. The repository inherited vocabulary from a previous project ("Ashen Vanguard"), already removed from the rules and skills. The final name is decided in task 2.
2. **Resolution and scale**: ChatGPT proposes 1920x1080 with 960x540 production and 2x scale. The inherited rules fixed a 480x270 base; today `assets.md` delegates resolution and sizes to the Art Bible. Decision in task 2.
3. **Hand size**: ChatGPT talks about six cards; batle-1 shows 5 cards (Mão 5/5), batle-2 shows 5 in a fan. Other screens show 6.
4. **Hero names**: ChatGPT and hero-menu use Dreadguard, Blood Huntress, Void Inquisitor. batle-1 uses Valgrin, Morzeth, Kaelis. wireframe-10 uses Branwen, Nyssa, Cael. wireframe-13 uses Arden (Warrior). batle-4 uses PT names (Inquisidor do Vazio, Caçadora de Sangue).
5. **Class names**: ChatGPT uses Guerreiro, Mago, Curandeiro, Artilharia, Arqueiro. The grimoire and the mastery tree use Guardião, Caçadora, Inquisidor. Wireframe-11 uses Arqueiro, Mago, Curandeiro. There is no single roster.
6. **Battle duration**: the concepts show "ROUND XX/10" in a normal battle. The inherited 5-to-8-round rule was removed; the target duration will be defined in the GDD.
7. **Hit chance**: the project rule says "hits are guaranteed; there is no hit percentage". The concepts show "25% ESQUIVA" (DODGE) (batle-5 and hero-archer) and "Tem 20% de chance de aplicar a condição" (has a 20% chance to apply the condition) (wireframe-11, Tiro Preciso). Dodge is a percentage chance to avoid a hit. Conflict to decide.
8. **Turn order**: the project rule requires an always-visible turn-order queue. No concept shows an explicit queue; batle-2 has a node trail at the top, which is a map, not a turn order. Absent.
9. **Mana vs. energy**: ChatGPT asks for a decision on mana (RPG) vs. energy (cards). Heroes show a mana bar next to HP (batle-3, batle-5), and abilities have an energy cost and a cooldown in turns. Overlapping systems, which ChatGPT itself flags as a risk.
10. **Energy color**: gold, violet, blue flame and green change from screen to screen.
11. **Elite**: ChatGPT says a 20% elite encounter chance, as a system rule. The concept examples use rounds 5 and 7 and an elite shown on screen. Consistent, but the labels on the screens are not uniform.
12. **Pixel scale and FPS**: menu-settings shows INTEGER scale and FPS 60. wireframe-8 shows 2x scale and unlimited FPS.
13. **Duplicates**: wireframe-10 and wireframe-12 are identical. The folder has 13 files with 12 distinct screens.
14. **Concept count**: ChatGPT talks about 19 prompts and later about 27 (23 to 27 are heroes; 20, 21 and 22 are settings, deckbuilding and team, but prompts 20 to 22 do not appear in the text, only as references in the wireframes table). There are 24 concept PNGs, not 27.
15. **Hero wireframes**: ChatGPT lists 5 classes with 6 abilities, but wireframe-hero-menu uses generic numbers and I-to-VI labels.
16. **Year in the footer**: wireframe-5 says "© 2025". Today's date is 2026.

### IP risks (the project's ip-and-tone rule)

- The ChatGPT text cites Warhammer 40,000, Space Marine 2, Darkest Dungeon, Slay the Spire 2, DOOM The Dark Ages, Alien/Predator, Blasphemous, Dungeon Rushers and "Jake Thayne / Primal Hunter" (in the archer's reference link) as inspirations. None of these may go into any project text, file name, prompt or asset. Use them only as internal references, without copying terms.
- The boss subtitle "IMPERADOR DO VAZIO" (EMPEROR OF THE VOID) (batle-3) and "demon-emperor" in the boss prompt: this matches the rule against an emperor as a corpse-god on a throne. Review.
- The "Inquisidor" class (Void Inquisitor, skill-tree-1 and 2): the rule prohibits "Inquisition" as an organization. As a class name it is probably allowed, but it needs review.
- A throne of skulls, a red moon, a throne room and a cathedral altar: generic tropes, allowed.
- ChatGPT's prompts ask for "No recognizable copyrighted iconography" and "Original universe": good, but not a guarantee.

### Gaps (not verified or absent)

- Unit death: the project rule says it never crosses runs and always leaves something behind. Nothing in ChatGPT or the concepts addresses it.
- Permanent power ceiling (GDD section 8): not read here (out of scope). The radial tree and fragments must be checked against the ceiling.
- Map structure (nodes, node types, branches): it appears only as a linear trail of skulls (batle-2, 6, 7). There is no branching map.
- Shops and events: nothing about price per round, reroll or stock quantities beyond the screens.
- Cards: there is no complete table of costs and effects; only examples.
- Balancing: the HP and damage numbers in the concepts are examples; ChatGPT itself warns about this.
- Enemies: there is no complete list with intents, nor a creature family defined in text (only per-concept descriptions).
- Save and run continuity: not addressed.
- There is no concept or wireframe for a death/defeat screen, act victory, or battle reward.
- There is no class-selection screen before the run, nor a map screen.
- Audio, touch input and accessibility: they appear only in settings (the ACCESSIBILITY category has no content).
- Fonts: no specific font is defined; the text says "readable pixel" and "gothic only for titles", but the screens show serifs in the body text.
- Palette: the ChatGPT hex values and the concept "estimates" are not measured (the automatic sampling gave a rough result dominated by black).
