# Product Requirements Document — Excalidraw

> **Method:** Reverse-engineered from repository source code, test files, package manifests, configuration, and i18n strings. All claims are traceable to specific files. Where a conclusion is inferred from code structure rather than an explicit statement, it is labelled **Inference from source**.

---

## 1. Product Overview

Excalidraw exists in two complementary forms:

**1. `excalidraw.com` (the hosted web application)** A browser-based virtual whiteboard that renders diagrams in a hand-drawn, sketch-like style. Users can draw shapes, annotate with text, insert images, collaborate in real time, and export their work. No account is required for solo use; collaboration is initiated by sharing a URL.

**2. `@excalidraw/excalidraw` (the embeddable React library)** A published npm package that lets other applications embed the full Excalidraw editor — or a controlled subset of it — inside their own product. The library is peer-dependent on React 17, 18, or 19 (`packages/excalidraw/package.json` `peerDependencies`). It must be rendered client-side only (documented in `packages/excalidraw/README.md`: "must not be server-side rendered").

The two are built from the same monorepo; `excalidraw-app/` is the host application that wraps the library and adds Firebase persistence, Socket.IO collaboration, Sentry error tracking, and PWA support.

---

## 2. Product Goal

**Inference from source:** No explicit mission statement exists in the repository. The following is synthesised from the `packages/excalidraw/README.md` introduction, the welcome screen (`excalidraw-app/components/AppWelcomeScreen.tsx`), and the feature set visible in the codebase.

The goal is to provide a **low-friction, visually informal diagramming and whiteboarding tool** that:

- Produces drawings that look hand-made, reducing the visual formality barrier compared to polished diagramming tools.
- Runs entirely in the browser with no install, no sign-in required for solo use, and no data sent to a server unless the user explicitly shares or collaborates.
- Can be embedded by developers into their own applications with minimal integration overhead.
- Supports real-time multiplayer collaboration secured with end-to-end encryption, with the decryption key stored only in the URL fragment — the server never sees plaintext scene data.

---

## 3. Target Audience

Evidence is drawn from tool capabilities, arrowhead options, collab features, embed API, i18n, and welcome screen copy.

