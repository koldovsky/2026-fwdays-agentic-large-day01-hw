# Product Requirements Document (reverse-engineered)

This PRD describes **observable product behavior** reconstructed from this repository’s implementation. It is **not** a marketing or roadmap document. Statements without sufficient code backing are marked **Not verified** or **Partially verified**.

---

## 1. Product overview

### What the product is

- **Primary deliverable:** A **browser-based diagram / whiteboard editor** shipped as:
  - A **React component library** `@excalidraw/excalidraw` (`packages/excalidraw/package.json` describes it as *“Excalidraw as a React component”*).
  - A **hosted web application** `excalidraw-app` that embeds that editor and adds hosting-specific behavior (persistence hooks, collaboration client, share links, optional AI integrations, etc.).

### Core interaction model

- Users work on a **2D canvas**: create and manipulate **elements** (shapes, lines, text, images, frames, embeddables, etc.) with **tools** (selection, drawing, eraser, hand, laser, …), **actions** (undo/redo, align, export, …), and **application state** (zoom, scroll, selection, UI mode).
- **Rendering** uses HTML canvas (static + interactive layers) driven by scene data, not DOM layout of shapes.

### Application type

- **Editor / design surface** with optional **real-time collaboration**, **shareable links**, **library** of reusable items, and **import/export** of scene data — as implemented in code paths below.

**Evidence:** `packages/excalidraw/components/App.tsx`, `packages/element/src/Scene.ts`, `packages/excalidraw/types.ts`, `excalidraw-app/App.tsx`.

---

## 2. Product goal (inferred from features)

### Problems addressed (by implemented capabilities)

- **Visual ideation and annotation:** create diagrams from primitive shapes, connectors, text, images, and freehand strokes (`ToolType` in `packages/excalidraw/types.ts`; element types in `packages/element/src/types.ts`).
- **Iteration and correction:** undo/redo via `Store` / `History` and `Action` results with capture policy (`packages/element/src/store.ts`, `packages/excalidraw/history.ts`, `CaptureUpdateAction`).
- **Sharing:** export scene data and generate **backend-backed share links** with encryption material in the URL hash (`excalidraw-app/data/index.ts` `exportToBackend`, `importFromBackend`).
- **Synchronous co-editing (when configured):** multi-user session with encrypted socket payloads and Firebase-backed assets for rooms (`excalidraw-app/collab/Collab.tsx`, `excalidraw-app/data/firebase.ts`, `excalidraw-app/data/index.ts` collaboration URL helpers).
- **Reuse:** maintain a **library** of stencil items (`packages/excalidraw/data/library.ts`, `LibraryItem` in `packages/excalidraw/types.ts`).
- **Optional AI-assisted flows (host):** diagram→code and text→diagram when `VITE_APP_AI_BACKEND` is available (`excalidraw-app/components/AI.tsx`).

### Outcomes users achieve

- Persistable **scenes** (elements + app state + binary files) serialized for export/import (`packages/excalidraw/data/types.ts` `ImportedDataState` / `ExportedDataState`).
- **Not verified** as universal goals: team process, compliance, or education — only what features implement.

---

## 3. Target users (code signals only)

The product appears designed for users who:

- **Author 2D diagrams** in a web browser using **mouse/pen/touch** (pointer types and tool set in `packages/excalidraw/types.ts`, `AppState` in `packages/excalidraw/types.ts`).
- **Collaborate remotely** when a compatible WebSocket server and Firebase are configured (`excalidraw-app/collab/Collab.tsx`, `.env-style URLs in `excalidraw-app` data layer).
- **Integrate the editor** into another React app via `@excalidraw/excalidraw` props and callbacks (`packages/excalidraw/types.ts` `ExcalidrawProps`).
- **Export or share** work as links, images, SVG, or JSON depending on actions and host wiring (`ActionName` includes `copyAsPng`, `copyAsSvg`, export-related props).

**Secondary / Partially verified**

- **Mobile users:** `editorInterface` / form factor and mobile-specific UI branches exist (`packages/excalidraw/components/App.tsx` mobile handling; `excalidraw-app/App.tsx` `isMobile` in `renderTopRightUI`). Exact UX guarantees are **Partially verified** (e.g. HACK disabling some handles on mobile in `App.tsx`).
- **“Excalidraw+” cloud users:** host links to external Plus URLs and export flows (`excalidraw-app` components referencing `VITE_APP_PLUS_*`, `ExportToExcalidrawPlus.tsx`). **Not verified:** commercial relationship; only URL and upload behavior in code.

**Not verified:** specific industries, company size, or persona names — not encoded in repository.

---

## 4. Core features

Evidence references point to authoritative modules; not every file is listed per bullet.

### Drawing / editing

- Create and edit **vector elements**: rectangles, diamonds, ellipses, lines, arrows, freedraw, text, images, frames, magic frames, embeddables, iframes (`ExcalidrawElement` union, `packages/element/src/types.ts`).
- Adjust **stroke, fill, opacity, roughness, roundness, fonts, alignment**, etc., via **actions** and toolbar UI (`ActionName` includes `changeStrokeColor`, `changeFontSize`, … — `packages/excalidraw/actions/types.ts`).
- **Crop** images where supported (`ActionName` includes `cropEditor`).
- **Charts** pipeline exists (`packages/excalidraw/charts` referenced from codebase structure; chart types in `packages/element/src/types.ts` `ChartType`).

### Interaction / tools

- **Tool modes** including `selection`, `lasso`, shape tools, `arrow`, `line`, `freedraw`, `text`, `image`, `eraser`, `hand`, `frame`, `magicframe`, `embeddable`, `laser` (`ToolType`, `packages/excalidraw/types.ts`).
- **View mode** restricts actions that lack `viewMode: true` in `ActionManager.handleKeyDown` (`packages/excalidraw/actions/manager.tsx`).
- **Keyboard** shortcuts via `ActionManager.handleKeyDown` and action `keyTest` (`packages/excalidraw/actions/manager.tsx`).

### State / history

- **Undo / redo** through `History` + `Store` with `CaptureUpdateAction` policy (`packages/element/src/store.ts`, `packages/excalidraw/history.ts`).
- **App-wide UI state** in React `AppState` (tool, selection, zoom, scroll, dialogs, collaborators map, …) (`packages/excalidraw/types.ts` `AppState`).

### Collaboration (host app)

- **Live session** when joining/creating a room: URL `#room=<roomId>,<roomKey>`, Socket.IO client, encrypted broadcasts, collaborator presence (`excalidraw-app/data/index.ts`, `excalidraw-app/collab/Collab.tsx`, `excalidraw-app/collab/Portal.tsx`).
- **Collaboration disabled when the host runs inside an iframe** (`isCollabDisabled = isRunningInIframe()` in `excalidraw-app/App.tsx`).

### Import / export

- **Load/save scene** actions (`loadScene`, `saveToActiveFile`, `saveFileToDisk` in `ActionName`).
- **Clipboard:** copy/cut/paste, copy as PNG/SVG (`ActionName`).
- **JSON / PNG** export paths and host `onExport` hook for async completion (`packages/excalidraw/types.ts` `onExport` on `ExcalidrawProps`).
- **Shareable link** via backend POST + hash in URL (`excalidraw-app/data/index.ts` `exportToBackend`).
- **Host:** import from hash `#json=...`, `#url=...`, collaboration links (`excalidraw-app/App.tsx` `initializeScene`).

### Library / reuse

- **Library items** (v2) as named, versioned groups of elements (`LibraryItem`, `LibraryItems` in `packages/excalidraw/types.ts`); persistence via adapters (`packages/excalidraw/data/library.ts` `LibraryPersistenceAdapter`).

### UI / controls

- **Main menu**, **command palette**, **search**, **sidebar** tabs, **stats**, **welcome screen** components under `packages/excalidraw/components/` (e.g. `AppMainMenu` in host `excalidraw-app` wires `MainMenu` defaults).
- **Optional AI UI** when `aiEnabled` / host includes `AIComponents` (`packages/excalidraw/types.ts` `aiEnabled`; `excalidraw-app/App.tsx` `AIComponents`).

### Host-only (excalidraw-app)

- **Firebase** storage for collab/share assets (`excalidraw-app/data/firebase.ts`, `excalidraw-app/app_constants.ts` prefixes).
- **Sentry** optional (`excalidraw-app/sentry.ts`, imported from `excalidraw-app/index.tsx`).
- **PWA** registration (`excalidraw-app/index.tsx` `registerSW`).

---

## 5. User workflows (key scenarios)

### A. Create and edit shapes

1. User selects a **tool** (`AppState.activeTool`) — e.g. rectangle — `packages/excalidraw/types.ts`.
2. Pointer events on canvas create/update **`newElement`** / finalize via **`actionFinalize`** (`packages/excalidraw/components/App.tsx` references `actionFinalize`).
3. **`syncActionResult`** applies `ActionResult` to `Scene` and `setState` (`packages/excalidraw/components/App.tsx`).
4. **Canvas** re-renders via `StaticCanvas` / `InteractiveCanvas` (`packages/excalidraw/components/canvases/`, `packages/excalidraw/renderer/`).

### B. Undo / redo

1. User triggers **undo** or **redo** actions (`ActionName` `undo`, `redo`).
2. **`History`** applies deltas to snapshots (`packages/excalidraw/history.ts`).

### C. Share static scene (host)

1. User exports to backend; client posts to `VITE_APP_BACKEND_V2_POST_URL` (`excalidraw-app/data/index.ts` `exportToBackend`).
2. **Hash** updated to `#json=<id>,<key>`; optional Firebase upload for images.
3. Recipient opens link; **`importFromBackend`** fetches and decrypts (`excalidraw-app/data/index.ts`, `excalidraw-app/App.tsx` `initializeScene`).

### D. Collaborate (host)

1. User starts collaboration; app generates or uses **`roomId` / `roomKey`**, pushes hash, opens Socket.IO (`excalidraw-app/collab/Collab.tsx`).
2. **Encrypted** scene updates broadcast (`excalidraw-app/collab/Portal.tsx`).
3. **Collaborators** appear in `AppState.collaborators` (`packages/excalidraw/types.ts` `Collaborator`).

### E. Library

1. User adds selection to library (`ActionName` `addToLibrary`).
2. **`Library`** class queues updates and persists via adapter (`packages/excalidraw/data/library.ts`).

### Variations / constraints

- **Iframe embed:** collaboration UI suppressed (`excalidraw-app/App.tsx` `isCollabDisabled`).
- **Align frames:** predicate excludes frame-like elements until implemented (`packages/excalidraw/actions/actionAlign.tsx` — see §8 boundaries).

---

## 6. Interaction model

### Tools

- **Active tool** is part of `AppState.activeTool` (`ToolType` or custom) (`packages/excalidraw/types.ts`).

### Actions / commands

- **Actions** are registered objects with `perform()` returning `ActionResult` (`packages/excalidraw/actions/types.ts`, `packages/excalidraw/actions/register.ts`).
- **`ActionManager`** dispatches `executeAction`, keyboard routing, and optional panel UI (`packages/excalidraw/actions/manager.tsx`).

### Events

- Pointer handlers on canvas drive creation, selection, transform (`packages/excalidraw/components/App.tsx` — large handler surface).
- **Global keyboard** when `handleKeyboardGlobally` prop set (`packages/excalidraw/types.ts`).

### Selection

- **`selectedElementIds`**, groups, linear editor state, etc., in `AppState` (`packages/excalidraw/types.ts`).

### Host callbacks

- **`onChange`** on every scene update for persistence (`ExcalidrawProps`, used in `excalidraw-app/App.tsx`).

---

## 7. Technical constraints (product-visible)

| Constraint | Evidence |
|------------|----------|
| **Scene elements** must reconcile versions for sync (`version`, `versionNonce`, `index`) | `packages/element/src/types.ts` field comments |
| **Undo capture** policy (`IMMEDIATELY` / `NEVER` / `EVENTUALLY`) affects whether edits undo as one step | `packages/element/src/store.ts` |
| **Share link payload size** — backend may return `RequestTooLargeError` | `excalidraw-app/data/index.ts` `exportToBackend` |
| **Image / file uploads** per encoded size cap in host | `excalidraw-app/app_constants.ts` `FILE_UPLOAD_MAX_BYTES` (used in export/collab paths) |
| **Collaboration** requires network + compatible server; **not** self-contained in repo | `excalidraw-app/collab/Collab.tsx`, env URLs |
| **Bounds** for some path operations incomplete | `packages/element/src/bounds.ts` — `TODO: Implement this` branches |
| **Align/distribute** disabled for frame-like selection | `packages/excalidraw/actions/actionAlign.tsx`, `actionDistribute.tsx` |
| **Embedding:** collaboration disabled in iframe | `excalidraw-app/App.tsx` |

---

## 8. Data model (product perspective)

| Entity | Role for the user | Implementation |
|--------|-------------------|----------------|
| **Element** | A drawable object on the canvas (shape, text, line, …) | `ExcalidrawElement` (`packages/element/src/types.ts`) |
| **Scene** | Ordered set of elements the editor operates on | `Scene` (`packages/element/src/Scene.ts`) |
| **AppState** | Tool, selection, viewport, UI mode, collaborators, … | `AppState` (`packages/excalidraw/types.ts`) |
| **Binary file** | Image (or other) asset keyed by `FileId`, referenced from elements | `BinaryFiles`, `BinaryFileData` (`packages/excalidraw/types.ts`) |
| **Library item** | Named reusable group of elements | `LibraryItem` (`packages/excalidraw/types.ts`) |
| **Room / share link** | Host-only: session id + key or json id + key in URL | `excalidraw-app/data/index.ts` |

---

## 9. Feature boundaries / non-goals (observable)

- **Real-time collaboration** is **not** available when the app runs **in an iframe** (`excalidraw-app/App.tsx`).
- **Align / distribute** for **frame-like** elements is **not** enabled (`packages/excalidraw/actions/actionAlign.tsx`, `actionDistribute.tsx`).
- **Full path bounds** for all curve operations may be **incomplete** (`packages/element/src/bounds.ts` — `TODO` branches).
- **Collaboration / JSON / AI servers** are **external**; this repo is **not** the room server (`excalidraw-app` env URLs and comments).
- **Not verified:** complete list of disabled features per `UIOptions.canvasActions` — depends on host props (`packages/excalidraw/types.ts` `UIOptions`).

---

## 10. Evidence sources

### UI / host

- `excalidraw-app/App.tsx`, `excalidraw-app/index.tsx`
- `excalidraw-app/components/{AppMainMenu,AppWelcomeScreen,AI}.tsx`
- `packages/excalidraw/components/App.tsx`, `packages/excalidraw/components/LayerUI.tsx`

### State / data model

- `packages/excalidraw/types.ts` (`AppState`, `ToolType`, `ExcalidrawProps`, `Collaborator`)
- `packages/element/src/types.ts` (`ExcalidrawElement`)
- `packages/element/src/Scene.ts`, `packages/element/src/store.ts`

### Actions

- `packages/excalidraw/actions/types.ts` (`Action`, `ActionName`, `ActionResult`)
- `packages/excalidraw/actions/manager.tsx`
- `packages/excalidraw/actions/register.ts`

### Rendering

- `packages/excalidraw/components/canvases/StaticCanvas.tsx`, `InteractiveCanvas.tsx`
- `packages/excalidraw/renderer/staticScene.ts`, `interactiveScene.ts`

### Collaboration / persistence (host)

- `excalidraw-app/data/index.ts`
- `excalidraw-app/collab/Collab.tsx`, `excalidraw-app/collab/Portal.tsx`
- `excalidraw-app/data/firebase.ts`, `excalidraw-app/data/LocalData.ts`

### Library / import-export

- `packages/excalidraw/data/library.ts`
- `packages/excalidraw/data/types.ts` (`ImportedDataState`, `ExportedDataState`)

### Manifest / identity

- `packages/excalidraw/package.json` (`description`)
- Root `package.json` (monorepo name `excalidraw-monorepo`)
