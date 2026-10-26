# ADR 0016: Desktop (Electron) and Android (Capacitor) packaging

- Status: accepted
- Date: 2026-10-26

## Context

PLAN B4.4/B4.5 ship the web build on Windows desktop and Android. The developer approved the new dependencies on 2026-10-26 (`questions-to-dev.md`, local).

## Decision

| Target | Tool (exact version) | Command | Output |
|---|---|---|---|
| Windows desktop | `electron` 45.0.0 + `electron-builder` 26.18.0 | `bun run desktop:build` | `release/Ossuary <version>.exe` (portable, unsigned) |
| Desktop dev run | `electron` | `bun run desktop:dev` | window with `dist/` loaded |
| Android | `@capacitor/core`, `@capacitor/android`, `@capacitor/cli` 8.5.3 | `bun run android:build` | `android/app/build/outputs/apk/debug/app-debug.apk` |

- Both shells load the same Vite build (`dist/`); no game code changes per platform.
- Electron: `electron/main.cjs`, context isolation on, Node integration off, sandbox on, menu hidden, window maximised for the 1920×1080 target. Bun needs `bun node_modules/electron/install.js` once to fetch the Electron binary (postinstall scripts are not run by default).
- Android: `capacitor.config.ts` (`appId` `xyz.lekzera.ossuary`, `webDir` `dist`), activity locked to `sensorLandscape`. Requires JDK 21 and the Android SDK (`ANDROID_HOME`).
- Signing: none yet (portable exe and debug APK). Code signing, store builds and icons are 1.0 RC tasks (PLAN R5.3).

## Alternatives

- Tauri: smaller binaries, but needs Rust toolchain and WebView2 differences; Electron matches the developer's request.
- Cordova: superseded by Capacitor.

## Consequences

- `release/` and Android build outputs stay out of git (`.gitignore`).
- The default Electron and Android icons are used until the art pass provides app icons.
