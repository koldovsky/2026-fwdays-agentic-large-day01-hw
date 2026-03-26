# Product Requirements Document (Reverse-Engineered)

> This PRD is reverse-engineered from the Excalidraw open-source codebase. It documents the product as-built, not as originally planned.

---

## 1. Product Overview

**Product:** Excalidraw — a browser-based, collaborative virtual whiteboard for sketching hand-drawn-style diagrams.

**Vision:** Provide the fastest path from idea to diagram, with a hand-drawn aesthetic that keeps sketches informal and encourages iteration over perfection.

**Distribution:**
- **Web app** — Standalone deployment at excalidraw.com (free, open-source)
- **npm package** — `@excalidraw/excalidraw` for embedding in third-party React applications
- **Excalidraw+** — Commercial product with persistent storage, team management, and enhanced collaboration

---

## 2. Target Users

| Persona | Need | How Excalidraw Serves It |
|---------|------|------------------------|
| **Individual contributor** | Quick sketch for a Slack message or doc | Zero-setup browser tool, instant PNG/SVG export |
| **Distributed team** | Real-time brainstorming | Live collaboration with cursor presence and follow mode |
| **Developer** | Embed drawing in their app | npm package with React component + imperative API |
| **Educator** | Classroom collaboration | Shareable rooms, laser pointer tool, view mode |
| **Designer** | Low-fidelity wireframing | Hand-drawn aesthetic communicates "draft, not final" |

---

## 3. Functional Requirements

### 3.1 Drawing Tools (16 tools)

| Tool | Shortcut | Description |
|------|----------|-------------|
| Selection | V, 1 | Select, move, resize, rotate elements |
| Lasso | — | Freehand selection by drawing around elements |
| Rectangle | R, 2 | Draw rectangular shapes |
| Diamond | D, 3 | Draw diamond/rhombus shapes |
| Ellipse | O, 4 | Draw circles and ellipses |
| Arrow | A, 5 | Draw arrows with endpoint binding to shapes |
| Line | L, 6 | Draw multi-point lines, optionally closed as polygons |
| Freedraw | P/X, 7 | Freehand drawing with pressure-sensitive strokes |
| Text | T, 8 | Add text, standalone or bound to containers |
| Image | 9 | Insert raster images with crop and scale |
| Eraser | E, 0 | Remove elements by click or drag |
| Hand | H | Pan the canvas without selecting |
| Frame | F | Create grouping frames that clip child elements |
| Magicframe | — | AI-generated frames for text-to-diagram |
| Embeddable | — | Embed external content (URLs, videos) |
| Laser | K | Temporary pointer visible to all collaborators |

### 3.2 Element Operations

**Transform:**
- Move (drag), resize (handles), rotate (rotation handle)
- Flip horizontal (`Shift+H`) and vertical (`Shift+V`)
- Duplicate (`Ctrl+D` or `Alt+Drag`)

**Organization:**
- Group / Ungroup (`Ctrl+G` / `Ctrl+Shift+G`)
- Z-ordering: bring forward, send backward, bring to front, send to back
- Align (left, center-horizontal, right, top, center-vertical, bottom)
- Distribute (horizontal, vertical)
- Lock / Unlock elements

**Clipboard:**
- Cut, Copy, Paste (`Ctrl+X/C/V`)
- Copy as PNG, Copy as SVG
- Copy styles / Paste styles (`Ctrl+Alt+C/V`)

**Links:**
- Add hyperlinks to elements (`Ctrl+K`)
- Element-to-element linking

### 3.3 Styling Properties

