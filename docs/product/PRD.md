# Product Requirements Document — Excalidraw

> **Type:** Reverse-engineered PRD. All requirements are derived from source code, runtime behavior, and configuration found in this repository. This document does not represent an internal roadmap; it describes what the product _currently is_ and _does_, expressed in product language.

---

## 1. Product Goal

Excalidraw's goal is to deliver a **fast, approachable, browser-native whiteboard** that feels like a physical sketchpad — with a signature hand-drawn aesthetic — while remaining powerful enough for technical diagrams, collaborative sessions, and third-party embedding.

The product fulfills two distinct but overlapping goals:

| Goal | Delivery shape | North star |
| --- | --- | --- |
| **Consumer whiteboard** | Hosted web app (`excalidraw-app`) | Any user can open a URL, start drawing, share a link, and optionally collaborate in real time — zero install, zero account required |
| **Whiteboard infrastructure** | npm package (`@excalidraw/excalidraw`) | Any product team can embed a fully-featured canvas in their app with a single React component and a stable API |

Both goals share the same editor core; the hosted app adds the product shell (sharing, real-time collaboration, persistence, PWA behaviors) on top of the library.

---

## 2. Target Audience

### 2.1 End users of the hosted app

**Primary:** Knowledge workers, engineers, designers, and students who need to quickly externalize ideas — architecture diagrams, flowcharts, wireframes, brainstorming maps, meeting notes on a canvas — without adopting a heavyweight diagramming tool.

**Behavioral signals in source:**

- No account/auth gate: the app initializes from `localStorage` and can load a shared scene from a URL hash without login (`excalidraw-app/data/index.ts`, local-first recovery in `excalidraw-app/App.tsx`).
- `localStorage` quota alerts exist (`localStorageQuotaExceededAtom`) — indicates a "light" persistence model aimed at casual, individual use as the baseline.
- Share-link flow (`excalidraw-app/share/ShareDialog.tsx`) is prominent and link-centric, consistent with a product used in async communication contexts (Slack, email, issue trackers).

**Secondary:** Teams doing live collaborative design reviews or remote whiteboarding sessions — served by the real-time collaboration path (`excalidraw-app/collab`).

**Tertiary:** Power users who install the app as a PWA and use OS-level file handling (`.excalidraw` file handler, share target in the manifest).

### 2.2 Developers embedding `@excalidraw/excalidraw`

Product engineers at SaaS companies, documentation platforms, note-taking apps, or internal tools who want to embed a canvas without building one. They interact with Excalidraw as an npm package, not a hosted product.

**What they need (evidenced by API surface):**

- A drop-in `<Excalidraw />` React component with minimal configuration.
- Imperative control: `ExcalidrawImperativeAPI` (`updateScene`, `getSceneElements`, `getAppState`, `updateLibrary`, `addFiles`, `onChange`, `onIncrement`, `registerAction`).
- Theming hooks: `theme` prop, `UIOptions`, `renderTopRightUI` / `renderTopLeftUI` slot props.
- Localization: `langCode` prop backed by `packages/excalidraw/locales/*.json`.
- Full control over persistence and transport: the library deliberately does not ship a room server or storage backend.

### 2.3 Monorepo contributors / maintainers

Engineers who contribute to the hosted app or library and need the repository to stay shippable. Maintainers are an implicit audience for the architecture, test coverage, and quality constraints documented in this repo.

---

## 3. Key Features

### 3.1 Drawing canvas and shape toolset

**Requirement:** Users can create and edit a rich set of drawable shapes on an infinite canvas.

**Supported element types** (from `ToolType` in `packages/excalidraw/types.ts`):

| Category     | Elements                                          |
| ------------ | ------------------------------------------------- |
| Geometry     | Rectangle, diamond, ellipse                       |
| Lines        | Arrow (with endpoint binding), line, freedraw     |
| Content      | Text, image, embeddable (iframe)                  |
| Organization | Frame, magic frame                                |
| Interaction  | Selection, lasso, eraser, hand/pan, laser pointer |

**Canvas behaviors:**

