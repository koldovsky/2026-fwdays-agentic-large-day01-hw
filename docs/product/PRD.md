# Product requirements (reverse-engineered)

**Disclaimer:** This document **infers** product intent from the **Excalidraw monorepo** as it exists in this repository. It is **not** an official PRD, contract, or external roadmap. No marketing claims are invented; where the tree is silent, see **Not evidenced in-repo** below.

## Product goal

- **Optimize for** a **browser-based virtual whiteboard** with a **hand-drawn (“rough”) aesthetic**: drawing, editing, history, library, import/export, and **localization**, as implemented in code.
- **Dual delivery:**
  - **Hosted product** — `excalidraw-app/` wraps the editor with Vite, optional **PWA**, **share/collab**, **Firebase-related** wiring, **Sentry**, welcome/onboarding shell UI, and **Excalidraw+**-gated UI when env/cookies allow (`excalidraw-app/App.tsx`, `excalidraw-app/index.tsx`, `app_constants.ts`).
  - **Embeddable package** — `@excalidraw/excalidraw` ships the **React `Excalidraw` component**, styles, and documented embed patterns without requiring the hosted stack (`packages/excalidraw/index.tsx`, `packages/excalidraw/README.md`).

**Pointers:** [`docs/memory/projectbrief.md`](../memory/projectbrief.md) (repo purpose and surfaces), `packages/excalidraw/README.md` (embed contract), `excalidraw-app/App.tsx` (composition around `@excalidraw/excalidraw`).

## Audience

| Audience | Need (inferred) | Evidence (paths) |
|----------|-----------------|-------------------|
| **Canvas users** | Draw, select, transform, export; learn UI on first open | `packages/excalidraw/components/App.tsx`, `excalidraw-app/App.tsx`, `excalidraw-app/components/AppWelcomeScreen.tsx` |
| **Collaborators** | Share links / live sync when product features are enabled | `excalidraw-app/collab/Collab.tsx`, `excalidraw-app/data/`, imports in `excalidraw-app/App.tsx` |
| **Embedders** | Drop-in editor + CSS, sized container, API hooks | `packages/excalidraw/README.md`, `packages/excalidraw/index.tsx`, `examples/with-script-in-browser`, `examples/with-nextjs` |
| **Power users** | Keyboard-driven commands and palette | `packages/excalidraw/actions/`, `CommandPalette` / `DEFAULT_CATEGORIES` in `excalidraw-app/App.tsx` |

## Key functions

### Library (**npm-embed**; does not require `excalidraw-app`)

- **Editor core** — Canvas, tools, scene/history, actions, rendering pipeline under `packages/excalidraw/` (large `App` in `packages/excalidraw/components/App.tsx`).
- **Document/data in package** — Encode/decode, restore, blobs, library serialization, reconciliation-oriented helpers under `packages/excalidraw/data/` (usable by embeds and the hosted app).

### Hosted shell (**hosted-only**)

- **Welcome / onboarding** — `AppWelcomeScreen.tsx` plus `WelcomeScreen` from `@excalidraw/excalidraw`.
- **Local persistence** — `STORAGE_KEYS` and related wiring in `excalidraw-app/app_constants.ts`, `LocalData`, `importFromLocalStorage` from `excalidraw-app/App.tsx`.
- **Backend v2 (HTTP)** — `excalidraw-app/data/index.ts` uses `import.meta.env` **`VITE_APP_BACKEND_V2_*`** (behavior depends on deployment env).
- **Firebase-oriented paths** — `FIREBASE_STORAGE_PREFIXES` and related constants in `app_constants.ts` (exact product behavior **not fully specified** in-repo).
- **Realtime collab** — `socket.io-client` on the app; `excalidraw-app/collab/Collab.tsx`.
- **PWA** — `registerSW()` from `virtual:pwa-register` in `excalidraw-app/index.tsx`; plugin configured via `excalidraw-app/vite.config.mts` (root devDependency).
- **Error reporting** — `@sentry/browser`; bootstrap import in `excalidraw-app/index.tsx`.
- **Excalidraw+ / account hooks** — Cookie/env branches in `AppWelcomeScreen.tsx` (`VITE_APP_PLUS_*`, `app_constants.ts`); full commercial feature matrix **not evidenced** here.

### Integrators

- **Embed** — Documented in `packages/excalidraw/README.md`; reference hosts in `examples/*` (e.g. Next font copy in `examples/with-nextjs/package.json`).

## Technical restrictions

| Area | Restriction | Evidence |
|------|-------------|----------|
| **Tooling runtime** | Node **≥18** for development/build | `engines` in root / `excalidraw-app` `package.json` |
| **Package manager** | **Yarn 1** classic **workspaces**: `excalidraw-app`, `packages/*`, `examples/*` | Root `package.json` (`packageManager`, `workspaces`) |
| **UI** | **React**; app on **19.x**; library **peer** range `^17 \|\| ^18 \|\| ^19` | `excalidraw-app/package.json`, `packages/excalidraw/package.json` |
| **Aliases** | `@excalidraw/*` must stay aligned across **TypeScript**, **Vite**, **Vitest** | `tsconfig.json`, `excalidraw-app/vite.config.mts`, `vitest.config.mts` |
| **Host env files** | Vite **`envDir`** loads `.env*` from **monorepo root** (parent of `excalidraw-app/`) | `excalidraw-app/vite.config.mts` |
| **Dev server port** | Default **3000**, overridable via **`VITE_APP_PORT`** | Same file |
| **Embed contract** | Import package **CSS**; container needs **non-zero height** | `packages/excalidraw/README.md`; summarized in `docs/memory/projectbrief.md` |
| **Iframe** | Shell uses **`isRunningInIframe`** for behavior differences | `excalidraw-app/App.tsx` (`@excalidraw/common`) |
| **CI / quality gates** | Tests, lint, typecheck, coverage, size-limit jobs per workflows | `.github/workflows/*.yml`; summary in [`docs/memory/activeContext.md`](../memory/activeContext.md) |

No production **secret** or **URL** values are stated here; they are deployment-specific.

## Not evidenced in-repo

- Complete **Excalidraw+** feature matrix, pricing, or SLAs.
- Concrete production values for **`VITE_*`**, Firebase, or backend endpoints.
- In-repo **issue backlog** or **roadmap** as source of truth (see `docs/memory/activeContext.md`).

## Related documentation

- [`domain-glossary.md`](domain-glossary.md) — Element, Scene, AppState, Tool, Action (code-aligned terms).  
- [`../memory/productContext.md`](../memory/productContext.md) — Audiences, jobs-to-be-done, flows.  
- [`../memory/projectbrief.md`](../memory/projectbrief.md) — Repo purpose and what ships where.  
- [`../technical/architecture.md`](../technical/architecture.md) — Runtime and package boundaries.
