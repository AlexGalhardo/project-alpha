---
name: alpha-audio-assets
description: Use when creating, regenerating or replacing any sound of project-alpha (music track or sound effect — no voice, no TTS) with the ElevenLabs API, or when touching `scripts/assets/` audio generators, `public/assets/audio/` or the audio keys. Keeps every sound on the same style, key contract, loudness and format.
---

# project-alpha — audio assets

Read first: `docs/gdd.md` (seção de áudio: lista de faixas e efeitos) and
`.claude/rules/assets.md`. Estilo sonoro, alvos de loudness e lista final de faixas: a definir
na GDD ou em `docs/sdd/audio.md` (not created yet). If this skill and the GDD diverge, the GDD wins.
For playback in the engine use the Phaser `audio-and-sound` skill.

## Scope

**Music and SFX only.** The game has no voice acting: do not call text-to-speech or voice-design
endpoints. Vocal reactions, if any, are wordless SFX.

## Style

- Defined per track in the GDD. Until then, every prompt must state the mood, tempo and loop intent.
- Never name games, bands, composers or artists in a prompt (IP rule, and the API rejects them).

## Keys

From `.claude/rules/assets.md`:

- Music: `music.<id>` (track id as defined in the GDD).
- Sound effect: `sfx.<category>.<id>`, lower-case, stable.
- For frequent effects, 2-3 variations as `<key>.1`, `<key>.2`… for rotation.

## Folders and formats

- `scripts/assets/` — generator scripts (TypeScript, run with `bun`), idempotent: skip a key whose
  output already exists unless asked to regenerate.
- `art-src/audio-log.jsonl` — generation log, one line per call:
  `{key, endpoint, prompt, params, cost, at, output}`. Prompts and parameters must be enough to
  reproduce the sound.
- `public/assets/audio/` — shipped files named by key: **`.ogg` primary, `.mp3` fallback**, both
  loaded under the same key.

## Rules

1. **Key only in `.env`:** `ELEVEN_LABS_API_KEY`, sent as header `xi-api-key`. Never print it,
   log it, commit it or pass it on a command line that ends up in history.
2. **Check the current endpoints and parameters in the official docs before coding**
   (https://elevenlabs.io/docs/api-reference): Sound Effects `POST /v1/sound-generation`,
   Music `POST /v1/music`. Do not rely on memory for parameter names.
3. **Budget and approval gate:** before any bulk run, list the keys, the duration of each and the
   estimated credit cost, and wait for the developer's approval. Generate one take at a time,
   keep loops short, and never retry in a loop.
4. **Pilot first:** one track or one SFX per category, approved by the developer, fixes the style
   before the rest is generated.
5. **Logging:** every call is logged, including rejected takes.
6. **Loopable music:** every track meant to loop must loop cleanly — trim to a bar boundary, cut at
   zero crossings, no fade at the loop point. One-shot stingers are not looped.
7. **Loudness normalisation:** normalise every file to the targets defined for the project (one for
   music, one for SFX) so the volume channels behave predictably. No sample may clip.
8. Do not add audio dependencies or tools without asking.

## In the game

- Every input gets a sound within 0.1 s.
- At most 2 simultaneous instances of the same effect.
- Audio starts only after the first user gesture (browser autoplay rule).
- The game works with audio blocked or missing.

## Verification

Done means heard in the game:

- [ ] The key loads and plays in the browser from both `.ogg` and `.mp3`.
- [ ] No clipping or distortion at full volume; loudness matches neighbouring sounds.
- [ ] Loop seam check: let each looping track loop at least 3 times and listen at the seam.
- [ ] SFX has no leading silence (it must feel instant) and no cut-off tail.
- [ ] The log line exists and reproduces the file.

Report the command run and the result, not just "done".
