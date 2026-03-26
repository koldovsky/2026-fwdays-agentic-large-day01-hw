# Progress

## Production-Ready

### Core Editor (Library)

- **Element creation and editing**: All 16 tool types (`selection`, `lasso`, `rectangle`, `diamond`, `ellipse`, `line`, `arrow`, `text`, `image`, `eraser`, `hand`, `laser`, `freedraw`, `frame`, `magicframe`, `embeddable`) are implemented with full lifecycle (create, select, edit, delete, style).
- **Rendering pipeline**: Two-canvas (static + interactive) + offscreen element cache + DPR scaling. `roughjs`-based hand-drawn style is stable and deterministic (seed-based).
- **History (undo/redo)**: CRDT delta-based system with `DurableIncrement`/`EphemeralIncrement` split. Extensively tested (63 tests in `history.test.tsx`).
- **Export**: PNG, SVG, clipboard (with `exportEmbedScene` option for round-trip import). `exportToCanvas()`, `exportToBlob()`, `exportToSvg()` are all part of the public library API.
- **Imperative API** (`ExcalidrawImperativeAPI`): Full-featured programmatic surface — `updateScene`, `applyDeltas`, `mutateElement`, `getSceneElements`, `addFiles`, `setActiveTool`, `scrollToContent`, `registerAction`, `onStateChange`, event subscriptions.
- **Actions system**: ~90 named actions registered via `ActionManager`; all core editor operations (style, clipboard, z-order, align/distribute, group, flip, rotate, lock, export, history) implemented.
- **Library items**: Add, reuse, import/export `.excalidrawlib`; persisted in IndexedDB with migration from localStorage.
- **Fonts**: 11 built-in font families (Virgil, Excalifont, Cascadia, ComicShanns, Assistant, Helvetica, Liberation, Lilita, Nunito, Xiaolai, Emoji). `Fonts.loadElementsFonts()` ensures fonts are loaded before export.
- **i18n**: Locale files per language; auto-detection via `i18next-browser-languagedetector`.
- **Accessibility**: Radix UI primitives used for dropdowns and dialogs; ARIA labels present in key components.

### App Shell

- **Collaboration** (Socket.IO + Firebase): Room creation, AES-GCM E2E encryption, element delta broadcasting, follow-mode, idle tracking — fully implemented in `Collab.tsx`.
- **Persistence**: localStorage (elements + appState), IndexedDB (binary files, library), cross-tab sync, Firebase Firestore (collab scenes), Firebase Storage (collab + share-link files).
- **PWA**: Service worker with `CacheFirst` strategies for fonts and lazy chunks; `file_handlers` for `.excalidraw` files; `share_target` for file sharing.
- **Sharing**: Static `#json=<id>,<key>` share links (encrypted snapshot); room URLs (`#room=<id>,<key>`); QR code generation (lazy chunk).
- **Docker deployment**: Multi-stage Dockerfile producing a minimal `nginx:1.27-alpine` image, published to DockerHub as multi-arch (`amd64`, `arm64`, `arm/v7`).

---

## Partially Implemented / In Progress

### Elbow Arrow Routing (Inference)

`packages/element/src/elbowArrow.ts` implements A\* pathfinding with `fixedSegments` and segment renormalization. The presence of `handleSegmentRenormalization()` and `FixedSegment` tracking alongside complex heading-based routing suggests ongoing stabilization. Source: `elbowArrow.ts` complexity and `fixedSegments` on `ExcalidrawElbowArrowElement`.

### Image Cropping

`ImageCrop` field exists on `ExcalidrawImageElement`, `isCropping`/`croppingElementId` in `AppState`, and `actionCropEditor.tsx` exists. However, no dedicated test file for cropping was found in `packages/excalidraw/tests/`. The feature is functional but test coverage appears limited. Source: `packages/element/src/types.ts`, `packages/element/src/cropElement.ts`.

### `@excalidraw/utils` Package

Version `0.1.2` (vs `0.18.0` for other packages) — significantly behind the main package. The sub-path exports map only exposes types (no `dev`/`prod` runtime exports for sub-paths), and it is not included in `build:packages`. Source: `packages/utils/package.json`.

