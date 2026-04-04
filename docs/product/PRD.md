# Product Requirements Document — Excalidraw

**Type:** Reverse-engineered PRD
**Source:** `packages/excalidraw/types.ts`, `packages/common/src/constants.ts`,
`excalidraw-app/`, `.env.development`, `packages/excalidraw/index.tsx`

---

## 1. Product Purpose

Excalidraw is an open-source virtual whiteboard for sketching diagrams in a hand-drawn style.
It ships both as a standalone web app (`excalidraw.com`) and as an embeddable React library
(`@excalidraw/excalidraw`) that developers can drop into any product.
The core value proposition: lower the barrier to visual communication by making imperfect,
sketch-style drawings feel intentional — no design skills required.

---

## 2. Target Audience

### End Users
- **Individual knowledge workers** — engineers, designers, PMs who need quick diagrams
  without launching Figma or Miro
- **Teams in real-time meetings** — collaborative whiteboarding during remote calls
  (laser pointer tool, live cursors, idle detection via `UserIdleState`)
- **Presenters** — zen mode + laser tool for distraction-free presentations
- **Students & educators** — free, zero-signup, works offline (PWA)

### Developers / Integrators
- **Product teams** embedding a drawing surface into their SaaS
  (note-taking apps, wikis, project tools)
- **Open-source contributors** extending the core library

### Signals from code:
```typescript
// packages/excalidraw/types.ts — ExcalidrawProps
viewModeEnabled?: boolean      // read-only embed
renderTopRightUI?              // custom host UI injection
UIOptions?.canvasActions       // hide/show menu items per host product
onLibraryChange?               // sync library to host storage
```

---

## 3. Key Features

### 3.1 Drawing Tools (16 types)
Verified from `TOOL_TYPE` constant (`packages/common/src/constants.ts:447`):

| Tool | Type | Notes |
|---|---|---|
| Selection | `selection` | Multi-select, resize, rotate |
| Lasso | `lasso` | Free-form selection area |
| Rectangle | `rectangle` | Rounded corners via `roundness` |
| Diamond | `diamond` | |
| Ellipse | `ellipse` | |
| Arrow | `arrow` | Sharp / round / elbow types |
| Line | `line` | Multi-point click-by-click |
| Freedraw | `freedraw` | Smooth strokes via `perfect-freehand` |
| Text | `text` | Inline WYSIWYG editor |
| Image | `image` | Paste / drag-drop, stored as `BinaryFiles` |
| Frame | `frame` | Named container with clip region |
| Embeddable | `embeddable` | Embed iframes (YouTube, Figma, etc.) |
| Eraser | `eraser` | Animated erase trail |
| Hand | `hand` | Pan canvas without accidentally drawing |
| Laser | `laser` | Presentation pointer with animated trail |

### 3.2 Hand-drawn Aesthetic
- RoughJS (`roughjs@4.6.4`) renders shapes with controlled randomness via `element.seed`
- `element.roughness` (0–2) controls how "sketchy" each element looks
- `element.seed` is fixed per element — same shape renders identically across sessions

### 3.3 Real-time Collaboration
- Socket.io (`socket.io-client@4.7.2`) for live sync
- Firebase (`firebase@11.3.1`) for scene persistence
- Each collaborator: `Collaborator { pointer, username, color, userState, isInCall, isSpeaking }`
- Conflict resolution: `element.version` + `element.versionNonce` for reconciliation
- Fractional indexing (`element.index`) for z-order consistency across clients

### 3.4 Export
Verified from `packages/utils/src/export.ts` and `ExcalidrawProps`:

| Format | API | Notes |
|---|---|---|
| PNG | `exportToBlob()` | `exportScale` 1x / 2x / 3x |
| SVG | `exportToSvg()` | Fully vector, fonts inlined |
| Canvas | `exportToCanvas()` | Raw `HTMLCanvasElement` |
| Clipboard | `exportToClipboard()` | Paste into Figma, Notion, Slides |
| JSON | `serializeAsJSON()` | `.excalidraw` file, full round-trip |

### 3.5 Library (Reusable Templates)
- `LibraryItem { id, status: "published"|"unpublished", elements, created }`
- Stored in `IndexedDB` via `data/library.ts`
- Shareable as `.excalidrawlib` files
- Public library: `https://libraries.excalidraw.com`

