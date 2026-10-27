# Prototype QA report (2026-10-26)

Scope: the prototype (Act 1 only, web), mapped item by item to `docs/qa/human-qa-prototype.md`. Scope rule from `docs/gdd.md` section 2: items for Alpha or later are N/A-PROTOTYPE.

Status meanings:

- AUTOMATED: an existing test asserts the expected result. Notes list any clause that is not asserted.
- MANUAL-PENDING: needs a human (feel, sound by ear, real devices, Safari, Firefox), or no automated assertion exists yet. Notes give the closest automated evidence.
- N/A-PROTOTYPE: outside prototype scope per GDD section 2.

Automated evidence is at rule level in `tests/unit/*` and at flow level in `tests/e2e/*` and `tests/smoke/*`. Several e2e specs drive the game through test hooks (`window.__botStep`, `__combat`, `__startRun`) rather than tapping party select or the map, so UI selection is not covered by them.

## Commands run

Run on 2026-10-26 in C:\dev\project-alpha.

| Command | Result |
| --- | --- |
| `bun test tests/unit` | 85 pass, 0 fail, 50405 expect() calls, 5 files, 4.00 s |
| `bunx playwright test --reporter=line --project=desktop-1280x720` | 10 passed (17.3 s) |
| `bunx playwright test --reporter=line --project=mobile-landscape-844x390` | 10 passed (18.3 s) |

Before the Playwright runs, `playwright.config.ts` gained `testIgnore: ['**/unit/**']`. Playwright loaded the Bun unit tests (which import `bun:test`) and failed with "Received protocol 'bun:'" before this change. The 10 Playwright tests per project are 5 in `menus-and-save`, 2 in `screens`, 1 in `manual-play`, 1 in `full-act`, and 1 smoke.

## Summary

| Area | Items | AUTOMATED | MANUAL-PENDING | N/A-PROTOTYPE |
| --- | --- | --- | --- | --- |
| 1. Boot, loading and fallbacks | 10 | 1 | 9 | 0 |
| 2. Title and main menu | 7 | 3 | 4 | 0 |
| 3. New run and party select | 8 | 2 | 6 | 0 |
| 4. Map | 8 | 0 | 8 | 0 |
| 5. Combat: playing cards | 14 | 6 | 8 | 0 |
| 6. Combat: turn, intents and preview | 16 | 5 | 11 | 0 |
| 7. Combat: victory, defeat and falling | 7 | 4 | 3 | 0 |
| 8. Auto battle | 8 | 1 | 7 | 0 |
| 9. Game speed (1x, 2x, 3x) | 7 | 1 | 6 | 0 |
| 10. Rewards | 6 | 1 | 5 | 0 |
| 11. Camp | 6 | 1 | 5 | 0 |
| 12. Shop node | 8 | 1 | 7 | 0 |
| 13. Rest node | 5 | 2 | 3 | 0 |
| 14. Events | 5 | 0 | 0 | 5 |
| 15. Boss | 7 | 3 | 4 | 0 |
| 16. Heroes and items | 5 | 2 | 2 | 1 |
| 17. Meta progression | 4 | 0 | 2 | 2 |
| 18. Settings | 10 | 0 | 9 | 1 |
| 19. Pause | 7 | 4 | 3 | 0 |
| 20. Save and resume | 11 | 5 | 6 | 0 |
| 21. Internationalisation | 9 | 0 | 9 | 0 |
| 22. Input and touch | 9 | 0 | 9 | 0 |
| 23. Audio | 9 | 0 | 9 | 0 |
| 24. Accessibility | 7 | 0 | 7 | 0 |
| 25. Performance | 5 | 0 | 5 | 0 |
| 26. Errors and robustness | 5 | 1 | 4 | 0 |
| **Total** | **203** | **43** | **151** | **9** |

## Item mapping

### 1. Boot, loading and fallbacks

