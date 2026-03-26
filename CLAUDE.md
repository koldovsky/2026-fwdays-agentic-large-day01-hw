# Excalidraw — CLAUDE.md

## Project Overview

This is the **Excalidraw** open-source collaborative whiteboard application. It is a **Yarn monorepo** built with React, TypeScript, and Vite, featuring a canvas-based hand-drawn-aesthetic drawing editor with real-time collaboration.

## Monorepo Structure

```
packages/
  common/       # Shared utilities, constants, color functions
  element/      # Element types, Scene, Store operations
  excalidraw/   # Main React component library (the editor)
  math/         # Vector and geometry math utilities
  utils/        # Export/import helpers
excalidraw-app/ # Standalone web app shell (entry point)
examples/       # Integration examples (Next.js, browser script)
```

## Key Commands

```bash
# Development
yarn start                # Start dev server (port 3000)

# Building
yarn build                # Build app + version
yarn build:packages       # Build all packages

# Testing
yarn test                 # Vitest in watch mode
yarn test:all             # Type check + lint + format + tests
yarn test:app             # Run app tests
yarn test:coverage        # Coverage report

# Code quality
yarn fix                  # Auto-fix lint + format
yarn test:code            # ESLint (zero warnings)
yarn test:other           # Prettier check
yarn test:typecheck       # TypeScript type check
```

## Architecture

- **App.tsx** (`packages/excalidraw/components/App.tsx`) — main class component orchestrating all state, Scene, Store, History, ActionManager
- **Scene** — element graph with ordering and lookup
- **Store** — incremental element snapshots for collaboration sync
- **History** — undo/redo built on Store snapshots
- **ActionManager** — handles all actions (toolbar clicks, keyboard shortcuts, API)
- **Renderer** — three canvas layers: static, interactive, new-element-in-progress
- **Collab** (`excalidraw-app/collab/`) — Socket.io real-time collaboration with Firebase persistence

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI | React 19, TypeScript (strict) |
| Bundler | Vite 5 |
| State | Jotai 2 (atoms), class component state for App |
| Persistence | Firebase + IndexedDB (idb-keyval) |
| Collaboration | Socket.io 4 |
| Rendering | HTML Canvas + Rough.js |
| Testing | Vitest 3, Testing Library, jsdom |
| i18n | i18next (70+ locales) |
| Package manager | Yarn 1.22.22 (pinned) |

## Testing Notes

- Tests use jsdom environment with canvas mocks (`setupTests.ts`)
- Coverage thresholds: 60% lines/statements, 70% branches, 63% functions
- Test files live alongside source with `.test.ts(x)` suffix

## Package Manager

Always use **yarn** (not npm). Node >= 18.0.0 required.

## Path Aliases

TypeScript path aliases map `@excalidraw/*` to the monorepo packages. Configured in `tsconfig.json` and mirrored in `excalidraw-app/vite.config.mts`.

## Lint Rules

- Do not import from `jotai` directly in `packages/excalidraw` — use the internal wrapper
- ESLint enforces type-only imports where applicable
- Zero warnings policy (`--max-warnings=0`)
