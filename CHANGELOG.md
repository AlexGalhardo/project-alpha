# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.6] - 2026-10-26

### Added

- **balance:** Enable Act 2 by default with tuned act scaling ([8cfcc24](https://github.com/AlexGalhardo/project-alpha/commit/8cfcc244213eb696e2b525992fd089590673276a))
- **art:** Add 16 px node and item icons reduced from PixelLab masters ([dc7001d](https://github.com/AlexGalhardo/project-alpha/commit/dc7001dac9f620dcebf62d59fb87a2ff1e3d0bda))
- **core:** Add the Rites difficulty ladder core and profile unlocks (in progress) ([dfced1a](https://github.com/AlexGalhardo/project-alpha/commit/dfced1a1baf38f98880617e1fb5b20283d97e793))
- **rites:** Add the 10-level difficulty ladder with profile unlocks and party selector ([5ac5826](https://github.com/AlexGalhardo/project-alpha/commit/5ac58266c52e3d616e2cb5c5c7ba5e975ff5d5aa))
- **view:** 16 px node icons on the map and item icons in camp, shop, treasure and reward ([fd58085](https://github.com/AlexGalhardo/project-alpha/commit/fd58085cc2efee60aae2e9b19409ac213fb61f99))
- **events:** Add six more events to reach twelve, in English and Portuguese ([fa20477](https://github.com/AlexGalhardo/project-alpha/commit/fa20477b602338168546577dc040770fc984a786))
- **content:** Add Act 3 with the three-phase final boss and the turn-limit enrage ([75abc2f](https://github.com/AlexGalhardo/project-alpha/commit/75abc2f461ba5b3079a6318f9cd71fc986524ff7))
- **view:** Fill the viewport at 1920x1080 with Roboto text and size-agnostic art ([e955060](https://github.com/AlexGalhardo/project-alpha/commit/e95506088c2a885a3936501b9d54f6a2138576bf))
- **art:** Add native-resolution art in progress ([9919705](https://github.com/AlexGalhardo/project-alpha/commit/99197057e40904e5f86726a7b8af27d466d1060c))

### Changed

- **view:** Show a loading bar and stream music after the title appears ([5d2f02a](https://github.com/AlexGalhardo/project-alpha/commit/5d2f02a02d919e3aee5cd72b72964501fb301e38))

### Fixed

- **i18n:** Polish Brazilian Portuguese wording and enforce the card word limit in both locales ([fcf8e6e](https://github.com/AlexGalhardo/project-alpha/commit/fcf8e6e0f53cfe01c128e0510a5391150c21a956))

### Documentation

- **plan:** Record Alpha progress and the live deployment ([09ce776](https://github.com/AlexGalhardo/project-alpha/commit/09ce7768c674c4e10dbff4d6714aa3e7492765c9))
- **adr:** Add the QA playtester agent to the coordination model ([f17ec92](https://github.com/AlexGalhardo/project-alpha/commit/f17ec927af7d2c490d8e5a398b80ca94d14c07e1))
- Record the render overhaul decision (B40) and native-resolution asset rules ([4d10dbc](https://github.com/AlexGalhardo/project-alpha/commit/4d10dbcef87c37e472fe40b7369f0c07285891e7))
- Add a how-to-play guide and mark twelve events done ([1758ded](https://github.com/AlexGalhardo/project-alpha/commit/1758ded83e075e980c33d6d20e39c7bf1c0d49a9))
- **reports:** Add the first QA playtest and the Rites simulation sweep ([b0f340c](https://github.com/AlexGalhardo/project-alpha/commit/b0f340ca9f1dd65f851bec20709152b2ed1cf0dc))
- **plan:** Record desktop and Android packaging status ([3e0162d](https://github.com/AlexGalhardo/project-alpha/commit/3e0162d051ef49d2a4dbbe9e35e5b60b6f05c6cc))
- Add the render ADR, Act 3 design and balance reports ([eff0ead](https://github.com/AlexGalhardo/project-alpha/commit/eff0eadb66a107aa954c7057c7a6b3e3be7ee31e))

## [0.0.5] - 2026-10-26

### Added

- **view:** Draw unit sprites in code with palette ramps, light and outline ([419e08c](https://github.com/AlexGalhardo/project-alpha/commit/419e08cacc622ce5c0f381e4891f396ffa6ce958))
- **view:** Add procedural nave backgrounds under the final bg keys ([48d5c47](https://github.com/AlexGalhardo/project-alpha/commit/48d5c4718df60b08dc5c0cd0c0027859cfcc87fd))
- **audio:** Generate the prototype music loops and SFX with ElevenLabs ([cde07aa](https://github.com/AlexGalhardo/project-alpha/commit/cde07aa6af83d3e7ed92d7aa462132300babe0cc))
- **view:** Load generated audio with synthesized fallback ([026359b](https://github.com/AlexGalhardo/project-alpha/commit/026359b2b79bb2728e94b34f12cc0e275740aa1f))
- **audio:** Play music per screen and richer SFX for hits, statuses, stress and purchases ([09201a9](https://github.com/AlexGalhardo/project-alpha/commit/09201a90934d253510f1cc8e9cd222401c3345d7))
- **view:** Warn when the party has no front-liner ([7bf9a51](https://github.com/AlexGalhardo/project-alpha/commit/7bf9a51a93569993d220fbff2f62709709566fe7))
- **view:** Load generated sprites from a manifest and show card art ([a3f8d4d](https://github.com/AlexGalhardo/project-alpha/commit/a3f8d4d979b6f41eaf0d072693696e5a3222cfcc))
- **art:** Generate heroes, enemies, boss, backgrounds and card art with PixelLab ([1e01b8d](https://github.com/AlexGalhardo/project-alpha/commit/1e01b8d611b301d0307b716f3378e16095864843))
- **i18n:** Add Act 2, events, treasure, legacy and new card strings; e2e click-through ([2a4891a](https://github.com/AlexGalhardo/project-alpha/commit/2a4891a1b951a6076bc3beefdc5cf62c9596951e))
- **i18n:** Per-boss phase banners; refresh the asset prompts log ([ae9fcac](https://github.com/AlexGalhardo/project-alpha/commit/ae9fcace06354e192a34e73503110352d1d5bb35))
- **core:** Add Act 2, events, treasure and the skill-tree meta (Act 2 off by default) ([2792484](https://github.com/AlexGalhardo/project-alpha/commit/2792484b2305d0aced8a2ed659f8833ae6335529))
- **view:** Add event, treasure and Legacy screens, veteran start and boss phase banner ([7f92106](https://github.com/AlexGalhardo/project-alpha/commit/7f921065344fb286cffe4a3fe51c372e3594081c))
- **art:** Add Act 2 enemies, boss, backgrounds and new card art ([c87eb73](https://github.com/AlexGalhardo/project-alpha/commit/c87eb73f0849321366ba310d34617bd36c23a004))

### Changed

- **balance:** Tune boss and elite HP, add two Tier A encounters, record the sim report ([c408f92](https://github.com/AlexGalhardo/project-alpha/commit/c408f9212411a187a5b35488f62602c660056263))

### Fixed

- **core:** Hide unseen boss phase actions and fix keg, Bulwark, prices, enemy heal ([4ff250c](https://github.com/AlexGalhardo/project-alpha/commit/4ff250c1238cd549a1540fdf78d6ea9d3aa135ed))
- **art:** Regenerate three card arts that broke the IP and tone rules ([747a5b9](https://github.com/AlexGalhardo/project-alpha/commit/747a5b92c950ec62e001c68edea37bbcc1dbf012))
- **a11y:** Draw status icons with Art Bible shapes, colours and buff/debuff chevrons ([eb47152](https://github.com/AlexGalhardo/project-alpha/commit/eb471528445c6d6c468d126220fa7ca0132aa41b))

### Documentation

- Update plan status and record core rule interpretations in the GDD ([beb780c](https://github.com/AlexGalhardo/project-alpha/commit/beb780c3cdf2ef733e43c1c1ea3d098b99dff8d0))
- **reports:** Add the prototype QA coverage report ([bd8ad10](https://github.com/AlexGalhardo/project-alpha/commit/bd8ad1058c9e76877c2a2b23d79d26798794ddb9))
- **gdd:** Clarify equipment timing, Reload, Hunter's Focus, first-attack items and drop Retain ([27f9016](https://github.com/AlexGalhardo/project-alpha/commit/27f90169838b095edeaa27ab48cc440651c819de))
- **assets:** Render the prompts actually used from the generation logs ([6710fa9](https://github.com/AlexGalhardo/project-alpha/commit/6710fa98a564fcf6dc406952bbc2df86c69e38f1))
- **gdd:** Specify Alpha content: Act 2, events, treasure and skill tree v1 ([f076233](https://github.com/AlexGalhardo/project-alpha/commit/f076233af705768f47463077da156807ce419818))
- **plan:** Mark verified prototype items and record blockers ([a3db68d](https://github.com/AlexGalhardo/project-alpha/commit/a3db68d0f8cd568755a9243b16701e7a5ae9dd7d))
- **a11y:** Add the colour-vision audit script and report ([9f8ee7f](https://github.com/AlexGalhardo/project-alpha/commit/9f8ee7f69024bd79f16434b13dbb766034af6d58))
- Sync specs, ADR 0003, glossary and README with the Alpha systems ([ed27287](https://github.com/AlexGalhardo/project-alpha/commit/ed2728732cc73f62d128d061fb44fd1654541e91))

## [0.0.4] - 2026-10-26

### Added

- **i18n:** Add English and Brazilian Portuguese strings with a parity test ([9244fac](https://github.com/AlexGalhardo/project-alpha/commit/9244fac51daa6622c93cbbbe56669ff7e25e426a))
- **view:** Add Phaser scenes, HUD, placeholders, settings, auto battle and game speed ([8d0d750](https://github.com/AlexGalhardo/project-alpha/commit/8d0d7508b98a312903eaedb9cee823e36c018b89))
- **audio:** Add synthesized placeholder SFX keyed like the final sound set ([0a4146c](https://github.com/AlexGalhardo/project-alpha/commit/0a4146c994a29c7719f704a9f7fd418db42ce197))
- **core:** Add the deterministic run, combat, map, economy and auto-battle engine ([5d6ae69](https://github.com/AlexGalhardo/project-alpha/commit/5d6ae695206c60de56a8e2b5d551ddf229144bb2))
- **sim:** Add the headless balance simulation CLI ([27d7c5e](https://github.com/AlexGalhardo/project-alpha/commit/27d7c5e801adb23f5ce421789ba54e486518bdf4))

### Fixed

- **view:** Keep HUD backgrounds under the combat layer; add map layout, keyboard paths and e2e tours ([93f9e1d](https://github.com/AlexGalhardo/project-alpha/commit/93f9e1db9c3d5b02d3ea2469e4b2b3d863992e2f))
- **view:** Readable cards with number chips, reward text, shop tiles and settings spacing ([5db50ee](https://github.com/AlexGalhardo/project-alpha/commit/5db50ee02ad00208b4f50bba46d9214daeac9ca8))

### Documentation

- Finish the English translation and align research with the 640x360 decision ([601242a](https://github.com/AlexGalhardo/project-alpha/commit/601242ac3e5e8ee85559e88d0f7cca36cc56ec04))
- **gdd:** Add the game design document with rules, content tables and formulas ([77ae6cd](https://github.com/AlexGalhardo/project-alpha/commit/77ae6cda204e5e5779223b587d52e1df7efe1c58))
- **plan:** Add the phased plan with quality gates and prototype asset budget ([221802f](https://github.com/AlexGalhardo/project-alpha/commit/221802f372e96da0011b2d3430d8e95f4167dc09))
- **art:** Add the art bible with palette, sprite specs, layouts and audio style ([9852ac5](https://github.com/AlexGalhardo/project-alpha/commit/9852ac553877320cc681828064ed2288669f253a))
- **sdd:** Add system specs and the human QA script ([3eb24e4](https://github.com/AlexGalhardo/project-alpha/commit/3eb24e49bf9fb6b47147858033dc6ae1e297922e))
- **adr:** Record core, data, i18n, font, save, layer, zoom and placeholder decisions ([50dfcdb](https://github.com/AlexGalhardo/project-alpha/commit/50dfcdb6712f73f15c563ae2c9e84f9517650266))
- Add README and align asset rules with the art bible ([f7d0fbe](https://github.com/AlexGalhardo/project-alpha/commit/f7d0fbeaab3b12b0b40a33a3aa323866880270c7))
- **gdd:** Record stun, recover and minimum-combat rules ([e77bdde](https://github.com/AlexGalhardo/project-alpha/commit/e77bdde9f717805cdcb1fdb85e6c8ac202d10ed4))
- **assets:** Add the prototype asset generation request for the cost gate ([7031458](https://github.com/AlexGalhardo/project-alpha/commit/70314586a837484237870ed45af042ebbfad3ff6))

## [0.0.3] - 2026-10-26

### Documentation

- Translate repository content to English and make English the default language ([f770efc](https://github.com/AlexGalhardo/project-alpha/commit/f770efc7dbd290b78f9962af4203e306475fe90a))
- **design:** Record brainstorming decisions and the shared glossary ([6def7c8](https://github.com/AlexGalhardo/project-alpha/commit/6def7c8b85d259563790c8d63b2b393b1f9939c5))

## [0.0.2] - 2026-10-26

### Documentation

- **research:** Add sourced web research and digest of the developer references ([9bf0701](https://github.com/AlexGalhardo/project-alpha/commit/9bf0701c20a05b1f8a0f87028d5721ccd1bc07d6))

## [0.0.1] - 2026-10-26

### Fixed

- **release:** Ignore untracked files in the clean tree check ([af09182](https://github.com/AlexGalhardo/project-alpha/commit/af091823aaf32d11acc90d577518dcf8f1fdc826))

### Documentation

- Add AGENTS.md entry point and agent rules for the deckbuilder ([0f5f160](https://github.com/AlexGalhardo/project-alpha/commit/0f5f1601f341e00624fd7ddcc096f6fd20afff32))
- **adr:** Record tooling, release, CI/CD and agent coordination decisions ([fce9384](https://github.com/AlexGalhardo/project-alpha/commit/fce9384ce0392697a96ea194875ce1c581d5d16a))
- **books:** Apply Pixel Logic and The Art of Game Design to this genre ([f23593e](https://github.com/AlexGalhardo/project-alpha/commit/f23593e4a6fe9161b8ffef7d51a3aaae6b15eff1))
- Keep the project kickoff prompt ([a45f73b](https://github.com/AlexGalhardo/project-alpha/commit/a45f73b2c5647b12cc2903c6a90d387d74d06e99))
- **skills:** Retarget project skills from the previous tactics game to this deckbuilder ([f535621](https://github.com/AlexGalhardo/project-alpha/commit/f535621369a0d22543be6643489eff4cf8b0c8cf))
[0.0.6]: <https://github.com/AlexGalhardo/project-alpha/compare/v0.0.5...v0.0.6>
[0.0.5]: <https://github.com/AlexGalhardo/project-alpha/compare/v0.0.4...v0.0.5>
[0.0.4]: <https://github.com/AlexGalhardo/project-alpha/compare/v0.0.3...v0.0.4>
[0.0.3]: <https://github.com/AlexGalhardo/project-alpha/compare/v0.0.2...v0.0.3>
[0.0.2]: <https://github.com/AlexGalhardo/project-alpha/compare/v0.0.1...v0.0.2>
[0.0.1]: <https://github.com/AlexGalhardo/project-alpha/releases/tag/v0.0.1>
