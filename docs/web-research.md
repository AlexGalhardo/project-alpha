# Web research: roguelite + deckbuilding + grimdark RPG in pixel art (Phaser 4, web)

> Consolidated research. Collection date: 2026-10-26. Every relevant claim carries an inline URL.
> "not verified" = I could not confirm it in a primary source during this collection. Nothing here was invented.
> StS values refer to Slay the Spire 1 unless marked "StS2".

---

## 1. Executive summary

- Slay the Spire 1 (StS) defines the turn core: **3 energy, draw 5 cards per turn**, the hand is discarded at the end of the turn, and an exhaust pile ([StS2 Mechanics](https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Mechanics), [Exhaust](https://slaythespire.wiki.gg/wiki/Exhaust)).
- Darkest Dungeon (DD1) defines the dark RPG layer: side view with **ranks** (position limits abilities), stress 0–200 with a resolve check at 100 and a heart attack at 200 ([Wikipedia DD](https://en.wikipedia.org/wiki/Darkest_Dungeon), [Stress](https://darkestdungeon.wiki.gg/wiki/Stress)).
- Darkest Dungeon II (DD2) **removed accuracy: hits are guaranteed** (except specific effects), stress became a 0–10 scale, and it added relationships between heroes and the stagecoach/road ([DD2 wiki](https://darkestdungeon.wiki.gg/wiki/Darkest_Dungeon_II), [Stress DD2](https://darkestdungeon.wiki.gg/wiki/Stress_(Darkest_Dungeon_II))). This validates our "hits are guaranteed" invariant.
- StS economy is well documented: normal combat 10–20 gold, elite 25–35, boss 95–105; card removal 75 + 25 per use ([Gold](https://slaythespire.wiki.gg/wiki/Gold), [Merchant](https://slaythespire.wiki.gg/wiki/Merchant)).
- MegaCrit's balancing was driven by metrics from early on (GDC 2019 talk) ([GDC Vault](https://www.gdcvault.com/play/1025731/-Slay-the-Spire-Metrics), [Game Developer](https://www.gamedeveloper.com/design/learn-i-slay-the-spire-i-s-metrics-driven-approach-to-game-balancing-at-gdc-2019)).
- StS2 has been in **Early Access since 5 Mar 2026** (Steam), Godot engine, weekly/fortnightly beta updates until Aug–Sep 2026 ([Steam appdetails](https://store.steampowered.com/app/2868840/Slay_the_Spire_2/), [Wikipedia StS](https://en.wikipedia.org/wiki/Slay_the_Spire)).
- Phaser 4 is stable: **v4.0.0 on 2026-04-10**, latest stable **v4.2.1 on 2026-07-09** ([GitHub releases API](https://api.github.com/repos/phaserjs/phaser/releases)).
- For pixel art in Phaser: `pixelArt: true` = `antialias: false` + `roundPixels: true` ([RenderConfig](https://docs.phaser.io/api-documentation/typedef/types-core#renderconfig)); integer scaling is our responsibility (compute `zoom`).
- ElevenLabs: SFX up to 30 s per generation, seamless loops, 40 credits/s when the duration is fixed; Music API limited to 5 min ([SFX docs](https://elevenlabs.io/docs/overview/capabilities/sound-effects), [API pricing](https://elevenlabs.io/pricing/api)).
- IP risk: GW applies a restrictive IP policy (prohibits fan films/animations without a license since 2021, per secondary coverage); avoid any term or symbol listed in the project rules.

---

## 2. Camera and framing

| Game | Framing | Facts | Source |
|---|---|---|---|
| DD1 | 2D side view, same plane for exploration and combat | Side view chosen to reduce assets; the same view was reused for exploration | [Wikipedia DD – Development](https://en.wikipedia.org/wiki/Darkest_Dungeon) |
| DD1 | Ranks (rows): allies on the left, enemies on the right | Ranks inspired by *The Bard's Tale*; front = strong melee and more damage taken; back = protected and weaker attacks; enemies can pull/push heroes between positions | [Wikipedia DD](https://en.wikipedia.org/wiki/Darkest_Dungeon) |
| DD1 | Number of ranks | 4 per side (ranks 1–4): the Arbalest "is only effective from the 3rd and 4th ranks"; the Hag occupies ranks 3 and 4 and the cauldron ranks 1 and 2. A 4-hero party in DD1 is inferred (1 hero per rank); explicit only in DD2 | [Heroes (DD)](https://darkestdungeon.wiki.gg/wiki/Heroes_(Darkest_Dungeon)), [Hag](https://darkestdungeon.wiki.gg/wiki/Hag) |
| DD2 | Side view with stylized 3D models | A party never exceeds 4 heroes | [DD2 wiki – Combat](https://darkestdungeon.wiki.gg/wiki/Darkest_Dungeon_II) |
| StS | Side view: player on the left, enemies on the right, hand of cards at the bottom | Layout described by the wiki itself (piles, exhaust icon "on the right side of the screen") | [StS2 Mechanics – Piles](https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Mechanics) |

Implications:

- 2D side view is the cheapest framing for pixel art: one sprite per unit facing one side (mirroring for the enemy side is optional).
- Ranks turn position into a decision without a grid — compatible with touch (few, large targets).
- A card hand at the bottom plus units above requires reserving ~35–40% of the height for the hand (our own layout estimate, not from a source; at the chosen 640×360 base the action band is 138 px, see `docs/brainstorming.md` B28).
- Enemies on the right with intent above the head (StS) is a genre convention; keep it.

---

## 3. Visuals and art direction

### 3.1 References

| Game | Direction | Source |
|---|---|---|
| DD1 | Art by Chris Bourassa; **woodcut and illuminated manuscript** look, influenced by Albrecht Dürer, Mike Mignola, Guy Davis, Chris Bachalo; in-house engine | [Wikipedia DD – Influences](https://en.wikipedia.org/wiki/Darkest_Dungeon) |
| DD2 | Move to **3D (Unity)** keeping the style; declared goal: "emulate the marketing art I drew for DD1" (Bourassa) | [NME](https://www.nme.com/features/darkest-dungeon-2-how-redhook-studios-are-reinventing-their-roguelike-classic-3085987), [Epic interview](https://store.epicgames.com/en-US/news/darkest-dungeon-2-early-access-interview), [TheGamer](https://www.thegamer.com/darkest-dungeon-2-3d-combat/) (broken link as of 2026-10-26) |
| DD2 | Reason for 3D: an audience "desensitized" to the 2D art already consumed; use 3D only where it reinforces the style | [Gamebanshee (PC Gamer reprint)](https://www.gamebanshee.com/3hqup) |
| StS1 | Hand-drawn art, libGDX engine (Java) | [Wikipedia StS](https://en.wikipedia.org/wiki/Slay_the_Spire) |
| StS2 | Godot engine (migration from Unity after the runtime-fee controversy) | [Wikipedia StS – Sequel](https://en.wikipedia.org/wiki/Slay_the_Spire), [Game Developer](https://gamedeveloper.com/business/slay-the-spire-devs-followed-through-on-abandoning-unity) |

### 3.2 Pixel art considerations (base decided: 640×360, `docs/brainstorming.md` B28)

- 640×360 × 2 = 1280×720; × 3 = 1920×1080; × 4 = 2560×1440 — all integers (arithmetic). The alternative studied, 480×270, gives × 4 = 1920×1080 and × 2 = 960×540.
- Phaser `pixelArt: true` enables nearest-neighbor and rounds positions ([RenderConfig](https://docs.phaser.io/api-documentation/typedef/types-core#renderconfig)).
- Phaser 4 (rc.3) added a per-object `vertexRoundMode` (`off`, `safe`, `safeAuto` default, `full`, `fullAuto`) — `full` can make sprites "shake" when rotated ([releases](https://github.com/phaserjs/phaser/releases)).
- Phaser 4 added a `Blocky` filter (pixelates while preserving the palette) — useful for transitions/effects, not for base art ([releases](https://github.com/phaserjs/phaser/releases)).
- `smoothPixelArt` (WebGL) keeps pixels blocky but smooths edges between pixels when scaled — **do not use** if the project rule is "no antialiasing" ([RenderConfig](https://docs.phaser.io/api-documentation/typedef/types-core#renderconfig)).
- Legibility: silhouette per class; DD1 solves position reading through ranks and pose (Wikipedia DD). For nodes: selective outline + 1 light, per the project's asset rules.
- Rotation/fractional scale breaks pixel art; avoid non-integer `scale` tweens on unit sprites (general practice; direct consequence of `roundPixels`/nearest).

---

## 4. Audio

| Point | Fact | Source |
|---|---|---|
| DD1 narrator | Wayne June, sardonic narrator; Bourassa knew him through his Lovecraft readings; the voice was considered a "necessary element" after the trailer | [Wikipedia DD](https://en.wikipedia.org/wiki/Darkest_Dungeon) |
| DD2 narrator | Wayne June also narrates DD2 (The Academic); died in 2025, Red Hook tribute on 30 Jan | [DD wiki – Wayne June](https://darkestdungeon.wiki.gg/wiki/Wayne_June) |
| Hub music | The Hamlet's music is called "The Hamlet" | [DD wiki – Hamlet](https://darkestdungeon.wiki.gg/wiki/Hamlet) |
| Dynamic music DD/StS | Layers by intensity — **not verified** in this collection | — |
| DD2 bark/stress | Negative banter increases with stress (0–3 no negative banter, 4–6 some) and generates more stress | [Stress DD2](https://darkestdungeon.wiki.gg/wiki/Stress_(Darkest_Dungeon_II)) |

Implications (project rule: no voice acting):

- Replace the narrator with **short text + a sound sting** (bell, low string) on critical events (meltdown, death, critical hit).
- SFX as the primary feedback channel: impact, block, card played, card exhausted, stress gained.
- Music: exploration loop, combat loop, boss variation; ElevenLabs Music generates up to 5 min per track ([API pricing](https://elevenlabs.io/pricing/api)).
- Web: audio only after a user gesture (see section 12).

---

## 5. UI/HUD and UX

### 5.1 Intent and predictability (StS)

- Enemies show **intent** through an icon: attack (the weapon icon changes with the damage), defense (Block), buff, attack+buff, attack+defense, debuff, unknown, etc. ([Intent](https://slaythespire.wiki.gg/wiki/Intent)).
- Some enemies use the buff icon for **healing** (Mystic, Time Eater, Darklings) — a documented ambiguity ([Intent](https://slaythespire.wiki.gg/wiki/Intent)). Lesson: one icon per effect, never reused.
- The draw pile can be viewed, but **sorted by rarity, not by the real order** ([StS2 Mechanics – Piles](https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Mechanics)). Lesson: transparency without removing the uncertainty of shuffling.
- The exhaust pile has an icon with a counter; clicking shows the cards ([StS2 Mechanics](https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Mechanics)).

### 5.2 Turn order and position (DD)

- DD2 keeps **turn order, speed, HP and status** as tactical dimensions ([DD2 wiki](https://darkestdungeon.wiki.gg/wiki/Darkest_Dungeon_II)).
- Ranks require highlighting which positions each ability reaches (DD convention; exact layout **not verified**).

### 5.3 Cards and keywords

- Keywords with tooltips: *Exhaust* ("Removed until the end of combat"), *Ethereal*, *Unplayable* — the wiki shows the same structure: name + short phrase ([Exhaust](https://slaythespire.wiki.gg/wiki/Exhaust), [Ascension – Ascender's Bane](https://slaythespire.wiki.gg/wiki/Ascension)).
- Frame rarity: the game only has frame colors for common, uncommon, rare and boss; shop/event relics use the rare frame ([Relics – Notes](https://slaythespire.wiki.gg/wiki/Relics)). Lesson: few rarity colors, reinforced by shape.

### 5.4 Touch

- The project's requirements (no hover, response ≤ 0.1 s) are not covered by external sources; StS2 has minimum PC requirements (Windows 10 64-bit, dual-core 2 GHz, 4 GB RAM) and is not mobile on Steam ([Steam appdetails](https://store.steampowered.com/app/2868840/Slay_the_Spire_2/)).
- Suggested pattern (ours): tap 1 = select and show a preview; tap 2 on the target = confirm; long-press = tooltip. Replaces hover.

---

## 6. Category/genre and market

| Item | Data | Source |
|---|---|---|
| StS1 release | 23 Jan 2019 (1.0), Mega Crit | [Steam appdetails 646570](https://store.steampowered.com/app/646570/) |
| StS1 EA | EA in Nov 2017 sold ~2,000 copies in the first weeks; took off after a Chinese streamer; 2nd best-seller on Steam in the week to 21 Jan 2018 | [Wikipedia StS – Reception](https://en.wikipedia.org/wiki/Slay_the_Spire) |
| StS1 sales | >1 million by Jun 2018; 1.5 million by Mar 2019 | [Wikipedia StS](https://en.wikipedia.org/wiki/Slay_the_Spire) |
| StS1 role in the genre | "Considered the game that popularized" roguelike deckbuilders — Wikipedia marks it *citation needed* → **not verified** | [Wikipedia StS](https://en.wikipedia.org/wiki/Slay_the_Spire) |
| StS2 | EA since **5 Mar 2026**, Mega Crit, genres Indie/Strategy/Early Access, €22.99 (regional price seen) | [Steam 2868840](https://store.steampowered.com/app/2868840/Slay_the_Spire_2/) |
| StS2 content | Ironclad, Silent, Defect + Necrobinder and Regent; co-op up to 4 players; Godot | [Wikipedia StS – Sequel](https://en.wikipedia.org/wiki/Slay_the_Spire) |
| StS2 status | Beta patch v0.111.0 on 14 Aug 2026; Neowsletter Sep/2026: team returns from a pause, works on an alternative Act 2, a new character, modes | [Steam news API](https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=2868840), [PCGamesN](https://www.pcgamesn.com/slay-the-spire-2/neowsletter-september-2026) |
| StS2 and Godot | Mega Crit is a Platinum sponsor of Godot (~€36k/year) since Apr 2026 | [GamingOnLinux](https://gamingonlinux.com/2026/04/godot-gets-a-funding-boost-from-slay-the-spire-2-devs-mega-crit) |
| DD1 | Released 19 Jan 2016, Red Hook; "gothic roguelike turn-based RPG about the psychological stresses of adventuring"; Kickstarter Feb 2014: target US$ 75k met in 2 days, >US$ 313k from ~10k backers | [Steam DD](https://store.steampowered.com/app/262060/Darkest_Dungeon/), [Wikipedia DD](https://en.wikipedia.org/wiki/Darkest_Dungeon) |
| DD2 | 1.0 on 8 May 2023 (Steam + Epic), US$ 39.99; "roguelike road trip of the damned"; Kingdoms mode with 3 modules | [Steam DD2](https://store.steampowered.com/app/1940340/Darkest_Dungeon_II/), [Game Developer PR](https://www.gamedeveloper.com/press-release/darkest-dungeon-ii-exits-early-access-launches-into-10-on-steam-epic-game-store-today) |
| Others in the genre (Monster Train, Balatro, Inscryption, etc.) | Market figures **not verified** in this collection | — |

Reading: the "deckbuilder + party with position + stress" niche (the DD×StS crossover) has no evident leader in the collected sources — **not verified** as a market gap; treat as a hypothesis.

---

## 7. Gameplay and combat loop

### 7.1 Card core (StS)

| Rule | Value | Source |
|---|---|---|
| Energy per turn | 3 | [StS2 Mechanics – Turns](https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Mechanics), [Energy](https://slaythespire.wiki.gg/wiki/Energy) |
| Draw per turn | 5 | same |
| Piles | Draw, Hand, Discard, Exhaust | [StS2 Mechanics – Piles](https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Mechanics) |
| End of turn | Cards without *Retain* go to the discard | same |
| Exhaust | The card goes to the exhaust pile until the end of combat | [Exhaust](https://slaythespire.wiki.gg/wiki/Exhaust) |
| Ethereal | Exhausted if still in hand at the end of the turn | [Ascension](https://slaythespire.wiki.gg/wiki/Ascension) |
| Turns | Player, then enemy group; the turn ends manually | [StS2 Mechanics](https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Mechanics) |
| Hand limit | 10; excess draws stay in the draw pile and excess created cards go to the discard | [Mechanics – Hand Size Limit](https://slaythespire.wiki.gg/wiki/Mechanics) |
| Ironclad starting deck | 5 Strike, 4 Defend, 1 Bash (10 cards) | [Cards](https://slaythespire.wiki.gg/wiki/Cards) |
| Silent starting deck | 5 Strike, 5 Defend, Neutralize, Survivor (12) — last item truncated in the collection | [Cards](https://slaythespire.wiki.gg/wiki/Cards) |
| Starting max HP | Ironclad 80 (75 at A14), Silent 70 (66), Defect 75 (71), Watcher 72 (68) | [Ironclad](https://slaythespire.wiki.gg/wiki/Ironclad), [Silent](https://slaythespire.wiki.gg/wiki/Silent), [Defect](https://slaythespire.wiki.gg/wiki/Defect), [Watcher](https://slaythespire.wiki.gg/wiki/Watcher) |
| HP cap (StS2) | 999,999,999 | [StS2 Mechanics – Health](https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Mechanics) |

### 7.2 Run structure (StS)

| Item | Value | Source |
|---|---|---|
| Acts | 3 + optional Act 4 (3 keys) with the final boss | [Wikipedia StS – Gameplay](https://en.wikipedia.org/wiki/Slay_the_Spire) |
| Node types | 7: Monster, Elite, Rest, Unknown, Treasure, Merchant, Boss | [Map Locations](https://slaythespire.wiki.gg/wiki/Map_Locations) |
| Before the boss | The last node before the boss in Acts 1–3 is always a rest | [Rest Sites](https://slaythespire.wiki.gg/wiki/Rest_Site) |
| Rest | Heal 30% of max HP **or** upgrade 1 card (Smith) | [Rest Sites](https://slaythespire.wiki.gg/wiki/Rest_Site) |
| Floors per act | 17; up to 6 nodes per floor; each room has 1–3 entry and exit paths. Floor 1 = easy combats; floor 9 = treasure; floor 15 = rest; floor 16 = boss (page marked "under construction" by the wiki) | [Map Generation](https://slaythespire.wiki.gg/wiki/Map_Generation) |
| Boss of Acts 1–2 | 95–105 gold, choice of 3 rare cards; the next floor has a chest with a choice of 3 boss relics | [Map Locations](https://slaythespire.wiki.gg/wiki/Map_Locations) |

### 7.3 DD1: position, stress, affliction

| Rule | Value | Source |
|---|---|---|
| Stress bar | 0–200; at 100 a resolve check happens | [Stress](https://darkestdungeon.wiki.gg/wiki/Stress) |
| Virtue vs. affliction | Base virtue chance 25%, decided before the history | [Affliction](https://darkestdungeon.wiki.gg/wiki/Affliction) |
| Virtue | Resets stress to 40–45 | [Stress](https://darkestdungeon.wiki.gg/wiki/Stress) |
| 200 stress | Heart attack → Death's Door, or death if already there | [Stress](https://darkestdungeon.wiki.gg/wiki/Stress) |
| Affliction | −15% on several resistances, −10% max HP; forced actions ("act-outs"), e.g. Fearful 31.5% (10.5% stress to the group / retreat / pass the turn) | [Affliction](https://darkestdungeon.wiki.gg/wiki/Affliction) |
| Affliction barks | 6 stress to the group or to one ally | [Affliction](https://darkestdungeon.wiki.gg/wiki/Affliction) |
| History | Each affliction has weight 4; +2 each time it is gained (personality emerges) | [Affliction](https://darkestdungeon.wiki.gg/wiki/Affliction) |
| Ranks | Abilities require a rank; movement is strategy | [Wikipedia DD](https://en.wikipedia.org/wiki/Darkest_Dungeon) |

### 7.4 DD2: stress 0–10, relationships, road

| Rule | Value | Source |
|---|---|---|
| Stress | 0–10; 0–3 no negative banter; 4–6 some | [Stress DD2](https://darkestdungeon.wiki.gg/wiki/Stress_(Darkest_Dungeon_II)) |
| At 10 | 80% Meltdown (HP goes to 10%, loses affinity) / 20% Resolute (heals 50%, buffs) | [Stress DD2](https://darkestdungeon.wiki.gg/wiki/Stress_(Darkest_Dungeon_II)) via [search](https://darkestdungeon.wiki.gg/wiki/Meltdown) |
| Accuracy | **No accuracy**; hits are guaranteed except for specific effects | [DD2 wiki – Combat](https://darkestdungeon.wiki.gg/wiki/Darkest_Dungeon_II) |
| Abilities | Depend on skills (Mastery Trainer at each Inn), not on weapon/armor | same |
| Party | Chosen at the Crossroads; maximum 4 | same |
| Relationships | The same decision at nodes gives +1 affinity; Inn items change affinity (e.g. 67% positive / 33% negative) | [Relationships](https://darkestdungeon.wiki.gg/wiki/Relationships) |
| Stagecoach | Wheels and Armor lose level on certain roads; repair 8 Baubles each; without them, an ambush | [Stagecoach DD2](https://darkestdungeon.wiki.gg/wiki/Stagecoach) |
| Kingdoms | Regions of 40 leagues / 3 nodes | [Kingdoms](https://darkestdungeon.wiki.gg/wiki/Kingdoms) |

---

## 8. Progression

### 8.1 Inside the run vs. meta

| Game | Inside the run | Meta | Source |
|---|---|---|---|
| StS1 | Cards, relics, potions, upgrades, gold | Points per run unlock characters, cards and relics; 20 Ascension levels | [Wikipedia StS](https://en.wikipedia.org/wiki/Slay_the_Spire) |
| DD1 | Provisions, loot, light, stress | Hamlet with 8 buildings (Abbey, Blacksmith, Guild, Nomad Wagon, Sanitarium, Stage Coach, Survivalist, Tavern) upgraded with heirlooms | [Hamlet](https://darkestdungeon.wiki.gg/wiki/Hamlet) |
| DD1 heirlooms | Heirlooms (meta) | Bust, Portrait, Deed, Crest; dungeon piles: Crest 12, Bust/Deed 6, Portrait 3 | [Heirlooms](https://darkestdungeon.wiki.gg/wiki/Heirlooms) |
| DD2 | Items, relationships, stagecoach, skills per Inn | **Altar of Hope** paid with **Candles of Hope** (earned per expedition + Hero Goals + Region Goals); unlocks heroes and stagecoach upgrades | [Altar of Hope](https://darkestdungeon.wiki.gg/wiki/Altar_of_Hope), [DD2 wiki](https://darkestdungeon.wiki.gg/wiki/Darkest_Dungeon_II) |

### 8.2 Ascension (StS1)

- Unlock: beat the Act 3 boss with the character; each win unlocks the next level ([Ascension](https://slaythespire.wiki.gg/wiki/Ascension)).

| Level | Effect | Source |
|---|---|---|
| A1 | ~60% more elites | [Ascension](https://slaythespire.wiki.gg/wiki/Ascension) |
| A2/A3/A4 | Normal / elite / boss enemies deal more damage | same |
| A5 | Post-boss healing 75% of the HP lost (previously 100%) | same |
| A6 | Start the run with −10% HP | same |
| A7/A8/A9 | Normal / elite / boss enemies with more HP and sometimes more Block | same |
| A10 | Start with the Ascender's Bane curse (cannot be removed) | same |
| A11 | One fewer potion slot | same |
| A12 | Upgraded cards appear with half the frequency in Acts 2 and 3 | same |
| A13 | Bosses give 25% less gold (71–79) | same, [Gold](https://slaythespire.wiki.gg/wiki/Gold) |
| A14 | Max HP −5 (Ironclad) / −4 (others) | same |
| A15 | Events with worse results | same |
| A16 | Shop 10% more expensive | same, [Merchant](https://slaythespire.wiki.gg/wiki/Merchant) |
| A17/A18/A19 | Normal / elite / boss enemies with harder movesets | same |
| A20 | Two bosses at the end of Act 3 | same |

- The modifiers are cumulative and each character has its own ladder ([Ascension](https://slaythespire.wiki.gg/wiki/Ascension)). In StS2 the ladder has **10 levels** ([StS2 Mechanics – Ascension](https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Mechanics)).

### 8.3 Dam mode (DD2)

- Optional modifiers: a retreat button (+2 Loathing, +2 stress), selling to the Hoarder, a mountain at every Inn, more battle modifiers, Acts 1/2 extended ([Altar of Hope – The Dam](https://darkestdungeon.wiki.gg/wiki/Altar_of_Hope)). It offers "à la carte difficulty" instead of a single ladder.

---

## 9. Economy

### 9.1 StS1 — gold

| Gold source | Value | Source |
|---|---|---|
| Normal combat | 10–20 | [Gold](https://slaythespire.wiki.gg/wiki/Gold) |
| Elite | 25–35 | same |
| Boss | 95–105 (71–79 at A13+) | same |
| Starting gold | 99 (StS1 and StS2) | [Gold](https://slaythespire.wiki.gg/wiki/Gold), [StS2 Mechanics – Gold](https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Mechanics) |

### 9.2 StS1 — shop (Merchant)

| Item | Price (A16+) | Source |
|---|---|---|
| 5 colored cards (2 attacks, 2 skills, 1 power; 1 at −50%) | Common 45–55 (50–61); Uncommon 68–83 (75–91); Rare 135–165 (149–182) | [Merchant](https://slaythespire.wiki.gg/wiki/Merchant) |
| 2 colorless (1 uncommon, 1 rare; +20%) | 81–99 (89–109); 162–198 (178–218) | same |
| 3 relics (the right slot is always a shop relic) | Shop/Common 143–158 (157–173); weights 50/33/17% common/uncommon/rare | same |
| Card removal | 75, +25 per use; 1 per shop; Smiling Mask fixed at 50 | [Merchant](https://slaythespire.wiki.gg/wiki/Merchant), [Gold](https://slaythespire.wiki.gg/wiki/Gold) |

### 9.3 StS1 — card and relic rewards

| Context | Rare / Uncommon / Common | Source |
|---|---|---|
| Normal combat (base, before offset) | 3% / 37% / 60% | [Cards – Card Distribution](https://slaythespire.wiki.gg/wiki/Cards) |
| Shop (base) | 9% / 37% / 54% | same |
| Relics (most sources) | Common 50% / Uncommon 33% / Rare 17% | [Relics – Rarity](https://slaythespire.wiki.gg/wiki/Relics) |
| Small / medium / large chest | C 75/35/0; U 25/50/75; R 0/15/25 | same |
| Cards offered per reward | 3 (normal and elite; elites have a better chance of rare/uncommon); the boss of Acts 1–2 offers 3 rares | [Map Locations](https://slaythespire.wiki.gg/wiki/Map_Locations) |
| Shop (composition) | 5 character cards, 2 colorless, 3 relics, 3 potions and 1 removal per shop | same |

Note: there is a rarity "offset" (pity) that is only affected by card rewards, not by the shop ([Cards](https://slaythespire.wiki.gg/wiki/Cards)).

### 9.4 DD1 — gold and sinks

- Gold comes from loot, gems sold at the end, and expedition rewards; trinket sales ([DD Gold](https://darkestdungeon.wiki.gg/wiki/Gold)).
- Sinks: stress (Abbey, Tavern), provisions, Blacksmith, Guild, Survivalist, Sanitarium, Nomad Wagon ([DD Gold](https://darkestdungeon.wiki.gg/wiki/Gold)).
- Radiant: idle stress in town 5 → 10; returned provisions yield a bit more ([Game Modes](https://darkestdungeon.wiki.gg/wiki/Game_Modes)).

### 9.5 DD1 — trinkets

- A table by rarity and DLC exists (e.g. Ancestral 9 base, Trophy 9 base + 3 CC, Crimson Court 34+2), but the wiki warns it does not include *The Fire's Edge* ([Trinkets](https://darkestdungeon.wiki.gg/wiki/Trinkets)). Consolidated total **not verified**.

---

## 10. Balancing

| Point | Fact | Source |
|---|---|---|
| Talk | "'Slay the Spire': Metrics Driven Design and Balance", GDC 2019, Anthony Giovannetti | [GDC Vault](https://www.gdcvault.com/play/1025731/-Slay-the-Spire-Metrics), [GDC news](https://gdconf.com/news/learn-slay-spires-successful-metrics-driven-approach-game-balancing-gdc-2019) (broken link as of 2026-10-26) |
| Scope | Focus on metrics from early on and throughout EA; use of community feedback while keeping feel and difficulty "over a year of changes" | [Game Developer](https://www.gamedeveloper.com/design/learn-i-slay-the-spire-i-s-metrics-driven-approach-to-game-balancing-at-gdc-2019) |
| Method | Many playtesters + metrics reported by the client to decide which cards had good design and which to remove; testers came from the *Netrunner* community | [Wikipedia StS – Development](https://en.wikipedia.org/wiki/Slay_the_Spire) |
| Tool | Homemade analytics tool recording each run; "players pick this card X% of the time" (Edge interview) | [PressReader/Edge](https://www.pressreader.com/australia/edge/20190620/282351156287993) — content via search summary, **not read in full** |
| Slack channel + metrics server | Mentioned only in an AI-generated podcast summary → **not verified** | [Podwise](https://podwise.ai/episodes/1459444) |
| StS2 today | Experimental beta patches, including reverting reworks (Jul 2026) | [PCGamesN](https://www.pcgamesn.com/slay-the-spire-2/patch-notes-july-31-2026) |
| Ascension | Cumulative 20-level ladder (section 8.2) | [Ascension](https://slaythespire.wiki.gg/wiki/Ascension) |
| DD1 modes | Darkest (normal); Radiant (less grind, same stats, permadeath); Stygian: +20% enemy HP, +3% crit, more stress, the light drains 7 per step instead of 6, defeat at **86 weeks or 12 deaths** (save erased); Bloodmoon: 100 weeks / 16 deaths | [Game Modes](https://darkestdungeon.wiki.gg/wiki/Game_Modes) (Stygian % via search summary of the same page) |
| DD2 | Dam: difficulty through modifiers; Kingdoms uses Escalation tiers | [Altar of Hope](https://darkestdungeon.wiki.gg/wiki/Altar_of_Hope), [Kingdoms](https://darkestdungeon.wiki.gg/wiki/Kingdoms) |

---

## 11. Fun and heuristics

| Heuristic | Evidence in the games | Source |
|---|---|---|
| Tension and relief | A mandatory rest before each boss (Acts 1–3) | [Rest Sites](https://slaythespire.wiki.gg/wiki/Rest_Site) |
| Meaningful choice | Rest: heal 30% **or** upgrade a card — a direct trade-off | same |
| Risk and reward | Elite 25–35 gold vs. normal 10–20, plus a relic; A1 increases elites by ~60% | [Gold](https://slaythespire.wiki.gg/wiki/Gold), [Ascension](https://slaythespire.wiki.gg/wiki/Ascension) |
| Deck dilution | Taking a card is not always good; removing one costs gold | [Wikipedia StS – Gameplay](https://en.wikipedia.org/wiki/Slay_the_Spire) |
| Visibility | Enemy intents are visible | [Intent](https://slaythespire.wiki.gg/wiki/Intent) |
| Controlled uncertainty | Draw pile visible, order hidden | [StS2 Mechanics](https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Mechanics) |
| Emotional snowball | Negative banter generates stress and reduces affinity ("snowballing") | [Stress DD2](https://darkestdungeon.wiki.gg/wiki/Stress_(Darkest_Dungeon_II)) |
| Loss with legacy | Afflictions shape personality through the history of weights | [Affliction](https://darkestdungeon.wiki.gg/wiki/Affliction) |
| Run length | DD2 Kingdoms shortened regions to 3 nodes; DD1 Radiant cut the grind — both signal that the audience asked for shorter sessions | [Kingdoms](https://darkestdungeon.wiki.gg/wiki/Kingdoms), [Game Modes](https://darkestdungeon.wiki.gg/wiki/Game_Modes) |
| Typical StS run length in minutes | **not verified** | — |
| Same seed for everyone | StS daily challenge with a fixed seed | [Wikipedia StS](https://en.wikipedia.org/wiki/Slay_the_Spire) |

---

## 12. Technical: Phaser 4 web

### 12.1 Version status

| Version | Date | Pre-release | Source |
|---|---|---|---|
| v4.2.1 | 2026-07-09 | no | [GitHub API](https://api.github.com/repos/phaserjs/phaser/releases) |
| v4.2.0 | 2026-06-19 | no | same |
| v4.1.0 | 2026-04-30 | no | same |
| v4.0.0 | 2026-04-10 | no — "rebuilt the WebGL renderer from scratch, keeping the API" | [v4.0.0](https://github.com/phaserjs/phaser/releases/tag/v4.0.0) |
| v4.0.0-rc.7 | 2026-03-25 | yes | [GitHub API](https://api.github.com/repos/phaserjs/phaser/releases) |

→ Pin `"phaser": "4.2.1"` (no `^`), per the project rule. The official docs at docs.phaser.io showed "v4.1.0" at collection time ([RenderConfig](https://docs.phaser.io/api-documentation/typedef/types-core#renderconfig)).

### 12.2 Pixel art config

| Option | Default | Effect | Source |
|---|---|---|---|
| `pixelArt` | false | Sets `antialias: false` and `roundPixels: true`; "best setting for pixel art" | [RenderConfig](https://docs.phaser.io/api-documentation/typedef/types-core#renderconfig) |
| `antialias` | true | false = nearest-neighbor; also turns off canvas AA when scaled | same |
| `roundPixels` | false | Draws texture objects only at integer positions | same |
| `smoothPixelArt` | false | Blocky pixels with smoothed edges (WebGL) — avoid | same |
| `vertexRoundMode` | `safeAuto` | Per-object rounding when the camera has `roundPixels` | [releases](https://github.com/phaserjs/phaser/releases) |

### 12.3 Scale

- Modes: `NONE`, `FIT` (keeps the ratio, may leave borders), `ENVELOP` (covers, may crop), `WIDTH_CONTROLS_HEIGHT`, etc.; `zoom` = canvas size = game size × zoom; `autoCenter: CENTER_BOTH` ([Scale Manager](https://docs.phaser.io/phaser/concepts/scale-manager)).
- `FIT` scales by fractions → breaks the rule "integer scale always".
- Phaser 4 has a built-in integer zoom: `Phaser.Scale.MAX_ZOOM` (the largest integer zoom that fits the parent), `setMaxZoom()` and `getMaxZoom()` (source: local skill `.claude/skills/scale-and-responsive/SKILL.md`, not a URL). It snaps in **CSS pixels and ignores the device pixel ratio**, measured in the local spike (§12.7), so on a DPR 3 phone it can leave the art at a non-integer number of device pixels per game pixel or waste screen.
- Recommendation (B28): `mode: Phaser.Scale.NONE`, `width: 640, height: 360`, and on every resize apply `zoom = max(1, floor(fit × dpr)) / dpr` with `fit = min(innerWidth / 640, innerHeight / 360)` through `game.scale.setZoom()`; center via CSS. The invariant is an integer number of **device** pixels per game pixel (§12.7).
- Relevant fix: ScaleManager did not resize to the parent container (#7213), fixed in a v4 release ([releases](https://github.com/phaserjs/phaser/releases)).

### 12.4 Textures and atlases

- `load.spritesheet()` = uniform cells; `load.atlas()` = free frames; `load.multiatlas()` = several images; accepts the TexturePacker "Phaser 3" format ([Textures](https://docs.phaser.io/phaser/concepts/textures)).
- SVG is rasterized by the browser when the texture is created ([Textures](https://docs.phaser.io/phaser/concepts/textures)) → our SVG placeholders must be loaded already at their final size (no browser scaling) so they do not gain antialiasing.
- v4 fix: `DynamicTexture` turned black when resized from a power of 2 to a non-power of 2 ([releases](https://github.com/phaserjs/phaser/releases)).

### 12.5 Web audio

- Most browsers do not play sound until a click/tap; check `this.sound.locked`; Phaser tries to resume the AudioContext on the first gesture; `this.sound.unlock()` is available ([Audio](https://docs.phaser.io/phaser/concepts/audio)).
- The Chrome warning "The AudioContext was not allowed to start" is normal ([Audio](https://docs.phaser.io/phaser/concepts/audio)); MDN reference: [Autoplay guide](https://developer.mozilla.org/en-US/docs/Web/Media/Autoplay_guide).
- v4 fix: audio from a Base64 data URI did not load ([releases](https://github.com/phaserjs/phaser/releases)).

### 12.6 Performance

- `BatchHandler` in v4 creates its own WebGL buffers: ~5 MB of RAM and VRAM in a basic game ([releases](https://github.com/phaserjs/phaser/releases)).
- `TimeStep#stepLimitFPS` fixed to drop fewer frames; an FPS limit is only needed to run below the monitor's refresh rate ([releases](https://github.com/phaserjs/phaser/releases)).
- Blend modes leaked between siblings in `Container` — fixed ([releases](https://github.com/phaserjs/phaser/releases)).
- Animation FPS of DD/StS: **not verified**. For pixel art, 8–12 fps per unit animation is a common convention, not a source.

---

### 12.7 Local spike (2026-10-26)

Source: local experiment, not a URL. Stack: Phaser 4.2.1, Vite 8.3.5, Bun 1.4.4, playwright-core 1.64.1 with chrome-headless-shell. Summary in `scratchpad/phaser-spike/FINDINGS.md` (22 cases, 8 screenshots). Limits: only headless Chromium with emulated DPR; no real iOS Safari, Firefox or WebKit; the BitmapText atlas was a stand-in.

Scale:

- `pixelArt: true` with `scale.mode: Phaser.Scale.NONE` and an integer zoom recomputed on `resize` (`game.scale.setZoom()`). Letterboxing via CSS.
- Across the 8 screenshots (480×270 and 640×360, zoom 1 to 4), zero irregular NxN blocks: pixel-exact.
- The invariant is an integer number of device pixels per game pixel, not an integer number of CSS pixels. Formula: `zoom = max(1, floor(fit × dpr)) / dpr`.

| Viewport | DPR | Base 480×270 | Base 640×360 |
|---|---|---|---|
| 1280×720 | 1 | zoom 2 → 960×540 | zoom 2 → 1280×720 |
| 1920×1080 | 1 | zoom 4 → 1920×1080 | zoom 3 → 1920×1080 |
| 390×844 (portrait) | 3 | 320×180 (2 device px per game px) | 213.33×120 (1 device px) |
| 844×390 (landscape) | 3 | 640×360 | 640×360 |

Gotcha: at zoom 1, Phaser does not write `canvas.style`; read `getBoundingClientRect()` instead of assuming the size.

Text:

- 1-bit BitmapText: 2 unique colors per text row.
- `Text` at 8 px: 143 unique colors; at 10 px: 156. Browser antialiasing appears even with `pixelArt`.
- Adopted rule: all UI text in BitmapText, with the EN and accented PT-BR charset. `Text` only for debugging.

Audio:

- Before the gesture, `sound.locked === true` and the context is suspended. After the click, `unlocked` fires once.
- Start the music in `sound.once('unlocked', ...)`.

Speed (global factor):

- Apply `time.timeScale = f`, `tweens.timeScale = f` and `anims.globalTimeScale = f`.
- Tween progress after about 1.5 s: 0.25 (1x), 0.494 (2x), 0.742 (3x).
- Timer ticks: 3, 5 and 8 (ideal 3, 6 and 9). In other words, the timer does not scale linearly.
- Gotchas: `scene.restart()` resets only `tweens.timeScale` to 1 (reapply in every `create()`); the factors multiply (clock × timer event; tween × tween); `Timeline.timeScale` does not affect its own tweens; `timeScale = 0` does not really freeze (use `paused`). The core never reads this factor.

## 13. Skills, plugins, rules and prompts

### 13.1 Skills available in this Claude Code environment (source: session skill list, no URL)

| Area | Skills |
|---|---|
| Phaser 4 | `v4-new-features`, `game-setup-and-config`, `scale-and-responsive`, `loading-assets`, `sprites-and-images`, `animations`, `tweens`, `cameras`, `scenes`, `input-keyboard-mouse-touch`, `audio-and-sound`, `text-and-bitmaptext`, `filters-and-postfx`, `particles`, `render-textures` |
| Design | `art-of-game-design`, `gd-roguelike`, `gd-rpg`, `gd-game-feel`, `gd-game-ui-ux`, `gd-procedural-gen`, `gd-save-systems` |
| Balancing/QA | `ccgs-balance-check`, `ccgs-playtest-report`, `ccgs-qa-plan`, `ccgs-perf-profile`, `ccgs-localize` |
| Art | `pixel-logic`, `aseprite-pixel-assets`, `alpha-art-assets`, `asset-animation`, `game-assets`, `inkscape-vector-assets` |
| Audio | `alpha-audio-assets`, `gd-audio-design` |
| MCP | PixelLab MCP: `create_character`, `animate_character`, `create_ui_asset`, `create_sidescroller_tileset`, `create_portrait_character`, `reduce_colors`, `pixelart_workbench`, `vfx_workbench` (session tool list) |

### 13.2 PixelLab

- Product: characters with 4 or 8 rotations, animations, tilesets, isometric tiles, map objects, editing (inpaint, rotate, resize, style transfer); asynchronous REST API per job ([PixelLab API llms.txt](https://api.pixellab.ai/v2/llms.txt)).
- Endpoints: `create-character-v3` (8 rotations), `create-character-pro`, `animate-character`, `create-character-state`, `create-character-with-4-directions` ([same](https://api.pixellab.ai/v2/llms.txt)).
- Site: UI generation (buttons, health bars, menus) with a style reference; inpainting "that understands the original image" ([pixellab.ai](https://www.pixellab.ai/)).
- Billing model: monthly subscription; generations and remaining credits visible in the account; a mid-month upgrade charges only the remaining days; commercial use allowed, except training new models with the images ([PixelLab FAQ](https://www.pixellab.ai/docs/faq)).
- **Prices: not verified** — `pixellab.ai/pricing` and `/plans` return 404 and the home page lists no prices; third parties disagree (Apprentice US$ 10 or 12/month; Architect US$ 50/month) ([G2](https://ai.g2.com/marketplace/tools/pixellab), [Cinevva](https://app.cinevva.com/guides/ai-pixel-art-generators)). Use the MCP `get_balance` before batches.
- Check on 2026-10-26: `https://www.pixellab.ai/pricing` (broken link as of 2026-10-26), `https://pixellab.ai/pricing` (broken link as of 2026-10-26) and `https://api.pixellab.ai/docs` (broken link as of 2026-10-26) returned HTTP 404; the home page loads "Loading subscription plans..." with no prices.

Plans and costs (third-party sources only; official not verified):

| Plan | Price | Credits / generations | Commercial use | Source (accessed 2026-10-26) |
|---|---|---|---|---|
| Free trial | US$ 0 | 40 fast, then 5 slow per day | not verified | [Knowara](https://knowara.com/ai-tools/image/pixellab-review/) |
| Entry ("Hobbyist"/"Apprentice") | about US$ 10 to 12/month | 1,000 to 2,000 images/month (sources disagree) | included in paid plans (page says "cleared for commercial use in shipped games") | [Knowara](https://knowara.com/ai-tools/image/pixellab-review/), [G2](https://ai.g2.com/marketplace/tools/pixellab) |
| Mid-tier ("Pro") | about US$ 29 to 35/month | about 3,000/month | same | [Knowara](https://knowara.com/ai-tools/image/pixellab-review/) |
| Top ("Architect"/"Team") | about US$ 50/month | 6,000/month | same | [G2](https://ai.g2.com/marketplace/tools/pixellab) |
| API | billed separately, per call | not verified | not verified | [Knowara](https://knowara.com/ai-tools/image/pixellab-review/) |

Cost per asset type (character, object, UI, image): **not verified**. Proxy used in the budget in `scratchpad/asset-pricing.md`: US$ 0.010 to 0.012 per generation, derived from the third-party quota (hypothesis, not an official price).

Verified account data (source: PixelLab MCP `get_balance`, 2026-10-26; provided by the coordinator, not queried in this task):

| Item | Value |
|---|---|
| Developer's plan quota | 5,000 generations per billing period |
| Usage reported by the developer (2026-10-26) | 1,600 of 5,000 used; about 3,400 remaining |
| `get_balance` (MCP, 2026-10-26) | subscription expired on 2026-10-25; generations frozen until renewal at `pixellab.ai/account` |
| Pay-as-you-go balance | US$ 0.05 |

Divergence to confirm at `pixellab.ai/account`: the developer reports about 3,400 generations remaining, but `get_balance` on the same day indicates an expired subscription and frozen generations. Until this is confirmed, it is unclear whether generation is blocked.

Implication: the prototype's need (68 assets × 3 tries ≈ 204 generations) fits within the remaining quota reported by the developer, as long as the subscription is active. If the expiration is real, generation stays blocked until renewal.

### 13.3 ElevenLabs

| Resource | Fact | Source |
|---|---|---|
| SFX duration | 0.1–30 s; automatic default | [SFX docs](https://elevenlabs.io/docs/overview/capabilities/sound-effects) |
| SFX cost | 40 credits/s when the duration is specified | same |
| SFX loop | Loop with no perceptible start/end | same |
| SFX formats | MP3 always; WAV 48 kHz for non-loop | same |
| SFX prompt influence | High = literal; low = creative | same |
| API pay-as-you-go | SFX US$ 0.12/min; Music US$ 0.15/min, limit 5 min, commercial license from Starter, 44.1 kHz 128–192 kbps | [API pricing](https://elevenlabs.io/pricing/api) |
| Music | Instrumental or with vocals; section-based editing; "cleared for almost all commercial uses, including games" | [Music docs](https://elevenlabs.io/docs/overview/capabilities/music), [Music terms](https://elevenlabs.io/music-terms) |
| Creator plan | US$ 22/month (US$ 11 in the 1st month) | [API pricing](https://elevenlabs.io/pricing/api) |

Plans (plans page, accessed 2026-10-26, [pricing](https://elevenlabs.io/pricing)):

| Plan | Monthly price | Credits/month | Commercial use | Source |
|---|---|---|---|---|
| Free | US$ 0 | 10,000 | not verified | [pricing](https://elevenlabs.io/pricing) |
| Starter | **conflict: US$ 1 (table) vs US$ 6 (FAQ)** | 30,000 | yes: "Commercial License" and "Music commercial use" from Starter | [pricing](https://elevenlabs.io/pricing) |
| Creator | **conflict: US$ 11 (table) vs US$ 22 (FAQ)** | 121,000 | inherits from Starter | [pricing](https://elevenlabs.io/pricing) |
| Pro | US$ 99 | 600,000 | inherits from Creator | [pricing](https://elevenlabs.io/pricing) |
| Scale | US$ 299 | 1,800,000 | inherits from Pro (3 seats) | [pricing](https://elevenlabs.io/pricing) |
| Business | US$ 990 | 6,000,000 | inherits from Scale (10 seats) | [pricing](https://elevenlabs.io/pricing) |

Starter conflict: the table and the FAQ on the same page give different values; the conservative value (US$ 6) is the one used in the budget. Unresolved. SFX cost conflict: the plans page cites 200 credits per generation; the capabilities page cites 40 credits/s with a fixed duration. Unresolved; the rule in 13.4 uses 40 credits/s.

### 13.4 Useful rules for `.claude/rules` (derived from the sources)

- "Every new card keyword has a name + a short phrase of ≤ 12 words and its own icon" (section 5.3).
- "One intent icon per effect type; never reuse the buff icon for healing" (Intent).
- "A generation prompt lists palette, size in px, light direction and outline; never a work or artist name" (the project's IP rule).
- "A generation batch shows the estimated cost: SFX = seconds × 40 credits; music = minutes × US$ 0.15" (13.3).

### 13.5 Example prompts (no "in the style of")

Pixel art — unit:

```text
Side-view pixel art sprite, 48x48 px canvas, character facing right.
Armored templar with tall rectangular shield and flanged mace, hooded helm.
Limited palette of 12 colors: ash grey, bone white, rust red, tarnished brass, deep slate (no pure black).
Single light source from upper left, selective dark-brown outline, no anti-aliasing on outer edge, no dithering.
Transparent background. Readable silhouette at 1x.
```

Pixel art — enemy:

```text
Side-view pixel art enemy, 64x64 px, facing left.
Gaunt hollow preacher in tattered robes, iron cage over the head, candle stubs fused to shoulders.
Palette: 14 colors, cold desaturated greens and wax yellow, deep violet shadows, no pure black.
Light from upper right, crisp 1px outline, transparent background, no anti-aliasing.
```

Card frame:

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

Music (loop):

```text
Instrumental dark ambient loop for a turn-based battle, 90 BPM, D minor.
Low cello ostinato, muffled war drums, sparse detuned harpsichord, choir pad without words.
Tense but steady, no melody climax, 60 seconds, seamless loop start and end, no vocals.
```

---

## 14. IP risks

| Risk | Fact | Source |
|---|---|---|
| GW IP policy | A 2021 update banned unlicensed fan films/animations; the *TTS* series went on indefinite hiatus | [Vice](https://vice.com/en/article/warhammer-40k-fans-in-revolt-over-zero-tolerance-fan-animation-policy), [Know Your Meme](https://knowyourmeme.com/news/warhammer-fan-series-tts-announces-indefinite-hiatus-in-protest-of-games-workshops-new-strict-copyright-policies) |
| Official page | games-workshop.com/en-US/Intellectual-Property-Policy returned HTTP 405 in this collection → current text **not verified** | [GW IP Policy](https://www.games-workshop.com/en-US/Intellectual-Property-Policy) |
| Trademarks | Third-party list includes "40,000", "40K", "Adeptus Custodes", "Adeptus Mechanicus", "Blood Bowl", "Black Library", "Citadel" | [MyMiniFactory](https://creator.myminifactory.com/registered-trademarks-from-games-workshop) |
| Precedent | 2007: GW blocked the fan film *Damnatus* | [Slashdot](https://games.slashdot.org/story/07/07/11/1536240/games-workshop-forbids-warhammer-fan-films/interesting-comments) |

How to evoke the tone without copying (aligned with `.claude/rules/ip-and-tone.md`):

- Use generic tropes (militarized faith, technology as relic, a decaying empire) and the GDD's vocabulary.
- Our own heraldry: simple geometric shapes (a split ring, a flame in a crown of thorns) instead of eagles, winged skulls or recognizable stylized crosses.
- Armor silhouettes without giant rounded shoulder pads and without a helmet with a characteristic front grille — avoid a universe's visual "signature".
- DD is also a protected reference: do not copy classes under its names (Plague Doctor, Highwayman, Crusader as a package), nor the "Ancestor"/manor as a premise. Ranks, stress and meltdown are genre mechanics, not protected expression (mechanics are generally not protected by copyright — legal analysis **not verified**).
- Generation prompts never cite a work, artist or studio (project rule).
- Check every new name with a web search before fixing it.

---

## 15. What this means for our game

1. **Energy 3 / draw 5 as a starting point**, then double/halve through simulation; it is the most tested pairing in the genre (§7.1).
2. **Guaranteed hits**: DD2 proved that removing accuracy works in a dark RPG; keep the invariant and move the uncertainty to card draws and intents (§7.4).
3. **Ranks 1–4 per side** in side view: an ability/card declares origin and target ranks; movement is a card effect (§2, §7.3).
4. **Stress on a short scale (0–10)** like DD2, not 0–200: it fits readable pips at the 640×360 base and on a tap (§7.4).
5. At 10 stress: a binary result announced in advance (e.g. meltdown vs. resolve) with the chance shown in the preview — respects "visible damage before deciding" (§7.3, §7.4).
6. **Enemy intent with an icon per effect + a number**, without reusing icons; a distinct shape beyond color (§5.1).
7. **Draw pile visible, order hidden**, a clickable exhaust counter (§5.1).
8. **Keywords with a tooltip on long-press**; name + short phrase (§5.3, §13.4).
9. **Rarity by color + frame shape**, at most 4 levels (§5.3, §13.5).
10. **A node map with 7 types** (normal, elite, rest, event, treasure, shop, boss) and a guaranteed rest before the boss (§7.2, §11).
11. **Rest = exclusive choice** (heal ~30% or upgrade a card/skill) (§7.2).
12. **Gold: normal < elite < boss** in the rough StS ratio of 1 : 2 : 7 (15 / 30 / 100) as an initial anchor (§9.1).
13. **Card removal with rising cost** (75 +25 in StS) — a gold sink and a dilution decision (§9.2).
14. **Rarity pity** in rewards (StS offset) to avoid runs with no rares (§9.3).
15. **Equipment with rarity** using weights 50/33/17 as a starting point (§9.3).
16. **Relationships between heroes (DD2) as an optional layer of the Beta**: +1 affinity on shared decisions; outside Alpha (§7.4).
17. **Meta-progression grants options, not raw power**: DD2's Altar unlocks heroes and slots; follow the GDD §8 ceiling (§8.1).
18. **Difficulty as a cumulative ladder** (Ascension) + optional modifiers (Dam) for players who want to tune (§8.2, §8.3).
19. **Metrics from the first playable**: a log of choices/pick rate per card and win rate per node; this is MegaCrit's documented method and matches `bun run sim` (§10).
20. **Shared daily seed** — trivial with the injected RNG the core already requires (§11).
21. **Phaser pinned to 4.2.1**, `pixelArt: true`, 640×360 base, `Scale.NONE` + a zoom snapped to whole device pixels on resize, not `MAX_ZOOM` (§12.1–12.3, §12.7).
22. **SVG placeholders rasterized at the final size**, never scaled by the browser (§12.4).
23. **Audio unlocked on the first tap** ("Tap to start"); the game works with `sound.locked` (§12.5).
24. **No spoken narrator**: short text + a sound sting on stress/death events (§4).
25. **Predictable audio budget**: ~40 SFX × 2 s × 40 credits ≈ 3,200 credits; 6 tracks × 1 min × US$ 0.15 ≈ US$ 0.90 (calculated from §13.3; confirm the plan first).
26. **PixelLab price not verified** → check `get_balance` and show the estimate at the cost gate (§13.2).
27. **Short sessions**: regions of ~3 nodes (Kingdoms) and 3-act runs — aim for runs that fit a web session (§11).
28. **IP**: no GW/DD/FFT terms; our own geometric heraldry; web search mandatory for any new name (§14).
29. **All UI text in BitmapText; integer zoom per device pixel** (§12.7).

---

## 15b. Developer references (summary)

Full digest, image by image: [`docs/research/developer-references.md`](research/developer-references.md). Sources: `references/chatgpt/conversation.md`, 24 concept arts, 13 wireframes (12 distinct screens; `wireframe-10` = `wireframe-12`) and the repository <https://github.com/AlexGalhardo/zeta-c>.

- Reference concept called **DARKEON**: side-view turn-based combat, 3 heroes on the left against 3 to 5 enemies on the right, top HUD, card hand at the bottom, "End Turn" button.
- Reference roster of 5 classes (Warrior, Mage, Healer, Artillery, Archer) and a 3-hero combat party; 6 abilities per hero with energy cost and cooldown.
- Proposed meta-progression: a mastery tree per hero, a team-pact tree, and a permanent tree with fragments.
- Proposed economy: Gold, Fragments, Relics and Health as a pact cost; 3 shops (3×3 Merchant, Arsenal, Reliquary).
- Consistent UI: dark-stone panels, gold border on focus; technical wireframes at 1920×1080 with pixel coordinates.
- zeta-c structure to replicate: `PLAN.md` with phases → groups → checkboxes and "Ready when", `.claude/rules` + `.claude/skills`, Biome + markdownlint + Conventional Commits hooks, simulation, smoke and balancing scripts, `CHANGELOG.md` with `[Unreleased]`.

**Contradictions to decide in the brainstorming (task 2):**

| # | Topic | Conflict |
|---|---|---|
| 1 | Name | DARKEON (references) × "project-alpha" × vocabulary inherited from the previous project |
| 2 | Resolution | 1920×1080 with 960×540 production (ChatGPT) × 480×270 base (inherited rules); resolved: 640×360 (`docs/brainstorming.md` B28) |
| 3 | Hand | 5 × 6 cards across screens |
| 4 | Combat duration | "ROUND XX/10" × 5 to 8 rounds |
| 5 | Hit chance | "25% DODGE" and condition chance × guaranteed-hit invariant |
| 6 | Turn order queue | absent from the concepts × required by the rules |
| 7 | Resources | mana + energy + cooldown overlapping (ChatGPT itself points out the risk) |
| 8 | Hero and class names | 4 different sets across screens |
| 9 | IP | "Emperor of the Void", "Inquisitor" and third-party work citations in the ChatGPT text |

## 15c. Reference images of the 4 games

Local folder, outside git (`references/` is in `.gitignore`). Each folder has `images/` and `images.md` with file, source URL and description.

| Game | Folder | Images | Origin |
|---|---|---|---|
| Darkest Dungeon | `references/darkest-dungeon/` | 23 | Steam (official screenshots): combat 9, hub 5, hero sheet 2, event 2, loot 2, camp 1, map 1, shop 1 |
| Darkest Dungeon II | `references/darkest-dungeon-2/` | 20 | Steam: event 6, combat 5, exploration 4, camp 2, map 1, bestiary 1, hub 1 |
| Slay the Spire | `references/slay-the-spire/` | 55 | Steam (6) + frames from the official Launch Trailer (24) + slaythespire.wiki.gg (25: patch notes, menus, sprites, icons). Real in-game captures: 30. Capture categories: combat 12, menu 11, sprite 5, event 5, loot 4, boss 4, deck 3, shop 3, map 3, icon 3, bestiary 1, art 1. 8 tool/template files removed. No rest-site screenshot found for StS1 or StS2 |
| Slay the Spire 2 | `references/slay-the-spire-2/` | 51 | Steam (6) + frames from the official Gameplay Trailer (14) + Steam News (6) + slaythespire.wiki.gg (24 cards, icons and art) + 1 marketing; 26 in-game captures |

Visual curation done on 2026-10-26: each `images.md` gives category, source URL, description and "Observed patterns". No duplicates found (MD5 + dHash).

## 16. Sources

Slay the Spire (official wiki and data)

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
- <https://gdconf.com/news/learn-slay-spires-successful-metrics-driven-approach-game-balancing-gdc-2019> (broken link as of 2026-10-26)
- <https://www.gamedeveloper.com/design/learn-i-slay-the-spire-i-s-metrics-driven-approach-to-game-balancing-at-gdc-2019>
- <https://www.pressreader.com/australia/edge/20190620/282351156287993>
- <https://podwise.ai/episodes/1459444>

Darkest Dungeon 1 and 2

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
- <https://www.thegamer.com/darkest-dungeon-2-3d-combat/> (broken link as of 2026-10-26)
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

Generation tools

- <https://api.pixellab.ai/v2/llms.txt>
- <https://www.pixellab.ai/>
- <https://www.pixellab.ai/docs/faq>
- <https://ai.g2.com/marketplace/tools/pixellab>
- <https://app.cinevva.com/guides/ai-pixel-art-generators>
- <https://www.pixellab.ai/pricing> (HTTP 404, accessed 2026-10-26; broken link as of 2026-10-26)
- <https://pixellab.ai/pricing> (HTTP 404, accessed 2026-10-26; broken link as of 2026-10-26)
- <https://api.pixellab.ai/docs> (HTTP 404, accessed 2026-10-26; broken link as of 2026-10-26)
- <https://knowara.com/ai-tools/image/pixellab-review/> (accessed 2026-10-26; "verified as of September 2026" according to the page)
- <https://elevenlabs.io/pricing> (accessed 2026-10-26)
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
