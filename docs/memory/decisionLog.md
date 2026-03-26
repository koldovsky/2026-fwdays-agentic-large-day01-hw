# Decision log

Lightweight record of **structural and tooling choices** observable in this monorepo. Each entry points to existing docs or manifests for detail—this file captures **why the shape matters**, not full command matrices (see [`techContext.md`](./techContext.md)).

## Details

Deeper architecture → [`docs/technical/architecture.md`](../technical/architecture.md).

Editor patterns → [`systemPatterns.md`](./systemPatterns.md).

Product scope (library vs app, non-goals) → [`docs/product/PRD.md`](../product/PRD.md).

Vite aliases and troubleshooting → [`docs/technical/dev-setup.md`](../technical/dev-setup.md) §9.

---

## Log (newest first)

### 2026-03 — Memory Bank split for agentic workflows

| Field | Content |
|-------|---------|
| **Context** | Large brownfield repos need small, navigable context files for humans and agents. |
| **Decision** | Keep **core** Memory Bank files (`projectbrief`, `techContext`, `systemPatterns`) stable; add **optional** `productContext`, `activeContext`, `progress`, `decisionLog` for UX, handoff, status, and rationale. |
| **Consequences** | More files to maintain; `activeContext` and `progress` should be updated when tasks change. Aligns with workshop bonus checklist in [`.github/PULL_REQUEST_TEMPLATE.md`](../../.github/PULL_REQUEST_TEMPLATE.md). |

- **Signals:** Brownfield scale and agent/human navigation pressure favor small, focused context files.
- **Trade-offs:** Clearer handoff and stable core docs vs more files to curate and occasional drift in optional files.
- **Follow-up:** Refresh `activeContext` and `progress` when work shifts; keep entries aligned with the PR template checklist.

### Yarn workspaces monorepo

| Field | Content |
|-------|---------|
| **Context** | One repository ships the app, packages, and examples together. |
| **Decision** | Use **Yarn 1** workspaces (`excalidraw-app`, `packages/*`, `examples/*`) with private root package name `excalidraw-monorepo` per root [`package.json`](../../package.json). |
| **Consequences** | Cross-package imports resolve locally; CI and Docker builds must respect workspace layout. |

- **Signals:** One repo must ship the app, shared packages, and examples without publishing friction for every local change.
- **Trade-offs:** Simple local linking and shared tooling vs CI/Docker needing the same workspace layout assumptions.
- **Follow-up:** Treat root [`package.json`](../../package.json) workspace config as the source of truth when adding packages or apps.

### Package build order for `@excalidraw/*`

| Field | Content |
|-------|---------|
| **Context** | Published packages depend on each other (`common` → `math` → `element` → `excalidraw`). |
| **Decision** | Root scripts build in dependency order (see [`systemPatterns.md`](./systemPatterns.md) and [`scripts/buildPackage.js`](../../scripts/buildPackage.js)); `utils` uses a separate build path when needed. |
| **Consequences** | Partial builds fail if lower layers are stale; document commands in [`techContext.md`](./techContext.md). |

- **Signals:** Inter-package dependency order (`common` → `math` → `element` → `excalidraw`) must hold for correct artifacts.
- **Trade-offs:** Predictable publishable builds vs brittle partial builds when lower layers are out of date.
- **Follow-up:** Keep build-order docs in [`techContext.md`](./techContext.md) and [`systemPatterns.md`](./systemPatterns.md) in sync with [`scripts/buildPackage.js`](../../scripts/buildPackage.js).

### Library vs host application

| Field | Content |
|-------|---------|
| **Context** | Consumers need an embeddable editor; operators need a full web product. |
| **Decision** | **`@excalidraw/excalidraw`** holds the React editor, actions, and renderers; **`excalidraw-app`** is the Vite shell for collab, storage, Sentry, PWA, etc. |
| **Consequences** | Backend transports (**Socket.IO**, **Firebase**) appear at the **app** layer, not as hard requirements of the library (see PRD non-goals in [`docs/product/PRD.md`](../product/PRD.md)). |

- **Signals:** Embedders need a library; operators need collab, storage, and product shell features.
- **Trade-offs:** Clean npm-facing surface vs complexity living intentionally in `excalidraw-app` only.
- **Follow-up:** When adding transports or persistence, keep them out of hard library requirements per PRD non-goals.

### Vite aliases for local development

| Field | Content |
|-------|---------|
| **Context** | The app must consume workspace **source** during dev for fast feedback. |
| **Decision** | `excalidraw-app` resolves `@excalidraw/excalidraw` (and related packages) via **`resolve.alias`** in [`excalidraw-app/vite.config.mts`](../../excalidraw-app/vite.config.mts); the app `package.json` does not list `@excalidraw/excalidraw` as a dependency. |
| **Consequences** | Embedding examples differ from published npm consumption; document both paths in architecture and dev setup. |

- **Signals:** Dev workflows need fast iteration against workspace **source**, not only prebuilt package output.
- **Trade-offs:** Excellent local feedback vs a consumption path that differs from published npm embedding.
- **Follow-up:** Keep [`docs/technical/architecture.md`](../technical/architecture.md) and [`docs/technical/dev-setup.md`](../technical/dev-setup.md) explicit about alias vs npm usage.

### Scene and Store own the element graph

| Field | Content |
|-------|---------|
| **Context** | Undo, collaboration, and rendering need one authoritative element model. |
| **Decision** | **`Scene`** holds ordered elements and maps; **`Store`** captures deltas for history and `onIncrement`; **`App`** orchestrates **`ActionManager`** → **`syncActionResult`** (see [`docs/technical/architecture.md`](../technical/architecture.md)). |
| **Consequences** | UI-only **Jotai** state in the editor must not replace scene truth; glossary entries **Scene**, **Store**, **AppState** apply. |

- **Signals:** Undo, collaboration, and rendering all depend on a single authoritative element model.
- **Trade-offs:** Clear ownership in **Scene**/**Store** vs risk of duplicating or diverging state in UI atoms.
- **Follow-up:** In reviews, reject patterns that replace scene truth with **Jotai**; use glossary terms **Scene**, **Store**, **AppState** consistently.

### Node engine vs Docker base image

| Field | Content |
|-------|---------|
| **Context** | Contributors run locally; images pin a specific Node for reproducible builds. |
| **Decision** | Manifests require **Node >= 18** while [`Dockerfile`](../../Dockerfile) build stage uses **`node:22`** (see [`techContext.md`](./techContext.md)). |
| **Consequences** | Local and CI Node versions may differ from Docker; watch for native-addon or tooling drift. |

- **Signals:** Contributors run diverse local Node versions while container builds need a pinned, reproducible runtime.
- **Trade-offs:** Broad local compatibility (`>= 18`) vs Docker pinning (`node:22`) and possible cross-environment drift.
- **Follow-up:** Watch native addons and toolchain behavior when engine policy or the [`Dockerfile`](../../Dockerfile) base image changes.

---

## How to add an entry

Append a new dated block at the **top** after this section grows: use a `###` heading, the Context/Decision/Consequences table, then three bullets (**Signals**, **Trade-offs**, **Follow-up**) with one line each, immediately under the table. Link to PRs or commits in prose when relevant; keep entries short to stay within Memory Bank line limits.
