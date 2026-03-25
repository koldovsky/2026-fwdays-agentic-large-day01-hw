# Product Requirements Document (Reverse-Engineered)

> Reconstructed from the Excalidraw source code. All claims are derived from implementation evidence.

## 1. Product Overview

### Vision

Excalidraw is an open-source virtual whiteboard for creating hand-drawn-style diagrams. It serves two roles simultaneously:

1. **Standalone web application** — hosted at excalidraw.com with real-time collaboration, cloud persistence, and PWA support
2. **Embeddable React component** — published as `@excalidraw/excalidraw` on npm, designed for integration into third-party applications

### Core Value Proposition

- **Hand-drawn aesthetic** — rough.js rendering engine gives all elements a deliberately imperfect, sketch-like appearance, distinguishing Excalidraw from tools like draw.io, Figma, or Miro
- **Zero-friction start** — no signup required; open browser → draw immediately
- **End-to-end encryption** — collaborative sessions use AES-GCM encryption with room keys transmitted exclusively in URL fragments (never sent to server)
- **Open source** — MIT license; free for commercial use, modification, and distribution

### License

MIT (c) 2020 Excalidraw. Source: `LICENSE`.

## 2. Target Audience

### Primary Users

| Segment | Use Case | Evidence |
|---------|----------|---------|
| Software engineers | Architecture diagrams, system design, technical sketching | Default tools include arrows, shapes, text; code font (Cascadia) available |
| Remote teams | Real-time collaborative brainstorming | WebSocket sync, live cursors, room sharing via link/QR |
| Educators & presenters | Illustrating concepts during lectures | Laser pointer tool, Zen mode, View mode (read-only) |
| Designers | Low-fidelity wireframing and prototyping | Frame tool, image embedding, library management |
| Third-party developers | Embedding whiteboard into own applications | React component SDK with 50+ props, UIOptions, render slots |

### Integration Users (SDK)

Developers embedding Excalidraw into:
- Documentation platforms
- Note-taking applications
- Project management tools
- Education platforms

Evidence: `ExcalidrawProps` interface in `packages/excalidraw/types.ts` exposes `renderTopLeftUI`, `renderTopRightUI`, `renderCustomStats`, `onMount`, `onChange`, `UIOptions` for deep customization.

## 3. Key Features

### 3.1. Drawing Tools

16 tools available (from `ToolType` in `packages/excalidraw/types.ts`):

| Category | Tools |
|----------|-------|
| Selection | `selection`, `lasso` |
| Shapes | `rectangle`, `diamond`, `ellipse` |
| Lines | `arrow` (straight + elbowed), `line`, `freedraw` |
| Content | `text`, `image`, `embeddable` |
| Organization | `frame`, `magicframe` |
| Utilities | `eraser`, `hand` (pan), `laser` (pointer) |

### 3.2. Element Styling

| Property | Options |
|----------|---------|
| Fill | Solid, hachure, cross-hatch, zigzag |
| Stroke | Solid, dashed, dotted |
| Stroke width | Thin, bold, extra-bold |
| Opacity | 0–100% |
| Roundness | Sharp or rounded corners |
| Arrowheads | Arrow, bar, dot, triangle |
| Fonts | 9 families: Excalifont (default hand-drawn), Virgil, Helvetica, Cascadia (code), Nunito, Lilita One, Comic Shanns, Liberation Sans, Assistant |

### 3.3. Canvas Interaction

| Feature | Details |
|---------|---------|
| Infinite canvas | Pan via hand tool, middle-click, or Space+drag |
| Zoom | 0.1x–30x range; Ctrl+scroll, pinch gesture, UI controls |
| Grid | Toggleable visual grid (`Ctrl+'`) + object snapping (`Alt+S`) |
| Undo/Redo | Delta-based (not snapshot); collaboration-safe |
| Copy/Paste | Cross-application clipboard support |
| Grouping | `Ctrl+G` / `Ctrl+Shift+G` |
| Element locking | Prevent accidental edits |
| Alignment | Horizontal and vertical distribution |
| Z-ordering | Fractional indexing for conflict-free multiplayer reordering |

### 3.4. Real-Time Collaboration

| Aspect | Implementation |
|--------|---------------|
| Transport | socket.io WebSocket (volatile events for cursors, broadcast for elements) |
| Persistence | Firebase Firestore (encrypted scene) + Cloud Storage (binary files) |
| Encryption | AES-GCM; room key in URL `#fragment` only — server never sees plaintext |
| Sharing | Clipboard, native Share API, QR code generation |
| Conflict resolution | Element `version` + `versionNonce` pair for deterministic reconciliation |
| Offline | Offline detection via `isOfflineAtom`; local state preserved |
| Sync throttle | Cursor sync at ~30fps (33ms), scene save at 300ms |
| Deleted elements | Retained for 24 hours for late-joining reconciliation |

### 3.5. Export & Import