| ID | Status | Evidence / note |
| --- | --- | --- |
| BT-01 | AUTOMATED | tests/smoke/boot.spec.ts: Title active, canvas visible, zero page and console errors (fresh context, both projects). |
| BT-02 | MANUAL-PENDING | Throttled-network timing not automated. |
| BT-03 | MANUAL-PENDING | Sprites are code-drawn placeholders (ADR 0014); no sprite file to block until the PixelLab batch. |
| BT-04 | MANUAL-PENDING | Blocked audio file not automated. |
| BT-05 | MANUAL-PENDING | WebGL disable flag not automated; fallback behaviour not verified. |
| BT-06 | MANUAL-PENDING | Offline reload not automated. |
| BT-07 | MANUAL-PENDING | Server-down error screen not verified. |
| BT-08 | MANUAL-PENDING | Private window not automated. |
| BT-09 | MANUAL-PENDING | Width below 320 px not in the Playwright projects. |
| BT-10 | MANUAL-PENDING | Version footer vs build record not checked. |

### 2. Title and main menu

| ID | Status | Evidence / note |
| --- | --- | --- |
| MM-01 | MANUAL-PENDING | No-save path asserted (tests/e2e/menus-and-save.spec.ts:118-131); disabled look of Continue not verified. |
| MM-02 | AUTOMATED | tests/e2e/menus-and-save.spec.ts:216: reload mid-combat, Continue lands in the same combat view. |
| MM-03 | MANUAL-PENDING | Focus visuals (corner brackets) and keyboard activation not automated. |
| MM-04 | AUTOMATED | tests/e2e/menus-and-save.spec.ts:118: every menu button taps and responds. 0.1 s timing not measured. |
| MM-05 | AUTOMATED | tests/e2e/menus-and-save.spec.ts:145: language switch changes the menu (asserts "Nova run"). Other screens and English-leak check not automated. |
| MM-06 | MANUAL-PENDING | Zoom maths in tests/unit/view.test.ts:24-44; resize behaviour and button clickability not automated. |
| MM-07 | MANUAL-PENDING | Footer legibility and overlap not automated. |

### 3. New run and party select

| ID | Status | Evidence / note |
| --- | --- | --- |
| NR-01 | MANUAL-PENDING | Party select UI not automated (bot hooks skip it). |
| NR-02 | MANUAL-PENDING | window.__startRun bypasses party select; rank order via UI not asserted. |
| NR-03 | MANUAL-PENDING | Disabled start with reason not automated. |
| NR-04 | MANUAL-PENDING | Seed display and copy not automated. |
| NR-05 | AUTOMATED | tests/e2e/menus-and-save.spec.ts:177: abandon needs two taps, returns to menu. Run removal not asserted explicitly. |
| NR-06 | AUTOMATED | tests/unit/run.test.ts:127 (same seed, same map), :176 (same state for same seed and commands); combat.test.ts:237 (turn 1 hand of 5). |
| NR-07 | MANUAL-PENDING | Typed-seed field not verified (may not exist). |
| NR-08 | MANUAL-PENDING | Row sizes and node types: tests/unit/run.test.ts:78. Boss in row 10 not confirmed. |

### 4. Map

| ID | Status | Evidence / note |
| --- | --- | --- |
| MP-01 | MANUAL-PENDING | Node selection UI not automated. |
| MP-02 | MANUAL-PENDING | Unreachable-node hint not automated. |
| MP-03 | MANUAL-PENDING | Keyboard map navigation not automated. |
| MP-04 | MANUAL-PENDING | Forward-only edges asserted (run.test.ts:78); offered-nodes UI not asserted. |
| MP-05 | MANUAL-PENDING | Distinct icons and labels are a visual check. |
| MP-06 | MANUAL-PENDING | Elite-row pairing and rows 9-10 contents not asserted. |
| MP-07 | MANUAL-PENDING | Rotation rescale not automated. |
| MP-08 | MANUAL-PENDING | Long-press tooltip not automated. |

### 5. Combat: playing cards

