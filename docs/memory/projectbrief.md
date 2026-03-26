# Project Brief — Excalidraw Monorepo (Memory Bank)

**When to load deep docs:** Need **prioritized requirements, milestones, or acceptance-style product spec** → [docs/product/PRD.md](../product/PRD.md). Need **definitions of domain terms / UI feature names** → [docs/product/domain-glossary.md](../product/domain-glossary.md).

## Executive summary

**Yarn workspaces monorepo** for **Excalidraw**: a **browser-based whiteboard** with a hand-drawn look. Ships a **first-party Vite app** (`excalidraw-app`) and the embeddable **`@excalidraw/excalidraw`** package for integrators.

## Core purpose

- **Problem:** Fast, privacy-friendly sketching and diagramming in the browser—standalone or embedded—without heavy design tools.
- **Audiences:** End users and teams (standalone app); **developers** embedding React (see `examples/*`).

## Stack & layout (summary)

| Area | Summary |
|------|--------|
| UI | React 19, Vite 5, TypeScript strict, Sass + clsx + Radix |
| State | Jotai (scoped stores); no Tailwind/shadcn in-repo |
| Repo shape | `excalidraw-app/`, `packages/{excalidraw,common,element,math,utils}/`, `examples/*` — **no single root `src/`** |
| Collab / cloud | Socket.io, Firebase (app); configured via env |
| Quality | ESLint, Prettier, Vitest |

**Versions, scripts, env variables, and CI** → [docs/memory/techContext.md](./techContext.md) and [docs/technical/dev-setup.md](../technical/dev-setup.md).

## What must hold

- Runnable **excalidraw-app**; publishable **`@excalidraw/excalidraw`** (ESM + types + CSS).
- **Editor fidelity:** canvas tools, import/export, library, accessibility as implemented.
- **Optional collaboration** when backends exist; **extensibility** (tunnels, imperative API, examples).
- **Hygiene:** typecheck, lint, test gates at monorepo root.

## Success criteria (short)

- `build:packages` + app build succeed for target environments (incl. Docker/Vercel paths).
- Quality scripts (`test:typecheck`, `test:code`, tests) pass as expected in CI.
- Consumers can depend on the library with documented peers; examples show integration patterns.

## Where to start in code

- App shell: `excalidraw-app/App.tsx` · Collab: `excalidraw-app/collab/` · Firebase: `excalidraw-app/data/firebase.ts`
- Library API: `packages/excalidraw/index.tsx` · Editor root: `packages/excalidraw/components/App.tsx`

## Boundary conditions

Front-end–centric: collaboration/AI/Firebase **servers** are external or env-configured—not a full backend monolith in-repo.

## Details

- For full product requirements and vision → see [docs/product/PRD.md](../product/PRD.md)
- For comprehensive domain-specific terminology → see [docs/product/domain-glossary.md](../product/domain-glossary.md)