### Coordinate Type Migration

`packages/math/src/types.ts` declares both tuple types (`GlobalPoint`, `LocalPoint`) and object types (`GlobalCoord`, `LocalCoord`) marked with `// TODO: remove` comments. The codebase is in the process of migrating to tuple-based types. Source: `packages/math/src/types.ts`.

---

## Experimental / Example-Only

### TTD (Text-to-Diagram) and AI Features

`TTDDialog`, `TTDDialogTrigger`, `TTDStreamFetch`, `DiagramToCodePlugin`, and `MagicFrame` element type are exported and integrated, but gated by the `aiEnabled` prop on `ExcalidrawProps`. The `DiagramToCodePlugin` component name suggests this feature converts diagram elements to code via AI. Source: `packages/excalidraw/index.tsx`, `packages/excalidraw/types.ts` (`aiEnabled`).

### `examples/` Directory

- `examples/with-nextjs/` — Next.js integration example; not published or part of the build pipeline.
- `examples/with-script-in-browser/` — Vanilla HTML/script embed example; `start:example` script in root `package.json` builds packages and serves this example.
- Both are excluded from TypeScript compilation (`exclude: ["examples"]` in `tsconfig.json`).

### Visual Debug Canvas

`excalidraw-app/components/DebugCanvas.tsx` is rendered only in development builds (conditionally). Used to overlay geometric debug information. Source: `excalidraw-app/App.tsx` component tree.

---

## Notable Test Coverage

| Area | Test File | Test Count | Notes |
| --- | --- | --- | --- |
| History (undo/redo) | `history.test.tsx` | 63 | Includes singleplayer + multiplayer (CRDT) |
| Data restoration | `data/restore.test.ts` | 43 | Schema migration edge cases |
| Regression / snapshots | `regressionTests.test.tsx` | 40 | Visual regression via snapshots |
| Element flipping | `flip.test.tsx` | 38 | All element types + rotation |
| Scene export | `scene/export.test.ts` | 15 | SVG/canvas export pipeline |
| Arrow binding | `arrowBinding.test.tsx` | 21 | Binding strategies, edge cases |
| Excalidraw component API | `excalidraw.test.tsx` | 28 | Props, imperative API surface |
| Context menu | `contextmenu.test.tsx` | 17 | Right-click actions |
| Selection behavior | `selection.test.tsx` | 15 | Multi-select, group select |
| Clipboard (copy/paste) | `clipboard.test.tsx` | 19 | Images, Mermaid, frames, JSON |
| Collaboration sync | `collab.test.tsx` | 2 | Force-delete reconciliation |
| Data reconcile | `data/reconcile.test.ts` | 2 | CRDT merge |

Coverage thresholds enforced: **lines 60%, branches 70%, functions 63%, statements 60%**. Thresholds are intentionally moderate; `ignoreEmptyLines: false` is explicitly noted in `vitest.config.mts` as affecting numbers.

## Related Docs

- [Product Requirements (PRD)](../product/PRD.md) — the requirement counterpart to each completed feature: key features (§5), functional requirements (§6), open questions about in-progress items (§8)
- [Developer Setup](../technical/dev-setup.md) — validation commands and coverage thresholds (§6)
- [Active Context](./activeContext.md) — current development focus areas and features still stabilising

## Source Evidence

- `packages/excalidraw/tests/` — all 38 test files (inspected names and structure)
- `excalidraw-app/tests/` — 3 test files
- `packages/excalidraw/index.tsx` — exported API surface
- `packages/element/src/types.ts` — element types, `ImageCrop`, `FixedSegment`
- `packages/element/src/elbowArrow.ts` — A\* implementation, `handleSegmentRenormalization`
- `packages/utils/package.json` — version `0.1.2`, limited exports
- `packages/math/src/types.ts` — `GlobalCoord`/`LocalCoord` TODO comments
- `packages/excalidraw/types.ts` — `aiEnabled` prop, `TTDDialog*` exports
- `vitest.config.mts` — coverage thresholds and reporter config
- `excalidraw-app/App.tsx` — `DebugCanvas` conditional render
- `tsconfig.json` — `exclude: ["examples"]`
