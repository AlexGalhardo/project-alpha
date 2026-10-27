# Human QA script

Script for a person to test the production build before each phase closes. Every item has an id, a step, the expected result and the severity if it fails. Items tagged **(Alpha)** or **(Beta)** cover features that are not in the prototype: record them as "not applicable" in earlier phases, never as "passed".

Method references: the `ccgs-qa-plan` skill (QA plan per phase, exit criteria) and the `gc-game-qa` skill (browser game checklist). Design references: `docs/gdd.md` (rules and numbers), `docs/art-bible.md` (screens, sizes, feedback timings), `docs/sdd/testing-and-qa.md` (where this script sits in the test strategy).

## Severities

| Level | Criterion | Example |
|---|---|---|
| S1 | Crash, save loss or corruption, or the run cannot be finished. | Reloading the tab deletes the run. |
| S2 | A main flow is blocked, or a game rule is wrong with a way out. | A card cannot be played and the turn does not end. |
| S3 | Defect with a workaround: the flow works, but with a visible error or poor feedback. | The preview disappears after two taps. |
| S4 | Cosmetic: text, alignment, colour with no impact on reading. | Wrong accent in PT-BR. |

Console rule: any red error or warning in the browser console during a step is S3, unless it breaks the flow (then S2 or S1).

## Preconditions

### Browsers (execution matrix)

| Id | Browser | Minimum version | Platform |
|---|---|---|---|
| B1 | Chrome | current and one before | desktop |
| B2 | Firefox | current | desktop |
| B3 | Safari | current | iOS (iPhone) |
| B4 | Chrome | current | Android |

Exact versions and run dates: fill in the report of each round.

### Viewports

| Id | Size (CSS px) | Use |
|---|---|---|
| V1 | 1280×720 | small desktop (zoom 2) |
| V2 | 1920×1080 | reference desktop (zoom 3) |
| V3 | 390×844 | phone, portrait (letterboxed) |
| V4 | 844×390 | phone, landscape (main mobile layout) |

### Test data

- A clean profile (no save).
- An old save from a previous version (for the version test).
- A corrupted save (edited by hand to be invalid).
- A fixed seed to repeat a run (record the seed in every bug).
- Languages: EN and PT-BR.
- Developer tools open to read the console.

### Build

- Production build, cache cleared on the first run.
- Record the version shown in the menu footer.

## 1. Boot, loading and fallbacks

| Id | Step | Expected | Sev. |
|---|---|---|---|
| BT-01 | Open the build URL in B1 with a clean cache. | Loading screen appears; the title screen shows with no console error. | S2 |
| BT-02 | Measure time to the title on V4 with simulated slow network. | Progress bar advances; no freeze longer than 20 s without feedback. | S3 |
| BT-03 | Block one sprite in DevTools and reload. | The game loads; the asset shows as its placeholder; no crash. | S2 |
| BT-04 | Block one audio file. | The game loads without that sound; nothing blocks. | S2 |
| BT-05 | Disable WebGL (browser flag) and open. | Canvas rendering, or a clear message if there is no fallback. | S2 |
| BT-06 | Open offline after a full load. | Clear network-failure message; no white screen. | S3 |
| BT-07 | Reload with the server down. | Error screen with a retry option. | S3 |
| BT-08 | Open the URL in a private window. | The game starts; "storage unavailable" messages do not block. | S3 |
| BT-09 | Open with a width below 320 px. | No severe horizontal overflow; the game shows a minimum-size notice. | S3 |
| BT-10 | Check the version in the menu footer. | Same version as the build record. | S4 |

## 2. Title and main menu

