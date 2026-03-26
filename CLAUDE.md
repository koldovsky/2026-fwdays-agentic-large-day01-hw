# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is the Excalidraw monorepo — a Yarn workspaces project containing the main web app and core libraries.

**Package manager:** Yarn 1.22.22 — always use `yarn`, never `npm`.

## Commands

```bash
# Development
yarn start                  # Dev server on port 3001
yarn build                  # Build the web app
yarn build:packages         # Build all packages (common, math, element, excalidraw)

# Testing
yarn test                   # Run vitest (watch mode)
yarn test:app               # Run vitest once
yarn test:all               # Full CI check: typecheck + eslint + prettier + vitest
yarn test:typecheck         # TypeScript type check only
yarn test:code              # ESLint only (max-warnings=0)
yarn test:coverage          # Vitest with coverage report

# Code quality
yarn fix                    # prettier + eslint --fix
```

Run a single test file:
```bash
yarn test path/to/file.test.ts
```

## Architecture

### Monorepo structure

| Path | Purpose |
|------|---------|
| `excalidraw-app/` | Vite-based web application (entry: `index.tsx`, main logic: `App.tsx`) |
| `packages/excalidraw/` | Published React component library (exports from `index.tsx`) |
| `packages/utils/` | Public export API (`exportToCanvas`, `exportToBlob`, `exportToSvg`, etc.) |
| `packages/element/` | Element types, scene management, binding, collision, transforms |
| `packages/common/` | Shared constants, colors, event bus, utility types |
| `packages/math/` | 2D geometry math utilities |

### State management

- The primary app state is `this.state` (`AppState`, ~60 fields) on the `App` class component — managed via `this.setState()`.
- **Jotai** is used for fine-grained, per-feature isolated UI state — not the primary AppState.
- Do **not** import from `jotai` directly — use `app-jotai` or `editor-jotai` wrappers.

### Import rules (enforced by ESLint)

- Do **not** import barrel `index` files inside `packages/excalidraw` — use direct file imports.
- TypeScript path aliases (`@excalidraw/*`) map to package source files for development, resolved to built dist in production.

## Code conventions

From `.github/copilot-instructions.md`:

- **Performance:** Prefer implementations without allocation; trade RAM for CPU cycles.
- **Immutability:** Use `const` and `readonly`.
- **Null handling:** Use optional chaining (`?.`) and nullish coalescing (`??`).
- **Components:** Functional components with hooks for all new code. The existing `App` class component (`packages/excalidraw/components/App.tsx`) is a documented legacy exception — do **not** attempt to convert it. See `docs/technical/decisionLog-archive.md` (~2020 entry).
- **Styling:** CSS modules.
- **Math types:** Use `Point` type (from `packages/math/src/types.ts`) instead of raw `{ x, y }` objects.
- **Naming:** PascalCase for components/interfaces/types, camelCase for functions/variables, ALL_CAPS for constants.

## Test coverage thresholds

Vitest is configured with minimum thresholds: lines 60%, branches 70%, functions 63%, statements 60%. Failing to meet these will fail CI.

## Memory Bank

Project context is maintained in `docs/memory/`. Load these files at the start of every session:

| File | Contents |
|------|----------|
| `docs/memory/activeContext.md` | Current focus, next steps, open questions |
| `docs/memory/progress.md` | What is done, in progress, and blocked |
| `docs/memory/projectbrief.md` | What this project is and its goals |
| `docs/memory/techContext.md` | Tech stack, versions, commands |
| `docs/memory/systemPatterns.md` | Architecture patterns and design rules |
| `docs/memory/productContext.md` | Product intent, constraints, anti-goals |

Reference docs (load on demand, not pre-loaded):
- `docs/memory/decisionLog.md` — Recent undocumented-behavior findings; append-only, grows with discoveries
- `docs/technical/decisionLog-archive.md` — Archived architectural and policy decisions (~2021–2026)
- `docs/technical/architecture.md` — Mermaid diagrams, data flow, rendering pipeline
- `docs/technical/dev-setup.md` — Full onboarding guide (prerequisites → first PR)
- `docs/technical/undocumented-behavior.md` — Known HACK/FIXME findings
- `docs/product/domain-glossary.md` — 20 project-specific terms with precise definitions