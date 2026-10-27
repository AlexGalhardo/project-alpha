# Human QA script (1.0)

Manual pass for a release candidate. Budget: about 45 minutes. Each step has the expected result and a box to tick: ☐ pass, ✗ fail. Note the failing step ID and what you saw. Automated coverage is in `tests/`; this script covers what automation cannot judge (feel, reading, sound, real devices).

The prototype script (203 items) is archived as `docs/qa/human-qa-prototype.md`; its IDs are used by `docs/reports/2026-10-26-qa-prototype.md`.

## Severities

| Level | Meaning |
|---|---|
| S1 | Crash, save loss or corruption, or the run cannot be finished. Stop and report at once. |
| S2 | A main flow is blocked, or a rule is wrong with no way out. |
| S3 | Works, but with a visible error or poor feedback. |
| S4 | Cosmetic: text, alignment, colour with no effect on reading. |

## Environment

- Builds: desktop exe (`Ossuary.<version>.exe` from the GitHub release), web (`ossuary-web-v<version>.tar.gz`, extracted and served, or the live site), Android APK only if the release has one.
- Browser: Chrome, current version. Use DevTools device mode for the phone viewports. Note the exact version and OS.
- Save: start from a clean profile for section A; keep the same profile for sections D to G.

## A. Install and boot (5 min)

| ID | Step | Expected | Result |
|---|---|---|---|
| A1 | Download the exe from the release. Check it against `checksums.txt` with `sha256sum`. | The hash matches the release file. | ☐ / ✗ |
| A2 | Run the exe. | The window opens on the Title screen. The window may show a warning because the build is not code-signed. | ☐ / ✗ |
| A3 | Extract the web tarball, serve the folder with any static server, and open it. | Title screen shows within a few seconds. No blank page. | ☐ / ✗ |
| A4 | Open the live site in a private window. | Same Title screen. Storage warnings, if any, do not block play. | ☐ / ✗ |
| A5 | If an APK is attached: install it on an Android device and open it. If none is attached, mark N/A. | App opens to the Title screen, or N/A. | ☐ / ✗ / N/A |

## B. Viewports (5 min)

| ID | Step | Expected | Result |
|---|---|---|---|
| B1 | Desktop 1920×1080, Chrome. Open a combat. | The 640×360 layout fills the window with integer-free scaling; text is sharp, nothing overlaps. | ☐ / ✗ |
| B2 | Desktop 1280×720. Open the Map and a combat. | Everything fits; no clipped labels. | ☐ / ✗ |
| B3 | Phone portrait 390×844. Title and Menu. | Letterboxed, readable, no horizontal scroll. | ☐ / ✗ |
| B4 | Phone landscape 844×390. Combat with a full hand. | Hand cards, end-turn button and energy orb are all tappable. | ☐ / ✗ |
| B5 | Resize the desktop window while on the Map. | Layout rescales; the position on the map is kept. | ☐ / ✗ |

## C. Title, menu and settings (5 min)

| ID | Step | Expected | Result |
|---|---|---|---|
| C1 | Press New run, then Back, then Credits. | Each button responds at once; Credits shows the font and engine credits. | ☐ / ✗ |
| C2 | Settings: switch the language to Português (PT-BR). | Every visible text changes; no key names (for example `hud.round`) show. | ☐ / ✗ |
| C3 | Set music volume to 0, then SFX volume to 0. | Music and effects go silent separately. | ☐ / ✗ |
| C4 | Turn on "Reduce screen shake" and "Reduce flashes", then close and reopen Settings. | Both stay on after reopening. | ☐ / ✗ |
| C5 | Set the default game speed to 3x. Start a combat. | The combat starts at 3x. | ☐ / ✗ |

## D. A run through three acts (15 min)

