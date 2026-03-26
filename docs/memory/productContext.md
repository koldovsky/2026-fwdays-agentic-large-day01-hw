# Product Context

## UX Goals

- **Zero friction start**: The canvas is immediately ready on page load; no sign-in or account is required.
- **Hand-drawn aesthetic by default**: All shapes are rendered through `roughjs` giving them a deliberate, imperfect, sketch-like appearance. Roughness is configurable per element.
- **Collaborative without setup**: Sharing a `#room=` URL fragment is sufficient to start a real-time session; the encryption key is embedded only in the fragment (never sent to the server).
- **Privacy by design**: All collaborative scenes are AES-GCM encrypted end-to-end; the server stores only ciphertext. See [Collaboration Patterns](../technical/architecture.md) for the encryption and socket data-flow details.
- **Offline capable**: A PWA service worker with Workbox caching allows the app to load and work offline after first visit.
- **Embeddable with minimal ceremony**: Third-party apps can drop in `<Excalidraw />` with only `react`/`react-dom` as peer dependencies.

## Core User Workflows

### 1. Create and Edit Elements

- Select a tool from the toolbar (or press keyboard shortcut): `rectangle`, `diamond`, `ellipse`, `arrow`, `line`, `text`, `image`, `frame`, `eraser`, `hand`, `laser`, `freedraw`, `lasso`.
- Drag on canvas to create; release to commit.
- Text is created by double-clicking; an in-DOM editable overlay appears (WYSIWYG).
- Image elements are created via drag-and-drop or paste from clipboard.

### 2. Format and Style

- Select element(s), then use the properties panel to change `strokeColor`, `backgroundColor`, `fillStyle` (`hachure`/`cross-hatch`/`solid`/`zigzag`), `strokeWidth`, `strokeStyle` (`solid`/`dashed`/`dotted`), `roughness`, `opacity`, `arrowhead` type, `fontFamily`, `fontSize`, `textAlign`.
- Styles are "sticky": the last used style is the default for the next element of that type.

### 3. Organize Elements

- **Groups**: select multiple elements → Group (`Ctrl+G`) → treated as a single unit for move/resize.
- **Frames**: drag a `frame` element as a named grouping/export boundary.
- **Z-order**: bring to front/back, send forward/backward.
- **Align / Distribute**: horizontal/vertical alignment and equal distribution across selected elements.
- **Layers**: elements have fractional string indices for stable ordering.

### 4. Navigate the Canvas

- Pan: `Space`+drag or middle-mouse drag; also the Hand tool.
- Zoom: `Ctrl+Scroll`, pinch gesture, `+`/`-` shortcuts.
- Fit to content: `Shift+1`.
- **Follow mode**: in collaborative sessions, click a collaborator avatar to follow their viewport.

### 5. Real-Time Collaboration

- Click "Live Collaboration" → generates `#room=<id>,<key>` URL → share it.
- Remote cursors and usernames are visible in real-time.
- Remote pointer clicks are broadcast as volatile ("sparkle") events.
- Idle/active status is tracked and broadcast every ~`ACTIVE_THRESHOLD` ms.
- Pressing Stop Session disconnects and resumes local saves.

### 6. Export

- **PNG/SVG**: File → Export image. Supports background on/off, scale factor, dark mode, embed-scene (stores JSON in SVG metadata).
- **Clipboard**: Copy as PNG or SVG.
- **Save to .excalidraw file**: JSON serialization of all elements + appState + embedded binary files.
- **Share link (static)**: generates `#json=<id>,<key>` — uploaded as an encrypted snapshot to the backend V2 API; shareable as a read-only permanent link.
- **Excalidraw+ export**: uploads to Firebase Storage and redirects to the Plus app.

### 7. Import

- Drag and drop `.excalidraw` / `.excalidraw.svg` / `.excalidraw.png` files onto the canvas.
- Paste images or SVG from clipboard.
- Import Mermaid diagram syntax → auto-converts to Excalidraw elements.
- Import library (`.excalidrawlib`) files.
- Load scene from URL via `#url=<encoded-url>`.

### 8. Library

- Save selected elements as library items.
- Reuse library items by clicking them (inserts into canvas).
- Import/export `.excalidrawlib` files.
- Library is stored in IndexedDB with a one-time migration from legacy localStorage.

### 9. Embed Use Cases

See [PRD §4.4](../product/PRD.md) for the product-level embedding scenario and [PRD §6 FR-21–FR-25](../product/PRD.md) for the corresponding functional requirements.

- Host app instantiates `<Excalidraw>` component.
- Passes `initialData` for pre-loaded scene.
- Subscribes to `onChange` for scene updates.
- Uses `ExcalidrawImperativeAPI` (via `onExcalidrawAPI` callback or `useExcalidrawAPI()`) to call `updateScene()`, `getSceneElements()`, `setActiveTool()`, `scrollToContent()`, `exportToCanvas()`, etc.
- Implements its own collaboration transport by calling `reconcileElements()` + `updateScene({ collaborators })` with remote data.
- Renders custom UI via named slots: `<MainMenu>`, `<WelcomeScreen>`, `<Footer>`, `<Sidebar>`, `<LiveCollaborationTrigger>`.

## Supported Interactions (Input Model)

- **Mouse/trackpad**: pointer events (down/move/up), scroll wheel, pinch-to-zoom.
- **Touch**: pointer events on mobile; phone layout detected via `EditorInterfaceContext` breakpoints.
- **Keyboard**: single-key tool shortcuts, `Ctrl+Z`/`Ctrl+Y` for history, `Ctrl+C`/`Ctrl+V` clipboard, `Delete`/`Backspace` to remove, `Escape` to cancel/deselect, `Enter` to confirm, `Alt+Shift+D` for theme toggle.
- **File drag-and-drop** onto canvas.
- **Clipboard API**: paste images, SVG, JSON scenes, text (potentially parsed as chart/Mermaid data).

## Related Docs

- [Product Requirements (PRD)](../product/PRD.md) — complete feature list (§5), user scenarios (§4), non-functional requirements (§7)
- [Technical Architecture](../technical/architecture.md) — collaboration data flow, encryption implementation, persistence decision tree

## Source Evidence

- `excalidraw-app/App.tsx` — `initializeScene()`, `ExcalidrawWrapper`, component tree
- `excalidraw-app/collab/Collab.tsx` — `startCollaboration()`, socket message types, idle tracking
- `excalidraw-app/app_constants.ts` — timing constants, localStorage keys
- `packages/excalidraw/index.tsx` — exported hooks, components, utilities
- `packages/excalidraw/types.ts` — `ToolType`, `AppState`, `ExcalidrawProps`, `ExcalidrawImperativeAPI`
- `packages/excalidraw/components/App.tsx` — `AppState` field groups, context providers
- `packages/excalidraw/actions/` — named action registry
- `packages/element/src/types.ts` — element type union, arrowhead types
- `excalidraw-app/share/ShareDialog.tsx` — sharing UI logic
- `vitest.config.mts`, test files — confirm documented features are tested
