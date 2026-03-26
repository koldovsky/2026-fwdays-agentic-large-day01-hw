# Project overview and repository findings

**Generated:** 2026-03-26  
**Workspace:** `2026-fwdays-agentic-large-day01-hw`

---

## 1. Size estimate (Repomix)

Repomix v1.13.0 was run from the repository root (default packing; binary WASM assets excluded from text output).

| Metric | Value |
|--------|--------|
| **Files packed** | 853 |
| **Estimated tokens** | ~3.31M |
| **Character count** | ~9.47M |
| **Binary files detected** | 2 (`scripts/wasm/hb-subset.wasm`, `scripts/wasm/woff2.wasm`) |

**Interpretation:** This is a **large** front-end monorepo. Token volume is dominated by a few heavy artifacts (WASM bindings embedded as TS, font sources, and the main `App.tsx` surface), not by a huge number of small files alone.

**Largest sources by token share (Repomix top 5):**

| Rank | Path | Role |
|------|------|------|
| 1 | `packages/excalidraw/subset/woff2/woff2-wasm.ts` | WOFF2 subsetting (WASM glue) |
| 2 | `packages/excalidraw/subset/harfbuzz/harfbuzz-wasm.ts` | HarfBuzz subsetting (WASM glue) |
| 3 | `packages/excalidraw/fonts/ComicShanns/ComicShanns-Regular.sfd` | Font source (SFD) |
| 4 | `packages/excalidraw/components/App.tsx` | Core application shell |
| 5 | `packages/excalidraw/fonts/Xiaolai/index.ts` | Font bundling / metadata |

To reproduce metrics: `npx repomix` (optionally with a project-specific `repomix.config.*`).

---

## 2. What this project is

This repository is the **Excalidraw** open-source **virtual whiteboard** codebase, organized as a **Yarn workspaces monorepo**. The workspace name (`excalidraw-monorepo` in root `package.json`) and package layout match the upstream Excalidraw project.

The folder name **`2026-fwdays-agentic-large-day01-hw`** indicates this copy is used in a **fwdays “agentic” course homework** context (day 01): a realistic, non-trivial codebase for agents or students to navigate, build, and modify—not a greenfield toy app.

**Product summary**

- **Excalidraw** is a canvas-based diagramming tool with a hand-drawn aesthetic.
- The **`@excalidraw/excalidraw`** package exposes Excalidraw as an **embeddable React component** (with required CSS and a sized parent container).
- The **`excalidraw-app`** package is the **full web application** (hosting, collaboration hooks, integrations), built with Vite.

---

## 3. Goals of the project

| Layer | Goal |
|-------|------|
| **Library** | Ship a reusable React component and related packages (`common`, `element`, `math`, `utils`) for embedding diagrams in third-party apps. |
| **Application** | Provide the official Excalidraw web experience: editing, persistence patterns, sharing/collaboration-related UI, i18n, and production concerns (e.g. Sentry in app deps). |
| **Platform / homework** | Offer a large, real-world TypeScript/React/Vite codebase suitable for **agent-assisted exploration**, refactors, and DevOps-style tasks (e.g. Docker image build). |

---

## 4. Technological stack

### 4.1 Core runtime and language

| Area | Choice |
|------|--------|
| Language | **TypeScript** (5.9.x at root) |
| UI | **React 19** (`excalidraw-app`) |
| Bundler / dev server | **Vite 5** |
| Package manager | **Yarn 1** workspaces (`yarn@1.22.22`) |
| Node | **>= 18** (engines); **Dockerfile** uses **Node 22** for builds |

### 4.2 Quality and testing

| Tool | Use |
|------|-----|
| **Vitest** | Unit / app tests (`yarn test:app`, coverage options) |
| **ESLint** | Lint (`yarn test:code`) |
| **Prettier** | Formatting (`yarn test:other` / `yarn fix:other`) |
| **TypeScript compiler** | Project-wide typecheck (`yarn test:typecheck`) |
| **Husky** | Git hooks (`yarn prepare`) |

### 4.3 Application-specific dependencies (excalidraw-app)

Examples from `excalidraw-app/package.json`: **Firebase**, **socket.io-client** (realtime/collab), **jotai** (state), **i18next**-related language detection, **idb-keyval**, **Sentry** browser SDK, **Vite PWA** and related plugins at the root.

### 4.4 Deployment

| Artifact | Mechanism |
|----------|-----------|
| Static production build | Vite → `excalidraw-app/build` |
| Container image | Multi-stage **Dockerfile**: Node build stage → **nginx:alpine** serving static files |

### 4.5 Notable native / compiled assets

Font subsetting uses **WASM** (Harfbuzz / WOFF2), with supporting scripts under `scripts/wasm` and `scripts/woff2`.

---

## 5. Repository structure

### 5.1 High-level layout

```mermaid
flowchart TB
  subgraph root [Repository root]
    PKG[package.json workspaces]
    SCR[scripts]
    GH[.github]
    DOC[docs]
  end

  subgraph ws [Yarn workspaces]
    APP[excalidraw-app]
    PKGS[packages/*]
    EX[examples/*]
  end

  subgraph packages [packages]
    EXC[@excalidraw/excalidraw]
    COM[@excalidraw/common]
    ELM[@excalidraw/element]
    MTH[@excalidraw/math]
    UTL[@excalidraw/utils]
  end

  root --> ws
  PKGS --> packages
  APP --> EXC
  EX --> EXC
```

### 5.2 Directory reference

| Path | Purpose |
|------|---------|
| `excalidraw-app/` | Vite-based **host application**: entry, features (e.g. `collab/`, `components/`, `data/`), tests |
| `packages/excalidraw/` | Main **React package**: components, scene, actions, renderer, locales, fonts, subset WASM bindings |
| `packages/common/` | Shared primitives and helpers consumed across packages |
| `packages/element/` | Element model / manipulation |
| `packages/math/` | Math utilities; geometry types (see `packages/math/src/types.ts` per project conventions) |
| `packages/utils/` | General utilities |
| `examples/with-nextjs/` | Next.js embedding example |
| `examples/with-script-in-browser/` | Script-tag / simple browser example |
| `scripts/` | Build, release, locales, WASM-related tooling |
| `firebase-project/` | Firebase project configuration assets |
| `public/` | Shared static assets (e.g. screenshots) |
| `.github/workflows/` | CI (e.g. size limits, Sentry, etc.) |

### 5.3 Typical build / run flows (from root `package.json`)

| Command | Effect |
|---------|--------|
| `yarn start` | Dev server via `excalidraw-app` (`vite`) |
| `yarn build` | Production build of the app |
| `yarn build:packages` | Builds `common` → `math` → `element` → `excalidraw` ESM outputs |
| `yarn test:all` | Typecheck + lint + prettier + app tests |
| Docker | `yarn build:app:docker` inside image build; nginx serves static output |

---

## 6. Summary

| Question | Answer |
|----------|--------|
| **What is it?** | Excalidraw monorepo: embeddable React whiteboard + full web app. |
| **Why here?** | Course homework repo name implies use as a **large realistic codebase** for agentic workflows. |
| **Size class** | **Large** (~853 tracked text files, ~3.3M tokens by Repomix; significant WASM/font payload in a few files). |
| **Stack** | TypeScript, React 19, Vite 5, Yarn workspaces, Vitest/ESLint/Prettier, optional Docker+nginx. |

---

## 7. Artifacts in this folder

| File | Description |
|------|-------------|
| `project-overview.md` | This report (metrics, stack, structure). |

Full Repomix pack output was **not** retained here (multi‑MB XML); re-run `npx repomix` if a single-file dump of the tree is needed.