| ID | Step | Expected | Result |
|---|---|---|---|
| D1 | New run. Party select shows 5 heroes and a Rite selector. Pick 3 heroes and order them. | Start is enabled only with 3 heroes. Rank order matches the order you picked. | ☐ / ✗ |
| D2 | Choose Rite 0 (none). Start. | The Act 1 Map opens with 10 rows; the boss is in row 10. | ☐ / ✗ |
| D3 | Tap a reachable node. | It is selected and its type (icon and label) shows before entering. | ☐ / ✗ |
| D4 | In a combat, read an enemy's intent. | Target, damage per hit, hit count, and any debuff with its amount (for example "bleed 3") are visible. | ☐ / ✗ |
| D5 | Play a card: tap it, then tap a highlighted target. | The preview shows the final number before you confirm. Energy drops after confirm. | ☐ / ✗ |
| D6 | Try a card with no energy, and a card from a rank it cannot play from. | Each is refused with a reason shown (greyed or cross icon). | ☐ / ✗ |
| D7 | Let a hero reach 10 stress. | Collapse feedback shows; next turn has one less energy; the hero drops to 5 stress. | ☐ / ✗ |
| D8 | Win a combat. Take a card from the Reward screen. Visit the Camp, then leave. | Each screen works; the card joins the deck; Camp leave returns to the Map. | ☐ / ✗ |
| D9 | Beat the Act 1 boss (Bell-Maw). | Victory-style feedback, then the Sanctum (see E). | ☐ / ✗ |
| D10 | Optional, long: keep a combat going past turn 10. | From turn 10 enemies gain Might each turn ("Enraged" shows). Skip if it takes too long. | ☐ / ✗ / skipped |

## E. Sanctum (5 min)

| ID | Step | Expected | Result |
|---|---|---|---|
| E1 | After the Act 1 boss reward, the Sanctum opens. | Injuries are cleared; four options are shown: Rest, Purge, Temper, Tithe. | ☐ / ✗ |
| E2 | Choose Rest. | Every hero goes to full HP; the camp opens. | ☐ / ✗ |
| E3 | Start a new run, reach the Sanctum, choose Purge with 2 or more cards. Pick 2 cards. | Both cards leave the deck; the camp opens. | ☐ / ✗ |
| E4 | Choose Tithe. | Gold rises by 60. | ☐ / ✗ |

## F. Legacy and Veteran start (5 min)

| ID | Step | Expected | Result |
|---|---|---|---|
| F1 | Finish a run (win or lose). Read the Summary. | Embers earned are shown and banked; the Summary returns to the Menu. | ☐ / ✗ |
| F2 | Menu → Legacy. Buy node I for one hero. | Embers go down by the node cost (10); the node shows as owned after reload. | ☐ / ✗ |
| F3 | Start a new run with a hero that has node III (buy the nodes if needed). | The party screen shows the Veteran start toggle, on by default. | ☐ / ✗ |
| F4 | Start with the toggle on. Open the deck. | The hero's first Strike is replaced by card A (for example Marksman has Ricochet). | ☐ / ✗ |

## G. Save and continue (5 min)

| ID | Step | Expected | Result |
|---|---|---|---|
| G1 | Mid-combat (after playing two cards), reload the page. | Menu shows Continue. Continue lands in the same combat with the same hand and energy. | ☐ / ✗ |
| G2 | Close the tab mid-run, reopen the same address. | Continue resumes the run. | ☐ / ✗ |
| G3 | Abandon the run from Pause (two taps). Reload. | Continue is gone; the run is not resumed. | ☐ / ✗ |

## H. Pause, auto battle and speed (3 min)

| ID | Step | Expected | Result |
|---|---|---|---|
| H1 | Press the gear button in a combat. Resume. | Pause opens; Resume returns to the same point; no action runs twice. | ☐ / ✗ |
| H2 | Turn Auto on at a combat's start. Let it finish the combat. | The party plays on its own; the combat ends with victory or defeat; no freeze. | ☐ / ✗ |
| H3 | Switch speed 1x → 2x → 3x during the enemy phase. | Animations speed up; the enemy phase keeps its order. | ☐ / ✗ |

## I. Touch and input (2 min, phone)

| ID | Step | Expected | Result |
|---|---|---|---|
| I1 | Long-press an intent icon. | A tooltip explains it; the action is not taken. | ☐ / ✗ |
| I2 | Tap the end-turn button twice quickly. | Only one turn ends. | ☐ / ✗ |
| I3 | Tap a card while an animation runs. | Nothing plays twice; the tap is ignored or queued (no double play). | ☐ / ✗ |

## Results

| Section | Steps | Pass | Fail | N/A or skipped |
|---|---|---|---|---|
| A. Install and boot | 5 | | | |
| B. Viewports | 5 | | | |
| C. Title, menu and settings | 5 | | | |
| D. Three acts | 10 | | | |
| E. Sanctum | 4 | | | |
| F. Legacy and Veteran start | 4 | | | |
| G. Save and continue | 3 | | | |
| H. Pause, auto and speed | 3 | | | |
| I. Touch and input | 3 | | | |

Failures: list ID, severity (S1–S4), build version, device and browser.