| Property | Options |
|----------|---------|
| Stroke color | Color picker with presets + custom hex |
| Background color | Color picker with presets + custom hex + transparent |
| Fill style | Hachure, cross-hatch, solid, zigzag |
| Stroke width | Thin, bold, extra bold |
| Stroke style | Solid, dashed, dotted |
| Roughness | Architect (clean), artist (moderate), cartoonist (max wobble) |
| Opacity | 0–100 slider |
| Corner roundness | Sharp, round |
| Font family | 9 fonts including hand-drawn (Virgil/Excalifont), sans-serif, monospace |
| Font size | Configurable |
| Text align | Left, center, right |
| Arrowheads | 10+ styles including ER-diagram cardinality markers |
| Arrow type | Sharp, round, elbow (orthogonal routing) |

### 3.4 Collaboration

| Feature | Description |
|---------|-------------|
| Real-time editing | Multiple users edit the same canvas simultaneously via WebSocket |
| Room sharing | Unique URL with room ID in hash fragment — share link to invite |
| Cursor presence | Live cursor positions displayed for all collaborators with usernames |
| Follow mode | Lock viewport to follow another user's scroll and zoom |
| Laser pointer | Temporary visible pointer for presentations (K key) |
| Conflict resolution | Version + nonce-based reconciliation for concurrent edits |
| Encryption | Scene data encrypted client-side before transmission |

### 3.5 Export & Import

**Export formats:**
| Format | Method | Options |
|--------|--------|---------|
| PNG | File download or clipboard | Scale (1x–4x), background toggle, embed scene data |
| SVG | File download or clipboard | Background toggle, dark mode |
| JSON (.excalidraw) | File download | Full scene with elements, appState, and files |
| Link | Shareable URL | Encrypted backend storage |

**Import:**
- Load `.excalidraw` JSON files
- Paste images from clipboard
- Drag-and-drop image files

### 3.6 Library System

- Save element groups as reusable library items
- Publish / unpublish items
- Browse community-published libraries from `libraries.excalidraw.com`
- Drag-and-drop insertion from library sidebar
- Import/export library files

### 3.7 AI Features

| Feature | Description |
|---------|-------------|
| Text-to-Diagram | Convert natural language descriptions into Excalidraw diagrams via AI backend |
| Mermaid-to-Excalidraw | Convert Mermaid syntax (flowcharts, sequence diagrams, ER diagrams, mind maps, etc.) into native Excalidraw elements |

**Supported Mermaid diagram types:** Flowchart, Sequence, Class, State, ER, Journey, Gantt, Pie, Quadrant, Requirement, Git Graph, C4 Context, Mind Map, Timeline, Zenuml, Sankey, XY Chart, Block.

### 3.8 Search

- Search elements by text content (`Ctrl+F`)
- Highlight and navigate between matches
- Scroll-to-match navigation

### 3.9 Command Palette

- Fuzzy-search over all available actions (`Ctrl+/` or `Ctrl+Shift+P`)
- Categories: App, Export, Tools, Editor, Elements, Links, Library
- Shows keyboard shortcut hints
- Recent action tracking

---

## 4. Non-Functional Requirements

### 4.1 Performance

| Requirement | Implementation |
|-------------|---------------|
| Smooth canvas interaction | Dual-canvas architecture separates element rendering from pointer feedback |
| Efficient re-rendering | Static canvas only redraws when elements change (sceneNonce check) |
| Large canvas support | Viewport culling — only visible elements are rendered |
| Responsive state updates | Jotai atoms with selective subscriptions — components only re-render when their slice changes |
| Efficient undo/redo | Delta-based (StoreDelta) — stores diffs, not full snapshots |

### 4.2 Offline & Resilience

| Feature | Implementation |
|---------|---------------|
| PWA support | Service worker via Vite PWA plugin; installable on desktop/mobile |
| Auto-save | Continuous save to localStorage + IndexedDB |
| Crash recovery | Restores from local storage on reload |
| File System API | Native save/open dialogs on supported browsers |

### 4.3 Accessibility

| Feature | Implementation |
|---------|---------------|
| Keyboard navigation | Full keyboard shortcut system for all major operations |
| ARIA labels | Applied to toolbar buttons and interactive elements |
| Screen reader support | Semantic HTML with role attributes |
| High contrast | Dark mode theme option |
| Alt text | Support for image alt text |

