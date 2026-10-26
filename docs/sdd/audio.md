# SDD-13 Audio

| Field | Value |
|---|---|
| Status | Draft, 2026-10-26 |
| Owner | Coordinator (`src/platform/audio.ts`, view hooks); generation through the `alpha-audio-assets` skill |
| Phase | PROTOTYPE |
| Depends on | SDD-12, SDD-16 |
| References | GDD §17; Art Bible §13 (style sheet, loudness targets, keys); `.claude/rules/assets.md` (audio); `docs/web-research.md` §12.5, §12.7 |

## 1. Goal

Play 4 music loops and about 35 SFX from core events, unlock audio on the first gesture, and keep the game fully playable with audio blocked or missing.

## 2. Non-goals

- Voice acting, adaptive layered music (later), spatial audio.

## 3. Requirements

- R-1 Unlock: audio starts only after the first user gesture (Title "Tap to start"); music starts in `sound.once('unlocked', …)` (spike §12.7).
- R-2 Files: `public/assets/audio/<key>.ogg` primary and `.mp3` fallback; keys from GDD §17.1 / Art Bible §13.
- R-3 Music per screen: `music.menu` (title, menu, party select), `music.map` (map, camp, shop, rest), `music.combat`, `music.boss`; crossfade 800 ms; loops seamless.
- R-4 SFX are triggered by the presenter from events (e.g. `DamageDealt` → `sfx.hit.<kind>`), never by the core.
- R-5 Concurrency: at most 2 instances of the same SFX at once; a third request is dropped.
- R-6 Audio is not sped up at 2x/3x; at 3x, SFX of the same key within 80 ms are merged.
- R-7 Volumes: music and SFX buses from settings (defaults 60 and 80, GDD §18.2); 0 mutes the bus.
- R-8 Missing or failed audio file: log once, continue silently; never block loading.
- R-9 Tab hidden: music pauses; on return it resumes without stacking.

## 4. Design

- `src/platform/audio.ts`: `playMusic(key)`, `playSfx(key)`, `setVolumes()`, guard map for concurrency.
- `src/view/audioMap.ts`: `DomainEvent['kind'] → sfx key` table.

## 5. Acceptance criteria

- AC-1 Given a fresh load with no gesture, then no audio plays and `sound.locked` is true; after the first tap, `music.menu` starts.
- AC-2 Given the same SFX requested 3 times in 10 ms, then at most 2 play.
- AC-3 Given an audio file returning 404, then the game reaches the menu and plays every other sound.
- AC-4 Given music volume 0, then music is silent and SFX continue.
- AC-5 Given a move from map to combat, then the crossfade lasts 800 ms ± 50 ms and no click is audible (human QA AD-07).
- AC-6 Given every SFX and music file, then its loudness meets the Art Bible §13.3 targets (offline check in the asset pipeline, SDD-16).

## 6. Edge cases

- Browser blocks audio again after unlock (iOS interruption): the game continues; audio resumes on the next gesture.
- Very fast speed with many hits: merge rule R-6 avoids clipping.

## 7. Test strategy

- Unit: event → key table complete for every event kind that has a sound; concurrency guard.
- Integration: platform audio with a fake Phaser sound manager.
- Human QA: section 23 of `docs/qa/human-qa.md`.

## 8. Verification

```sh
bun test tests/unit/audio
```