| Format | Direction | Details |
|--------|-----------|---------|
| `.excalidraw` (JSON) | Import/Export | Full scene: elements + appState + binary files; MIME `application/vnd.excalidraw+json` |
| PNG | Export | Canvas rasterization with optional metadata embedding for round-trip |
| SVG | Export | Vector output with embedded scene data, frame clipping, font inlining |
| Library JSON | Import/Export | `excalidrawLibrary` format v1/v2 with items and metadata |

Scene metadata can be embedded in exported images, enabling re-import of the `.excalidraw` data from a PNG/SVG file.

### 3.6. Library System

- Personal library: add elements, reuse across sessions
- Drag-drop insertion onto canvas
- Multi-select with shift+click range selection
- JSON import/export of library collections
- Publishing flow: author metadata, preview image generation, item naming

### 3.7. AI Features (Beta)

| Feature | Description |
|---------|-------------|
| Text-to-Diagram | Natural language → diagram generation via TTDDialog |
| Diagram-to-Code | Diagram → code output via DiagramToCodePlugin |
| Chat interface | Conversational AI with history persistence (IndexedDB) |

Backend: configurable via `VITE_APP_AI_BACKEND` env variable.

### 3.8. UI Modes

| Mode | Trigger | Behavior |
|------|---------|----------|
| Normal | Default | Full UI with toolbars, sidebar, menus |
| Zen | `Alt+Z` | Hides all UI for distraction-free drawing |
| View | Programmatic | Read-only; disables all editing |
| Grid | `Ctrl+'` | Visual grid overlay |
| Snap | `Alt+S` | Object-to-grid/element alignment |

### 3.9. Command Palette

Trigger: `Ctrl+/` or `Ctrl+Shift+P`. Provides:
- Fuzzy search across all actions and tools
- Library item insertion by name
- Mermaid/AI integrations
- Recent command history

### 3.10. Internationalization

- 58+ languages via Crowdin localization pipeline
- Source: `packages/excalidraw/locales/en.json`
- RTL support: Arabic, Persian, Hebrew
- Inclusion threshold: 85% translation completion

### 3.11. Responsive Design

| Form Factor | Width | Panel Mode |
|-------------|-------|------------|
| Phone | ≤599px | `mobile` (collapsed) |
| Tablet | 600–1180px | `compact` |
| Desktop | >1180px | `full` / `compact` |

Touch handling: double-tap text insertion, Apple Pencil Scribble, two-finger pinch zoom.

### 3.12. PWA

- Installable via `vite-plugin-pwa` + `pwacompat`
- Display mode: `standalone` (full-screen app)
- File handler: `.excalidraw` files open in PWA
- Service worker: auto-update with Workbox caching strategies
- Precache limit: ~2.3 MB

## 4. SDK / Embedding API

### Installation

```bash
npm install react react-dom @excalidraw/excalidraw
```

Peer dependencies: React 19.x, React-DOM 19.x.

### Component Props (Key Selection)

| Category | Props |
|----------|-------|
| Data | `initialData`, `onChange`, `onExport` |
| Lifecycle | `onMount`, `onUnmount`, `onExcalidrawAPI` |
| Interaction | `onPointerUpdate`, `onPointerDown`, `onPaste`, `onDuplicate`, `onLinkOpen` |
| UI slots | `renderTopLeftUI`, `renderTopRightUI`, `renderCustomStats`, `renderEmbeddable` |
| Modes | `viewModeEnabled`, `zenModeEnabled`, `gridModeEnabled`, `objectsSnapModeEnabled` |
| Theming | `theme` (LIGHT/DARK), `langCode` |
| Config | `UIOptions`, `autoFocus`, `detectScroll`, `handleKeyboardGlobally` |
| Collaboration | `isCollaborating`, `onUserFollow` |
| Content | `validateEmbeddable`, `aiEnabled`, `showDeprecatedFonts` |

### Distribution

| Channel | Purpose |
|---------|---------|
| `@excalidraw/excalidraw` (latest) | Stable releases |
| `@excalidraw/excalidraw@next` | Pre-release builds |
| Type subpaths | `@excalidraw/excalidraw/element/types`, `@excalidraw/excalidraw/data/types` |

Self-hosting fonts: `window.EXCALIDRAW_ASSET_PATH = "/path/"`.

SSR: requires dynamic import with `{ ssr: false }` (client-only rendering).

## 5. Technical Constraints

### Browser Support

| Browser | Minimum Version |
|---------|----------------|
| Chrome | 70+ |
| Edge | 79+ (Chromium-based) |
| Safari | 12+ |
| Firefox | Modern (no explicit floor) |
| Samsung Internet | 10+ |
| Android WebView | 13+ |

Excluded: IE ≤ 11, Opera Mini, KaiOS ≤ 2.5.

Source: `browserslist` in `excalidraw-app/package.json`.

### Runtime Requirements

| Requirement | Value |
|-------------|-------|
| Node.js | ≥18.0.0 (build-time) |
| React | 19.0.0 (peer dependency) |
| Canvas API | Required — HTML Canvas 2D for rendering |
| Web Crypto API | Required — AES-GCM encryption for collaboration |
| IndexedDB | Required — local persistence (library, TTD chat) |