### 4.4 Multi-Instance Support

- Multiple `<Excalidraw>` components on the same page don't interfere
- Implemented via Jotai scope isolation (`jotai-scope`)

### 4.5 Browser Support

- Modern browsers with Canvas API support
- Client-side only — no SSR (Next.js requires `dynamic(..., { ssr: false })`)
- Responsive layout — adapts to window size

### 4.6 Security

- Client-side encryption for shared scenes
- No server-side storage of unencrypted data
- Firebase authentication for collaboration rooms

---

## 5. Embedding API (npm Package)

The `@excalidraw/excalidraw` package exposes a React component with extensive customization:

### Component Props

| Prop | Type | Purpose |
|------|------|---------|
| `initialData` | `ExcalidrawInitialData` | Preload elements, appState, files |
| `onChange` | `(elements, appState, files) => void` | State change callback |
| `onPointerUpdate` | `(payload) => void` | Real-time pointer tracking |
| `theme` | `"light" \| "dark"` | Visual theme |
| `viewModeEnabled` | `boolean` | Read-only mode |
| `zenModeEnabled` | `boolean` | Minimalist UI |
| `gridModeEnabled` | `boolean` | Show grid |
| `isCollaborating` | `boolean` | Collaboration mode flag |
| `aiEnabled` | `boolean` | AI features toggle |
| `renderTopRightUI` | `() => JSX.Element` | Custom UI injection |
| `UIOptions` | `UIOptions` | Fine-grained UI control (hide tools, menus, actions) |
| `tools` | `Tool[]` | Register custom tools |

### Imperative API (via ref)

- `updateScene(data)` — Programmatically update elements and state
- `getSceneElements()` — Get current elements
- `exportToSvg()` / `exportToBlob()` — Generate exports
- `scrollToContent()` — Pan to fit content
- `undo()` / `redo()` — History control
- `resetScene()` — Clear canvas

---

## 6. UI Modes

| Mode | Shortcut | Description |
|------|----------|-------------|
| **Default** | — | Full UI with all panels and tools |
| **Zen Mode** | `Alt+Z` | Hides menus and panels; canvas only |
| **View Mode** | `Alt+R` | Read-only; disables creation/modification; allows pan/zoom |
| **Grid Mode** | `Ctrl+'` | Shows visual grid; elements snap to grid |
| **Object Snap** | `Alt+S` | Elements snap to other elements during move/resize |
| **Dark Mode** | `Shift+Alt+D` | Dark theme for canvas and UI |
| **Stats Panel** | `Alt+/` | Shows element counts and rendering metrics |

---

## 7. Data Model

### Scene Format (`.excalidraw` JSON)

```
{
  type: "excalidraw",
  version: 2,
  source: "https://excalidraw.com",
  elements: ExcalidrawElement[],
  appState: Partial<AppState>,
  files: Record<FileId, BinaryFileData>
}
```

### Element Common Properties

Every element has: `id`, `type`, `x`, `y`, `width`, `height`, `angle`, `strokeColor`, `backgroundColor`, `fillStyle`, `strokeWidth`, `strokeStyle`, `roughness`, `opacity`, `groupIds`, `frameId`, `index` (fractional), `seed`, `version`, `versionNonce`, `isDeleted`, `boundElements`, `link`, `locked`.

---

## 8. Constraints & Limitations

1. **Client-side only** — Cannot be server-side rendered.
2. **Container height required** — Parent element must have explicit height; Excalidraw fills 100%.
3. **CSS import required** — Embedders must import `@excalidraw/excalidraw/index.css`.
4. **Font CDN dependency** — Fonts load from CDN by default; self-hosting requires `window.EXCALIDRAW_ASSET_PATH`.
5. **No native mobile app** — PWA only; no App Store / Play Store distribution.
6. **Collaboration requires backend** — Real-time features need the Socket.io server and Firebase auth.
