# Progress Snapshot

Evidence drawn from: `packages/excalidraw/CHANGELOG.md`, package `version` fields, source file structure, TODO/FIXME comments, and existing memory files.
Current published version: **`@excalidraw/excalidraw` 0.18.0** (released 2025-03-11). The `Unreleased` section of the CHANGELOG describes the next version's work in progress.

---

## 1. Already Implemented (verified in source)

### Core Drawing Engine
- All primitive element types: rectangle, diamond, ellipse, arrow (straight, curved, elbow), line, freedraw, text, image, embeddable, frame, magic frame
- Elbow arrows with `FixedSegment` routing and `bindMode: "orbit" | "inside" | "skip"` (`packages/element/src/types.ts`)
- Freehand drawing via `perfect-freehand`; rough/sketchy aesthetic via `roughjs`
- Dual canvas architecture: `StaticCanvas` (elements) + `InteractiveCanvas` (selection/handles)

### Text System
- WYSIWYG inline text editor (`wysiwyg/textWysiwyg.tsx`)
- Text element wrapping (0.18.0, PR #7999)
- Font picker with extended font set including CJK (0.18.0, PRs #8012, #8530)
- Font subsetting for SVG export using HarfBuzz + woff2 WASM (`packages/excalidraw/subset/`)
- Custom font metrics provider (0.18.0, PR #9121)

### State Management
- Four-layer state: `AppState` (class state) → `Scene` (elements) → `Store` (change tracking) → `History` (undo/redo)
- Multiplayer undo/redo (`Store` + `CaptureUpdateAction`) (0.18.0, PR #7348)
- `FractionalIndex` z-ordering for stable multi-user element ordering

### Collaboration
- Real-time collaboration via `socket.io-client` (`excalidraw-app/collab/Collab.tsx`)
- Scene encryption with share links (room key in URL fragment, AES-GCM, `excalidraw-app/data/index.ts`)
- Collaborator cursors and presence indicators
- Conflict resolution via `reconcileElements` (fractional index–based merge)
- Firebase persistence for shared scenes

### Persistence & Export
- `localStorage` + `IndexedDB` for local scene save/restore
- PNG, SVG, clipboard export
- `.excalidraw` JSON format with `data/restore.ts` migration layer
- Embed scene data in PNG/SVG metadata
- `onExport` async generator prop for host-controlled export flow (Unreleased, implemented in `App.tsx`)

### UI Features
- Command palette (0.18.0, PR #7804)
- Scene search (`SearchMenu.tsx`, `QuickSearch.tsx`) (0.18.0, PR #8438)
- Element stats panel with editable fields (0.18.0, PR #6382)
- Image cropping with snap support (`actionCropEditor.tsx`, `isCropping` AppState) (0.18.0, PR #8613)
- Element linking (`actionElementLink.ts`, `ElementLinkDialog.tsx`) (0.18.0, PR #8812)
- Element locking (`actionElementLock.ts`, `LockButton.tsx`, `UnlockPopup.tsx`)
- Element type conversion (`ConvertElementTypePopup.tsx`, wired via `convertElementTypePopupAtom` in `App.tsx`)
- Flowchart creation tool (0.18.0, PR #8329)
- Grid snap, object snap, midpoint snap toggle actions
- Zen mode, view mode, theme toggle
- Library panel with install from GitHub/URL

### AI Features
- Text-to-diagram dialog (`TTDDialog/`): Mermaid input → Excalidraw conversion via `@excalidraw/mermaid-to-excalidraw@2.1.1`
- Mermaid paste detection and auto-conversion (`data/restore.ts`)
- Magic Frame (`DiagramToCodePlugin/`): diagram → code generation via `diagramToCode` API hook
- AI backend configured via `VITE_APP_AI_BACKEND` env var; token-free rewrite shipped in 0.18.0 (PR #8269)

### Public Package API
- ESM-only bundle (deprecated UMD in 0.18.0)
- New lifecycle props: `onMount`, `onInitialize`, `onUnmount` (all wired in `App.tsx:3146, 3171, 3363`)
- `api.onEvent(name, callback)` and `api.onEvent(name).then(...)` (implemented: `App.tsx:669`)
- `ExcalidrawAPIProvider`, `useExcalidrawAPI`, `useAppStateValue` exported from `packages/excalidraw/index.tsx`
- `ExcalidrawAPI.isDestroyed` flag (implemented: `App.tsx:745, 3153`)
- `captureUpdate: CaptureUpdateAction` replacing `commitToHistory` (0.18.0)

### Monorepo Package Split
All five workspace packages published at version `0.18.0`:
- `@excalidraw/common` — shared constants and utilities
- `@excalidraw/math` — geometric primitives and coordinate types
- `@excalidraw/element` — element types, `Scene`, `Store`, mutation helpers
- `@excalidraw/excalidraw` — React component and public API
- `@excalidraw/utils` — public utility exports

### Testing
Tests exist (`packages/excalidraw/tests/`) for: App lifecycle, arrow binding, clipboard, context menus, drag-create, element locking, export, flip, history, images, lasso, library, Mermaid, move, multipoint create, regression suite, selection, and more. `@excalidraw/element` has transform tests; `@excalidraw/math` has no test directory yet.

### PWA & App Infrastructure
- Vite 5 build, PWA via `vite-plugin-pwa`, offline support
- Vercel deployment for `excalidraw-app`
- Firebase for collaboration backend
- Sentry error tracking (optional via `VITE_APP_DISABLE_SENTRY`)

---

## 2. Partially Implemented

### Lasso Selection Tool
- **Evidence of completion**: `LassoTrail` class instantiated in `App.tsx:706`; `"lasso"` is a first-class `Tool` type; `lasso.test.tsx` is 1804 lines with extensive test coverage; mobile defaults to lasso over selection (`App.tsx:2920`)
- **Gaps**: Lasso not yet listed in 0.18.0 CHANGELOG highlights — may be unreleased or silently shipped; `types.ts:343` `StaticCanvasRenderConfig` shows `type: "selection" | "lasso"` suggesting render path partially integrated
- **[Tentative]**: Feature appears functionally complete in code but not yet publicly documented

### `@excalidraw/math` Point Tuple Migration
- **Completed**: `GlobalPoint`, `LocalPoint` as branded tuples are the intended canonical types
- **Incomplete**: Legacy `GlobalCoord`, `LocalCoord` object types still present with explicit `// TODO remove` markers at `types.ts:42,60`; `pointFrom()` retains overloads for object form (`point.ts:26,30`)
- Any code touching coordinates must handle both representations until migration completes

### Multiplayer Selected Group Rendering
- `// TODO: support multiplayer selected group IDs` at `renderer/interactiveScene.ts:1880`
- Group selection highlight in the interactive canvas is not rendered for remote collaborators' selected groups

### Static / Interactive Canvas State Split
- Three `AppState` fields (`editingGroupId`, `selectedElementIds`, `frameToHighlight`) are documented in `types.ts:189–191` as candidates to move into `InteractiveCanvasAppState`
- Split is architecturally desired but not yet performed

### Library Jotai Instance Scoping
- `library.ts:253`: `libraryItemsAtom` reset on instance destroy is commented out pending per-instance jotai scoping
- Multiple embedded `<Excalidraw />` instances share library atom state — known limitation, not yet fixed

### WASM Font Tools CDN Loading
- `// TODO: consider adding support for fetching wasm from an URL` in both `woff2-loader.ts` and `harfbuzz-loader.ts`
- Font subsetting WASM is bundled locally; remote CDN/URL loading not yet supported

---

## 3. Planned or Hinted (code comments + deferred TODOs)

| Signal | Location | Implication |
|---|---|---|
| `// @TODO come with better API before v0.18.0` | `types.ts:631` (the `name` prop) | Public API for `name` prop is pending redesign; still unresolved past 0.18.0 |
| `// TODO: Separate arrow from linear element` | `data/restore.ts:502` | Arrow type may be split from the `linear` element family in a future refactor |
| `// TODO remove the dark theme color after we stop inverting canvas colors` | `clients.ts:125` | Canvas color inversion approach for dark mode is a known temporary workaround |
| `// TODO: rename this state field to "isScaling"` | `App.tsx:12347` | `isResizing` semantics are ambiguous; rename deferred |
| `// TODO: Cover with tests` | `App.tsx:3658` | Specific code path acknowledged as lacking test coverage |
| `/** @deprecated does nothing. Will be removed in 0.15 */` | `types.ts:752` | Stale deprecation marker (past 0.15 and 0.18); dead prop not yet removed |
| `/** @deprecated #6213 TODO remove 23-06-01 */` | `data/types.ts:31` (`isSidebarDocked`) | Removal overdue by ~2 years; still present in `LegacyAppState` |
| `FIXME after we start emitting updates from Store for appState.theme` | `wysiwyg/textWysiwyg.tsx:964` | Store does not yet observe `appState.theme`; text editor uses a workaround |
| Unreleased CHANGELOG: "most `api.on*` subscriptions will be removed in favor of `onEvent`" | `CHANGELOG.md` (Unreleased) | Large API surface reduction planned for a future release |

---

## 4. Major Milestones and Maturity Signals

| Milestone | Version / Status | Signal |
|---|---|---|
| Initial open-source release | Early (pre-0.17) | Implied by CHANGELOG structure |
| UMD → ESM bundle migration | 0.18.0 | Breaking change, PR #7441, #9127 |
| Multiplayer undo/redo | 0.18.0 | PR #7348; large Store/History architecture change |
| Elbow arrows + flowcharts | 0.18.0 | PRs #8299, #8329, #8952; `ExcalidrawElbowArrowElement` type |
| Monorepo package split | 0.18.0 | `@excalidraw/common`, `math`, `element`, `utils` all versioned separately |
| CJK font support + font picker | 0.18.0 | PR #8012, #8530; HarfBuzz/woff2 subsetting |
| Public API lifecycle overhaul | Unreleased | `onMount`, `onEvent`, `isDestroyed`, `ExcalidrawAPIProvider` all wired |
| Lasso selection | Unreleased (code complete) | 1804-line test file, full `App.tsx` integration |
| Element type conversion | Unreleased | `ConvertElementTypePopup` wired via `App.tsx` |
| `onEvent` migration (legacy `api.on*` removal) | Future (unscheduled) | CHANGELOG Unreleased notes intent, no timeline |
| Point tuple migration in `@excalidraw/math` | In progress | Both old and new forms coexist with explicit TODO markers |

---

## Details

For active development focus → see [docs/memory/activeContext.md](activeContext.md)
For architecture → see [docs/technical/architecture.md](../technical/architecture.md)
For domain terminology → see [docs/product/domain-glossary.md](../product/domain-glossary.md)
For known undocumented behaviors → see [docs/memory/decisionLog.md](decisionLog.md)
