# Product Requirements Document: Excalidraw

> Reverse-engineered from source. Reflects actual implemented behavior, not marketing copy.
>
> **Related docs:** [Architecture](../technical/architecture.md) · [Domain Glossary](./domain-glossary.md) · [Decision Log](../memory/decisionLog.md) · [System Patterns](../memory/systemPatterns.md) · [Project Brief](../memory/projectbrief.md)

---

## 1. Product Goal

Excalidraw is an **open-source virtual whiteboard** with a hand-drawn aesthetic. It exists in two forms:

| Form | Goal |
|---|---|
| **excalidraw.com** (SPA) | Zero-install, browser-native collaborative sketching tool for quick diagrams, brainstorming, and wireframes |
| **`@excalidraw/excalidraw`** (npm package) | Embeddable React component that gives any web app a fully-featured canvas editor with a stable imperative API |

The unifying goal: make drawing fast, low-friction, and visually consistent enough to communicate ideas — without the precision or learning curve of a professional design tool.

---

## 2. Target Audience

### Primary: SPA users (excalidraw.com)
- Engineers, designers, and PMs who need to sketch architecture diagrams, flowcharts, or wireframes quickly
- Remote teams who need a shared live whiteboard without sign-up or account creation
- Individuals who want a local-first sketchpad that works offline

### Secondary: Embedding developers
- Frontend teams integrating a whiteboard or diagram editor into their own product (Notion, Confluence, custom apps)
- Product builders who need the canvas as infrastructure (e.g., educational platforms, design tools, note-taking apps)

### Implicit audience signals from code
- **Mobile/touch users** are supported but de-prioritized: transform handles for linear elements are explicitly disabled on mobile (`App.tsx:7126`, HACK comment), and several features have TODOs for better mobile UX
- **Accessibility** is acknowledged but incomplete (`ErrorDialog.tsx:24` TODO about A11y)
- **Non-English users** are supported via `langCode` prop and `i18n` infrastructure

---

## 3. Key Features

### 3.1 Drawing Tools

| Tool | Element Type | Notes |
|---|---|---|
| Rectangle, Diamond, Ellipse | `ExcalidrawRectangleElement` etc. | Rounded corners, fill styles (hachure, solid, cross-hatch, dots) |
| Arrow, Line | `ExcalidrawArrowElement`, `ExcalidrawLinearElement` | Straight, curved, elbow; auto-bind to shapes |
| Text | `ExcalidrawTextElement` | Inline editing via WYSIWYG overlay; font family, size, alignment |
| Freedraw | `ExcalidrawFreeDrawElement` | Pressure-sensitive; SVG-exportable |
| Image | `ExcalidrawImageElement` | Paste/drag-drop; stored as binary files separate from scene JSON |
| Embeddable | `ExcalidrawEmbeddableElement` | Inline iframes (YouTube, Vimeo, custom URLs via `validateEmbeddable`) |
| Frame | `ExcalidrawFrameElement` | Named container; clips and exports children as a unit |
| MagicFrame | `ExcalidrawMagicFrameElement` | AI input zone — converts canvas region to HTML via AI backend |

### 3.2 Collaboration (excalidraw.com only)

- Real-time multi-user via **Socket.io** room (`excalidraw-room` server)
- **End-to-end encrypted**: AES-GCM key lives only in the URL `#hash`, never transmitted to server
- Scene persisted to **Firebase Firestore** (latest snapshot); binary files to **Firebase Storage**
- Per-user cursor broadcasting; "follow mode" (lock viewport to another user)
- CRDT-style conflict resolution via element `version` + `versionNonce` + fractional z-index

### 3.3 Library System

- User-maintained stencil collections (`.excalidrawlib` JSON format)
- Install from URL (allow-listed hosts only)
- Published libraries browseable via `libraryReturnUrl`
- Scoped to each editor instance via isolated Jotai atom

### 3.4 Export

| Format | API | Notes |
|---|---|---|
| `.excalidraw` JSON | Save to disk / `getSceneElements()` | Full fidelity; includes `AppState` fields marked `export: true` |
| PNG | `exportToBlob()`, `exportToCanvas()` | With/without background, dark mode, scale factor |
| SVG | `exportToSvg()` | Embeds fonts as `<style>`; respects `exportWithDark` |
| Clipboard | `exportToClipboard()` | PNG or SVG to system clipboard |
| Per-frame export | Frame panel | Exports single frame as standalone image |

**Limitation**: `exportToSvg` does not filter deleted elements (FIXME in `export.test.ts:94`).

### 3.5 AI Features (`aiEnabled` prop / excalidraw.com)

- **Text-to-diagram (TTD)**: Natural language → Excalidraw elements via streaming AI backend; dialog with chat history (IndexedDB-persisted)
- **Diagram-to-code (MagicFrame)**: Canvas region → JPEG → AI backend → HTML snippet rendered in embedded iframe

### 3.6 View Modes

| Mode | Prop | Effect |
|---|---|---|
| View mode | `viewModeEnabled` | Canvas read-only; no drawing tools, no selection editing |
| Zen mode | `zenModeEnabled` | Hides toolbar and UI chrome; full-canvas focus |
| Grid mode | `gridModeEnabled` | Snap-to-grid overlay |
| Object snap | `objectsSnapModeEnabled` | Snap to element edges and centers |