- Zoom and scroll with viewport culling: `Renderer.getRenderableElements` performs viewport-based culling so only visible elements are drawn (`packages/excalidraw/scene/Renderer.ts`).
- Hand-drawn aesthetic rendered via RoughJS (`roughjs` dependency, used in `_renderStaticScene`).
- Grid mode, zen mode, and view-only mode are toggleable from `AppState`.
- Infinite undo/redo via `History` + `Store` durable increments (`packages/excalidraw/history.ts`, `packages/element/src/store.ts`).
- Arrow endpoint binding: arrows attach to shapes with normalized `fixedPoint` ratios and follow shape movement (`FixedPointBinding` in `packages/element/src/types.ts`).

### 3.2 Real-time collaboration (hosted app)

**Requirement:** Multiple users can join a shared session, see each other's cursors and edits live, and receive an offline warning if connectivity drops.

**Implementation signals:**

- Room-based sessions coordinated by `Collab` class (`excalidraw-app/collab/Collab.tsx`) with socket-based transport via `Portal` (`excalidraw-app/collab/Portal.tsx`).
- Element reconciliation on merge: `reconcileElements` applies version/versionNonce rules to decide which changes win, handling concurrent edits without a CRDT library (`packages/excalidraw/data/reconcile.ts`).
- Presence rendering: collaborator cursors/pointers and laser positions are drawn on `InteractiveCanvas` via `AppState.collaborators` (`packages/excalidraw/renderer/interactiveScene.ts`).
- Offline awareness: `isOfflineAtom` drives a visible warning banner in `excalidraw-app/App.tsx`; offline multiplayer is explicitly not seamless.
- Firebase-backed scene persistence for shared sessions (encrypted): `excalidraw-app/data/firebase.ts` uses `encryptData`/`decryptData` and transaction-based saves.

### 3.3 Link-based sharing (hosted app)

**Requirement:** Users can generate a shareable URL that encodes the full scene and optionally upload it to a backend for recipients to open.

**Implementation signals:**

- `exportToBackend` in `excalidraw-app/data/index.ts` handles scene upload; the result is a URL with a hash fragment.
- `ShareDialog` (`excalidraw-app/share/ShareDialog.tsx`) provides copy-link, system-share, and link-revocation flows.
- Scene data is encrypted client-side before upload; the decryption key travels in the URL hash (never reaches the server).

### 3.4 Export

**Requirement:** Users can export their drawings as image files or structured data.

**Export formats evidenced in code:**

| Format | Entry point |
| --- | --- |
| PNG / SVG bitmap | `exportToCanvas` in `packages/excalidraw/scene/export.ts` reuses `renderStaticScene` |
| Clipboard (copy as image) | Built into editor actions |
| `.excalidraw` JSON file | Serialization via `packages/excalidraw/data/*` |
| Library items (`.excalidrawlib`) | `Library` class in `packages/excalidraw/data/library.ts` |

The export renderer uses the same `renderStaticScene` function as the on-screen renderer, with `isExporting: true` and adjusted scroll/zoom for the export region.

### 3.5 Shape library

**Requirement:** Users can save reusable groups of elements to a personal library, import community libraries, and insert saved shapes into any drawing.

**Implementation signals:**

- `Library` class manages import, merge, and persistence of `LibraryItem` templates keyed by ID (`packages/excalidraw/data/library.ts`).
- Library menu UI: `packages/excalidraw/components/LibraryMenu*.tsx`.
- `ExcalidrawImperativeAPI.updateLibrary` exposes library management to embedders.
- Items carry `published | unpublished` status for distinguishing personal vs. community-sourced templates.

### 3.6 Progressive Web App (PWA) installation and offline use

**Requirement:** Users can install Excalidraw as a native-like app, open `.excalidraw` files from the OS, and use the app on intermittent connections.

**Implementation signals:**

- PWA manifest is generated via `vite-plugin-pwa` in `excalidraw-app/vite.config.mts` with `file_handlers` for `.excalidraw` and `share_target` for OS-level sharing.
- Service worker registration at app startup (`excalidraw-app/index.tsx`) with runtime caching for fonts, locale chunks, and JS bundles.
- Local-first initialization: the app restores state from `localStorage` on load before any network calls.

