# Decision Log

Key architectural decisions, summarized from the current codebase and cross-checked against git history.

## Verification scope

- Source-first review across root manifests, excalidraw-app, packages, firebase-project, Docker, CI, and examples.
- Files excluded by .cursorignore were not used as evidence.
- Git history was used only as a secondary check on when decisions appeared.

## DL-001: Workspace monorepo as the default architecture

Decision:
- Keep the system as a Yarn workspaces monorepo with one host app, shared packages, and runnable examples.

Evidence:
- package.json defines packageManager yarn@1.22.22 and workspace list (package.json:4-5).
- package.json root scripts orchestrate cross-workspace builds and tests (package.json:59, package.json:65-66, package.json:70).
- Directory layout mirrors the workspace contract: excalidraw-app, packages/common|element|excalidraw|math|utils, examples/*.

## DL-002: Layered split between host app and reusable editor engine

Decision:
- Keep product-specific behavior in excalidraw-app while the editor runtime/API stays in packages/excalidraw.

Evidence:
- excalidraw-app/App.tsx imports editor APIs from @excalidraw/excalidraw (excalidraw-app/App.tsx:10).
- packages/excalidraw/index.tsx defines provider/base wiring for reusable editor package (packages/excalidraw/index.tsx:46, packages/excalidraw/index.tsx:61).
- packages/excalidraw/components/App.tsx instantiates action manager, scene, renderer, store, and history (packages/excalidraw/components/App.tsx:819, packages/excalidraw/components/App.tsx:825, packages/excalidraw/components/App.tsx:829, packages/excalidraw/components/App.tsx:832-833).

## DL-003: Source-linked local development via Vite aliasing

Decision:
- Keep Vite as the app bundler and resolve internal @excalidraw/* modules directly to workspace source during development.

Evidence:
- excalidraw-app/package.json uses vite in start/build scripts (excalidraw-app/package.json:25-31).
- excalidraw-app/vite.config.mts defines alias mapping section (excalidraw-app/vite.config.mts:25).
- excalidraw-app/vite.config.mts includes manual chunk strategy via manualChunks() (excalidraw-app/vite.config.mts:96).

## DL-004: Action-driven editor command model

Decision:
- Centralize editor operations behind an ActionManager that evaluates availability, keyboard handlers, and action execution paths.

Evidence:
- packages/excalidraw/actions/manager.tsx defines ActionManager and execution entry points (packages/excalidraw/actions/manager.tsx:52, packages/excalidraw/actions/manager.tsx:81, packages/excalidraw/actions/manager.tsx:89, packages/excalidraw/actions/manager.tsx:148).
- packages/excalidraw/components/App.tsx constructs ActionManager in runtime constructor (packages/excalidraw/components/App.tsx:819).
- packages/excalidraw/components/App.tsx imports many discrete actions from packages/excalidraw/actions/* (packages/excalidraw/components/App.tsx:282-318).

## DL-005: Scene + Store + History as explicit state/change pipeline

Decision:
- Maintain a dedicated scene model and delta-based store pipeline, with undo/redo implemented as invertible history deltas.

Evidence:
- packages/element/src/Scene.ts declares scene model with non-deleted maps/cache and scene nonce (packages/element/src/Scene.ts:108, packages/element/src/Scene.ts:115-117, packages/element/src/Scene.ts:126, packages/element/src/Scene.ts:141).
- packages/element/src/store.ts defines CaptureUpdateAction and commit/scheduling emitters (packages/element/src/store.ts:38, packages/element/src/store.ts:80-82, packages/element/src/store.ts:110-111, packages/element/src/store.ts:183).
- packages/excalidraw/history.ts defines HistoryDelta and undo/redo stack behavior (packages/excalidraw/history.ts:15, packages/excalidraw/history.ts:90, packages/excalidraw/history.ts:95-96, packages/excalidraw/history.ts:139, packages/excalidraw/history.ts:148).

## DL-006: Canvas rendering is viewport-aware and cache-oriented

Decision:
- Render only visible, renderable scene elements and use memoized derivation/cancellation-aware rendering lifecycle.

Evidence:
- packages/excalidraw/scene/Renderer.ts computes visible elements with isElementInViewport inside getRenderableElements (packages/excalidraw/scene/Renderer.ts:1, packages/excalidraw/scene/Renderer.ts:26, packages/excalidraw/scene/Renderer.ts:49).
- packages/excalidraw/scene/Renderer.ts memoizes renderable set derivation (packages/excalidraw/scene/Renderer.ts:98).
- packages/excalidraw/components/App.tsx creates Scene and Renderer instances in constructor (packages/excalidraw/components/App.tsx:825, packages/excalidraw/components/App.tsx:829).

## DL-007: Local-first persistence with browser storage + IndexedDB files

Decision:
- Persist scene/app state locally by default, keep binary files in IndexedDB, and gate writes via save pause/lock semantics.

Evidence:
- excalidraw-app/data/LocalData.ts persists app+elements through saveDataStateToLocalStorage (excalidraw-app/data/LocalData.ts:73, excalidraw-app/data/LocalData.ts:125).
- excalidraw-app/data/LocalData.ts configures IndexedDB file store via idb-keyval createStore("files-db", "files-store") (excalidraw-app/data/LocalData.ts:49).
- excalidraw-app/data/LocalData.ts exposes debounced save/flush and pause/resume semantics (excalidraw-app/data/LocalData.ts:137, excalidraw-app/data/LocalData.ts:149, excalidraw-app/data/LocalData.ts:155, excalidraw-app/data/LocalData.ts:159, excalidraw-app/data/LocalData.ts:163).

## DL-008: Collaboration uses socket presence plus Firebase-backed encrypted scene/files

Decision:
- Keep collaboration architecture with realtime portal/socket behavior and Firebase persistence where scene payloads/files are encrypted client-side.

Evidence:
- excalidraw-app/collab/Collab.tsx defines collab API surface and lifecycle methods (excalidraw-app/collab/Collab.tsx:98, excalidraw-app/collab/Collab.tsx:132, excalidraw-app/collab/Collab.tsx:471, excalidraw-app/collab/Collab.tsx:955).
- excalidraw-app/data/firebase.ts initializes Firebase services and encrypt/decrypt flows (excalidraw-app/data/firebase.ts:10, excalidraw-app/data/firebase.ts:12, excalidraw-app/data/firebase.ts:18, excalidraw-app/data/firebase.ts:99, excalidraw-app/data/firebase.ts:111).
- firebase-project/firebase.json defines Firestore and Storage rule/index surfaces (firebase-project/firebase.json:1-7).

## DL-009: PWA-enabled web entrypoint

Decision:
- Keep app startup as React StrictMode with service worker registration and Vite PWA integration.

Evidence:
- excalidraw-app/index.tsx registers service worker and mounts StrictMode root (excalidraw-app/index.tsx:1-3, excalidraw-app/index.tsx:11-14).
- excalidraw-app/index.tsx stamps build SHA on window (excalidraw-app/index.tsx:9).
- excalidraw-app/vite.config.mts configures VitePWA and runtimeCaching (excalidraw-app/vite.config.mts:143, excalidraw-app/vite.config.mts:150).

## DL-010: Production delivery as static build in Nginx container

Decision:
- Continue multi-stage container strategy: Node build stage, Nginx static serving stage.

Evidence:
- Dockerfile uses multi-stage build and static asset handoff to Nginx (Dockerfile:1, Dockerfile:14, Dockerfile:16, Dockerfile:18).
- Dockerfile defines runtime healthcheck (Dockerfile:20).
- docker-compose.yml publishes container port mapping for web runtime (docker-compose.yml:9).

## DL-011: CI baseline validates runtime on Node 20 with app tests

Decision:
- Keep the baseline test workflow pinned to Node 20 and running yarn test:app on pushes.

Evidence:
- .github/workflows/test.yml runs on push to master with Node 20.x and app tests (.github/workflows/test.yml:1, .github/workflows/test.yml:5, .github/workflows/test.yml:15, .github/workflows/test.yml:19).

## Git cross-check note

- Commits a345399/5247322/da795d2/4451b1e were reviewed.
- The architecture above is primarily inferred from current source modules; git history mainly confirms these choices were established from project initialization.