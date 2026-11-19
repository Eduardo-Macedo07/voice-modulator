# Contributing

Thanks for your interest! Please read the [Code of Conduct](CODE_OF_CONDUCT.md) first.

## Setup

Requirements: Node.js LTS, Rust (`stable-msvc`), Visual Studio 2022 Build Tools (C++).

```bash
npm install
npm run tauri dev     # run the app with hot reload
```

## Before opening a pull request

The CI runs the same checks:

```bash
npx tsc --noEmit      # type check
npm test              # unit tests (Vitest)
```

## Workflow

- Open an issue first for larger changes, so the approach can be discussed.
- Create a branch from `main` and keep each pull request focused on one change.
- Use [Conventional Commits](https://www.conventionalcommits.org/) for commit messages
  (`feat:`, `fix:`, `docs:`, `chore:`, `ci:`).
- Add or update tests when you change audio/DSP behavior.