| ID | Status | Evidence / note |
| --- | --- | --- |
| CB-01 | AUTOMATED | tests/e2e/manual-play.spec.ts:38: tap card, tap target; card leaves hand and energy drops. First-tap preview not asserted. |
| CB-02 | MANUAL-PENDING | Drag and release not automated. |
| CB-03 | MANUAL-PENDING | Keyboard 1-9/0, Tab, Enter, Esc not automated. |
| CB-04 | AUTOMATED | tests/unit/combat.test.ts:254: card without energy rejected. Visual cost hint is manual. |
| CB-05 | AUTOMATED | tests/unit/combat.test.ts:254: card of wrong rank rejected. Red cross icon is manual. |
| CB-06 | MANUAL-PENDING | Fallen-hero card grey-out not asserted. |
| CB-07 | AUTOMATED | tests/unit/combat.test.ts:65: Volley 4 x2 on every enemy. Preview target list not asserted. |
| CB-08 | AUTOMATED | tests/unit/combat.test.ts:76: Brace gives 6 to self, 2 to others. |
| CB-09 | MANUAL-PENDING | Exhaust pile and counter not asserted. |
| CB-10 | MANUAL-PENDING | Cancel by tapping outside not automated. |
| CB-11 | MANUAL-PENDING | Input during animation not automated. |
| CB-12 | MANUAL-PENDING | Double-tap single play not automated. |
| CB-13 | AUTOMATED | tests/unit/combat.test.ts:254: no energy rejected. Explanation text is manual. |
| CB-14 | MANUAL-PENDING | Push and Pull distance asserted (combat.test.ts:284); intent retarget not asserted. |

### 6. Combat: turn, intents and preview

| ID | Status | Evidence / note |
| --- | --- | --- |
| CB-15 | AUTOMATED | tests/unit/combat.test.ts:244: enemies act by Speed, ties by rank. End Turn button tap not asserted. |
| CB-16 | MANUAL-PENDING | Space key not automated. |
| CB-17 | AUTOMATED | tests/unit/combat.test.ts:244: order matches Speed. Queue visibility is manual. |
| CB-18 | MANUAL-PENDING | Intent icon, number and target marker are visual. |
| CB-19 | MANUAL-PENDING | Intent tooltip not automated. |
| CB-20 | MANUAL-PENDING | Intent-to-damage match and no unseen source not asserted in UI. |
| CB-21 | MANUAL-PENDING | Preview display not automated; damage maths in combat.test.ts:32. |
| CB-22 | MANUAL-PENDING | No percentage text in combat: no test. A grep-based test would cover it. |
| CB-23 | MANUAL-PENDING | Turn-1 hand of 5 (combat.test.ts:237); hand limit 10 not asserted. |
| CB-24 | MANUAL-PENDING | Counter display vs contents not asserted. |
| CB-25 | AUTOMATED | tests/unit/combat.test.ts:273: discard reshuffles into draw when draw is empty. Counter display is manual. |
| CB-26 | MANUAL-PENDING | Status icons and tooltips are visual. |
| CB-27 | AUTOMATED | tests/unit/combat.test.ts:111 and :124: Bleed, Burn, Marked, Weakened decay timing. |
| CB-28 | MANUAL-PENDING | Buff and debuff separate display is visual. |
| CB-29 | MANUAL-PENDING | Colour-vision simulation is manual. |
| CB-30 | AUTOMATED | tests/unit/combat.test.ts:171: stress 10 resets to 5, -1 energy next turn. Collapse feedback is manual. |

### 7. Combat: victory, defeat and falling

| ID | Status | Evidence / note |
| --- | --- | --- |
| CB-31 | AUTOMATED | tests/unit/run.test.ts:256 (combat gold 10-16); tests/e2e/full-act.spec.ts:15 (bot Act 1 through reward to summary). |
| CB-32 | AUTOMATED | tests/unit/combat.test.ts:226: all heroes fallen is defeat. Run summary with Embers is manual. |
| CB-33 | AUTOMATED | tests/unit/combat.test.ts:197: fall gives +2 stress, ranks collapse. Grey-out is manual. |
| CB-34 | AUTOMATED | tests/unit/combat.test.ts:197: fallen return at 1 HP injured. The -25% max HP value is not asserted. |
| CB-35 | MANUAL-PENDING | New run restoring a fallen hero not asserted. |
| CB-36 | MANUAL-PENDING | Elite gold 28-36 and equipment drop not asserted. |
| CB-37 | MANUAL-PENDING | Resolution order vs tooltips not asserted. |

### 8. Auto battle