### Data Limits

| Constraint | Value | Source |
|------------|-------|--------|
| Max file upload | 4 MiB (4,194,304 bytes) | `app_constants.ts` |
| Max image dimension | 1440px (width or height) | `DEFAULT_MAX_IMAGE_WIDTH_OR_HEIGHT` |
| Zoom range | 0.1x – 30x | `MIN_ZOOM`, `MAX_ZOOM` in `constants.ts` |
| Save throttle | 300ms | `SAVE_TO_LOCAL_STORAGE_TIMEOUT` |
| Scene init timeout | 5000ms | `INITIAL_SCENE_UPDATE_TIMEOUT` |
| Cursor sync rate | ~30fps (33ms) | `CURSOR_SYNC_TIMEOUT` |
| Cross-tab sync | 50ms | `SYNC_BROWSER_TABS_TIMEOUT` |
| Deleted element TTL | 24 hours | `DELETED_ELEMENT_TIMEOUT` |
| Font cache TTL | 1 year (31,536,000s) | `FILE_CACHE_MAX_AGE_SEC` |

### Performance Characteristics

- **Dual canvas rendering** — static canvas (elements) re-renders only on scene change; interactive canvas (cursors, selection) re-renders every frame
- **WeakMap shape cache** — rough.js shapes cached per element reference; auto-evicted on GC
- **Code splitting** — CodeMirror (~500KB) loaded on-demand for AI features; locales split per-language; QR code generation deferred until share
- **Font subsetting** — moved to Web Workers for async processing
- **Known bottleneck** — binding calculations for large scenes (noted in TODOs)

### Security Model

| Layer | Mechanism |
|-------|-----------|
| Encryption | AES-GCM with 12-byte IV per message; key in URL `#fragment` |
| CORS | Restricted to `excalidraw.com` (production); permissive for fonts |
| Headers | `X-Content-Type-Options: nosniff`, `Referrer-Policy: origin` |
| Analytics | Opt-in only (`VITE_APP_ENABLE_TRACKING`); URL fragments stripped from Sentry payloads |
| Error tracking | Sentry (production/staging only); filters non-critical browser errors |

### Caching Strategy (PWA)

| Asset | Strategy | TTL | Max Entries |
|-------|----------|-----|-------------|
| `.woff2` fonts | CacheFirst | 90 days | 1000 |
| `fonts.css` | StaleWhileRevalidate | — | 50 |
| Locale chunks | CacheFirst | 30 days | 50 |
| Code chunks | CacheFirst | 90 days | 50 |

## 6. File Format Specification

### Scene Format (`.excalidraw`)

```typescript
{
  type: "excalidraw",
  version: number,
  source: string,
  elements: ExcalidrawElement[],
  appState: Partial<AppState>,
  files?: Record<FileId, BinaryFileData>  // local export only
}
```

- MIME type: `application/vnd.excalidraw+json`
- Encoding: UTF-8 JSON, 2-space indentation
- Binary files (images): base64-encoded, included only in local exports; stripped for database storage

### Library Format

```typescript
{
  type: "excalidrawLibrary",
  version: 1 | 2,
  source: string,
  libraryItems: LibraryItem[]
}
```

## 7. External Dependencies

### Services

| Service | Purpose | Environment |
|---------|---------|-------------|
| Firebase Firestore | Scene persistence | Dev + Production |
| Firebase Cloud Storage | Binary file storage | Dev + Production |
| socket.io server | Real-time collaboration | `localhost:3002` (dev) / `oss-collab.excalidraw.com` (prod) |
| AI backend | Text-to-diagram | `localhost:3016` (dev) / `oss-ai.excalidraw.com` (prod) |
| Sentry | Error tracking | Production + Staging |
| Simple Analytics | Usage analytics (opt-in) | Production |
| Crowdin | Translation management | CI/CD |
| Excalidraw Libraries | Community library hosting | `libraries.excalidraw.com` |

### Key Runtime Libraries

| Library | Version | Purpose |
|---------|---------|---------|
| React | 19.0.0 | UI framework |
| rough.js | 4.6.4 | Hand-drawn rendering |
| Jotai | 2.11.0 | Atomic state management |
| socket.io-client | 4.7.2 | WebSocket transport |
| Firebase | 11.3.1 | Cloud persistence |
| fractional-indexing | 3.2.0 | Conflict-free z-ordering |
| pwacompat | 2.0.17 | PWA compatibility layer |

## 8. Deployment Targets

| Target | Configuration | Output |
|--------|---------------|--------|
| Vercel | `vercel.json` — CORS headers, redirects, font caching | `excalidraw-app/build/` |
| Docker | Node 18 build → Nginx 1.27-alpine serve | Port 3000 (80 internal) |
| npm | `@excalidraw/excalidraw` — ESM + CJS dual export | Embeddable package |