### 3.6 Progressive Web App (Offline)
- Service worker: `public/service-worker.js`
- PWA install prompt via `beforeinstallprompt` event
- Fonts cached in IndexedDB for offline rendering
- `VITE_APP_ENABLE_PWA` flag in `.env.development`

### 3.7 Adaptive UI (3 form factors)
Verified from `packages/common/src/editorInterface.ts`:

| Form factor | Breakpoint | UI behavior |
|---|---|---|
| `phone` | width ≤ 599px or landscape < 500×1000 | Bottom toolbar, compact properties |
| `tablet` | 600–1180px (up to iPad Air) | Sidebar docked by breakpoint |
| `desktop` | > 1180px | Full sidebar, `compact`/`full` mode toggle |

### 3.8 Embeddable React Component
```typescript
// Minimal integration
import { Excalidraw } from "@excalidraw/excalidraw";
<Excalidraw onChange={(elements, appState) => persist(elements)} />
```
Customization surface: `viewModeEnabled`, `zenModeEnabled`, `gridModeEnabled`,
`UIOptions`, `renderTopLeftUI`, `renderTopRightUI`, `onDuplicate`, `onPaste`.

### 3.9 Keyboard-first Workflow
All 16 tools have single-key shortcuts. Full list in `HelpDialog.tsx`.
`handleKeyboardGlobally` prop controls whether shortcuts fire outside the canvas.

### 3.10 Undo / Redo with Collaboration Safety
- `HistoryDelta extends StoreDelta` — diff-based, not snapshot-based
- `CaptureUpdateAction.NEVER` for remote updates — they never pollute the local undo stack
- `element.version` excluded from undo apply — each undo is treated as a new user action

---

## 4. Non-goals / Technical Constraints

### 4.1 Not a vector design tool
- No bezier curve editing, no path boolean operations
- No pixel-level image editing
- Elements are intentionally simple: position, size, angle, color, roughness

### 4.2 No server-side rendering support
- `polyfill()` runs at import time with browser APIs (`navigator`, `document`)
- Canvas rendering requires browser `CanvasRenderingContext2D`
- SSR integration requires wrapping in dynamic import with `ssr: false`

### 4.3 No persistent backend in the library
- `@excalidraw/excalidraw` has no built-in persistence
- Storage is the host app's responsibility (`onChange` callback)
- Collaboration server is separate (`excalidraw-room`, not included in the package)

### 4.4 Immutable element model — no computed layout
- `ExcalidrawElement` is JSON-serializable with no computed fields
- No auto-layout, no constraints between elements (except arrow binding)
- Arrow binding (`FixedPointBinding`) is the only relational constraint

### 4.5 React-only
- The library requires React 17, 18, or 19 as a peer dependency
- No Vue, Angular, or Web Component wrappers in this repository

### 4.6 Single-canvas architecture limits very large scenes
- `isElementInFrame()` is a known bottleneck for large scenes
  (`packages/element/src/frame.ts:752` — TODO comment by authors)
- Snapping (`snapping.ts:44`) has a hardcoded element limit with a TODO to increase
- No virtualization — all non-deleted elements are passed to the renderer

### 4.7 No offline collaboration
- Real-time sync requires an active Socket.io connection
- Offline edits are local only; merge on reconnect is not implemented

### 4.8 localStorage quota risk
- App state and scene are persisted to `localStorage`
- Large scenes can exceed browser storage limits
- `localStorageQuotaExceededAtom` shows a warning in UI when exceeded
  (`excalidraw-app/App.tsx:1027`)

---

## 5. Success Metrics (inferred from code)

| Signal | Code evidence |
|---|---|
| Collaboration adoption | `isCollaborating` prop, `Collaborator.userState` idle detection |
| Export usage | `trackEvent` in `actionExport.tsx` with category `"export"` |
| Tool usage | `trackEvent` per action with `category: "toolbar" \| "element"` |
| Library engagement | `LibraryItem.status: "published"` — public sharing funnel |
| PWA install | `beforeinstallprompt` handler in `excalidraw-app/App.tsx` |
| Mobile reach | `editorInterface.formFactor` detection logged in action tracking |

---

*Sources: `packages/excalidraw/types.ts`, `packages/common/src/constants.ts`,
`packages/common/src/editorInterface.ts`, `packages/element/src/types.ts`,
`packages/utils/src/export.ts`, `excalidraw-app/App.tsx`, `.env.development`*