| Id | Step | Expected | Sev. |
|---|---|---|---|
| MM-01 | Open the menu with no save. | "Continue" is disabled; "New run", "Settings" and "Credits" work. | S2 |
| MM-02 | Open the menu with a valid save. | "Continue" is enabled and opens the saved run. | S2 |
| MM-03 | Use Tab/arrows through the menu. | Visible focus (corner brackets) on every button; Enter activates. | S2 |
| MM-04 | Tap every button. | Each button responds within 0.1 s. | S2 |
| MM-05 | Change language in Settings from the menu. | Every text changes; no English is left in PT-BR mode. | S3 |
| MM-06 | Resize the window on the menu. | Integer zoom recalculates; buttons stay clickable. | S3 |
| MM-07 | Check the version footer on V1 and V4. | Legible text, no overlap. | S4 |

## 3. New run and party select

| Id | Step | Expected | Sev. |
|---|---|---|---|
| NR-01 | Choose "New run". | Party select shows the 5 heroes. | S2 |
| NR-02 | Pick 3 heroes, set their ranks and confirm. | The map of Act 1 opens with that party in that rank order. | S2 |
| NR-03 | Try to confirm with fewer than 3 heroes. | Start stays disabled with a clear reason. | S3 |
| NR-04 | Look for the run seed. | The seed is shown and can be copied. | S4 |
| NR-05 | Abandon the run from the pause menu. | Confirmation first; after confirming, back to the menu and the run is gone. | S2 |
| NR-06 | Start two runs with the same seed and the same party. | Identical maps and identical first hand. | S2 |
| NR-07 | Start a run with a typed seed (if available). | Same result as the same seed generated by the game. | S3 |
| NR-08 | Check the act structure. | The map shows 10 rows; the boss is in row 10. | S2 |

## 4. Map

| Id | Step | Expected | Sev. |
|---|---|---|---|
| MP-01 | Tap a reachable node. | The node is selected and shows its type before entering. | S2 |
| MP-02 | Tap an unreachable node. | Nothing happens, with a visual hint. | S3 |
| MP-03 | Move through reachable nodes with the keyboard. | Visible focus; Enter enters the node. | S2 |
| MP-04 | Check that the route never goes back. | Visited rows are not offered again. | S2 |
| MP-05 | Look at each node type (combat, elite, rest, shop, boss). | Each type has a distinct icon and label, not only colour. | S2 |
| MP-06 | Play a whole act. | Elite rows 4 and 7 always offer a normal combat beside the elite; row 9 has rest and shop; row 10 is the boss. | S2 |
| MP-07 | Rotate V3 ↔ V4 with the map open. | The map rescales without losing the position. | S3 |
| MP-08 | Long-press a node type. | Tooltip with name and a short line. | S3 |

## 5. Combat: playing cards

Every card has three input paths. Test all of them.

| Id | Step | Expected | Sev. |
|---|---|---|---|
| CB-01 | Tap a card, then tap a valid target. | The preview appears on the first tap; the tap on the target confirms and energy drops. | S1 |
| CB-02 | Drag a card to a target and release. | Same as CB-01; releasing outside a target cancels. | S2 |
| CB-03 | Keyboard: 1–9/0 selects a card, Tab cycles targets, Enter confirms. | Same result; Esc cancels. | S2 |
| CB-04 | Tap a card without enough energy. | The card is not selected; the missing cost is shown. | S2 |
| CB-05 | Tap a card whose owner stands outside its From ranks. | The card is unplayable, with the rank icon in red + cross shape. | S2 |
| CB-06 | Tap a card of a fallen hero. | Greyed and unplayable. | S2 |
| CB-07 | Play an area card (e.g. Volley). | Damage on every enemy; the preview listed every target. | S2 |
| CB-08 | Play a Block card. | Block appears on the right hero with the right number. | S2 |
| CB-09 | Play an Exhaust card. | The card goes to the exhaust pile; the counter updates. | S2 |
| CB-10 | Cancel a selection by tapping outside. | Selection undone; energy and hand unchanged. | S2 |
| CB-11 | Try to play a card during another card's animation. | Input is queued or ignored; nothing plays twice. | S1 |
| CB-12 | Double-tap a target fast. | One play only. | S1 |
| CB-13 | Play cards until energy is 0 and try another. | Blocked with an explanation. | S3 |
| CB-14 | Play a Push/Pull card. | The enemy moves the stated number of ranks; intents retarget if needed. | S2 |

