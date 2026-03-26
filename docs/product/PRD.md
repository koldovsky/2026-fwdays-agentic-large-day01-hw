# Product Requirements Document: Excalidraw

_Reverse-engineered from codebase analysis. Reflects state as of 2026-03-25 (v0.18.0 released, unreleased changes on master)._

---

## 1. Purpose

Excalidraw is a **free, open-source, browser-based collaborative whiteboard** for creating hand-drawn-style diagrams. It ships in two forms:

- **excalidraw.com** — hosted SaaS product with real-time collaboration rooms, end-to-end encryption, and cloud persistence
- **`@excalidraw/excalidraw`** — publishable React component (npm, ESM-only) for embedding in third-party applications

### Problem Statement

Traditional diagramming tools (Visio, Lucidchart, draw.io) are heavyweight, require installation or accounts, and impose visual formalism that slows down early-stage ideation. Excalidraw provides a zero-friction alternative:

| Problem | How Excalidraw Solves It |
|---------|--------------------------|
| Complex tools too slow for quick sketches | Minimal UI, instant canvas — no sign-up required |
| "Perfect" diagrams discourage early ideation | Hand-drawn aesthetic signals "work in progress" |
| File-based collaboration causes merge conflicts | Live multiplayer with version-based reconciliation |
| Vendor lock-in with proprietary formats | Open `.excalidraw` JSON format, SVG/PNG export |
| Hard to embed whiteboards in other apps | `@excalidraw/excalidraw` npm package with full API |
| Whiteboard tools don't work offline | PWA with local persistence (localStorage + IndexedDB) |
| Diagramming from structured data is tedious | Mermaid-to-Excalidraw conversion, spreadsheet-to-chart |

---

## 2. Target Audience

| Segment | Primary Use Case |
|---------|-----------------|
| Software engineers | Architecture diagrams, system design sketches, ADRs, ER diagrams |
| Designers | Low-fidelity wireframes, user flows, quick mockups |
| Teams in meetings | Real-time collaborative brainstorming on a shared canvas |
| Presenters | Live drawing with laser pointer tool, zen mode for distraction-free delivery |
| Educators | Explanatory drawings, class diagrams, visual teaching aids |
| Third-party developers | Embedding a whiteboard component in their own products via npm |

All segments share a common trait: they need to **communicate visually** without investing time in learning a complex tool.

---

## 3. Key Features

### 3.1 Drawing Tools & Element Types

**12 user-facing element types** (plus 1 internal `selection` type):

| Element Type | Description |
|-------------|-------------|
| `rectangle` | Basic rectangular shape; also serves as text container and flowchart node |
| `diamond` | Diamond/rhombus shape; flowchart decision node |
| `ellipse` | Ellipse/circle shape; flowchart node |
| `line` | Straight or multi-point line |
| `arrow` | Connectable arrow with subtypes: sharp, curved, and elbow (orthogonal routing with smart binding) |
| `text` | Text element with wrapping support; can be bound to shape containers |
| `freedraw` | Freehand pen strokes rendered via `perfect-freehand` |
| `image` | Embedded images with crop and resize functionality |
| `frame` | Grouping frame for organizing content on the canvas |
| `magicframe` | AI-enhanced frame element for generative features |
| `iframe` | Internal iframe for embedded content |
| `embeddable` | External embeddable content (e.g., Giphy, web content) with URL validation |

**Arrow notation**: Standard arrowheads plus **crowfoot notation** for ER diagrams (as of 0.18.0).

**Additional tools** (not element types):
- **Eraser** — remove elements by stroke
- **Hand tool** — pan canvas without selection
- **Laser pointer** — temporary highlight for presentations
- **Lasso selection** — freehand multi-element selection
- **Tool lock** (`Q`) — keep a tool active across multiple placements

### 3.2 Hand-Drawn Aesthetic