| ID | Status | Evidence / note |
| --- | --- | --- |
| AU-01 | MANUAL-PENDING | Auto button and visible actions not automated. |
| AU-02 | MANUAL-PENDING | Auto off mid-player-phase not automated. |
| AU-03 | MANUAL-PENDING | Auto off or on in enemy phase not automated. |
| AU-04 | MANUAL-PENDING | Auto at 3x visibility not automated. |
| AU-05 | MANUAL-PENDING | Manual play after Auto not automated. |
| AU-06 | AUTOMATED | tests/unit/combat.test.ts:512: auto policy issues only valid commands and finishes combats. |
| AU-07 | MANUAL-PENDING | Auto setting on leave not automated. |
| AU-08 | MANUAL-PENDING | No confirmation dialog during Auto not automated. |

### 9. Game speed (1x, 2x, 3x)

| ID | Status | Evidence / note |
| --- | --- | --- |
| VL-01 | MANUAL-PENDING | Speed switch and faster animation not automated. |
| VL-02 | MANUAL-PENDING | Mid-animation speed change not automated. |
| VL-03 | MANUAL-PENDING | Mid-animation speed change not automated. |
| VL-04 | MANUAL-PENDING | Speed change in enemy phase not automated. |
| VL-05 | MANUAL-PENDING | Speed change while paused not automated. |
| VL-06 | MANUAL-PENDING | Valid speed kept on load (tests/unit/view.test.ts:130); restore on new combat not automated. |
| VL-07 | AUTOMATED | tests/e2e/menus-and-save.spec.ts:267: same seed at 1x and 3x gives same summary (both projects). GDD section 20 criterion 6 (100 seeds) not run. |

### 10. Rewards

| ID | Status | Evidence / note |
| --- | --- | --- |
| RW-01 | AUTOMATED | tests/unit/run.test.ts:256: gold and 3 distinct offers. Party-pool membership not asserted. |
| RW-02 | MANUAL-PENDING | Card joins deck not asserted. |
| RW-03 | MANUAL-PENDING | Skip flow not asserted. |
| RW-04 | MANUAL-PENDING | Rarity frame and colour are visual. |
| RW-05 | MANUAL-PENDING | V4 fit is visual. |
| RW-06 | MANUAL-PENDING | Esc on reward screen not automated. |

### 11. Camp

| ID | Status | Evidence / note |
| --- | --- | --- |
| CP-01 | MANUAL-PENDING | Camp offers and prices on screen not automated. |
| CP-02 | MANUAL-PENDING | Swap not asserted; tests/unit/run.test.ts:309 covers purchase spend only. |
| CP-03 | MANUAL-PENDING | Swap blocked without gold not asserted. |
| CP-04 | MANUAL-PENDING | Bind wounds 15% and Vigil not asserted (rest 30% in run.test.ts:331 is a different service). |
| CP-05 | MANUAL-PENDING | Free reorder and next-combat order not asserted. |
| CP-06 | AUTOMATED | tests/unit/run.test.ts:309: leaving returns to the map. |

### 12. Shop node

| ID | Status | Evidence / note |
| --- | --- | --- |
| SH-01 | MANUAL-PENDING | Stock of 5 cards in run.test.ts:290; 2 equipment and UI not asserted. |
| SH-02 | MANUAL-PENDING | Shop purchase effect not asserted (camp purchase in run.test.ts:309). |
| SH-03 | MANUAL-PENDING | Blocked purchase not asserted. |
| SH-04 | MANUAL-PENDING | Removal effect on deck not asserted; price step in run.test.ts:290. |
| SH-05 | AUTOMATED | tests/unit/run.test.ts:290: removal price grows by 25 per removal. |
| SH-06 | MANUAL-PENDING | Sold-out rule tested for camp (run.test.ts:309), not confirmed for shop. |
| SH-07 | MANUAL-PENDING | Leave without buying not asserted for shop. |
| SH-08 | MANUAL-PENDING | Double-tap single purchase not automated. |

### 13. Rest node