## 6. Combat: turn, intents and preview

| Id | Step | Expected | Sev. |
|---|---|---|---|
| CB-15 | End the turn with the button. | The enemy phase starts; intents resolve in turn-queue order. | S1 |
| CB-16 | End the turn with Space. | Same as CB-15. | S2 |
| CB-17 | Watch the turn queue for a whole combat. | Always visible; order matches Speed (ties: lower rank first). | S2 |
| CB-18 | Read every enemy intent at the start of the turn. | Icon + number + target marker for each enemy. | S2 |
| CB-19 | Long-press an intent. | Tooltip explains the icon. | S3 |
| CB-20 | Compare an intent with the damage taken. | Same number; never damage from an unseen source. | S1 |
| CB-21 | Read a card's preview before confirming. | Final damage per target with modifiers, resulting HP/Block. | S2 |
| CB-22 | Check that no percentage appears anywhere in combat. | Hits are guaranteed; no hit, dodge or crit chance. | S1 |
| CB-23 | Count the hand at the start of a turn. | 5 cards drawn (hand limit 10). | S3 |
| CB-24 | Compare the draw and discard pile counters with their contents. | Counters match. | S2 |
| CB-25 | Empty the draw pile during a turn. | Discard reshuffles into the draw pile; counts stay right. | S1 |
| CB-26 | Inspect each status (Block, Might, Marked, Weakened, Bleed, Burn, Ward, Stunned). | Distinct icon; name and short line in the tooltip. | S2 |
| CB-27 | Check stack counts over turns. | Stacks match what was applied and decay at the right moment (GDD §6.1). | S1 |
| CB-28 | Apply a buff and a debuff to one unit. | Both show separately, with different colour and shape. | S2 |
| CB-29 | Simulate deuteranopia in DevTools. | Statuses and intents still distinguishable by shape. | S2 |
| CB-30 | Let a hero reach 10 stress. | "Collapse" feedback; next turn has −1 energy; that hero's stress becomes 5. | S2 |

## 7. Combat: victory, defeat and falling

| Id | Step | Expected | Sev. |
|---|---|---|---|
| CB-31 | Win a normal combat. | Reward screen; gold credited. | S1 |
| CB-32 | Lose all three heroes. | Defeat; the run ends; run summary with Embers. | S1 |
| CB-33 | A hero falls mid-combat. | The hero leaves the line (ranks collapse); their cards grey out; each other hero gains 2 stress. | S2 |
| CB-34 | Finish a combat with a fallen hero. | Next round the hero returns at 1 HP with an Injury (−25% max HP). | S2 |
| CB-35 | Start a new run after a hero fell in the last run. | The hero is back to its starting state. | S1 |
| CB-36 | Win an elite. | Elite gold (28–36) and an equipment drop. | S2 |
| CB-37 | Kill an enemy while another has an end-of-turn status. | Resolution order matches the tooltips and GDD §5.2. | S2 |

## 8. Auto battle

| Id | Step | Expected | Sev. |
|---|---|---|---|
| AU-01 | Turn Auto on at the start of a combat (button or `A`). | The game plays the party's turn; the player sees each action. | S2 |
| AU-02 | Turn Auto off during the player phase. | Control returns between commands; no pending action is lost. | S1 |
| AU-03 | Turn Auto on during the enemy phase. | The enemy phase finishes without repeated or skipped intents. | S1 |
| AU-04 | Auto at 3x speed. | Actions happen at that speed; none disappears. | S2 |
| AU-05 | Turn Auto off and play by hand in the same round. | Normal control; nothing duplicated. | S2 |
| AU-06 | Let Auto play a whole combat. | Correct victory or defeat; no freeze. | S1 |
| AU-07 | Leave a combat with Auto on. | Auto keeps its setting or says it was turned off. | S3 |
| AU-08 | Check that Auto never waits for a confirmation. | No dialog blocks an automatic action. | S2 |

