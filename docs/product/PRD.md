# Product Requirements Document

**Product:** Excalidraw
**Version covered:** 0.18.0 (released 2025-03-11); Unreleased section also noted
**Evidence base:** Source code, `packages/excalidraw/CHANGELOG.md`, `packages/excalidraw/README.md`, existing memory files

---

## 1. Product Goal

Excalidraw provides an **infinite, collaborative whiteboard with a deliberate hand-drawn aesthetic**. The rough/sketchy visual style is the core product identity and is not configurable away at the system level — all shapes are rendered via `rough.js` with per-element `roughness` control ([`packages/excalidraw/renderer/staticScene.ts`](../../packages/excalidraw/renderer/staticScene.ts)).

The product ships as two tightly coupled artifacts from one repository:

1. **A hosted web application** (`excalidraw-app/`) deployed at excalidraw.com — full-featured editor with collaboration, Firebase storage, AI tools, and PWA support.
2. **A published React component library** (`@excalidraw/excalidraw@0.18.0`) on npm — embeddable in any React 17/18/19 application via a single `<Excalidraw />` component.

Both artifacts are MIT-licensed and open-source.

---

## 2. Target Audience

Three distinct audiences are evident from the codebase:

### 2.1 End Users of excalidraw.com

Users who visit the hosted app to create diagrams, wireframes, and sketches. The product caters to:
- **Casual/solo users** — local autosave to `localStorage`/IndexedDB, no account required ([`excalidraw-app/data/LocalData.ts`](../../excalidraw-app/data/LocalData.ts))
- **Collaborators** — real-time multiplayer via Socket.io rooms, end-to-end encrypted share links
- **Presenters** — laser pointer tool (`laser` tool type), follow mode (`userToFollow` in `AppState`), view mode for read-only display
- **Mobile users** — `formFactor: "phone"` branch in `App.tsx` adjusts UI (lasso as default selection tool on phones, transform handles hidden on mobile for linear elements)

### 2.2 Developers Embedding the Component

Developers who install `@excalidraw/excalidraw` and embed it in their applications:
- The package exposes a rich imperative API (`ExcalidrawImperativeAPI`) and declarative props (`viewModeEnabled`, `aiEnabled`, `renderTopRightUI`, `UIOptions`, `langCode`, etc.) — [`packages/excalidraw/types.ts`](../../packages/excalidraw/types.ts)
- `viewModeEnabled` creates a **read-only viewer** for embedding diagrams without editing capability
- `isCollaborating` prop signals to the editor that a collaboration session is active (managed externally by the host app)
- SSR constraint: must render client-side only; Next.js pattern using `dynamic(..., { ssr: false })` is documented in [`packages/excalidraw/README.md`](../../packages/excalidraw/README.md)

### 2.3 [Tentative] Excalidraw+ Subscribers

The codebase references `VITE_APP_PLUS_LP`, `VITE_APP_PLUS_APP`, `ExcalidrawPlusPromoBanner`, `ExportToExcalidrawPlus`, and `isExcalidrawPlusSignedUser` checks in `excalidraw-app/App.tsx`. A paid tier ("Excalidraw+") exists as a product, but its feature set, paywall logic, and backend are not present in this repository. The codebase only contains UI entry points and promo banners that link to `VITE_APP_PLUS_APP`.

---

## 3. Key Features

### 3.1 Drawing Canvas