### 3.7 Embedding API (`@excalidraw/excalidraw`)

The component exposes an imperative API (`ExcalidrawImperativeAPI`) via `onExcalidrawAPI` prop:

- `updateScene()` — primary programmatic state update
- `applyDeltas()` — apply pre-computed diffs (used by undo/redo integration)
- `getSceneElements()`, `getAppState()`, `getFiles()` — read state
- `onChange`, `onIncrement`, `onPointerDown/Up`, `onScrollChange` — event subscriptions
- `registerAction()` — extend the action registry at runtime
- Slot components: `<MainMenu>`, `<Sidebar>`, `<Footer>`, `<WelcomeScreen>` — inject host-app UI into fixed zones
- `renderTopLeftUI`, `renderTopRightUI` — inject arbitrary toolbar UI

---

## 4. Technical Limitations

### 4.1 Performance

| Limitation | Source | Impact |
|---|---|---|
| `isElementInFrame()` is O(n) with no cache | `frame.ts:752` (TODO comment) | Large scenes with many frames become slow |
| Snap point cache must be rebuilt synchronously before every drag | `App.tsx:9924` | Can't be lazily initialized; contributes to main-thread jank on large scenes |
| Snapping disabled above a scene size threshold | `snapping.ts:44` (TODO to raise/remove) | Snap silently stops working in large drawings |
| ShapeCache evicted on window resize | `componentWillUnmount`, cache docs | Every resize triggers full re-render of all elements |

### 4.2 Collaboration Constraints

| Limitation | Source |
|---|---|
| No server-side conflict resolution — last write wins within a version tick | `reconcileElements` in `data/reconcile.ts` |
| Scene broadcast version must be set before `updateScene()` or peers receive echo | `Collab.tsx:780` |
| Binary files (images) are NOT included in delta sync — stored separately in Firebase | `store.ts:434` (TODO) |
| Collaboration is excalidraw-app only — the npm package ships no transport layer | Architecture (no Collab in `@excalidraw/excalidraw`) |

### 4.3 Data Integrity Gaps

| Limitation | Source |
|---|---|
| Invisibly-small elements are kept in state and broadcast to collaborators | `sizeHelpers.ts:27` (TODO) |
| Empty text elements marked `isDeleted` during restore without recording a delta — collab won't see it | `restore.ts:407` (TODO) |
| Invisible elements may be restored by undo/redo after finalization | `actionFinalize.tsx:142` (TODO #7348) |
| `isDeleted` soft-deletion is used throughout; hard deletes do not exist | By design; needed for CRDT reconciliation |

### 4.4 Embedding / SSR Constraints

| Limitation | Source |
|---|---|
| Canvas requires non-zero parent height — invisible if parent has `height: 0` | `README.md` |
| Must be rendered client-side; SSR requires `dynamic(() => ..., { ssr: false })` | `README.md` |
| Jotai library state is not scoped if multiple instances share a Provider | `data/library.ts:253` (TODO) |
| `ExcalidrawAPI` is invalidated after unmount — all methods throw | `App.tsx:3164` |
| `onIncrement` only subscribes if defined on the **initial** render | `types.ts:567` |

### 4.5 Mobile / Touch

| Limitation | Source |
|---|---|
| Transform handles disabled for linear elements on mobile (HACK) | `App.tsx:7126` |
| Color input mobile UX is incomplete | `ColorInput.tsx:98` (TODO) |
| Eye-dropper preview does not reposition when near viewport edge | `EyeDropper.tsx:105` (FIXME) |

### 4.6 Font / Text Rendering

| Limitation | Source |
|---|---|
| Font family values are integers with a TODO to switch to content-hash IDs for custom fonts | `constants.ts:123`, `Fonts.ts:339` |
| Single text element flipping is not supported | `resize.test.tsx:566` (disabled test) |
| Bounding box for freedraw elements with curves outside min/max points is incorrect | `flip.test.tsx:479–613` (multiple TODO comments) |
| Free-drawing point rounding causes shake | `points.ts:67` (TODO) |

---

## 5. Non-Goals (inferred)

- **No server-side rendering** of canvas content
- **No backend storage** in the npm package — storage is the host app's responsibility
- **No vector editing** (bezier handles, node editing) — drawing tools produce fixed shapes
- **No versioning or branching** of scenes — single-state, undo is session-only
- **No access control** — collaboration rooms are open to anyone with the URL+key
- **No annotation/comments layer** — feedback is done by drawing on the canvas itself

---

## 6. Open Design Debt (tracked in code)

| Area | Description | Marker |
|---|---|---|
| Arrow ↔ linear unification | Arrow is a subtype of linear but semantically separate | `restore.ts:502` |
| `isResizing` rename | `AppState` field named incorrectly | `App.tsx:12347` |
| `positionElementsOnGrid` | Self-described "mostly vibe-coded"; no spec | `positionElementsOnGrid.ts:6` |
| Double-click logic consolidation | Two separate code paths for double-click | `App.tsx:6325` |
| Touch/pointer event unification | Touch events handled as a HACK on top of pointer events | `App.tsx:689` |
| Distribute/align frames | Frames excluded from distribute and align actions | `actionDistribute.tsx:43`, `actionAlign.tsx:50` |
