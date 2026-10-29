# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

Not scaffolded yet. The stack and architecture below are agreed with the owner; update this file (especially Commands) once `npm create tauri-app` has run and the real scripts exist.

## What this is

`voice-modulator`: an open-source desktop voice changer, built as a portfolio project. Real-time microphone processing with live monitoring, plus recording/export. Effects: pitch shift, robot (ring modulation), distortion/bitcrusher, echo, reverb, and an audio visualizer (waveform + spectrum).

- **Stack**: Tauri 2 + React + TypeScript + Vite. Windows 11 is the primary target (WebView2).
- **Language**: code, UI text, and commit messages in English (Conventional Commits). README is bilingual (EN + PT-BR). The owner talks to Claude in Portuguese.
- **License**: MIT.

## Commands (planned, from the Tauri React-TS template)

- `npm run tauri dev`: run the desktop app with hot reload
- `npm run tauri build`: build the Windows installer (`src-tauri/target/release/bundle/`)
- `npm test`: Vitest; single test: `npx vitest run src/audio/wav.test.ts` or `npx vitest -t "<test name>"`
- `npm run lint`: ESLint + Prettier

Toolchain on this machine: Node LTS, Rust `stable-msvc`, VS 2022 Build Tools (C++), Git — all installed via winget.

## Architecture

All audio DSP happens in the frontend with the Web Audio API. The Rust side stays thin: only saving files via `@tauri-apps/plugin-dialog` + `plugin-fs`. Don't move audio processing into Rust.

Signal graph (built in `src/audio/engine.ts`):

```
Mic (getUserMedia) → MediaStreamSource
  → PitchShifter (AudioWorklet) → Robot (ring mod) → Distortion (WaveShaper) → Bitcrusher (AudioWorklet)
  → Echo (Delay + feedback) → Reverb (Convolver, impulse response generated in code)
  → Master Gain ─┬→ AnalyserNode → Visualizer (canvas)
                 ├→ destination (headphone monitoring)
                 └→ MediaStreamDestination → MediaRecorder
```

- Each effect in `src/audio/effects/` exposes input/output nodes and a bypass toggle; the engine wires them in a fixed order. Toggling bypasses rather than rebuilding the graph, and parameter changes go through `AudioParam.setTargetAtTime` to avoid clicks.
- Custom DSP lives in AudioWorklets under `src/audio/worklets/`. The pitch shifter is a granular design (two crossfaded delay-line read heads). Keep its math in pure functions so Vitest can test it without an AudioContext.
- Low latency: `getUserMedia` with `echoCancellation`, `noiseSuppression`, `autoGainControl` all `false`; `AudioContext({ latencyHint: 'interactive' })`.
- Recording: MediaRecorder produces WebM/Opus; `src/audio/recorder.ts` also encodes WAV (pure TS encoder, unit-tested).
- Presets (`src/presets.ts`) are plain data objects of effect parameters.

## Release

GitHub Actions with `tauri-apps/tauri-action` builds the installer on `v*` tags and attaches it to GitHub Releases. CI runs lint + tests on every push.