All shapes are rendered via **Rough.js** onto an HTML5 `<canvas>`, producing an intentionally imprecise, sketch-like appearance. Three roughness levels (soft, medium, hard) control the sketch intensity. This is a deliberate UX choice: the visual style signals "work in progress" and reduces formalism anxiety, encouraging early-stage ideation.

### 3.3 Text-to-Diagram & AI Features

- **Mermaid-to-Excalidraw conversion**: Paste Mermaid syntax and auto-convert to visual elements. Supports 20+ Mermaid chart types including flowchart, sequenceDiagram, classDiagram, stateDiagram, erDiagram, gantt, pie, mindmap, timeline, gitGraph, and more.
- **Text-to-Diagram dialog** (`TTDDialog`): UI for creating diagrams from text descriptions
- **MagicFrame**: AI-enhanced frame element type for generative diagram features
- **Diagram-to-Code plugin** (`DiagramToCodePlugin`): Converts canvas diagrams to HTML output
- **AI toggle**: `aiEnabled` prop (defaults to `true`) controls availability of AI features
- **OpenAI integration types**: Typed interfaces for GPT-4/GPT-3.5-turbo chat completions with streaming support

### 3.4 Spreadsheet & Chart Support

- **Spreadsheet parsing**: `tryParseSpreadsheet()` detects tabular data from paste
- **Chart rendering**: `renderSpreadsheet()` converts parsed data to chart elements
- **Validation**: `isSpreadsheetValidForChartType()` checks data compatibility

### 3.5 Real-Time Collaboration

- Share a room link — co-editors join instantly, no account required
- Changes sync via **Socket.io** WebSocket rooms
- Conflict resolution uses a **version + versionNonce** system per element — higher version wins; ties broken by nonce
- Full scene sync every 20 seconds (`SYNC_FULL_SCENE_INTERVAL_MS = 20000`), incremental updates on changes
- **Multiplayer undo/redo** preserves individual user history across shared sessions (as of 0.18.0)
- **End-to-end encryption**: AES-GCM symmetric encryption via Web Crypto API; encryption key is part of the URL fragment (never sent to server)
- Firebase persists room data server-side

### 3.6 Export / Import

| Format | Direction | Notes |
|--------|-----------|-------|
| PNG | Export | Scene data embedded in PNG metadata (recoverable via re-import) |
| SVG | Export | Font subsetting included for self-contained output |
| JSON (`.excalidraw`) | Export + Import | Open format, human-readable |
| Clipboard | Export | Copy as PNG or JSON data |
| Image / JSON | Import | Drag-and-drop or file picker |
| Library (`.excalidrawlib`) | Export + Import | Reusable element collections |
| Mermaid | Import | Auto-detection and conversion on paste |

### 3.7 Library System

- Save and reuse element groups as **library items** (`.excalidrawlib` format)
- Items have published/unpublished status, name, creation timestamp
- Shared library ecosystem via `excalidraw.com` and `raw.githubusercontent.com/excalidraw/excalidraw-libraries`
- `LibraryPersistenceAdapter` interface for custom storage backends
- `onLibraryChange` callback for host app integration

### 3.8 View Modes

- **View mode** (`viewModeEnabled`) — fully read-only, all editing disabled; intended for consumer embedding
- **Zen mode** (`zenModeEnabled`) — hides all UI chrome for distraction-free drawing or presentation
- **Grid mode** (`gridModeEnabled`) — snaps elements for precise alignment
- **Object snap mode** — snap elements to other elements' edges and centers

### 3.9 Canvas Navigation & Interaction

- **Scene search** (`Ctrl/Cmd+F`) — find elements by content across the canvas (as of 0.18.0)
- **Command palette** (`Ctrl/Cmd+/` or `Ctrl/Cmd+Shift+P`) — searchable action menu (as of 0.18.0)
- **Element linking** (`Ctrl/Cmd+K`) — attach hyperlinks to elements (as of 0.18.0)
- **Element locking** (`Ctrl/Cmd+Shift+L`) — prevent accidental modification
- **Grouping** (`Ctrl/Cmd+G`) and ungrouping
- **Z-order control** — send backward/forward, send to back/bring to front
- **Zoom controls** — zoom to fit, zoom to selection, reset zoom
- **Copy/paste styles** — transfer visual properties between elements
- **Editable element stats panel** — modify element properties numerically (as of 0.18.0)
- **Extensive keyboard shortcuts** — 40+ shortcuts covering all major operations

