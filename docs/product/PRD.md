# Product Requirements Document (reverse-engineered)

> Derived entirely from source code, metadata, and configuration files in this repository.
> Not an official roadmap — a factual snapshot of what the product **does today**.

---

## 1. Product overview

| Field | Value | Source |
|-------|-------|--------|
| **Name** | Excalidraw | `APP_NAME` in `packages/common/src/constants.ts` |
| **Tagline** | "Virtual collaborative whiteboard tool that lets you easily sketch diagrams that have a hand-drawn feel" | `<meta name="description">` in `excalidraw-app/index.html` |
| **Page title** | Excalidraw Whiteboard | `<title>` in `excalidraw-app/index.html` |
| **Distribution** | Web app at excalidraw.com + embeddable React component `@excalidraw/excalidraw` | `packages/excalidraw/README.md`, `excalidraw-app/` |
| **License** | MIT | `packages/excalidraw/package.json` |

### Vision (inferred)

Provide a **browser-native whiteboard** where anyone can sketch diagrams that look informal and hand-drawn, with zero setup. Collaboration is first-class. The same rendering engine is available as a **drop-in React component** for third-party products.

---

## 2. Target users

| Persona | Evidence |
|---------|----------|
| **End users** — individuals or teams needing a quick whiteboard | Public web app, PWA install, collaboration, "free" in meta tags |
| **Developers / integrators** — embedding the editor in their own product | `@excalidraw/excalidraw` npm package, `peerDependencies` on React, Quick start in README, `UIOptions` for customisation |
| **Library consumers** — using drawing utilities without the full UI | `@excalidraw/utils`, `@excalidraw/math`, `@excalidraw/element` published separately |

---

## 3. Core capabilities

### 3.1 Drawing tools

The editor exposes 16 tool types (`ToolType` in `packages/excalidraw/types.ts`):

| Category | Tools |
|----------|-------|
| **Selection** | `selection`, `lasso` |
| **Shapes** | `rectangle`, `diamond`, `ellipse` |
| **Lines** | `arrow`, `line`, `freedraw` |
| **Content** | `text`, `image`, `embeddable` |
| **Organisation** | `frame`, `magicframe` |
| **Utility** | `eraser`, `hand` (pan), `laser` (pointer highlight) |

### 3.2 Element types

The canvas supports 10 element families (`ExcalidrawElement` union in `packages/element/src/types.ts`):

| Type | Description |
|------|-------------|
| `ExcalidrawGenericElement` | Rectangle, diamond, ellipse, selection |
| `ExcalidrawTextElement` | Rich text with font, alignment, auto-resize, container binding |
| `ExcalidrawLinearElement` / `ArrowElement` | Lines, polylines, arrows (with bindings and elbow routing) |
| `ExcalidrawFreeDrawElement` | Freehand drawing with pressure simulation |
| `ExcalidrawImageElement` | Raster images linked via `FileId` |
| `ExcalidrawFrameElement` / `MagicFrameElement` | Named container for grouping/clipping; AI-powered variant |
| `ExcalidrawIframeElement` / `EmbeddableElement` | Embedded iframes and external content (e.g. YouTube) |

Every element carries: `id`, position/size, style properties (stroke, fill, roughness, opacity), `version`/`versionNonce` for sync, fractional `index` for multiplayer ordering, `groupIds`, `frameId`, `boundElements`, `isDeleted`.

### 3.3 Styling and appearance

Users can customise per-element and per-canvas:

- **Stroke**: color, width, style (solid, dashed, dotted), roughness (sloppiness)
- **Fill**: color, fill style (hachure, cross-hatch, solid)
- **Font**: family, size (increase/decrease), text align, vertical align
- **Opacity**: per-element
- **Arrow**: arrowhead style, arrow type, binding properties
- **Roundness**: corner radius
- **Theme**: light / dark (`THEME` in `packages/common/src/constants.ts`)
- **Canvas background**: customisable color

### 3.4 Layout and organisation

