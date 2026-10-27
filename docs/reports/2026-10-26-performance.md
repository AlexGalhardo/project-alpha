# Performance report (R5.2), 2026-10-26

Build v0.0.6 plus the Sanctum core (no view changes). Measured with Playwright (Chromium, new headless) at a **1920×1080** viewport, device scale 1, against `bun run preview`. Headless Chromium renders WebGL through SwiftShader (CPU), so frame times on a real GPU should be equal or better.

## Results

| Metric | Value | Notes |
|---|---|---|
| Frame rate, combat with auto battle, 1x, 10 s | 60.0 fps; p50 16.7 ms, p95 16.8 ms, max 33.3 ms | One 33 ms frame in 600 (a scene redraw); no sustained drop |
| Frame rate, combat with auto battle, 3x, 10 s | 60.1 fps; p50 16.7 ms, p95 16.8 ms, max 17.6 ms | 3x adds no frame cost |
| Boot to Title active | 2.0–4.0 s (warm cache ~2.0 s) | Waits for Roboto (Google Fonts) and the SFX preload |
| Roboto stylesheet + font files done | 0.5–4.8 s after navigation | Varies with the font CDN; the game waits at most 3 s, then uses the system font |
| Requests / transfer during the first ~3 s | 150 requests, 5.8 MB | Music (4.4 MB ogg) streams in the background after Title |
| JS bundle | 1,573 kB raw, 421 kB gzip (one chunk) | Mostly Phaser; Vite warns above 500 kB |
| `dist/` total | 12 MB | Audio 9.3 MB (ogg 5.1 MB + mp3 4.2 MB; the browser fetches one format), sprites 0.6 MB |
| JS heap after GC: Title / after 3 full bot runs (~1,400 commands, every scene restarted many times) | 8 MB → 9 → 10 → 10 MB | No growth trend |
| JS heap after GC across 8 animated auto-battle combats | 9–10 MB, flat | No leak from combat animations, tweens or popups |
| Phaser textures alive | 127 at Title, 133–143 during a run, flat | Text canvases are released with their scenes |
| Display-list objects in active scenes | 3–16 between screens, flat | Scene restarts clean their objects |

## Findings and fixes (priority order)

1. **Boot waits on the font CDN** (view). Title can take up to the 3 s timeout when `fonts.gstatic.com` is slow. Fix: self-host Roboto (woff2, Latin + Latin-1 subsets, about 3 × 20 kB, OFL) under `public/fonts/` with `<link rel="preload" as="font">`; drop the Google Fonts dependency (also avoids sending player IPs to Google).
2. **Single 1.6 MB JS chunk** (build). Split Phaser into its own chunk (`build.rollupOptions.output.manualChunks: { phaser: ['phaser'] }`) so game updates re-download only the ~150 kB game code; consider Phaser's custom build to drop unused systems (Matter, Arcade physics, tilemaps, video).
3. **SFX preload blocks boot** (view). The 35 SFX (~0.7 MB) load before Title. Load them like the music, in the background after Title; `play()` already falls back to synthesized tones while a file is missing.
4. **Ship one audio format** (assets). Every modern browser plays ogg except older Safari; keep mp3 only as fallback for Safari and drop the duplicated work from the pipeline if Safari < 17 is out of scope (saves 4.2 MB of deploy size, not download size).
5. **Robustness** (view): `Button.draw` throws "Cannot read properties of null (reading 'drawImage')" when called after its scene shut down (seen when a test toggled auto battle on a stopped Combat scene). Not reachable through normal input, but a guard `if (!this.active) return;` in `Button.draw`/`setSelected` removes the crash class.

No frame-rate or memory work is needed for 1.0 on this evidence.

## How to reproduce

A temporary spec (not committed) used `requestAnimationFrame` sampling inside `page.evaluate` for 10 s, the CDP `HeapProfiler.collectGarbage` + `Runtime.getHeapUsage` pair after each run or combat, and `performance.getEntriesByType('resource')` for boot. Runs used the `__startRun`, `__botStep` and `__game` test hooks; auto battle was switched on through the Combat scene.