### 3.10 Localization

40+ language localizations via i18next. Locale files are code-split at build time (only `en.json` is eagerly loaded). CJK (Chinese, Japanese, Korean) fonts supported as of 0.18.0 with on-demand font loading.

### 3.11 Offline & PWA

- Progressive Web App with Service Worker and precaching
- Scene auto-saved to **localStorage** and **IndexedDB**
- Full offline functionality for single-user use; collaboration requires network

### 3.12 Embeddable React Component

The `@excalidraw/excalidraw` npm package allows third-party developers to embed the full editor:

```tsx
import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";

<div style={{ height: "500px" }}>
  <Excalidraw />
</div>
```

**Props API** (key props from `ExcalidrawProps`):

| Category | Props |
|----------|-------|
| Lifecycle | `onExcalidrawAPI`, `onMount`, `onInitialize`, `onUnmount` |
| Data flow | `initialData`, `onChange`, `onIncrement` |
| Modes | `viewModeEnabled`, `zenModeEnabled`, `gridModeEnabled`, `isCollaborating` |
| Events | `onPointerUpdate`, `onPointerDown`, `onPointerUp`, `onScrollChange`, `onPaste`, `onDuplicate`, `onLinkOpen` |
| UI customization | `renderTopLeftUI`, `renderTopRightUI`, `renderCustomStats`, `renderEmbeddable`, `renderScrollbars`, `UIOptions` |
| Configuration | `theme`, `langCode`, `name`, `autoFocus`, `detectScroll`, `handleKeyboardGlobally` |
| Features | `aiEnabled`, `showDeprecatedFonts`, `onExport`, `validateEmbeddable` |
| Library | `onLibraryChange`, `libraryReturnUrl` |
| Integration | `generateIdForFile`, `generateLinkForSelection` |

**Imperative API** (`ExcalidrawAPI`):
- Scene management: `updateScene()`, `resetScene()`, `getSceneElements()`, `getAppState()`, `getFiles()`
- Element operations: `mutateElement()`, `applyDeltas()`, `scrollToContent()`
- UI control: `setActiveTool()`, `setCursor()`, `toggleSidebar()`, `setToast()`
- Subscriptions: `onChange()`, `onIncrement()`, `onPointerDown/Up()`, `onScrollChange()`, `onUserFollow()`, `onStateChange()`, `onEvent()`
- Extensibility: `registerAction()`, `updateLibrary()`, `addFiles()`, `updateFrameRendering()`

**Exported UI components**: `Sidebar`, `Button`, `Footer`, `MainMenu`, `WelcomeScreen`, `LiveCollaborationTrigger`, `Stats`, `DefaultSidebar`, `TTDDialog`, `TTDDialogTrigger`, `CommandPalette`, `DiagramToCodePlugin`

**Exported hooks**: `useExcalidrawAPI()`, `useEditorInterface()`, `useExcalidrawStateValue()`, `useOnExcalidrawStateChange()`, `useStylesPanelMode()`

**Context provider**: `ExcalidrawAPIProvider` — enables sibling component access to editor state without prop drilling.

---

## 4. Technical Limitations

### 4.1 Browser Compatibility

Production browser targets (from `browserslist`):
- **Excluded**: IE <= 11, Safari < 12, Chrome < 70, Edge < 79, Opera Mini, KaiOS <= 2.5, UC Browser < 13, Samsung < 10
- **Supported**: >0.2% market share browsers that pass the above filters

React peer dependency: **React 17.x, 18.x, or 19.x** (with matching react-dom).

