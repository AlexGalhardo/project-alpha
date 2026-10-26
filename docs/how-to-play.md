# How to play (playtest build)

For the developer's playtests. Rules come from `docs/gdd.md`; this page explains what the build does today.

## Goal

Take a party of three heroes through the rounds of an act. Win combats, grow the deck, and reach the boss. A run ends when the whole party falls (defeat) or the last boss is beaten (victory).

## Screens

Title → Menu (New run, Continue, Legacy, Settings, Credits) → Party (pick 3 of 5, order sets ranks) → Map.

From the Map, each round is one node: Combat, Elite, Rest, Shop, Event or Treasure. After a combat, the Reward screen. After every round except the boss, the Camp. Then back to the Map. Winning or losing the run goes to the Summary, which banks Embers and returns to the Menu.

## Combat

- **Board:** heroes on the left in ranks 1 (front) to 3 (back). Enemies on the right in ranks 1 to 4. The boss takes ranks 1 and 2.
- **Turn:** you have 3 energy and draw 5 cards. Play cards while you have energy. End the turn with the button or Space. Block resets at the start of your turn.
- **Cards:** each card has a cost, a From rank (which hero ranks can play it) and a Target. If the owner stands outside From, the card is greyed out.
- **Playing:** tap a card, then tap a highlighted target. The preview shows the final damage or block before you confirm. Cards with no target play on the second tap.
- **Intents:** every enemy shows its next action (icon, number, target). Enemies act in turn-queue order: Speed high to low, ties to the front rank. The queue is always visible.
- **Damage:** hits always land. Hit damage = (base + Might) × 1.5 if the target is Marked × 0.75 if the attacker is Weakened. Block absorbs damage before HP. Bleed and Burn ignore Block.
- **Statuses:** Block, Might, Marked, Weakened, Bleed, Burn, Ward and Stunned. Long-press an icon for its tooltip.
- **Stress:** each hero has 10 pips. At 10, the party loses 1 energy next turn and that hero drops to 5 stress (a Collapse).
- **Falls:** a hero at 0 HP leaves the line, the others gain 2 stress. The hero returns next round at 1 HP with an Injury (max HP −25%) until a Rest with Recover.
- **Defeat:** all three heroes fallen. A combat that reaches 60 turns counts as a loss.

## Map, rounds and nodes

- A round is one map node. The map has 10 rows; the boss is in row 10.
- **Combat:** a normal enemy group. **Elite:** tougher, better drops. **Boss:** Bell-Maw in Act 1, Gilded Penitent in Act 2.
- **Rest (row 9):** one of Recover (heal, clear injury), Temper (upgrade a card) or Pray (−5 stress for each hero).
- **Shop:** 5 cards, 2 equipment, and card removal (50 gold, +25 for each removal already bought).
- **Event:** a short text with choices. Every outcome is shown before you pick. "Leave" is always last.
- **Treasure:** 25 gold and one equipment, once per act.
- **Camp:** swap a hero (30 gold), buy a card or equipment, one service (bind wounds or vigil, 12 gold), reorder ranks (free).

## Legacy and Veteran start

Embers come from every run: 2 per round cleared, 5 per elite, 15 per boss. The Legacy screen (from the Menu) spends Embers on a three-node branch per hero. Node I and II add cards to that hero's reward pool. Node III offers the Veteran start: the hero begins the run with card A in place of one starter Strike. Party select shows a "Veteran start" toggle when a picked hero has node III.

## Rites

Party select has a Rite selector. Rites are harder rules (for example, elites +20% HP). A Rite unlocks when you win at the previous one. Each rite line reads what it changes.

## Controls

- **Mouse / touch:** tap to select and confirm. Long-press (or right-click) shows a tooltip. Drag is optional.
- **Keyboard (combat):** 1–9 and 0 select cards, Tab or arrows cycle targets, Enter confirms, Esc cancels a selection (or opens Pause when nothing is selected), Space ends the turn.
- **Keyboard (map and rewards):** arrows move, Enter takes the node or card, Esc opens Pause.
- **Auto battle:** the Auto button or the A key. The game plays your party with the same policy as the bot. Turn it off at any time. Whether a pending action is kept on turn-off is a manual check (QA item AU-02, not verified).
- **Speed:** the speed button or the S key cycles 1x, 2x, 3x. It only changes animations.

## Pause, save and continue

- The gear button (or Esc with nothing selected) pauses. Pause offers Resume, Settings, Main menu and Abandon run. Abandon asks for a second tap.
- The run saves in the browser (localStorage) automatically. The exact save points are in the save code; not re-checked here. Continue on the Menu resumes the same combat view.
- Clearing site data deletes the run save. The Legacy profile is stored separately and is not deleted with the run.

## Known limitations of this build

- Sprites are generated and placeholder art is still in use for some screens. Check the Art Bible status before judging visuals.
- UI text scale is not done (PLAN A3.5). Long tooltips may need scrolling on phones.
- Tested in Chromium only (desktop and phone-sized emulation). Safari, Firefox and real phones are not verified.
- Balance numbers are first passes. Report anything that feels wrong; numbers change with a simulation report.
- Autosave is per browser. What happens when the same run is open in two tabs is a manual check (QA item SV-09, not verified).