## 9. Game speed (1x, 2x, 3x)

| Id | Step | Expected | Sev. |
|---|---|---|---|
| VL-01 | Switch 1x → 2x at the start of a turn (button or `S`). | Next animations run faster. | S2 |
| VL-02 | Switch to 3x during a damage animation. | The animation ends with the right result; nothing lost. | S1 |
| VL-03 | Switch to 1x during a card animation. | The animation ends at the new speed; no state jump. | S2 |
| VL-04 | Switch speed during the enemy phase. | The phase continues; order unchanged. | S2 |
| VL-05 | Change speed in the pause menu. | Nothing moves while paused; the new speed applies on resume. | S3 |
| VL-06 | Close and reopen with a default speed of 3x saved in Settings. | The default speed is restored. | S3 |
| VL-07 | Play the same combat at 1x and at 3x with the same seed and choices. | Identical end state (the game is deterministic). | S1 |

## 10. Rewards

| Id | Step | Expected | Sev. |
|---|---|---|---|
| RW-01 | Win a normal combat and look at the rewards. | Gold + a choice of 3 cards from the party heroes' pools. | S2 |
| RW-02 | Take a card. | The card joins the deck; the offer closes. | S2 |
| RW-03 | Skip the card. | Back to the flow with nothing extra. | S3 |
| RW-04 | Read the offered cards' rarity. | Rarity readable by frame shape and colour (common, uncommon, rare, legendary). | S2 |
| RW-05 | Reward screen on V4. | Everything fits and is tappable. | S3 |
| RW-06 | Press Esc on the reward screen. | The reward is not lost silently (confirm skip or return). | S2 |

## 11. Camp (after every round except the boss)

| Id | Step | Expected | Sev. |
|---|---|---|---|
| CP-01 | Open the camp after a round. | Swap, card for sale, equipment for sale, one service and rank reorder are shown with prices. | S2 |
| CP-02 | Swap a hero with enough gold (30). | Gold −30; the new hero joins at full HP, 0 stress, with their 4 starter cards; the leaving hero's cards leave the deck; equipment goes to the stash. | S1 |
| CP-03 | Swap without enough gold. | Blocked with a reason; gold unchanged. | S2 |
| CP-04 | Buy the service (12 gold). | "Bind wounds" heals 15% max HP of every hero, or "Vigil" removes 3 stress from one hero. | S2 |
| CP-05 | Reorder ranks. | Free; the next combat uses the new order. | S2 |
| CP-06 | Leave the camp without buying. | Back to the map; nothing changes. | S3 |

## 12. Shop node

| Id | Step | Expected | Sev. |
|---|---|---|---|
| SH-01 | Enter a shop with enough gold. | 5 cards and 2 equipment with prices; card removal; current gold visible. | S2 |
| SH-02 | Buy an item with enough gold. | Gold drops; the item goes to the deck or the stash. | S1 |
| SH-03 | Try to buy without enough gold. | Blocked with a reason; gold unchanged. | S2 |
| SH-04 | Remove a card. | Costs 50 gold; the card leaves the deck. | S1 |
| SH-05 | Remove a card in a later shop of the same run. | Costs 75 (50 + 25 × removals already bought). | S2 |
| SH-06 | Buy the same item twice. | Second purchase blocked (sold out). | S2 |
| SH-07 | Leave without buying. | Back to the map; nothing changes. | S3 |
| SH-08 | Press buy twice fast. | One purchase only. | S1 |

## 13. Rest (row 9)