### 4.2 Client-Side Only Rendering

All drawing happens on the HTML5 Canvas API — no DOM elements for shapes. This means:
- **No SSR rendering of canvas content** — the component must be rendered client-side only
- In Next.js, must use `dynamic(..., { ssr: false })`
- No `window`/`document` access at module load time in the library packages
- No server-side image generation or thumbnail creation out of the box

### 4.3 Module System Constraints

- **ESM only** — UMD bundle deprecated as of 0.18.0; no CommonJS fallback
- CRA (Create React App) users: ESM strict resolution breaks without ejecting or using craco
- Webpack users: must set `resolve.fullySpecified: false` for ESM imports
- TypeScript `"moduleResolution": "node"` / `"node10"` no longer supported — use `"bundler"`, `"node16"`, or `"nodenext"`
- Fonts auto-load from CDN by default; self-hosting requires `window.EXCALIDRAW_ASSET_PATH` configuration

### 4.4 Collaboration Architecture

- Collaboration rooms are **excalidraw-app only** — the `@excalidraw/excalidraw` library has **no built-in collaboration transport**
- The library has **no Firebase or Socket.io dependency** by design; third-party embedders must build their own sync layer
- Conflict resolution relies on each element carrying a `version` counter — direct element mutation (bypassing `newElementWith()`) breaks versioning and causes collaboration data loss
- E2E encryption is implemented at the app layer, not the library layer

### 4.5 Scale & Persistence

- No user accounts in the base product — rooms are ephemeral links with no access control (anyone with the link can edit)
- Room data is persisted in Firebase Firestore; storage and bandwidth limits apply
- Large scenes with many high-resolution images may hit Firebase storage limits
- **Scene growth**: deleted elements remain in the scene with `isDeleted: true` and are never compacted automatically — long-lived collaborative scenes accumulate tombstones over time
- Z-order uses fractional indexing (`index` field) for stability across peers — direct array reordering is not safe

### 4.6 Font Handling

- Custom fonts are embedded at export time via font subsetting (SVG export)
- CJK character sets are large; CJK font loading adds non-trivial download weight on first use
- Locale files are code-split, but font assets are loaded on demand from CDN (or self-hosted path)

### 4.7 Element Model Constraints

- Elements are **immutable** — mutations must go through `newElementWith()`; this is a hard architectural constraint enforced by collaboration versioning
- **No vector path editing** — shapes cannot be edited at the path/curve level after creation
- Element types are fixed — no plugin system for custom element types
- Bound text (text inside shapes) has container coupling constraints; container deletion removes bound text

### 4.8 AI Feature Limitations

- AI features (Text-to-Diagram, MagicFrame, DiagramToCode) require external API integration — no bundled LLM
- OpenAI integration types are defined but the actual API key/connection must be provided by the host application
- MagicFrame is present in the type system but has limited standalone functionality without AI backend integration

---

## 5. Boundary: Library vs. Hosted App

| Capability | Library (`packages/`) | Hosted App (`excalidraw-app/`) |
|------------|:--------------------:|:-----------------------------:|
| Core editor and all drawing tools | Yes | Yes |
| Element types (all 12) | Yes | Yes |
| Export/Import (PNG, SVG, JSON) | Yes | Yes |
| Library system | Yes | Yes |
| Mermaid conversion | Yes | Yes |
| AI/TTD dialog components | Yes (UI only) | Yes (with backend) |
| Encryption utilities | Yes | Yes |
| i18n (40+ languages) | Yes | Yes |
| Firebase auth/DB/storage | No | Yes |
| Socket.io collaboration rooms | No | Yes |
| Share link generation | No | Yes |
| E2E encrypted room sync | No | Yes |
| Sentry error tracking | No | Yes |
| PWA + Service Worker | No | Yes |

Third-party embedders using `@excalidraw/excalidraw` get everything in the "Library" column and must implement the "Hosted App" capabilities themselves if needed.