- **Grouping** / **ungrouping** elements
- **Frames** for visual containment and clipping
- **Z-ordering**: send backward, bring forward, send to back, bring to front
- **Alignment**: top, bottom, left, right, vertical center, horizontal center
- **Distribution**: horizontal, vertical
- **Flip**: horizontal, vertical
- **Locking** / unlocking elements
- **Snapping**: object snap mode, midpoint snapping
- **Grid mode**

### 3.5 Navigation and view

- **Zoom**: in, out, reset, zoom-to-fit (all / selection)
- **Pan**: hand tool or scroll/trackpad
- **Fullscreen** toggle
- **Zen mode** (distraction-free)
- **View mode** (read-only)
- **Stats** panel (element stats, debug)
- **Grid mode**

---

## 4. Collaboration

Real-time multi-user editing via WebSocket (`socket.io-client 4.7.2`, `excalidraw-app/collab/Collab.tsx`).

| Feature | Implementation |
|---------|---------------|
| **Encrypted sync** | `encryptData`/`decryptData` with room key; payloads `SCENE_INIT` and `SCENE_UPDATE` |
| **Element reconciliation** | `reconcileElements()` using `version`/`versionNonce` rules |
| **Live cursors** | `MOUSE_LOCATION` broadcast (volatile/throttled) with pointer position, tool, and username |
| **Presence** | `IDLE_STATUS` broadcast (active/idle); collaborator list via `room-user-change` |
| **Follow mode** | `USER_VISIBLE_SCENE_BOUNDS` + `user-follow` / `user-follow-room-change` events |
| **Periodic full sync** | `SYNC_FULL_SCENE_INTERVAL_MS` — periodic full scene broadcast to recover from missed incremental updates |
| **Firebase persistence** | Room scenes and image files stored via Firebase (`firebase 11.3.1`) |
| **Collaborator map** | `AppState.collaborators`: `Map<SocketId, Collaborator>` — pointer, selection, username, avatar, call state |

Transport: configurable via `VITE_APP_WS_SERVER_URL` (defaults to `localhost:3002` in dev, `oss-collab.excalidraw.com` in prod).

---

## 5. File formats and I/O

### 5.1 Native formats

| Format | MIME / Extension | Read | Write | Source |
|--------|-----------------|------|-------|--------|
| Excalidraw JSON | `application/vnd.excalidraw+json` / `.excalidraw` | yes | yes | `data/json.ts` |
| Excalidraw Library | `excalidrawlib` / `.excalidrawlib` | yes | yes | `data/library.ts`, `data/json.ts` |
| Excalidraw Clipboard | `excalidraw/clipboard`, `excalidraw-api/clipboard` | yes | yes | `EXPORT_DATA_TYPES` in `constants.ts` |

### 5.2 Export formats

| Format | Capability | Source |
|--------|-----------|--------|
| **PNG** | Export to file, copy to clipboard (`copyAsPng`) | `data/index.ts`, `actions/actionClipboard.tsx` |
| **SVG** | Export to file, copy to clipboard (`copyAsSvg`) | `data/index.ts`, `actions/actionClipboard.tsx` |
| **PNG with embedded scene** | Scene JSON compressed in `tEXt` PNG chunk — round-trip import | `data/image.ts` (`encodePngMetadata` / `decodePngMetadata`) |
| **SVG with embedded scene** | Scene data in SVG — round-trip import | `data/blob.ts` (`decodeSvgBase64Payload`) |
| **Plain text** | Copy selected text content | `copyText` action |

### 5.3 Import sources

- **File open** via File System Access API or file input; **drag & drop** onto canvas; **clipboard paste** (images, text, Excalidraw data)
- **URL / embed** (images, iframes, embeddable URLs); **Web Share Target** and **File Handler** (PWA receives/opens `.excalidraw` files)

### 5.4 Export options

| Option | `AppState` field | Default |
|--------|-----------------|---------|
| Include background | `exportBackground` | `true` |
| Embed scene data | `exportEmbedScene` | `false` |
| Dark mode export | `exportWithDarkMode` | matches theme |
| Scale | `exportScale` | `1` |

