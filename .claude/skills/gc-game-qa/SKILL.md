---
name: gc-game-qa
description: Game QA testing with Playwright — visual regression, gameplay verification, performance, and accessibility for browser games. Use when writing or running game tests, debugging test failures, or building QA infrastructure.
argument-hint: "[topic]"
license: MIT
compatibility: Requires Bun and Playwright for browser-based game testing.
metadata:
  author: OpusGameLabs
  version: 1.3.0
  tags: [game, qa, testing, playwright]
---

> **project-alpha:** skill de terceiros (`PlayableIntelligence/game-creator`, MIT). Use como checklist/guia; **não** gere scaffold, templates ou deploy próprios da skill (a estrutura do projeto está em `docs/sdd/architecture.md`; testes em `docs/sdd/testing.md`). Em conflito valem `AGENTS.md`, `.claude/rules/` e `docs/gdd.md`: Phaser 4 (não 3), Bun, roguelite deckbuilder dark fantasy com combate por turnos em fileira lateral; lógica pura em `src/core`, números em `src/data`, textos em `src/i18n`; arte via PixelLab, áudio via ElevenLabs.
>
> **Playwright aqui:** `@playwright/test` já é dependência; a config (`playwright.config.ts`, TypeScript) e os scripts `test*` serão recriados na fase ESTRUTURA. Smoke/e2e e QA visual rodam no fim de cada fase, não a cada commit. `@axe-core/playwright` é dependência nova: só com aprovação do desenvolvedor. Arquivos de teste em TypeScript (`.ts`), não `.js`.


# Game QA with Playwright

You are an expert QA engineer for browser games. You use Playwright to write automated tests that verify visual correctness, gameplay behavior, performance, and accessibility.

## Performance Notes

- Take your time with each step. Quality is more important than speed.
- Do not skip validation steps — they catch issues early.
- Read the full context of each file before making changes.
- Write tests that verify gameplay, not just that the page loads.

## Reference Files

For detailed reference, see companion files in this directory:
- `test-patterns.md` — Custom fixture code, boot tests, gameplay verification tests, scoring tests
- `gameplay-invariants.md` — All 7 core gameplay invariant patterns (scoring, death, buttons, render_game_to_text, design intent, entity audit, mute)
- `visual-regression.md` — Screenshot comparison tests, masking dynamic elements, performance/FPS tests, accessibility tests, deterministic testing patterns
- `clock-control.md` — Playwright Clock API patterns for frame-precise testing
- `playwright-mcp.md` — MCP server setup, when to use MCP vs scripted tests, inspection flow
- `iterate-client.md` — Standalone iterate client usage, action JSON format, output interpretation
- `mobile-tests.md` — Mobile input simulation and responsive layout test patterns

## Tech Stack

- **Test Runner**: Playwright Test (`@playwright/test`)
- **Visual Regression**: Playwright built-in `toHaveScreenshot()`
- **Accessibility**: `@axe-core/playwright`
- **Build Tool Integration**: Vite dev server via `webServer` config
- **Language**: JavaScript ES modules

## Project Setup

When adding Playwright to a game project:

```bash
bun add -d --exact @playwright/test @axe-core/playwright
bunx playwright install chromium
```

Add to `package.json` scripts:

```json
{
  "scripts": {
    "test": "bunx playwright test",
    "test:ui": "bunx playwright test --ui",
    "test:headed": "bunx playwright test --headed",
    "test:update-snapshots": "bunx playwright test --update-snapshots"
  }
}
```

## Required Directory Structure

```
tests/
├── e2e/
│   ├── game.spec.js       # Core game tests (boot, scenes, input, score)
│   ├── visual.spec.js     # Visual regression screenshots
│   └── perf.spec.js       # Performance and FPS tests
├── fixtures/
│   ├── game-test.js       # Custom test fixture with game helpers
│   └── screenshot.css     # CSS to mask dynamic elements for visual tests
├── helpers/
│   └── seed-random.js     # Seeded PRNG for deterministic game behavior
playwright.config.js
```

## Playwright Config

```js
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { open: 'never' }], ['list']],

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  expect: {
    toHaveScreenshot: {
      maxDiffPixels: 200,
      threshold: 0.3,
    },
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
  ],

  webServer: {
    command: 'bun run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
});
```

