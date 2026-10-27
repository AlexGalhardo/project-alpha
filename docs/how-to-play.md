# How to play (playtest build)

For the developer's playtests. Rules come from `docs/gdd.md`; this page explains what the build does today.

## Goal

Take a party of three heroes through three acts. Win combats, grow the deck, and beat the final boss of Act 3. A run ends when the whole party falls (defeat) or the last boss is beaten (victory).

## Screens

Title → Menu (New run, Continue, Legacy, Settings, Credits) → Party (pick 3 of 5, order sets ranks, Rite selector, Veteran start toggle when offered) → Map.

From the Map, each round is one node: Combat, Elite, Rest, Shop, Event or Treasure. After a combat, the Reward screen. After every round except the boss, the Camp, then back to the Map. Beating an act boss moves you to the next act's Map. Winning or losing the run goes to the Summary, which banks Embers and returns to the Menu.

## Combat

- **Board:** heroes on the left in ranks 1 (front) to 3 (back). Enemies on the right in ranks 1 to 4. Bosses take two ranks.
- **Turn:** you have 3 energy and draw 5 cards. Play cards while you have energy. End the turn with the button or Space. Block resets at the start of your turn.
- **Cards:** each card has a cost, a From rank (which hero ranks can play it) and a Target. If the owner stands outside From, the card is greyed out.
- **Playing:** tap a card, then tap a highlighted target. The preview shows the final damage or block before you confirm. Cards with no target play on the second tap.
- **Intents:** every enemy shows its next action: the target heroes, the damage per hit and the number of hits, the stress or Block it gives, and the debuffs it applies with their amounts (for example "bleed 3"). Enemies act in turn-queue order: Speed high to low, ties to the front rank. The queue is always visible.
- **Damage:** hits always land. Hit damage = (base + Might) × 1.5 if the target is Marked × 0.75 if the attacker is Weakened. Block absorbs damage before HP. Bleed and Burn ignore Block.
- **Statuses:** Block, Might, Marked, Weakened, Bleed, Burn, Ward and Stunned. Long-press an icon for its tooltip.
- **Stress:** each hero has 10 pips. At 10, the party loses 1 energy next turn and that hero drops to 5 stress (a Collapse).
- **Falls:** a hero at 0 HP leaves the line and the others gain 2 stress. The hero returns next round at 1 HP with an Injury (max HP −25%) until a Rest with Recover.
- **Enrage:** from combat turn 10, every enemy gains +1 Might at the start of each turn. Long fights get harder; the Enrage counter shows when it starts.
- **Defeat:** all three heroes fallen. A combat that reaches 60 turns counts as a loss.

## Acts, map and rounds

- An act is 10 rounds. Each round is one map node; the boss is in row 10.
- Act 1 (prototype) ends at Bell-Maw. Act 2 ends at the Gilded Penitent. Act 3, The Iron Sepulchre, ends at the Rift Mother, the final boss, who has three phases.
- Between acts, every hero heals 50% of max HP and loses injuries. Act 2 and Act 3 enemies are tougher (more HP and damage).
- **Combat:** a normal enemy group. **Elite:** tougher, better drops. **Boss:** one per act.
- **Rest (row 9):** one of Recover (heal, clear injury), Temper (upgrade a card) or Pray (−5 stress for each hero).
- **Shop:** 5 cards, 2 equipment, and card removal (50 gold, +25 for each removal already bought).
- **Event:** a short text with choices. Every outcome is shown before you pick. "Leave" is always last. There are 12 events.
- **Treasure:** 25 gold and one equipment, once per act.
- **Camp:** swap a hero (30 gold), buy a card or equipment, one service (bind wounds or vigil, 12 gold), reorder ranks (free).

## Sanctum

After the boss of Act 1 or 2 (not after the final boss), the Sanctum opens. Injuries clear first. Then you take exactly one of four recoveries, and the camp opens:

- **Rest:** every hero to full HP.
- **Purge:** remove 2 cards of your choice (needs 2 cards in the deck).
- **Temper:** upgrade 2 cards of your choice.
- **Tithe:** +60 gold.

No heal happens at the Sanctum unless you choose Rest. The Sanctum replaces the plain 50% heal between acts (GDD §23.1).

## Legacy and Veteran start

Embers come from every run: 2 per round cleared, 5 per elite, 15 per boss. The Legacy screen (from the Menu) spends Embers on a three-node branch per hero. Node I and II add cards to that hero's reward pool. Node III offers the Veteran start: the hero begins the run with card A in place of one starter Strike. Party select shows a Veteran start toggle when a picked hero has node III; it is on by default.

## Rites

Rites are harder difficulty rules. Party select has a Rite selector. A Rite unlocks when you win at the previous one. The rules, cumulative from Rite 1:

1. Elites have 20% more HP.
2. Common enemies deal 7.5% more damage.
3. Start the run with 30 gold.
4. The boss has 20% more HP.
5. Rest's Recover heals 20% instead of 30%.
6. Heroes start the run with 2 stress.
7. Shop and camp prices rise 15%.
8. Every enemy starts combat with 1 Might.
9. Injury costs 35% max HP.
10. The boss's phase 2 gains a fourth intent.

Rites are a Beta feature in the GDD; the selector is in the build for playtesting.

## Controls

- **Mouse / touch:** tap to select and confirm. Long-press (or right-click) shows a tooltip. Drag is optional.
- **Keyboard (combat):** 1–9 and 0 select cards, Tab or arrows cycle targets, Enter confirms, Esc cancels a selection (or opens Pause when nothing is selected), Space ends the turn.
- **Keyboard (map and rewards):** arrows move, Enter takes the node or card, Esc opens Pause.
- **Auto battle:** the Auto button or the A key. The game plays your party with the same policy as the bot. Turning it off is a manual check (QA item AU-02, not verified).
- **Speed:** the speed button or the S key cycles 1x, 2x, 3x. It only changes animations.

## Pause, save and continue

- The gear button (or Esc with nothing selected) pauses. Pause offers Resume, Settings, Main menu and Abandon run. Abandon asks for a second tap.
- The run saves in the browser (localStorage) automatically. The exact save points are in the save code; not re-checked here.
- Continue on the Menu resumes the saved run. Clearing site data deletes the run save. The Legacy profile is stored separately and is not deleted with the run.

## Known limitations of this build

- Act 3 is the hardest act by design (GDD §23). Act 2 and Act 3 are new and their balance is a first pass (Act 3 sim: 21.9% of 3-act runs win, GDD §23.7 baseline, 200 runs; target 18–35%). Report anything that feels wrong.
- Some Act 3 intent ids are shared with Act 1 or 2 and their text may not match Act 3 behaviour (for example Dirge). A fix is planned.
- Sprites are generated for most units; some screens still use placeholder art.
- UI text scale is not done. Long tooltips may need scrolling on phones.
- Tested in Chromium only (desktop and phone-sized emulation). Safari, Firefox and real phones are not verified.
- Autosave is per browser. What happens when the same run is open in two tabs is a manual check (QA item SV-09, not verified).
- Known P3 mismatch (bug-kindle-intent-stale, bug-execution-shown-damage): an enemy that acts after a Kindle (+1 Might) can hit harder than its shown intent, and the Sepulchre Knight's shown Execution can exceed the hit it deals. The intent shows the damage before earlier enemies resolve. Treat the shown number as approximate until fixed.