| Id | Step | Expected | Sev. |
|---|---|---|---|
| RS-01 | Enter the rest node. | Exclusive choice: Recover, Temper or Pray. | S2 |
| RS-02 | Choose Recover. | Each hero heals 30% max HP (rounded down) and loses any injury. | S2 |
| RS-03 | Choose Temper. | One card upgraded; name shows "+" and numbers change. | S2 |
| RS-04 | Choose Pray. | Every hero −5 stress. | S2 |
| RS-05 | Try to take two options. | Impossible. | S2 |

## 14. Events (Alpha)

| Id | Step | Expected | Sev. |
|---|---|---|---|
| EV-01 | Enter an event. | Short text (2–4 paragraphs) and clear choices. | S2 |
| EV-02 | Pick each option of an event. | The consequence shows and is applied. | S2 |
| EV-03 | An option that costs HP or gold without enough of it. | Option blocked with a reason. | S2 |
| EV-04 | Read the event in EN and PT-BR. | Same content in both; no English left in PT-BR. | S3 |
| EV-05 | Read a long event on V4. | Text fits (scroll if needed); nothing cut. | S3 |

## 15. Boss

| Id | Step | Expected | Sev. |
|---|---|---|---|
| BO-01 | Reach row 10. | Bell-Maw appears over two ranks with name and HP bar. | S1 |
| BO-02 | Watch phase 1. | Toll → Clapper → Resonance cycle, as intents. | S2 |
| BO-03 | Bring the boss to 80 HP or less. | Phase 2 starts at once: flash, shake, "THE BELL CRACKS"; new intent shown before the player continues. | S2 |
| BO-04 | Count the phases. | Exactly 2. | S2 |
| BO-05 | Beat the boss. | Victory; epilogue; run summary. | S1 |
| BO-06 | Lose to the boss. | Defeat; run summary; no extra credit. | S1 |
| BO-07 | Boss HP bar on V4. | Legible; the name is not cut. | S3 |

## 16. Heroes and equipment

| Id | Step | Expected | Sev. |
|---|---|---|---|
| HR-01 | Equip a weapon from the stash at camp. | The hero's card numbers update (e.g. Notched Blade +1 damage per hit) in the detail panel. | S2 |
| HR-02 | Equip a relic. | The passive applies (e.g. Iron Rosary: 6 Block at the start of each combat). | S2 |
| HR-03 | Fill the stash (6) and receive another item. | Clear choice to discard or replace; nothing lost silently. | S2 |
| HR-04 | Read every item's tooltip. | Name, slot, rarity and effect. | S3 |
| HR-05 | Skill tree (Alpha). | Spend Embers on a node; the option appears in the next run. | S2 |

## 17. Meta-progression

| Id | Step | Expected | Sev. |
|---|---|---|---|
| MT-01 | Finish a run (win or lose). | Embers = 2 × rounds cleared + 5 × elites won + 15 × bosses won, shown in the summary and stored. | S1 |
| MT-02 | Reload after the summary. | Embers total persists. | S1 |
| MT-03 | Spend Embers (Alpha). | The unlock appears in the next run; Embers drop. | S1 |
| MT-04 | Check that meta never gives raw stats (Alpha). | Unlocks are cards, variants or options only. | S2 |

## 18. Settings

Test every control with mouse, touch and keyboard.

| Id | Step | Expected | Sev. |
|---|---|---|---|
| ST-01 | Toggle fullscreen. | Mode changes without losing the run; zoom recalculates. | S3 |
| ST-02 | Set music volume to 0. | Music silent; SFX continue. | S2 |
| ST-03 | Set SFX volume to 0. | SFX silent; music continues. | S2 |
| ST-04 | Change language. | Every text changes, tooltips included. | S2 |
| ST-05 | Set the default game speed. | New combats start at that speed. | S3 |
| ST-06 | Set "Auto battle at combat start". | New combats start with Auto on. | S3 |
| ST-07 | Turn "Reduce screen shake" on and attack. | No shake; everything else unchanged. | S3 |
| ST-08 | Turn "Reduce flashes" on and hit / trigger the boss phase. | No full-screen flash; outline blink instead. | S2 |
| ST-09 | Change settings and reload. | Values persist. | S2 |
| ST-10 | UI text scale (Alpha). | Texts grow; nothing is cut. | S2 |