---

## 6. Shape library

- **`LibraryItem`**: `id`, `status` (`published` | `unpublished`), `elements`, `created`, optional `name` / `error` (`packages/excalidraw/types.ts`)
- **Persistence**: local storage + import/export as `.excalidrawlib` files
- **Remote libraries**: load from URL (`VITE_APP_LIBRARY_URL` = `libraries.excalidraw.com`)
- **Library UI**: sidebar panel for browsing, adding, and inserting shapes
- **API**: `addToLibrary` action; `Library` class with `updateLibrary()` public method

---

## 7. PWA and platform

### Progressive Web App

- **`display: standalone`**, installable (`id: "excalidraw"`)
- **Service Worker**: auto-update, Workbox runtime caching (fonts 90d, locales 30d, chunks 90d)
- **File handler**: OS-level `.excalidraw` file association
- **Share target**: receive files via Web Share API (POST `multipart/form-data`)
- **Offline**: precached app shell; dynamic caching for fonts, locales, and lazy chunks

### Mobile support

- `mobile-web-app-capable` meta tag
- Touch-optimised viewport (`excalidraw-app/index.html`)
- Touch/pointer event handling in `App.tsx` (double-tap, long-press context menu)

### Internationalisation

- **56+ locales** under `packages/excalidraw/locales/` (e.g. `en.json`, `uk-UA.json`, `ja-JP.json`, `ar-SA.json`, `zh-CN.json`, `de-DE.json`, `fr-FR.json`, `pt-BR.json`)
- Language detection via `i18next-browser-languagedetector`
- Coverage tracking scripts: `yarn locales-coverage`

### Theme

- Light / dark, persisted in `localStorage` key `excalidraw-theme`
- Early bootstrap in `index.html` inline script (avoids flash)
- System preference detection (`system` option)

---

## 8. Embeddable component API

The `@excalidraw/excalidraw` package (`packages/excalidraw/`) exposes:

### Required setup

1. Import CSS: `import "@excalidraw/excalidraw/index.css"`
2. Render inside a container with non-zero height
3. Client-only rendering for SSR frameworks (`ssr: false`)

### Customisation surface (`UIOptions`)

| Option | Type | Purpose |
|--------|------|---------|
| `canvasActions.clearCanvas` | `boolean` | Show/hide clear canvas |
| `canvasActions.export` | `false \| ExportOpts` | Export panel and backend hook |
| `canvasActions.loadScene` | `boolean` | Show/hide load |
| `canvasActions.saveToActiveFile` | `boolean` | Show/hide save |
| `canvasActions.saveAsImage` | `boolean` | Show/hide save-as-image |
| `canvasActions.changeViewBackgroundColor` | `boolean` | Background color picker |
| `canvasActions.toggleTheme` | `boolean \| null` | Theme toggle |
| `tools.image` | `boolean` | Enable/disable image tool |
| `dockedSidebarBreakpoint` | `number` | Width for auto-docking sidebar |
| `getFormFactor` | `(editorWidth: number, editorHeight: number) => EditorInterface["formFactor"]` | Control editor form factor / desktop UI mode from host app (optional; internal default if omitted). See `UIOptions` in `packages/excalidraw/types.ts` |

### React peer dependencies

`react` and `react-dom`: `^17.0.2 || ^18.2.0 || ^19.0.0`

---

## 9. Editor actions inventory

The editor registers **80+ named actions** (`ActionName` in `packages/excalidraw/actions/types.ts`), grouped by domain:

| Domain | Actions (representative) |
|--------|-------------------------|
| **Clipboard** | copy, cut, paste, copyAsPng, copyAsSvg, copyText, copyStyles, pasteStyles |
| **History** | undo, redo |
| **Z-order** | sendBackward, bringForward, sendToBack, bringToFront |
| **Selection** | selectAll, duplicateSelection, deleteSelectedElements |
| **File** | saveToActiveFile, saveFileToDisk, loadScene |
| **Export** | changeExportBackground, changeExportEmbedScene, changeExportScale, exportWithDarkMode |
| **Zoom** | zoomIn, zoomOut, resetZoom, zoomToFit, zoomToFitSelection |
| **Style** | changeStrokeColor, changeBackgroundColor, changeFillStyle, changeStrokeWidth, changeStrokeStyle, changeSloppiness, changeOpacity, changeRoundness |
| **Font** | changeFontFamily, changeFontSize, increaseFontSize, decreaseFontSize, changeTextAlign, changeVerticalAlign |
| **Arrow** | changeArrowhead, changeArrowType, changeArrowProperties |
| **Layout** | group, ungroup, alignTop/Bottom/Left/Right, alignVerticallyCentered, alignHorizontallyCentered, distributeHorizontally/Vertically, flipHorizontal/Vertical |
| **View** | viewMode, zenMode, gridMode, objectsSnapMode, toggleFullScreen, toggleTheme, stats, elementStats |
| **Element** | toggleElementLock, unlockAllElements, bindText, unbindText, hyperlink, autoResize, cropEditor |
| **Frame** | setFrameAsActiveTool, selectAllElementsInFrame, removeAllElementsFromFrame, updateFrameRendering, wrapSelectionInFrame |
| **Tools** | toggleEraserTool, toggleHandTool, toggleLinearEditor, toggleLassoTool, toggleShapeSwitch, togglePolygon, setEmbeddableAsActiveTool |
| **Collaboration** | goToCollaborator |
| **Discovery** | commandPalette, searchMenu, toggleShortcuts |
| **Library** | addToLibrary |
| **Links** | copyElementLink, linkToElement |

---

## 10. Non-functional requirements (observed)

| Area | Observation | Source |
|------|------------|--------|
| **Performance** | Hot-path comments on hit testing; `flushSync` for synchronous state; `Renderer.getRenderableElements` viewport culling | `App.tsx` |
| **Undo/redo** | `Store` + `History` with `CaptureUpdateAction` (IMMEDIATELY / NEVER / EVENTUALLY) | `packages/element/src/store.ts` |
| **Error tracking** | Sentry (`@sentry/browser 9.0.1`) loaded as side-effect import | `excalidraw-app/sentry.ts` |
| **Code quality** | TypeScript strict, zero ESLint warnings, Prettier, Vitest 60%+ coverage thresholds | `tsconfig.json`, `package.json`, `vitest.config.mts` |
| **Browser support** | `>0.2%`, no IE 11, no Safari <12, no Chrome <70 | `browserslist` in `excalidraw-app/package.json` |
| **Security** | Collaboration payloads encrypted; `@braintree/sanitize-url` for link sanitisation | `data/encryption.ts`, `packages/excalidraw/package.json` |

---

## 11. Out of scope (not found in code)

- User accounts / authentication (no auth layer in the OSS repo)
- Server-side rendering of scenes
- Real-time voice/video (though `Collaborator` has `isInCall`, `isSpeaking`, `isMuted` fields — UI stubs only)
- Version history / branching of documents
- Access control / permissions per document
- Billing or subscription logic

---

## Source verification

| Section | Primary sources |
|---------|----------------|
| Tools, elements, AppState | `packages/excalidraw/types.ts`, `packages/element/src/types.ts` |
| Actions | `packages/excalidraw/actions/types.ts` |
| Collaboration | `excalidraw-app/collab/Collab.tsx` |
| File formats | `packages/excalidraw/data/json.ts`, `data/image.ts`, `data/blob.ts`, `data/library.ts` |
| PWA | `excalidraw-app/vite.config.mts` |
| i18n | `packages/excalidraw/locales/` |
| UIOptions | `packages/excalidraw/types.ts` |
| Constants | `packages/common/src/constants.ts` |

---

*For architecture details → see [`docs/technical/architecture.md`](../technical/architecture.md).*
*For domain term definitions → see [`docs/product/domain-glossary.md`](./domain-glossary.md).*
*For dev setup → see [`docs/technical/dev-setup.md`](../technical/dev-setup.md).*