| ID | Status | Evidence / note |
| --- | --- | --- |
| RS-01 | MANUAL-PENDING | Exclusive choice UI not automated. |
| RS-02 | AUTOMATED | tests/unit/run.test.ts:331: Recover heals 30% and clears injury. Rounding down not asserted. |
| RS-03 | MANUAL-PENDING | Temper choice not asserted; upgrade table in combat.test.ts:362. |
| RS-04 | AUTOMATED | tests/unit/run.test.ts:331: Pray gives -5 stress. |
| RS-05 | MANUAL-PENDING | Taking two options not automated. |

### 14. Events

| ID | Status | Evidence / note |
| --- | --- | --- |
| EV-01 | N/A-PROTOTYPE | Event node is Alpha scope (GDD section 2, Node types). |
| EV-02 | N/A-PROTOTYPE | Event node is Alpha scope (GDD section 2). |
| EV-03 | N/A-PROTOTYPE | Event node is Alpha scope (GDD section 2). |
| EV-04 | N/A-PROTOTYPE | Event node is Alpha scope (GDD section 2). |
| EV-05 | N/A-PROTOTYPE | Event node is Alpha scope (GDD section 2). |

### 15. Boss

| ID | Status | Evidence / note |
| --- | --- | --- |
| BO-01 | MANUAL-PENDING | Two-rank boss placement and HP bar not automated. |
| BO-02 | MANUAL-PENDING | Toll, Clapper, Resonance cycle not asserted. |
| BO-03 | AUTOMATED | tests/unit/combat.test.ts:406: phase 2 at HP <= 80, debuffs cleared, intent replaced. Flash, shake and banner are manual. |
| BO-04 | MANUAL-PENDING | Exactly two phases not asserted. |
| BO-05 | AUTOMATED | tests/unit/run.test.ts:382: boss victory grants legendary item and 15 Embers. Epilogue is manual. |
| BO-06 | AUTOMATED | tests/unit/combat.test.ts:226: defeat rule. Boss-specific summary not asserted. |
| BO-07 | MANUAL-PENDING | HP bar legibility on V4 is visual. |

### 16. Heroes and items

| ID | Status | Evidence / note |
| --- | --- | --- |
| HR-01 | AUTOMATED | tests/unit/combat.test.ts:463: Notched Blade +1 per hit. Detail panel update is manual. |
| HR-02 | AUTOMATED | tests/unit/combat.test.ts:463: Iron Rosary 6 Block on turn 1 (GDD accepted rule). Passive display is manual. |
| HR-03 | MANUAL-PENDING | Full stash (6) prompt not asserted; GDD rule "full stash blocks" not tested. |
| HR-04 | MANUAL-PENDING | Item tooltip content is visual. |
| HR-05 | N/A-PROTOTYPE | Skill tree is Alpha scope (GDD section 2, Meta row). |

### 17. Meta progression

| ID | Status | Evidence / note |
| --- | --- | --- |
| MT-01 | MANUAL-PENDING | Embers formula: only the boss part is asserted (run.test.ts:382); rounds and elites not asserted. |
| MT-02 | MANUAL-PENDING | Embers persistence after reload not asserted. |
| MT-03 | N/A-PROTOTYPE | Spending Embers is Alpha scope (GDD section 2, Meta row). |
| MT-04 | N/A-PROTOTYPE | Unlocks are Alpha scope (GDD section 2, Meta row). |

### 18. Settings

| ID | Status | Evidence / note |
| --- | --- | --- |
| ST-01 | MANUAL-PENDING | Fullscreen toggle not automated. |
| ST-02 | MANUAL-PENDING | Music volume 0 not automated. |
| ST-03 | MANUAL-PENDING | SFX volume 0 not automated. |
| ST-04 | MANUAL-PENDING | Language change in menu asserted (menus-and-save.spec.ts:145); tooltips and other screens not. |
| ST-05 | MANUAL-PENDING | Default speed applied to new combat not asserted. |
| ST-06 | MANUAL-PENDING | Auto at combat start not asserted. |
| ST-07 | MANUAL-PENDING | Screen shake reduction not automated. |
| ST-08 | MANUAL-PENDING | Flash reduction not automated. |
| ST-09 | MANUAL-PENDING | Rows 4-6 and language persist after reload (menus-and-save.spec.ts:145); rows 1-3 and 7-8 not asserted. |
| ST-10 | N/A-PROTOTYPE | UI text scale is Alpha scope (marked Alpha in human-qa.md). |