Key points:
- `webServer` auto-starts Vite before tests
- `reuseExistingServer` reuses a running dev server locally
- `baseURL` matches the Vite port configured in `vite.config.js`
- Screenshot tolerance is generous (games have minor render variance)

## Testability Requirements

For Playwright to inspect game state, the game MUST expose these globals on `window` in `main.js`:

### 1. Core globals (required)

```js
// Expose for Playwright QA
window.__GAME__ = game;
window.__GAME_STATE__ = gameState;
window.__EVENT_BUS__ = eventBus;
window.__EVENTS__ = Events;
```

### 2. `render_game_to_text()` (required)

Returns a concise JSON string of the current game state for AI agents to reason about the game without interpreting pixels. Must include coordinate system, game mode, score, and player state.

```js
window.render_game_to_text = () => {
  if (!game || !gameState) return JSON.stringify({ error: 'not_ready' });

  const activeScenes = game.scene.getScenes(true).map(s => s.scene.key);
  const payload = {
    coords: 'origin:top-left x:right y:down',          // coordinate system
    mode: gameState.gameOver ? 'game_over' : 'playing',
    scene: activeScenes[0] || null,
    score: gameState.score,
    bestScore: gameState.bestScore,
  };

  // Add player info when in gameplay
  const gameScene = game.scene.getScene('GameScene');
  if (gameState.started && gameScene?.player?.sprite) {
    const s = gameScene.player.sprite;
    const body = s.body;
    payload.player = {
      x: Math.round(s.x), y: Math.round(s.y),
      vx: Math.round(body.velocity.x), vy: Math.round(body.velocity.y),
      onGround: body.blocked.down,
    };
  }

  // Extend with visible entities as you add them:
  // payload.entities = obstacles.map(o => ({ x: o.x, y: o.y, type: o.type }));

  return JSON.stringify(payload);
};
```

Guidelines for `render_game_to_text()`:
- Keep the payload **succinct** — only current, visible, interactive elements
- Include **coordinate system note** (origin and axis directions)
- Include **player position/velocity**, active obstacles/enemies, collectibles, timers, score, and mode flags
- Avoid large histories; only include what's currently relevant
- The iterate client and AI agents use this to verify game behavior without screenshots

### 3. `advanceTime(ms)` (required)

Lets test scripts advance the game by a precise duration. The game loop runs normally via RAF; this waits for real time to elapse.

```js
window.advanceTime = (ms) => {
  return new Promise((resolve) => {
    const start = performance.now();
    function step() {
      if (performance.now() - start >= ms) return resolve();
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });
};
```

For frame-precise control in `@playwright/test`, prefer `page.clock.install()` + `page.clock.runFor()`. The `advanceTime` hook is primarily used by the standalone iterate client (`scripts/iterate-client.js`).

For Three.js games, expose the `Game` orchestrator instance similarly.

See `test-patterns.md` for custom fixture code, boot tests, gameplay verification tests, and scoring tests.

See `gameplay-invariants.md` for all 7 core gameplay invariant patterns (scoring, death, buttons, render_game_to_text, design intent, entity audit, mute).

## When Adding QA to a Game

1. Install the browser: `bunx playwright install chromium` (`@playwright/test` is already a dependency; `@axe-core/playwright` only with approval)
2. Create `playwright.config.js` with the game's dev server port
3. Expose `window.__GAME__`, `window.__GAME_STATE__`, `window.__EVENT_BUS__` in `main.js`
4. Create `tests/fixtures/game-test.js` with the `gamePage` fixture
5. Create `tests/helpers/seed-random.js` for deterministic behavior
6. Write tests in `tests/e2e/`:
   - `game.spec.js` — boot, scene flow, input, scoring, game over
   - `visual.spec.js` — screenshot regression for each scene
   - `perf.spec.js` — load time, FPS budget
7. Add `package.json` scripts: `test`, `test:ui`, `test:headed`, `test:update-snapshots`
8. Generate initial baselines: `bun run test:update-snapshots`

## What NOT to Test (Automated)

- **Exact pixel positions** of animated objects (non-deterministic without clock control)
- **Active gameplay screenshots** — moving objects make stable screenshots impossible; use MCP instead
- **Audio playback** (Playwright has no audio inspection; test that audio objects exist via evaluate)
- **External API calls** unless mocked with `page.route()`
- **Subjective visual quality** — use MCP for "does this look good?" evaluations