### 3.7 Localization

**Requirement:** The editor UI is fully translatable and can be rendered in any supported locale.

**Implementation signals:**

- Extensive locale files under `packages/excalidraw/locales/*.json` covering dozens of languages.
- `langCode` prop on the `Excalidraw` component selects the active locale; hosts and the app can pass it dynamically.
- Build chunking splits locale files so only the active language is loaded at runtime.

### 3.8 Embeddable React component (library)

**Requirement:** Third-party apps can embed the full Excalidraw editor with one React component and control it via a stable imperative API.

**Integration contract evidenced by `packages/excalidraw/types.ts` and `README.md`:**

| Surface | Details |
| --- | --- |
| Component | `<Excalidraw />` — mounts `App` with providers |
| Initial data | `initialData` prop (elements, appState, files, library) |
| Reactive callbacks | `onChange`, `onPointerUpdate`, `onScrollChange` |
| Imperative API | `ExcalidrawImperativeAPI` (via `onExcalidrawAPI` prop or ref): `updateScene`, `getSceneElements`, `getAppState`, `updateLibrary`, `addFiles`, `registerAction`, `resetScene`, `setActiveTool` |
| Collaboration hooks | `isCollaborating`, `onPointerUpdate`, `collaborators` via API — embedders plug in their own transport |
| UI customization | `theme`, `langCode`, `UIOptions`, `renderTopRightUI`, `renderTopLeftUI`, `viewModeEnabled`, `zenModeEnabled`, `gridModeEnabled` |
| CSS requirement | Host must import the package stylesheet and give the parent element a non-zero height |

---

## 4. Technical Constraints

### 4.1 Browser-only rendering — no SSR support

The editor renders to `HTMLCanvasElement` via `useEffect` in `StaticCanvas` and `InteractiveCanvas`. There is no server-side rendering path for the canvas. The library README documents client-only and dynamic-import patterns for Next.js and similar SSR frameworks. **Embedders must render `<Excalidraw />` in a client-only context.**

### 4.2 React peer dependency and class component core

The editor's main component (`App` in `packages/excalidraw/components/App.tsx`) is a React class component. `Store.commit` is called in `componentDidUpdate`; the `_initialized` flag flips during `componentDidUpdate` in a specific order relative to `AppStateObserver.flush`. Changes to the render/update cycle carry hidden coupling risks documented in `docs/memory/decisionLog.md`.

React and React DOM are peer dependencies of `@excalidraw/excalidraw`; the host app supplies them.

### 4.3 Monorepo build order dependency

Internal packages must be built in dependency order: `common` → `math` → `element` → `excalidraw`. The `yarn build:packages` script enforces this sequence. Stale build artifacts in `packages/*/dist` can cause runtime errors when switching branches.

### 4.4 Collaboration is app-layer only, not a turnkey npm feature

Real-time sync (room creation, socket transport, Firebase persistence, `reconcileElements` orchestration) is implemented in `excalidraw-app/collab` and is not included in the published `@excalidraw/excalidraw` package. Embedders who need multiplayer must implement their own transport using the library's collaboration hooks (`isCollaborating`, `onPointerUpdate`, `updateScene` with `collaborators`).

### 4.5 End-to-end encryption for shared scenes

When the hosted app uploads a shared scene, the scene data is encrypted client-side (`encryptData`/`decryptData` in `excalidraw-app/data/firebase.ts`) before it reaches Firebase Storage. The decryption key is embedded in the URL fragment (never sent to the server). Any change to the sharing flow must preserve this property.

### 4.6 Element versioning and reconciliation invariants

Every `ExcalidrawElement` carries `version` and `versionNonce` fields used by `reconcileElements` to resolve merge conflicts during collaboration. Mutations must increment `version` correctly. The reconciliation rules in `packages/excalidraw/data/reconcile.ts` are a correctness boundary; incorrect version handling causes silent data loss or infinite sync loops.

### 4.7 Fractional index ordering

