# Product requirements document (PRD)

High-level product description for the **Excalidraw monorepo** (this repository). Scope is inferred from shipped packages, app, and public APIs—not a substitute for upstream Excalidraw roadmap.

---

## 1. Product goal

- Deliver **Excalidraw** as:
  1. A **full web application** (`excalidraw-app`) for end users to sketch, diagram, and share visuals in the browser.
  2. An **embeddable React component** (`@excalidraw/excalidraw`) so other products can offer the same editor without forking core logic.
- Maintain **shared packages** (`@excalidraw/common`, `@excalidraw/element`, `@excalidraw/math`, `@excalidraw/utils`) so one implementation powers both the app and the npm package.

**Success looks like:** stable editor UX, predictable integration for hosts, and a clear path from clone → develop → ship (see `docs/technical/dev-setup.md`).

---

## 2. Target people

| Segment | Needs |
|---------|--------|
| **End users** | Fast, low-friction drawing; export/share; optional collaboration in the hosted app. |
| **Frontend developers** | Drop-in `<Excalidraw />`, CSS import, typed API, examples (Vite browser, Next.js). |
| **Product teams** | Whiteboard/diagram capability inside their SaaS; hooks for persistence (`onChange`), theming, and UI toggles (`UIOptions`). |
| **Maintainers / contributors** | Monorepo scripts, tests, lint, and modular packages for safe changes. |

---

## 3. Key value propositions

- **Hand-drawn aesthetic** (Rough.js-style rendering) suitable for informal diagrams and workshops.
- **Dual distribution:** same core as **product app** and **npm library**.
- **Integration-friendly:** imperative API (`updateScene`, `getAppState`, …), lifecycle callbacks, optional collaboration signals (`onIncrement`, collaborators).
- **Extensible chrome:** `UIOptions`, custom render slots, library updates via API.

---

## 4. Main functionality

### 4.1 Editor capabilities (representative)

Drawing and editing (tools from `TOOL_TYPE` in `packages/common/src/constants.ts`), including:

- Selection, lasso, rectangle, diamond, ellipse, line, arrow, freedraw, text, image, eraser, hand (pan), frame, magic frame, embeddable, laser pointer.

Document and UI:

- Undo/redo (Store + History), grid, themes, view mode, zen mode, shape **library**, stats panels, export flows (image / JSON per product wiring).

### 4.2 Host / SDK capabilities

- Embed with React 17+ / 18 / 19 (peer deps in `packages/excalidraw/package.json`).
- Load **initial data**; subscribe to **`onChange(elements, appState, files)`**.
- Imperative control: scene updates, library updates, scroll, tool selection, etc. (see API surface in `packages/excalidraw/components/App.tsx`).

### 4.3 Application layer (`excalidraw-app`)

- Production build and dev server (Vite).
- Product integrations visible in dependencies: e.g. Firebase, `socket.io-client`, Sentry, i18n, Jotai—supporting realtime, auth/storage patterns, and operations outside the minimal library surface.

### 4.4 Developer experience

- Workspace builds (`yarn build:packages`), full app build (`yarn build`), tests (`yarn test`, `yarn test:all`), formatting and ESLint.

---

## 5. Technical restrictions and constraints

### 5.1 Runtime

- **Node.js** `>=18.0.0` for tooling (root `package.json` `engines`).
- **Browsers:** targets defined in `packages/excalidraw/package.json` `browserslist` (modern evergreen; excludes very old IE/Safari/Edge per list).

### 5.2 Embedding

- **Client-side rendering:** editor expects browser APIs (canvas, DOM). SSR frameworks must load the component on the client (e.g. Next.js dynamic import with `ssr: false`)—see `packages/excalidraw/README.md`.
- **CSS required:** integrators must import `@excalidraw/excalidraw/index.css`.
- **Layout:** parent container must have **non-zero height** or the canvas will not display.

### 5.3 Package and build

- **Package manager:** repository is configured for **Yarn Classic (v1)**; root scripts invoke `yarn --cwd …`.
- **Published package** ships built assets under `dist/` (`packages/excalidraw` `files` field); TypeScript declarations generated via package script (`gen:types`).
- **Deep imports:** v0.18+ uses subpath exports for types (`@excalidraw/excalidraw/common/*`, etc.); old `types/` paths removed per package README migration table.

### 5.4 Security and content

- **Embeddables** require validation paths in editor code; hosts can supply `validateEmbeddable` / `renderEmbeddable`.
- **Sanitization** dependencies exist for URLs and related concerns (e.g. `@braintree/sanitize-url` in package dependencies).

### 5.5 Operational

- Optional **telemetry / Sentry** in app builds controlled by env flags in `excalidraw-app` scripts (`VITE_APP_*`).
- Engine warnings may appear on non-LTS Node versions (e.g. 21) for some dev dependencies; LTS 18/20/22 preferred for tooling.

---

## 6. Out of scope (for this document)

- Detailed roadmap or issue-level backlog (track upstream project / issue tracker).
- Legal/privacy policy text (product deployment responsibility).
- Exact SLA for hosted app (depends on deployment).

---

## 7. Related documents

- [Domain glossary](./domain-glossary.md)
- [Architecture](../technical/architecture.md)
- [Developer setup](../technical/dev-setup.md)
- [Product context](../memory/productContext.md)

---

## 8. Source verification

- Root `package.json` — workspaces, scripts, engines.
- `packages/excalidraw/package.json` — description, peers, exports, browserslist.
- `packages/excalidraw/README.md` — integration constraints.
- `packages/common/src/constants.ts` — `TOOL_TYPE` and related product constants.
- `excalidraw-app/package.json` — app-specific dependencies and build env.
- `docs/memory/projectbrief.md`, `docs/memory/productContext.md`.
