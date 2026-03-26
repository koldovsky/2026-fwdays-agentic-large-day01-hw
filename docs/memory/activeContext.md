# Active Context

## Current Focus

This workspace is an **Excalidraw monorepo fork** used as a homework environment for the
**2026 fwdays Agentic IDE workshop (Day 1)**. The active work is documentation-driven:
exploring, reverse-engineering, and capturing the project's architecture into a structured
Memory Bank so that AI agents can work reliably with the codebase.

---

## Workshop Assignment — Day 1 Scope

The assignment involves creating documentation across three categories:

### Memory Bank (`docs/memory/`)

Structured markdown files capturing project context for AI-assisted development.

### Technical Docs (`docs/technical/`)

Architecture diagrams, data-flow descriptions, dev-setup guides.

### Product Docs (`docs/product/`)

Domain glossary, reverse-engineered PRD.

---

## Active Work Items

### Completed

- `.cursorignore` — repo root, 50+ exclusion patterns
- `docs/memory/projectbrief.md` — project overview and dual-product structure
- `docs/memory/techContext.md` — full tech stack with versions, build scripts, testing tools
- `docs/memory/systemPatterns.md` — architecture patterns + implicit-contract reference for AI agents
- `docs/memory/productContext.md` — UX goals, user personas, core scenarios
- `docs/memory/activeContext.md` — this file
- `docs/memory/progress.md` — workshop checklist and progress tracking
- `docs/memory/decisionLog.md` — key architectural decisions in Excalidraw
- `docs/technical/architecture.md` — 254 lines; 5 mermaid diagrams (high-level arch, data flow,
  action execution, state management, rendering pipeline, package deps)
- `docs/technical/dev-setup.md` — 371 lines; prerequisites → clone → dev server → tests →
  pre-commit hooks → library build → forbidden patterns → PR checklist → common issues
- `docs/technical/undocumented-behaviors.md` — 186 lines; 20 behaviors found via HACK/FIXME/TODO
  scan + static analysis (implicit state machines, mutation contracts, global singletons,
  known-broken areas, performance traps)
- `docs/product/domain-glossary.md` — 41 domain terms with project-specific definitions,
  source locations, usage context, and "do not confuse" notes

### Completed (continued)

- `docs/product/PRD.md` — reverse-engineered PRD; ~260 lines; product goal, 5 user personas,
  9 key features (F1–F9), 10 technical constraints (TC1–TC10), and explicit non-goals

---

## Key Source Locations to Know

| Area | Path |
|---|---|
| Main React component | `packages/excalidraw/components/App.tsx` |
| Element model & Scene | `packages/element/src/Scene.ts` |
| Store / undo-redo | `packages/element/src/store.ts` |
| AppState defaults | `packages/excalidraw/appState.ts` |
| Actions registry | `packages/excalidraw/actions/` |
| Renderer (static) | `packages/excalidraw/renderer/staticScene.ts` |
| Renderer (interactive) | `packages/excalidraw/renderer/interactiveScene.ts` |
| Collaboration (app) | `excalidraw-app/src/` |
| Firebase persistence | `excalidraw-app/src/data/` |
| i18n locales | `packages/excalidraw/locales/` (Crowdin-managed) |

---

## Environment State

- **Branch**: `master` (local, ahead of `origin/master`)
- **Node**: ≥18 required (`engines` field in `package.json`)
- **Package manager**: Yarn 1.22.22 (`yarn.lock` modified)
- **Dev server**: `yarn start` (Vite, excalidraw-app)
- **Tests**: `yarn test` (Vitest watch mode)

---

## Context for AI Agents

- The monorepo uses **Yarn workspaces** — run all commands from repo root
- The library package (`packages/excalidraw`) builds with **esbuild** via `scripts/buildPackage.js`
- The app (`excalidraw-app`) builds with **Vite**
- TypeScript is in **strict mode** — type errors block builds
- ESLint config lives in `packages/excalidraw/eslintrc.base.json` (no circular deps enforced)
- Pre-commit hooks: `husky` + `lint-staged` (prettier + eslint on staged files)
- `packages/excalidraw/locales/` is **auto-managed by Crowdin** — do not hand-edit
- WASM files in `scripts/wasm/` are **binaries** — do not modify