### 19. Pause

| ID | Status | Evidence / note |
| --- | --- | --- |
| PS-01 | AUTOMATED | tests/e2e/menus-and-save.spec.ts:177: pause opens from combat. Animation stop is manual. |
| PS-02 | MANUAL-PENDING | Esc to pause not automated. |
| PS-03 | AUTOMATED | tests/e2e/menus-and-save.spec.ts:177: resume keeps the same combat view. Esc resume not automated. |
| PS-04 | MANUAL-PENDING | Pause during Auto not automated. |
| PS-05 | AUTOMATED | tests/e2e/menus-and-save.spec.ts:177: settings back keeps the combat. |
| PS-06 | AUTOMATED | tests/e2e/menus-and-save.spec.ts:177: abandon needs two taps. Cancel path not asserted. |
| PS-07 | MANUAL-PENDING | Blur and audio stacking not automated. |

### 20. Save and resume

| ID | Status | Evidence / note |
| --- | --- | --- |
| SV-01 | AUTOMATED | tests/e2e/menus-and-save.spec.ts:216: Continue available after reload. Autosave timing not asserted. |
| SV-02 | AUTOMATED | tests/e2e/menus-and-save.spec.ts:216: reload mid-combat, same combat view. |
| SV-03 | MANUAL-PENDING | Closing and reopening the tab not automated (the test uses reload). |
| SV-04 | AUTOMATED | tests/unit/run.test.ts:199 (round trip) and :215 (mid-combat save resumes identically). |
| SV-05 | AUTOMATED | tests/unit/run.test.ts:199: corrupt save gives null. Warning message is manual. |
| SV-06 | MANUAL-PENDING | No older-version save fixture; migration not verified. |
| SV-07 | MANUAL-PENDING | Newer-version save not overwritten: not tested. |
| SV-08 | AUTOMATED | tests/unit/run.test.ts:176: same seed and commands give same state. Save-scumming UI not tested. |
| SV-09 | MANUAL-PENDING | Two-tab takeover not automated. |
| SV-10 | MANUAL-PENDING | Seed field equality in the save not asserted explicitly. |
| SV-11 | MANUAL-PENDING | Storage quota full not automated. |

### 21. Internationalisation

| ID | Status | Evidence / note |
| --- | --- | --- |
| IN-01 | MANUAL-PENDING | Mid-run language switch not automated. |
| IN-02 | MANUAL-PENDING | Mid-combat language switch not automated. |
| IN-03 | MANUAL-PENDING | English leak in PT-BR not automated (key parity only: tests/unit/i18n.test.ts:28,33). |
| IN-04 | MANUAL-PENDING | Raw key on screen not automated (t() returns key only when missing: view.test.ts:62). |
| IN-05 | MANUAL-PENDING | Tooltip wrap on V4 is visual. |
| IN-06 | MANUAL-PENDING | Name fit in 58 px strip is visual. |
| IN-07 | MANUAL-PENDING | Accent and cedilla rendering is visual. |
| IN-08 | MANUAL-PENDING | Number format per language not asserted. |
| IN-09 | MANUAL-PENDING | Language change from pause not automated. |

### 22. Input and touch

| ID | Status | Evidence / note |
| --- | --- | --- |
| IP-01 | MANUAL-PENDING | Touch on B3 and B4 needs real devices; Chromium touch emulation only. |
| IP-02 | MANUAL-PENDING | Long press tooltip vs confirm not automated. |
| IP-03 | MANUAL-PENDING | Visible focus not automated. |
| IP-04 | MANUAL-PENDING | Keyboard-only traversal not automated. |
| IP-05 | MANUAL-PENDING | Hover dependency check is manual. |
| IP-06 | MANUAL-PENDING | Click through modal not automated. |
| IP-07 | MANUAL-PENDING | Browser zoom 200% not automated. |
| IP-08 | MANUAL-PENDING | Two-finger touch needs real device. |
| IP-09 | MANUAL-PENDING | Input latency needs screen recording. |

### 23. Audio