## 19. Pause

| Id | Step | Expected | Sev. |
|---|---|---|---|
| PS-01 | Pause with the gear button mid-turn. | The game stops; animations stop. | S1 |
| PS-02 | Pause with Esc (nothing selected). | Same as PS-01. | S2 |
| PS-03 | Resume with the button and with Esc. | Resumes from the same point; no action runs twice. | S1 |
| PS-04 | Pause during Auto. | Auto stops; resume continues. | S1 |
| PS-05 | Open Settings from pause. | Settings open; going back keeps the combat. | S2 |
| PS-06 | Abandon the run from pause. | Confirmation; nothing happens on cancel. | S2 |
| PS-07 | Switch tabs (blur) during a combat. | The game pauses or keeps a consistent state; audio does not stack on return. | S3 |

## 20. Save and continue

| Id | Step | Expected | Sev. |
|---|---|---|---|
| SV-01 | Enter a round. | Autosave written; "Continue" available. | S1 |
| SV-02 | Reload the page mid-combat. | Back at the start of the current player turn; nothing duplicated. | S1 |
| SV-03 | Close the tab mid-combat and reopen. | Same rule as SV-02. | S1 |
| SV-04 | Continue a saved run. | Map, deck, gold, heroes, HP, stress and equipment identical to the save. | S1 |
| SV-05 | Load a corrupted save. | The game warns and offers a new run; no freeze. | S1 |
| SV-06 | Load a save from an older version. | Migration, or a clear message; no crash. | S1 |
| SV-07 | Load a save from a newer (future) version. | Clear message; the save is not overwritten. | S1 |
| SV-08 | Reload the same turn several times and replay it. | Same draws and intents every time (fixed seed; no save scumming). | S2 |
| SV-09 | Open the run in two tabs. | One tab takes over; the other never overwrites silently. | S1 |
| SV-10 | Check the seed in the save. | Same as the run's seed. | S2 |
| SV-11 | Storage quota full. | Warning; the game keeps running. | S2 |

## 21. Language (EN and PT-BR)

| Id | Step | Expected | Sev. |
|---|---|---|---|
| IN-01 | Switch EN → PT-BR mid-run. | Texts change; run state preserved. | S1 |
| IN-02 | Switch PT-BR → EN mid-combat. | Same; no mixed text. | S2 |
| IN-03 | Look for English in PT-BR mode. | None (except approved proper nouns). | S3 |
| IN-04 | Look for raw keys (e.g. `card.shb_hack.name`). | No key ever shows on screen. | S2 |
| IN-05 | Long PT-BR tooltip text on V4. | Wraps without overflow; nothing leaves the panel. | S3 |
| IN-06 | Long names on cards. | The short name fits the 58 px strip; the full name is in the detail panel. | S3 |
| IN-07 | Accents and cedilla everywhere, including capitals ("AÇÃO"). | Correct glyphs; accents do not overlap the line above. | S4 |
| IN-08 | Numbers in each language. | Correct format per language. | S4 |
| IN-09 | Change language from the pause menu. | Text changes; combat stays paused. | S3 |

## 22. Input (touch, mouse, keyboard)

| Id | Step | Expected | Sev. |
|---|---|---|---|
| IP-01 | Every button works with touch on B3 and B4. | No dead button. | S2 |
| IP-02 | Long press shows a tooltip and does not confirm. | Tooltip only; action needs a short tap. | S2 |
| IP-03 | Every button has visible keyboard focus. | Focus always visible. | S2 |
| IP-04 | Play a whole screen with the keyboard only. | No unreachable element. | S2 |
| IP-05 | Nothing depends on hover. | No information only appears under the cursor. | S2 |
| IP-06 | Click outside a modal. | Behaves as designed; no click passes through to the scene behind. | S2 |
| IP-07 | Browser zoom at 200%. | Integer zoom recalculates; text legible; nothing overlaps. | S3 |
| IP-08 | Two-finger touch on the game area. | No page zoom or unintended action. | S3 |
| IP-09 | Visual response to every input within 0.1 s (screen recording). | No input above 0.1 s. | S2 |