| Feature | Evidence |
|---|---|
| Infinite canvas with pan/zoom | `AppState.scrollX/Y`, `AppState.zoom`; `hand` tool |
| Hand-drawn element rendering | `rough.js 4.6.4`; per-element `roughness`, `seed` |
| All primitive shapes | `rectangle`, `diamond`, `ellipse`, `line`, `arrow`, `freedraw`, `text`, `image`, `frame`, `embeddable` — `ToolType` in [`packages/excalidraw/types.ts`](../../packages/excalidraw/types.ts) |
| Lasso selection | `LassoTrail` class; 1804-line test file [`packages/excalidraw/tests/lasso.test.tsx`](../../packages/excalidraw/tests/lasso.test.tsx) |
| Elbow arrows with fixed segments | `ExcalidrawElbowArrowElement`, `FixedSegment`, `bindMode: "orbit"|"inside"|"skip"` — [`packages/element/src/types.ts`](../../packages/element/src/types.ts) |
| Element type conversion | `ConvertElementTypePopup` wired via `convertElementTypePopupAtom` in `App.tsx` |
| Snap-to-grid and object snapping | `actionToggleGridMode`, `actionToggleObjectsSnapMode`; `VISIBLE_GAPS_LIMIT_PER_AXIS` in [`packages/excalidraw/snapping.ts`](../../packages/excalidraw/snapping.ts) |
| Element locking | `element.locked`; `LockButton`, `UnlockPopup`, `actionElementLock.ts` |
| Frame containers | `frame` element clips child elements; frame deletion does not delete children (PR #9011) |
| Arrow auto-binding | `maxBindingDistance_simple(zoom)` in [`packages/element/src/binding.ts`](../../packages/element/src/binding.ts) |
| Element linking | `actionElementLink.ts`, `ElementLinkDialog` (0.18.0, PR #8812) |
| Image cropping | `isCropping` / `croppingElementId` AppState; `actionCropEditor.tsx` (0.18.0, PR #8613) |
| Flowchart creation | (0.18.0, PR #8329); elbow arrows + auto-connect |
| Embeddable iframes | `embeddable` element type; `validateEmbeddable` prop; configurable URL allowlist |

### 3.2 Text and Typography

| Feature | Evidence |
|---|---|
| Inline WYSIWYG text editor | [`packages/excalidraw/wysiwyg/textWysiwyg.tsx`](../../packages/excalidraw/wysiwyg/textWysiwyg.tsx) |
| Text element wrapping | `autoResize` flag; (0.18.0, PR #7999) |
| 9 built-in fonts + CJK support | `packages/common/src/font-metadata.ts`; Excalifont, Virgil, Cascadia, Nunito, Lilita One, etc. |
| Font subsetting for SVG export | HarfBuzz + woff2 WASM; `packages/excalidraw/subset/` |
| Internationalization | 46 locales + `en` default; managed via Crowdin; `langCode` prop; `packages/excalidraw/i18n.ts` |
| RTL language support | `rtl: true` on Arabic (`ar-SA`) locale entry in `i18n.ts` |

### 3.3 Collaboration

| Feature | Evidence |
|---|---|
| Real-time multiplayer | Socket.io rooms; [`excalidraw-app/collab/Collab.tsx`](../../excalidraw-app/collab/Collab.tsx) |
| End-to-end encryption | AES-GCM; encryption key in URL fragment, never sent to server; [`excalidraw-app/data/index.ts`](../../excalidraw-app/data/index.ts) |
| Collaborator cursors + presence | `Collaborator` type; idle states `active`/`away`/`idle` |
| Follow mode | `userToFollow` / `followedBy` in `AppState` |
| Multiplayer undo/redo | `Store` + `CaptureUpdateAction`; (0.18.0, PR #7348) |
| Scene reconciliation | `reconcileElements` with `FractionalIndex` z-order; [`packages/element/src/reconcile.ts`](../../packages/element/src/reconcile.ts) |

### 3.4 Persistence and Export

| Feature | Evidence |
|---|---|
| Local autosave | `localStorage` + `IndexedDB` via `LocalData` |
| Firebase-backed share links | `excalidraw-app/data/firebase.ts`; scene upload with client-generated key |
| `.excalidraw` JSON format | Import/export with schema migration via `data/restore.ts` |
| PNG export (1×, 2×, 3×) | `EXPORT_SCALES` in `packages/common/src/constants.ts`; `exportToBlob` |
| SVG export | `exportToSvg`; optional scene embed; font subsetting applied |
| Clipboard export | `exportToClipboard` |
| `onExport` async handler | Host apps can intercept export and inject async logic; Unreleased API, wired in `App.tsx` |
| Library of reusable shapes | `LibraryItem[]`; IDB-persisted; install from URL (`VITE_APP_LIBRARY_BACKEND`) |

### 3.5 AI Features

All AI features are gated by `props.aiEnabled !== false` (default: enabled). Host apps must explicitly pass `aiEnabled={false}` to disable ([`packages/excalidraw/types.ts:671`](../../packages/excalidraw/types.ts)).

| Feature | Evidence |
|---|---|
| Text-to-diagram (natural language → elements) | `TTDDialog/`; calls `VITE_APP_AI_BACKEND`; token-free since PR #8269 |
| Mermaid → Excalidraw conversion | `@excalidraw/mermaid-to-excalidraw@2.1.1`; auto-detected on paste |
| Magic Frame (diagram → code) | `magicframe` tool; `DiagramToCodePlugin`; `diagramToCode` plugin interface |

**Constraint**: The AI backend API contract is not defined in this repository.

### 3.6 Progressive Web App

| Feature | Evidence |
|---|---|
| Offline support | Service worker with `autoUpdate`; fonts cached 90 days, chunks 90 days, locales 30 days; `vite-plugin-pwa` |
| Installable | PWA manifest with `display: "standalone"` |
| File handler | Registered for `.excalidraw` files (`application/vnd.excalidraw+json`) |
| Web Share Target | Other apps can share `.excalidraw`/`.json` files directly into the editor |

### 3.7 Developer / Embedding API

| Feature | Evidence |
|---|---|
| `<Excalidraw />` React component | `packages/excalidraw/index.tsx` |
| `ExcalidrawImperativeAPI` | `updateScene`, `getSceneElements`, `scrollToContent`, `onEvent`, etc. |
| Lifecycle props | `onMount`, `onInitialize`, `onUnmount` (Unreleased, wired in `App.tsx`) |
| Event subscription | `api.onEvent(name, callback)` (Unreleased, replaces `api.onChange`/`api.onPointerUpdate`) |
| `ExcalidrawAPIProvider` + hooks | `useExcalidrawAPI`, `useAppStateValue`, `useOnExcalidrawStateChange` (Unreleased) |
| UI customization | `renderTopRightUI`, `renderCustomStats`, `UIOptions` (canvas actions, toolbar items) |
| `viewModeEnabled` | Read-only viewer mode; toolbar hidden, all editing disabled |

---

## 4. Technical Constraints

### 4.1 Runtime Environment

| Constraint | Detail | Source |
|---|---|---|
| **Browser-only** | No SSR support. `document`, `window`, and Canvas 2D API are used directly. Next.js integration requires `ssr: false` dynamic import. | `packages/excalidraw/README.md` |
| **React 17, 18, or 19** | Peer dependency: `"react": "^17.0.2 \|\| ^18.2.0 \|\| ^19.0.0"` | `packages/excalidraw/package.json` |
| **Canvas 2D API required** | Rendering uses the HTML5 Canvas 2D API; no WebGL or OffscreenCanvas. Tests mock the Canvas API via `vitest-canvas-mock`. | `packages/excalidraw/components/canvases/` |
| **No IE support** | `browserslist`: `not ie <= 11`, `not edge < 79`, `not chrome < 70`, `not safari < 12` | `packages/excalidraw/package.json` |
| **ESM only** | UMD bundle deprecated in 0.18.0. Consumers must use ES module–capable environments. Webpack requires `resolve.fullySpecified: false`. | `CHANGELOG.md` (0.18.0 breaking changes) |
| **TypeScript `moduleResolution`** | Consuming projects must use `"bundler"`, `"node16"`, or `"nodenext"` — `"node"` does not support `package.json` `exports` fields | `CHANGELOG.md` (0.18.0) |

### 4.2 Component Sizing

| Constraint | Detail | Source |
|---|---|---|
| **Non-zero parent height required** | `<Excalidraw />` fills 100% of its parent. A parent with zero height renders an invisible canvas. | `packages/excalidraw/README.md` |
| **CSS import required** | `import "@excalidraw/excalidraw/index.css"` must be added by the consumer. | `packages/excalidraw/README.md` |

### 4.3 Collaboration Infrastructure

| Constraint | Detail | Source |
|---|---|---|
| **External WebSocket server required** | Collaboration requires a running `excalidraw-room` Socket.io server. Not bundled in this repo. | `VITE_APP_WS_SERVER_URL` in `.env.development` |
| **Firebase project required** | Share links and collaboration scene storage use Firebase. Dev uses a shared OSS Firebase project; production uses `excalidraw-room-persistence`. | `.env.development`, `.env.production` |
| **Share link size limit** | Firebase enforces an undetermined maximum scene size. The client detects it only via an upload error, returning a user-facing message rather than validating size before upload. | `excalidraw-app/data/index.ts` |

### 4.4 Persistence Constraints

| Constraint | Detail | Source |
|---|---|---|
| **Soft delete only** | Elements are never removed from the scene array — only marked `isDeleted: true`. This is required for collaboration sync and undo integrity. | `packages/element/src/Scene.ts` |
| **`AppState` storage partitioning** | Fields are tagged `browser`/`export`/`server`; `viewModeEnabled` is not persisted anywhere; user tool preferences are browser-only and not exported. | `packages/excalidraw/appState.ts`, `APP_STATE_STORAGE_CONF` |
| **Encryption key in URL fragment** | The share link encryption key is embedded in the URL hash (`#json={id},{key}` or `#room={id},{key}`). It is never sent to the server. Losing the URL loses the key. | `excalidraw-app/data/index.ts` |

### 4.5 Performance Constraints

| Constraint | Detail | Source |
|---|---|---|
| **PWA max cache file size** | Service worker will not cache files larger than 2.3 MB (`maximumFileSizeToCacheInBytes: 2.3 * 1024 ** 2`) | `excalidraw-app/vite.config.mts` |
| **Snapping gap scan limit** | `VISIBLE_GAPS_LIMIT_PER_AXIS = 99999` — acknowledged as a temporary ceiling with a `// TODO increase or remove once we optimize` | `packages/excalidraw/snapping.ts` |
| **Mobile touch + pointer event unification incomplete** | Double-click handling mixes native browser events with manual touch logic. `// HACK` comment in `App.tsx:689`. Transform handles for linear elements are disabled on mobile. | `packages/excalidraw/components/App.tsx` |

### 4.6 AI Constraints

| Constraint | Detail | Source |
|---|---|---|
| **External AI backend required** | TTD and magic frame call `VITE_APP_AI_BACKEND`; API contract not defined in this repo | `excalidraw-app/vite-env.d.ts`, `TTDDialog/` |
| **`aiEnabled` prop gate** | Host apps must pass `aiEnabled={false}` to disable all AI features | `packages/excalidraw/types.ts:671` |

---

## Details

For domain terminology → see [docs/product/domain-glossary.md](domain-glossary.md)
For architecture → see [docs/technical/architecture.md](../technical/architecture.md)
For active work and open issues → see [docs/memory/activeContext.md](../memory/activeContext.md)
For dev setup → see [docs/technical/dev-setup.md](../technical/dev-setup.md)