Elements in the `Scene` are ordered by a fractional string `index` field (`OrderedExcalidrawElement`). `replaceAllElements` runs `syncInvalidIndices` on every replacement to normalize indices. Code that inserts or reorders elements must produce valid fractional indices; the `validateIndicesThrottled` call in `Scene` logs violations in development.

### 4.8 Performance constraints

- **Viewport culling is required:** `Renderer.getRenderableElements` filters elements by viewport bounds before passing them to canvas drawing functions. Bypassing this on large diagrams would block the main thread.
- **Locale chunking:** Locale JSON files are split into separate build chunks; only the active language loads at runtime. New locale content must follow existing file structure to stay within the chunking boundaries.
- **Render throttling:** `renderStaticScene` supports RAF-based throttling (`isRenderThrottlingEnabled`). Features that trigger many rapid re-renders must account for this.

### 4.9 Accessibility baseline

Many interactive controls use `aria-label` attributes, and test helpers query by ARIA label. Regressions in labeling or focus order break both user accessibility and automated tests. New UI components should follow the existing labeling patterns.

### 4.10 Node.js and toolchain versions

| Tool    | Required version                                            |
| ------- | ----------------------------------------------------------- |
| Node.js | `>=18.0.0` (CI runs `20.x`)                                 |
| Yarn    | Classic `1.22.22` (`packageManager` in root `package.json`) |
| Docker  | Optional; needed only for `yarn build:app:docker`           |

Mismatched toolchain versions are the most common cause of `yarn install` failures and unexpected build behavior (see `docs/technical/dev-setup.md`).

### 4.11 Firebase and collaboration environment variables

Local collaboration features require environment variables (`VITE_APP_FIREBASE_CONFIG`, backend/collab URLs) that are not committed to the repository. Running without them causes Firebase/socket features to fail silently or throw at runtime. These values must be obtained from project maintainers and must not be committed.

---

## 5. Out of Scope (product boundaries, source-grounded)

| Area | Why it is out of scope |
| --- | --- |
| Account/auth system | No auth layer exists in the codebase; sharing is link-based and anonymous |
| Server-side canvas rendering | Canvas rendering is client-only by design; no SSR path exists |
| Multiplayer as a turnkey npm feature | Real-time room sync lives in `excalidraw-app`, not the npm package |
| Universal persistence format | The library provides serialization helpers but does not dictate storage; embedders own persistence policy |
| Offline multiplayer | The hosted app shows an explicit warning when offline during a collab session; seamless offline sync is not supported |

---

## 6. Source references

| Topic | Primary sources |
| --- | --- |
| Monorepo layout and workspaces | `package.json`, `docs/memory/projectbrief.md` |
| Editor component architecture | `packages/excalidraw/components/App.tsx`, `docs/technical/architecture.md` |
| Element types and tool list | `packages/excalidraw/types.ts` (`ToolType`, `ExcalidrawElement`) |
| Collaboration implementation | `excalidraw-app/collab/Collab.tsx`, `excalidraw-app/collab/Portal.tsx`, `packages/excalidraw/data/reconcile.ts` |
| Sharing and encryption | `excalidraw-app/data/index.ts`, `excalidraw-app/data/firebase.ts`, `excalidraw-app/share/ShareDialog.tsx` |
| Embeddable API surface | `packages/excalidraw/types.ts` (`ExcalidrawProps`, `ExcalidrawImperativeAPI`), `packages/excalidraw/README.md` |
| PWA and service worker | `excalidraw-app/vite.config.mts`, `excalidraw-app/index.tsx` |
| Library/shape templates | `packages/excalidraw/data/library.ts`, `packages/excalidraw/types.ts` |
| Export pipeline | `packages/excalidraw/scene/export.ts`, `packages/excalidraw/renderer/staticScene.ts` |
| Localization | `packages/excalidraw/locales/*.json` |
| Product context and user journeys | `docs/memory/productContext.md` |
| Domain terms | `docs/product/domain-glossary.md` |
| Decision log (memory bank) | `docs/memory/decisionLog.md` |