## 23. Audio: locked and unlocked

| Id | Step | Expected | Sev. |
|---|---|---|---|
| AD-01 | Open the game and touch nothing. | No sound; "Tap to start" is shown. | S3 |
| AD-02 | First tap. | Audio unlocked; menu music starts. | S2 |
| AD-03 | Block audio in the browser after unlocking. | The game continues without freezing. | S3 |
| AD-04 | Switch tabs and come back. | Music resumes or stays paused; no overlap. | S3 |
| AD-05 | SFX when playing a card. | Plays within 0.1 s. | S3 |
| AD-06 | The same SFX twice at the same time. | At most 2 instances; no volume spike. | S3 |
| AD-07 | Music changes between menu, map, combat and boss. | 800 ms crossfade, no click; seamless loops. | S3 |
| AD-08 | Listen to each loop for three cycles. | No silence or jump at the seam. | S3 |
| AD-09 | Play at 100% volume and listen for clipping. | No audible distortion. | S3 |

## 24. Accessibility

| Id | Step | Expected | Sev. |
|---|---|---|---|
| AX-01 | Simulate protanopia, deuteranopia and tritanopia in DevTools. | All information readable without relying on colour. | S2 |
| AX-02 | Check main text contrast on its panel. | At least 4.5:1 for normal text (measure with a tool). | S2 |
| AX-03 | Navigate the whole game with the keyboard. | No dead end. | S2 |
| AX-04 | Screen reader (NVDA or VoiceOver) on the HTML shell (loading, errors). | Messages are announced. Canvas content is out of scope. | S3 |
| AX-05 | Play with audio off. | The whole game stays understandable. | S2 |
| AX-06 | Important SFX have a visual counterpart. | Collapse, boss phase, fall, victory and defeat have text or icons. | S3 |
| AX-07 | Touch target sizes on V4. | Primary ≥ 44×44 CSS px; nothing tappable below 24×24 (Art Bible §3.3). | S2 |

## 25. Performance

| Id | Step | Expected | Sev. |
|---|---|---|---|
| PF-01 | Measure FPS in combat on V2. | 60 FPS most of the time; rare drops. | S3 |
| PF-02 | Measure FPS in combat on a mid-range phone (V4). | 30 FPS or more; no long freeze. | S2 |
| PF-03 | Measure FPS on an old, low-end phone. | The game runs; the drop is recorded. | S3 |
| PF-04 | Play a whole run and watch memory. | No severe continuous growth. | S2 |
| PF-05 | Time to load Act 1 from the menu. | Below the limit set in the PLAN. | S3 |

## 26. Errors and console

| Id | Step | Expected | Sev. |
|---|---|---|---|
| ER-01 | Read the console through a whole run. | No red errors; warnings justified. | S3 |
| ER-02 | Force a network error mid-combat. | Error screen or retry; no white screen. | S2 |
| ER-03 | Force an exception on a loaded asset (fallback test). | Visual fallback; clear log. | S2 |
| ER-04 | Press every button on every screen and check the console. | No unhandled error. | S3 |
| ER-05 | Check that no error exposes sensitive data. | No key, token or personal data. | S1 |

## 27. Quick regression (before every release)

Run at least: BT-01, MM-02, NR-02, CB-01, CB-15, CB-31, AU-06, VL-07, CP-02, PS-03, SV-02, SV-04, IN-01, AD-02, AX-01, PF-01.

## Report

For every failure record: id, browser, viewport, language, seed, actual steps, observed result, screenshot and console excerpt. An S1 or S2 failure blocks the release. Reports go to `docs/reports/qa-<phase>-<date>.md`.
