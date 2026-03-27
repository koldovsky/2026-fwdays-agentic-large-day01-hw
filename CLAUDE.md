# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Excalidraw is a browser-based collaborative whiteboard with a hand-drawn aesthetic. This is a Yarn monorepo containing the core React component library (`packages/excalidraw`), a production web app (`excalidraw-app`), and supporting packages.

## Commands

```bash
# Development
yarn start                # Dev server at http://localhost:3001

# Testing
yarn test:app             # Run Vitest tests (watch mode)
yarn test:all             # Full suite: typecheck + eslint + prettier + tests
yarn test:typecheck       # TypeScript typecheck only
yarn test:code            # ESLint only
yarn test:coverage        # Generate coverage report

# Fixing
yarn fix                  # Auto-fix eslint + prettier issues

# Building
yarn build                # Production build of the app
yarn build:packages       # Build all packages for npm publishing
```

After code modifications, run `yarn test:app` and fix any reported issues.

## Package Architecture

Dependency graph (→ means "depends on"):

```
excalidraw-app → packages/excalidraw → packages/element → packages/common
                                     → packages/math    → packages/common
packages/utils (standalone export utilities)
```

- **`packages/common`** — constants, theme tokens, shared type definitions
- **`packages/math`** — 2D geometry primitives; always use the `Point` type from `packages/math/src/types.ts`, never `{ x, y }` plain objects
- **`packages/element`** — element tree, Scene, Store, History, mutation logic
- **`packages/excalidraw`** — the embeddable `<Excalidraw />` React component (published to npm)
- **`packages/utils`** — export helpers (SVG, PNG, Blob)
- **`excalidraw-app`** — the production web app (Vite, Firebase, Socket.io collaboration)

## Key Architectural Patterns

### Element Mutation
Never mutate element properties directly. Use:
- `mutateElement(element, { prop: value })` — in-place mutation (triggers reactivity)
- `newElementWith(element, { prop: value })` — returns an immutable copy

### State Management
- **AppState**: monolithic state object managed in `App.tsx` — covers UI state, tool selection, viewport
- **Jotai atoms**: used for fine-grained reactive state; always import from `app-jotai.ts` or `editor-jotai.ts` wrappers, never directly from `jotai`

### Scene / Store / History Pipeline
User interaction → `mutateElement()` → `Scene` (spatial index + element registry) → `Store` (delta snapshots) → `History` (undo/redo stacks with `CaptureUpdateAction`)

### Rendering
Two-canvas architecture for performance:
- **Static canvas** — renders shapes, grid, images (redrawn only when elements change)
- **Interactive canvas** — renders selections, handles, remote cursors (redrawn on every frame)

Pipeline: `getNonDeletedElements` → `getRenderableElements` → `renderStaticScene` / `renderInteractiveScene`

### Collaboration
Real-time via Socket.io rooms. All payloads are E2E encrypted (AES-GCM; key stored in URL hash fragment, never sent to server). Element ordering uses fractional indexing for conflict-free merging.

### Imports
- No barrel imports inside packages — import from specific source files
- Use `import type { ... }` for type-only imports (enforced by ESLint)

## TypeScript & Code Style

- Strict TypeScript throughout; prefer implementations without allocation
- Prefer performant solutions — trade RAM for fewer CPU cycles
- Prefer `const` and `readonly` (immutable data)
- Use `?.` optional chaining and `??` nullish coalescing
- CSS Modules (`.module.scss`) for component styling
- PascalCase for components/interfaces/types, camelCase for variables/functions, ALL_CAPS for constants

## Testing

- Framework: Vitest 3 + Testing Library, jsdom environment
- Coverage thresholds enforced: lines ≥60%, branches ≥70%, functions ≥63%
- Canvas APIs are mocked in test setup

## Build System

- **App** (`excalidraw-app`): Vite 5 — output to `build/`
- **Packages** (`packages/*`): esbuild via `scripts/buildPackage.js`
- Dev server: port 3001 (app), port 3002 (WebSocket collaboration server)