| ID | Status | Evidence / note |
| --- | --- | --- |
| AD-01 | MANUAL-PENDING | Audio gating and "Tap to start" by ear. |
| AD-02 | MANUAL-PENDING | Audio unlock by ear. |
| AD-03 | MANUAL-PENDING | Blocked audio behaviour not automated. |
| AD-04 | MANUAL-PENDING | Tab switch audio by ear. |
| AD-05 | MANUAL-PENDING | SFX latency by ear and timing. |
| AD-06 | MANUAL-PENDING | Concurrent SFX limit not automated. |
| AD-07 | MANUAL-PENDING | Crossfade 800 ms by ear. |
| AD-08 | MANUAL-PENDING | Loop seam by ear. Music is 60 s (see known issues). |
| AD-09 | MANUAL-PENDING | Clipping by ear. Loudness not measured after loudnorm. |

### 24. Accessibility

| ID | Status | Evidence / note |
| --- | --- | --- |
| AX-01 | MANUAL-PENDING | Colour-vision simulation is manual. |
| AX-02 | MANUAL-PENDING | Contrast measurement with a tool is manual. |
| AX-03 | MANUAL-PENDING | Keyboard traversal not automated. |
| AX-04 | MANUAL-PENDING | Screen reader check is manual. |
| AX-05 | MANUAL-PENDING | Audio-off playthrough is manual. |
| AX-06 | MANUAL-PENDING | Visual counterpart for SFX is manual. |
| AX-07 | MANUAL-PENDING | Touch target sizes not measured. |

### 25. Performance

| ID | Status | Evidence / note |
| --- | --- | --- |
| PF-01 | MANUAL-PENDING | FPS needs a profiler on V2. |
| PF-02 | MANUAL-PENDING | FPS on a mid-range phone needs a device. |
| PF-03 | MANUAL-PENDING | Low-end phone needs a device. |
| PF-04 | MANUAL-PENDING | Memory over a run needs a profiler. |
| PF-05 | MANUAL-PENDING | Load time not measured against the PLAN limit. |

### 26. Errors and robustness

| ID | Status | Evidence / note |
| --- | --- | --- |
| ER-01 | AUTOMATED | tests/e2e/full-act.spec.ts:15 and tests/e2e/screens.spec.ts assert zero page or console errors. Warnings not reviewed. |
| ER-02 | MANUAL-PENDING | Network error mid-combat not automated. |
| ER-03 | MANUAL-PENDING | Asset fallback forced exception not automated. |
| ER-04 | MANUAL-PENDING | Every button on every screen not automated. |
| ER-05 | MANUAL-PENDING | Sensitive data in errors is manual review. |

## Known issues

1. The 8 px monospace "o" reads like "a" at the prototype's text size. Visual fix pending.
2. Music loops are 60 s (generated 2026-10-26, `art-src/audio/generation-log.json`). Art Bible section 13.1 targets 90-120 s in Alpha. Loops are accepted for the prototype; the AD-08 seam check is still manual.
3. SFX minimum duration is 0.5 s (ElevenLabs rejects less with HTTP 400). `sfx.ui.tap` is therefore 0.48 s in the repo files (ffprobe), not trimmed.
4. Pixel sprites are code-drawn placeholders (ADR 0014). The PixelLab batch has not run. PixelLab shows the subscription as expired (get_balance); the developer's account shows 1,600 of 5,000 used. These figures are not reconciled.
5. Not run: Safari (B3), Firefox (B2), and any real phone (B4, V3, V4 on device). Chromium only, in Playwright emulation.
6. Audio loudness after loudnorm was not measured. Targets are I=-16 for music and I=-14 for SFX.
7. No automated check for "no percentage in combat" (CB-22) or for "no raw key on screen" (IN-04). Both need tests.
8. e2e specs reach combat through test hooks, so party select, map selection and most of the UI flow are not covered by automation.
9. `playwright.config.ts` testDir includes `tests`; the unit folder is now excluded (see Commands run).

## Not verified

- Items marked MANUAL-PENDING with "not verified" in their notes (BT-05, BT-07, NR-07, SV-06, SV-07, MM-01).
- Whether the menu footer shows the build version (BT-10, MM-07).
- Whether the typed-seed field exists (NR-07).
