# Excalidraw — Reverse-Engineered Product Requirements Document

> Reconstructed from source code analysis of the Excalidraw monorepo (v0.18.0).

---

## 1. Product Purpose

Excalidraw is an open-source, browser-based virtual whiteboard that produces drawings with a hand-drawn, sketchy aesthetic. It serves both as a standalone web app (excalidraw.com) and as an embeddable React component library (`@excalidraw/excalidraw`) for third-party integration.

The core value proposition: **lower the barrier to visual communication** by removing the pressure to create polished diagrams — everything looks intentionally informal.

---

## 2. Target Audience

| Segment | Use Case |
|---------|----------|
| Software engineers | Architecture diagrams, system design, whiteboarding |
| Product / design teams | Wireframes, user flows, brainstorming |
| Educators & students | Explanations, visual notes, collaborative exercises |
| Anyone in a meeting | Ad-hoc sketching, real-time visual collaboration |
| Third-party developers | Embedding a drawing canvas in their own React apps |

---

## 3. Key Features

### 3.1 Drawing Tools

16 tools available via `TOOL_TYPE` constants:

| Tool | Description |
|------|-------------|
| selection | Default pointer for selecting/manipulating elements |
| lasso | Freeform area selection |
| rectangle, diamond, ellipse | Basic geometric shapes |
| arrow, line | Connectors with configurable arrowheads (sharp, round, elbow) |
| freedraw | Freehand strokes via `perfect-freehand` |
| text | Click-to-create text elements |
| image | Insert raster images from file or clipboard |
| eraser | Remove elements by painting over them |
| hand | Pan the canvas without interacting with elements |
| frame | Named container for grouping elements |
| magicframe | AI-powered frame that generates content |
| embeddable | Embed external URLs via iframe |
| laser | Presentation pointer with fading trail |

### 3.2 Element System

All canvas objects are typed variants of `ExcalidrawElement`:
- Shapes: rectangle, diamond, ellipse
- Connectors: line, arrow (with binding to shapes)
- Content: text (standalone or bound to shapes), image, iframe, embeddable
- Containers: frame, magicframe
- Drawing: freedraw

Each element carries: position, dimensions, rotation, style properties, version/versionNonce (for sync), fractional index (for ordering), groupIds, frameId, and optional hyperlink.

### 3.3 Styling

| Property | Options |
|----------|---------|
| Fill style | Hachure, cross-hatch, solid, zigzag |
| Stroke style | Solid, dashed, dotted |
| Stroke width | Thin (1), bold (2), extra-bold (4) |
| Roughness | Architect (clean), artist (slightly rough), cartoonist (very rough) |
| Opacity | 0–100% |
| Fonts | Excalifont, Virgil, Cascadia, Nunito, Lilita One, Comic Shanns, Liberation Sans, Helvetica, Assistant |

### 3.4 Real-Time Collaboration

- WebSocket-based sync via Socket.IO
- End-to-end encryption (AES-GCM) — server never sees plaintext
- Share link format: `#room=[roomId],[roomKey]` (key in fragment only)
- Multi-user cursors with names, avatars, and color coding
- User presence states: active, away, idle
- Follow mode — track another user's viewport
- Version-based element reconciliation for conflict resolution
- Firebase for file persistence and room data
- Cross-tab sync via BroadcastChannel

### 3.5 Export & Import

**Export formats:**
- PNG (with configurable scale: 1x, 2x, 3x)
- SVG (with embedded fonts)
- Clipboard (copy to system clipboard)
- Excalidraw JSON (`.excalidraw` file format)

**Import formats:**
- `.excalidraw` files
- PNG with embedded Excalidraw metadata
- Paste from clipboard (images, text, Excalidraw data)

**Programmatic API:** `exportToCanvas()`, `exportToSvg()`, `exportToBlob()`, `serializeAsJSON()`, `loadFromBlob()`

### 3.6 Library System

- Save reusable element groups as library items
- Persist libraries in IndexedDB
- Import libraries from URL (GitHub, excalidraw.com)
- Searchable library sidebar with tabs
- Merge/dedup logic for combining libraries

### 3.7 AI Features

- **Text-to-Diagram (TTD):** Convert natural language or Mermaid syntax to Excalidraw elements
- **Mermaid support:** Flowcharts, sequence diagrams, class diagrams, ER diagrams
- **Magic Frame:** AI-powered content generation within a frame
- **Diagram-to-Code:** Convert drawn diagrams to code representations
- Powered by configurable AI backend (`VITE_APP_AI_BACKEND`)

### 3.8 PWA & Offline

- Installable as desktop/mobile app
- Service worker with Workbox caching strategies
- Offline-capable after first load
- File handler registration for `.excalidraw` files
- Web Share Target support
- Auto-update strategy (silent background update)

### 3.9 Developer API (Library Mode)

The `@excalidraw/excalidraw` package exposes:
- `<Excalidraw>` React component with 50+ configurable props
- `ExcalidrawImperativeAPI`: `updateScene()`, `applyDeltas()`, `mutateElement()`, `scrollToContent()`, `resetScene()`
- Callbacks: `onChange`, `onPointerDown`, `onPointerUp`, `onScrollChange`, `onLinkOpen`
- Renderable UI slots: `renderTopRightUI`, `renderSidebar`, `renderEmbeddable`
- Full TypeScript types for all elements and state

---

## 4. Non-Goals & Constraints

| What Excalidraw does NOT do | Reason |
|-----------------------------|--------|
| Server-side rendering (SSR) | Canvas API and Web APIs are browser-only |
| Persistent user accounts | Privacy-first design; anonymous Firebase auth only |
| Server-side search of shared content | E2E encryption makes server-side indexing impossible |
| Version history / branching of drawings | Out of scope; focus is real-time, not async workflows |
| Role-based access control | No user identity system to anchor permissions to |
| Backend image rendering | All rendering is client-side via HTML Canvas + Rough.js |
| Real-time audio/video | Metadata flags exist but no A/V implementation |
| Server-side diagram recovery | If share URL is lost, encrypted content is unrecoverable |

---

## 5. Technical Constraints

- **Client-only rendering:** All drawing happens on HTML5 Canvas via Rough.js
- **Browser requirements:** Modern browsers with Canvas 2D, crypto.subtle, Service Workers
- **Monorepo:** 5 packages (`common`, `element`, `math`, `utils`, `excalidraw`) + app
- **State management:** Jotai atoms with ESLint-enforced wrapper pattern
- **Bundle size:** Monitored via `size-limit`; CodeMirror and Mermaid are lazy-loaded chunks
- **Self-hosting:** Requires own Firebase project + CDN for fonts (`EXCALIDRAW_ASSET_PATH`)

---

## 6. Quality Attributes

| Attribute | Implementation |
|-----------|---------------|
| Performance | Two-layer canvas (static + interactive), throttled rendering, fractional indexing |
| Privacy | E2E encryption, no cookies/fingerprinting analytics (Simple Analytics), key never leaves URL fragment |
| Accessibility | Radix UI primitives for popovers/tooltips, keyboard shortcuts, command palette |
| Reliability | Sentry error tracking (production), TopErrorBoundary for React errors, graceful Firebase degradation |
| Offline-first | PWA with Workbox caching, localStorage + IndexedDB persistence |
| Internationalization | i18next with browser language detection, 30+ locales via Crowdin |