| Audience segment | Evidence |
| --- | --- |
| **Individual knowledge workers** (notes, brainstorming, quick diagrams) | Auto-save to localStorage; no account needed; welcome screen for new users |
| **Engineering and product teams** (architecture, flowcharts, sequence diagrams) | Elbow-routing arrows; Mermaid import; cardinality (ERD crow's foot) arrowheads; frame containers; structured shapes |
| **Presenters and educators** | Laser pointer tool (`"laser"` in `TOOL_TYPE`); view/read-only mode (`viewModeEnabled`); zen mode (hides UI chrome) |
| **Developers embedding a whiteboard** | Published `@excalidraw/excalidraw` npm package; `UIOptions` / `CanvasActions` for feature toggling; `ExcalidrawImperativeAPI`; `onChange`, `onPointerUpdate`, `onIncrement` callbacks; `validateEmbeddable` prop |
| **International users** | 58 locale files covering 56 languages; automatic language detection via `i18next-browser-languagedetector`; RTL support (Arabic, Hebrew, Farsi locale files present) |

---

## 4. Core User Scenarios

All scenarios are grounded in implemented features verified in source or tests.

### 4.1 Solo diagramming

A user opens `excalidraw.com`, draws shapes, connects them with arrows, adds labels, arranges elements into frames, and saves the result. Work is auto-saved to `localStorage` every 300 ms (debounced). The user can open/save `.excalidraw` files, export PNG or SVG, and re-import an exported PNG/SVG that has an embedded scene.

### 4.2 Real-time collaboration

A user clicks "Live collaboration" → a `#room=<roomId>,<roomKey>` URL is generated and shared with teammates. All participants see each other's cursors (at ~30 fps), presence status (active / idle / away), and element changes in real time via Socket.IO. Scene data is end-to-end encrypted (AES-GCM); only the URL fragment holder can decrypt. The scene persists to Firebase Firestore so late joiners can load it. Sessions can be stopped, at which point the URL reverts to the origin.

### 4.3 Sharing a read-only snapshot

A user exports a "shareable link" via `exportToBackend`: the scene is compressed (zlib) and encrypted with a one-time key, then POST-ed to `json.excalidraw.com`. The resulting URL `#json=<id>,<key>` lets anyone view (but not edit) the scene without joining a live room.

### 4.4 Embedding in another product

A developer installs `@excalidraw/excalidraw`, renders `<Excalidraw />` inside a `div` with non-zero height, imports the stylesheet, and wires `onChange` to their own state store. They use `UIOptions.canvasActions` to hide irrelevant menu items, pass `viewModeEnabled` for a read-only display, and call `excalidrawAPI.updateScene()` to programmatically inject elements.

### 4.5 Structured diagramming (flowcharts, ERDs)

A user creates flowchart nodes using rectangles, diamonds, and ellipses, connects them with elbow arrows that auto-route around obstacles, applies cardinality arrowheads for ERD notation, uses the Mermaid import tab to paste Mermaid syntax and convert it to Excalidraw elements, and groups related shapes into named frames.

### 4.6 AI-assisted diagram creation

A user opens the Text-to-Diagram dialog (TTD), types a natural language description, and receives a Mermaid diagram streamed from the AI backend (`VITE_APP_AI_BACKEND`). The diagram is rendered as a preview and inserted into the canvas. Alternatively, the magic frame tool captures a canvas region, sends the rendered SVG to the AI, and displays the generated HTML in an iframe element on the canvas.

### 4.7 Presentation mode

A user toggles `viewModeEnabled` (read-only; no editing) and uses the laser pointer tool to highlight areas during a screen share. Zen mode (`zenModeEnabled`) hides all toolbars for a distraction-free view. A collaborator can "follow" another participant's viewport, which automatically mirrors their scroll and zoom.

---

## 5. Key Features

### 5.1 Drawing tools

16 tools: `selection` (rectangular), `lasso` (free-form), `rectangle`, `diamond`, `ellipse`, `arrow` (straight / curved / elbow-routed), `line` (polyline, closeable as polygon), `freedraw` (pressure-sensitive), `text`, `image` (raster/SVG), `eraser`, `hand` (pan), `frame` (named clip container), `magicframe` (AI-to-HTML frame), `embeddable` (iframe URL), and `laser` (transient pointer). Source: `packages/common/src/constants.ts` (`TOOL_TYPE`).

### 5.2 Element styling

Every element supports: stroke color, fill color, fill style (solid / hachure / cross-hatch / zigzag), stroke width (thin / bold / extra-bold), stroke style (solid / dashed / dotted), sloppiness / roughness (architect / artist / cartoonist), corner rounding, and opacity (0–100).

Text-specific: 9 font families (Excalifont, Virgil, Cascadia, Nunito, Lilita One, Comic Shanns, Liberation Sans, Assistant, Helvetica); 4 preset font sizes (16 / 20 / 28 / 36 px); horizontal and vertical alignment.

Arrow-specific: 14 arrowhead types (none, standard arrow, bar, circle, triangle, diamond — outline and filled variants) plus 6 cardinality/ERD notations (crow's foot one/many/one-or-many/exactly-one/zero-or-one/zero-or-many); 3 routing modes (sharp, rounded, elbow/orthogonal).

### 5.3 Element organisation

- **Grouping:** elements share a `groupIds` array; nested groups are supported; double-click to drill into a group for individual editing. (`Ctrl/Cmd+G` / `Ctrl/Cmd+Shift+G`)
- **Frames:** named rectangular containers that clip their contents; elements auto-join frames on paste or move; frame names are searchable.
- **Z-order:** send backward / bring forward / send to back / bring to front. (`Ctrl/Cmd+[` / `Ctrl/Cmd+]`)
- **Alignment and distribution:** align to left / center / right / top / middle / bottom; distribute horizontally or vertically. (via actions, accessible from context menu and toolbar)
- **Locking:** individual elements can be locked (`Ctrl/Cmd+Shift+L`); locked elements cannot be selected by click or box-select, resized, moved, or edited.
- **Hyperlinks:** any element can carry a URL (`Ctrl/Cmd+K`); clicking the link icon navigates to it (or fires `onLinkOpen` callback for embeds).

### 5.4 Text and text containers

Shapes (rectangle, diamond, ellipse) and arrows can act as text containers: double-clicking them creates a bound text element that resizes or wraps within the container. Standalone text supports in-canvas WYSIWYG editing, auto-resize, and manual wrap-to-width mode.

### 5.5 Arrow binding

Arrow endpoints snap to and bind to any bindable element (shapes, text, images, frames, embeddables). Binding modes: orbit (arrow terminates at the outline) or inside (arrow goes to the exact bind point). Bound elements drag their arrows with them. Binding can be toggled globally (`AppState.isBindingEnabled`) or temporarily overridden by holding `Ctrl`.

### 5.6 Canvas and viewport

- Zoom range: 10% – 3000% (step 10%). Fit to content / fit selection (`Shift+1` / `Shift+2`).
- Infinite canvas with scroll. Optional grid (20 px cells, major lines every 100 px).
- Object snapping (`Alt+S`): elements snap to each other's edges and midpoints.
- Multi-point snap guides drawn on the interactive canvas layer.
- Dark and light themes (`Shift+Alt+D`); theme persisted to `localStorage`.

### 5.7 Collaboration

- Room created by generating a 10-byte random ID and a 22-character AES-GCM key embedded in the URL fragment.
- Real-time sync via Socket.IO (`oss-collab.excalidraw.com` in production). All payloads encrypted.
- Scene durably stored in Firebase Firestore (encrypted) for late joiners; full sync every 20 s and on tab unload.
- Presence: cursor positions (~30 fps), idle/active/away status, user display names, collaborator avatars rendered on canvas.
- Follow mode: a user can follow another participant's viewport; the followed user continuously relays their visible scene bounds.
- Cross-tab sync: changes in one browser tab are propagated to other tabs on the same origin (debounced 50 ms via `localStorage` version stamps).

### 5.8 Export and import

Export formats: `.excalidraw` JSON (`Ctrl/Cmd+Shift+S`), PNG, SVG, and shareable links (`#json=<id>,<key>` via `exportToBackend`). Export options: background on/off, dark mode on/off, scale 1×/2×/3×, embed scene data in PNG/SVG for round-trip re-import. Copy as PNG (`Shift+Alt+C`); copy/paste elements via clipboard; Mermaid output via TTD dialog.

Import formats: `.excalidraw` JSON (`Ctrl/Cmd+O`), drag-and-drop PNG/SVG (if scene embedded), paste from clipboard, Mermaid syntax (auto-detected on paste), shareable link loaded from URL hash on page open.

### 5.9 Element library

A personal reusable shape collection persisted in IndexedDB. Users add selected canvas elements to the library; items can be inserted back onto the canvas. A "Browse Libraries" link opens the public `libraries.excalidraw.com` portal. Libraries can be installed from URLs via the `?libraryUrl=...&token=...` query-string mechanism.

### 5.10 Mermaid import and Text-to-Diagram

The TTD dialog (accessed via the toolbar or command palette) provides:

- **Mermaid tab:** CodeMirror editor with Mermaid syntax highlighting; parses via `@excalidraw/mermaid-to-excalidraw`; auto-error-fix using BFS candidate probing (up to 30 candidates, depth 4); live canvas preview; inserts elements on confirm.
- **Text-to-Diagram tab:** chat interface that streams Mermaid output from the configured AI backend; chat sessions stored in IndexedDB; multiple named chats supported.

### 5.11 Contextual and power-user features

- **Command palette** (`Ctrl/Cmd+/`): searchable list of all actions.
- **Search** (`Ctrl/Cmd+F`): searches text element content and frame names; highlights matches on canvas.
- **Style copy/paste** (`Ctrl/Cmd+Alt+C` / `Ctrl/Cmd+Alt+V`): copies style properties from one element and applies them to others.
- **Flip horizontal / vertical** (`Shift+H` / `Shift+V`).
- **Undo / redo** (`Ctrl/Cmd+Z` / `Ctrl/Cmd+Shift+Z`): full history with delta-based undo stack; collaboration-aware (remote changes do not pollute undo history).
- **Stats panel** (`Alt+/`): element-level and canvas-level statistics panel.

---

## 6. Functional Requirements

Derived from implementation, tests, and configuration. These describe what the system must do based on observed behaviour.

### Drawing and editing

- FR-1: The system must support creating the 11 element types listed in §5.1. (`packages/element/src/types.ts`)
- FR-2: Style changes must apply to all currently selected elements. (`packages/excalidraw/actions/actionProperties.ts`)
- FR-3: `currentItem*` appState properties must propagate to newly created elements as defaults. (`packages/excalidraw/types.ts`)
- FR-4: Text containers must auto-resize the bound text or wrap it when the container is resized. (`packages/element/tests/textElement.test.ts`)
- FR-5: Locked elements must not be selectable by click or box-select, and must not be moveable or editable. (`packages/excalidraw/tests/elementLocking.test.tsx`)
- FR-6: Elbow arrows must re-route automatically when any bound element is moved. (`packages/element/src/elbowArrow.ts`)
- FR-7: Arrow binding must be temporarily overridable by holding `Ctrl` regardless of the global preference. (`packages/excalidraw/tests/arrowBinding.test.tsx`)
- FR-8: Groups must be selectable as a unit; double-click must enter group-edit mode for individual element manipulation. (`packages/element/src/groups.ts`)
- FR-9: Undo must not record remote collaboration updates (actions with `CaptureUpdateAction.NEVER`). (`packages/excalidraw/history.ts`)
- FR-10: Undo / redo must remain functional even when elements have been force-deleted by a remote peer. (`packages/excalidraw/tests/history.test.tsx`)

### Collaboration

- FR-11: All Socket.IO scene payloads must be AES-GCM encrypted with a key stored only in the URL fragment. (`excalidraw-app/collab/Portal.tsx`)
- FR-12: The reconciliation algorithm must resolve concurrent edits using last-writer-wins by element version, with a deterministic tiebreak on `versionNonce`. (`packages/excalidraw/data/reconcile.ts`)
- FR-13: If a user is the first to join an empty room, they must receive the scene from Firebase Firestore (if it exists) within 5 seconds. (`excalidraw-app/collab/Collab.tsx`, `INITIAL_SCENE_UPDATE_TIMEOUT`)
- FR-14: Scene must be saved to Firebase on `beforeunload` to avoid data loss on tab close. (`excalidraw-app/collab/Collab.tsx`)
- FR-15: Local autosave must be paused while collaboration is active to prevent stale overwrite. (`excalidraw-app/data/LocalData.ts`)
- FR-16: Cursor positions must be broadcast at no more than 30 fps (~33 ms interval). (`excalidraw-app/app_constants.ts`, `CURSOR_SYNC_TIMEOUT`)

### Export and persistence

- FR-17: PNG and SVG export must support an "embed scene" option that encodes full scene JSON in the file metadata, enabling round-trip re-import. (`packages/excalidraw/actions/actionExport.tsx`)
- FR-18: Exports must support scale multipliers 1×, 2×, 3×. (`packages/excalidraw/actions/actionExport.tsx`)
- FR-19: Deleted elements must be retained for 24 hours before garbage collection (required for collaboration consistency). (`excalidraw-app/app_constants.ts`, `DELETED_ELEMENT_TIMEOUT`)
- FR-20: Image files uploaded to the backend must not exceed 4 MiB. (`packages/common/src/constants.ts`, `MAX_ALLOWED_FILE_BYTES`)

### Embedding API

- FR-21: The library must surface every scene change through an `onChange(elements, appState, files)` callback. (`packages/excalidraw/components/App.tsx`)
- FR-22: Host applications must be able to programmatically update the scene via `excalidrawAPI.updateScene()`. (`packages/excalidraw/types.ts`)
- FR-23: Host applications must be able to suppress or customise any canvas action via `UIOptions.canvasActions`. (`packages/excalidraw/types.ts`)
- FR-24: The library must not server-side render; it must be client-only. (`packages/excalidraw/README.md`)
- FR-25: Custom tool types injected via `activeTool.type = "custom"` must be passable back through the `onChange` callback. (`packages/excalidraw/types.ts`)

---

## 7. Non-Functional Requirements / Technical Constraints

### Performance

- Static canvas rendering is RAF-throttled in the browser: at most one draw call per animation frame (`throttleRAF`, `packages/common/src/utils.ts`). Throttling is disabled in tests.
- Per-element offscreen canvases cache roughjs output keyed on element version (`ShapeCache`); only changed elements are redrawn.
- Mermaid-to-Excalidraw and CodeMirror are loaded lazily (Rollup manual chunks) to reduce initial bundle size.
- Locale files are split into per-language Rollup chunks cached for 30 days (Workbox config, `excalidraw-app/vite.config.mts`).

### Security

- Collaboration and backend share links use AES-GCM 128-bit encryption (Web Crypto API).
- The room key is embedded in the URL hash fragment (`#room=...`) — it is never included in HTTP requests and is not accessible to the server.
- Embeddable URL validation is host-configurable (`validateEmbeddable` prop); by default no external URLs are allowed. (`packages/excalidraw/types.ts`)
- Library imports are restricted to `excalidraw.com` and `raw.githubusercontent.com/excalidraw/excalidraw-libraries`. (`packages/excalidraw/data/library.ts`)

### Accessibility

- Interactive controls carry `aria-label`, `aria-keyshortcuts`, `aria-disabled`, and `aria-checked` attributes. (`packages/excalidraw/components/`)
- Color picker and font picker have dedicated keyboard navigation handlers. (`components/ColorPicker/keyboardNavHandlers.ts`, `components/FontPicker/keyboardNavHandlers.ts`)
- Toast notifications use `role="status"`. Context menus use `role="menu"`.
- **No automated accessibility audit** (e.g. axe) is present in the test suite. Accessibility coverage is partial and not systematically enforced.

### Browser and runtime

- Requires modern browser with Web Crypto API, Canvas 2D API, and `requestAnimationFrame`.
- PWA support (service worker, Workbox caching) is enabled in production builds (`VITE_APP_ENABLE_PWA=true` in production).
- Node ≥ 18.0.0 required for development builds (`package.json` `engines`).
- React 17, 18, or 19 as peer dependency.

### Internationalisation

- 58 locale files; languages with < 85% translation completion are suppressed from the UI picker at runtime. (`packages/excalidraw/i18n.ts`)
- Language auto-detected from the browser via `i18next-browser-languagedetector`.
- RTL locale files exist (`ar-SA`, `fa-IR`, `he-IL`) though RTL layout completeness is not verifiable from source alone.

### Data size limits

- File uploads (images): 4 MiB hard cap enforced client-side.
- No hard element count limit found in source. **Inference from source:** limits are memory/performance-bound.
- Backend shareable links fail gracefully with a user-visible error on `RequestTooLargeError`.

---

## 8. Assumptions and Open Questions

### Assumptions visible in the implementation

- **A1:** Users sharing a collaboration link are trusted to know the room key (it is in the URL); there is no access control list or password beyond possession of the link.
- **A2:** The Socket.IO server is a relay only — it sees only encrypted ciphertext and never decrypts scene data (evidenced by: key is in URL hash only, server-side code is not part of this repo).
- **A3:** Collaboration is ephemeral by default — sessions are destroyed by the creator. Firebase serves as the durable fallback, not as a primary database.
- **A4:** The library (`@excalidraw/excalidraw`) is intended for single-page client-rendered applications; SSR support is explicitly excluded.
- **A5:** The `magicframe` / AI features require a separately deployed AI backend (`VITE_APP_AI_BACKEND`); the open-source repository does not include that backend.
- **A6:** Excalidraw+ (`app.excalidraw.com`) is a paid product distinct from the OSS app; the OSS app detects a `excplus-auth` cookie to personalise the welcome screen, but Plus features are not implemented in this repo.

### Open questions

- **OQ-1:** What is the maximum supported number of collaborators in a single room? No constant or server-side enforcement is visible in this repository.
- **OQ-2:** Is the `firebase.ts` scene reconciliation strategy (optimistic Firestore transaction) safe under high write contention with many simultaneous participants? No stress-test or explicit concurrency documentation was found.
- **OQ-3:** What is the production retention policy for data stored at `json.excalidraw.com` (shareable link backend)? The client code does not include TTL or expiry logic.
- **OQ-4:** The `ArrowheadLegacy` type (`dot`, `crowfoot_*`) is still parsed and stored but not shown in the new UI. Is there an active migration or are these permanently frozen?
- **OQ-5:** The coordinate system migration from `GlobalCoord`/`LocalCoord` object types to `GlobalPoint`/`LocalPoint` tuple types is marked TODO in `packages/math/src/types.ts`. What is the timeline and are there breaking API implications for library consumers?
- **OQ-6:** The `@excalidraw/utils` package is at version `0.1.2` while all other packages are at `0.18.0`. Is it on an independent versioning track, and what is its intended public API contract?
- **OQ-7:** The pre-commit hook (`lint-staged`) is commented out in `.husky/pre-commit`. Is this intentional? If so, what is the enforced quality gate for contributions?
- **OQ-8:** RTL (right-to-left) locale files exist but RTL layout correctness cannot be confirmed from source alone. What is the actual RTL support level?

---

## 9. Source Evidence

Key files and directories inspected to produce this document are listed in the [PRD Appendix](prd-appendix.md).
