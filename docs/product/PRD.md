# Product Requirements Document — Excalidraw

> **Type:** Reverse-Engineered PRD
> **Source version:** `@excalidraw/excalidraw` 0.18.0 / `excalidraw-app` 1.0.0
> **Date:** 2026-03-25

---

## 1. Product Overview

### 1.1 Vision

Excalidraw is a zero-friction virtual whiteboard that lets anyone sketch diagrams with a hand-drawn aesthetic. The product removes psychological barriers to ideation: nothing looks "too polished to change," and nothing requires an account or a tutorial to start.

### 1.2 Mission Statement

> Make collaborative visual thinking as effortless as grabbing a marker and a whiteboard — anywhere, on any device, for anyone.

### 1.3 Product Forms

| Form | Description |
|---|---|
| **excalidraw.com** | Hosted web SPA — open URL, draw, share |
| **`@excalidraw/excalidraw` npm package** | Embeddable React component for third-party products |
| **Self-hosted Docker** | For teams requiring data sovereignty |

---

## 2. Goals & Success Metrics

### 2.1 Business Goals

1. Be the default open-source whiteboard component embedded in developer tools (VS Code extensions, Notion-like apps, documentation platforms).
2. Drive adoption of excalidraw.com as a frictionless entry point that converts users to embedded-library consumers.
3. Maintain MIT-licensed open-source status to maximize ecosystem integration.

### 2.2 Product Goals

| Goal | Signal |
|---|---|
| Zero time-to-first-draw | Canvas is interactive within 2 s on cold load |
| One-click collaboration | Share link = active encrypted session, no login |
| Embeddability | Library published on npm, SSR-safe, tree-shakeable |
| Offline-first | Full functionality available without network (PWA) |
| Internationalization | 80+ locales, lazy-loaded, community-maintained |

---

## 3. Target Audience

### 3.1 Primary Segments

#### A. Knowledge Workers & Teams

- **Who:** Engineers, designers, PMs, consultants doing remote/async work
- **Jobs to be done:**
  - Quickly sketch a system architecture to send to a teammate
  - Run a whiteboard session during a video call
  - Leave a visual comment on a technical RFC
- **Pain points with alternatives:** Figma requires design knowledge; Miro requires a subscription and onboarding; pen-and-paper can't be shared digitally
- **Key needs:** Speed, shareability, no account

#### B. Software Engineers (library consumers)

- **Who:** React developers building documentation tools, note-taking apps, coding environments
- **Jobs to be done:**
  - Embed a whiteboard into their product without building one
  - Control the canvas programmatically (load data, observe changes, export)
- **Key needs:** Clean API, TypeScript types, SSR compatibility guidance, stable versioning

#### C. Self-Hosters / DevOps

- **Who:** Security-conscious teams, enterprises, open-source communities
- **Jobs to be done:** Run Excalidraw on their own infrastructure with their own Firebase/socket backend
- **Key needs:** Docker support, configurable environment variables, clear deployment docs

### 3.2 Secondary Segments

- **Educators / Students** — diagrams for teaching and note-taking
- **Technical writers** — lightweight diagrams for documentation (exports to PNG/SVG)
- **Open-source contributors** — the project is community-driven; contributors are also users

---

## 4. Key Features

### 4.1 Core Drawing

| Feature | Description |
|---|---|
| Shapes | Rectangle, diamond, ellipse, line, arrow, text, freehand |
| Freehand strokes | Pressure-sensitive via Perfect-freehand |
| Hand-drawn aesthetic | Roughness control via Rough.js |
| Styling | Stroke color/width, fill color/style, opacity, roundness |
| Typography | 3 font families (Virgil, Cascadia, Assistant); alignment, size |
| Images | Embed raster images; crop; resize |
| Frames | Named containers for grouping canvas regions |
| Element linking | Hyperlinks on any element |
| Locking | Prevent accidental edits to finished elements |
| Snapping | Smart alignment guides: point, gap, pointer |
| Grid mode | Snap-to-grid for precise layouts |

### 4.2 Collaboration

| Feature | Description |
|---|---|
| Live sessions | Real-time multi-user editing via Socket.IO |
| Encrypted sharing | Session key embedded in URL hash; never sent to server |
| Cursor presence | See collaborator pointers and selections |
| Laser pointer | Presentation-mode cursor for remote walkthroughs |
| Conflict resolution | CRDT-based reconciliation of concurrent changes |
| Collaborator count | Live indicator of active participants |

### 4.3 Export & Import

| Feature | Formats |
|---|---|
| Export | PNG (with embedded scene metadata), SVG, JSON |
| Import | JSON, clipboard paste, Mermaid diagram syntax |
| Clipboard | Copy/paste elements with full fidelity |
| PNG metadata | Scene data embedded in PNG; re-importable |

### 4.4 AI Features

| Feature | Description |
|---|---|
| Text-to-Diagram (TTD) | Describe a diagram in natural language → Excalidraw elements (OpenAI GPT-4) |
| Mermaid import | Convert Mermaid syntax to editable elements (`@excalidraw/mermaid-to-excalidraw`) |
| Magic Frame | AI-assisted frame element generation |
| Vision support | OpenAI image input for diagram-from-screenshot workflows |

### 4.5 Library System

| Feature | Description |
|---|---|
| Stencil library | Save grouped elements for reuse |
| Library sharing | Publish/import via shareable URL tokens |
| Custom persistence | `LibraryPersistenceAdapter` interface for custom backends |

### 4.6 Accessibility & UX Modes

| Feature | Description |
|---|---|
| Command palette | Keyboard-searchable access to all actions |
| Zen mode | Hides all UI chrome for focused drawing |
| View mode | Read-only canvas for presentation/embedding |
| Dark/light theme | System-preference aware, manually overridable |
| Keyboard shortcuts | Full keyboard navigation and action bindings |
| 80+ locales | i18next with lazy-loaded language bundles |

### 4.7 Embeddable Component API

**Component props (selection):**

| Prop | Purpose |
|---|---|
| `initialData` | Pre-populate canvas with elements and app state |
| `onChange` | Observe element and state changes |
| `renderTopRightUI` / `renderTopLeftUI` | Inject custom toolbar buttons |
| `isCollaborating` | Toggle collaboration mode |
| `viewModeEnabled` / `zenModeEnabled` / `gridModeEnabled` | UI mode flags |
| `theme` | `"light"` \| `"dark"` |
| `langCode` | Override locale |
| `validateEmbeddable` / `renderEmbeddable` | Custom iframe embedding |

**Imperative API (via ref):**

| Method | Purpose |
|---|---|
| `updateScene()` | Programmatically push elements or app state |
| `getSceneElementsAsJSON()` | Serialize current canvas |
| `getAppState()` | Read current UI state snapshot |
| `importLibrary()` / `resetLibrary()` | Manage element library |

**Utility package (`@excalidraw/utils`):**

| Function | Output |
|---|---|
| `exportToCanvas()` | `HTMLCanvasElement` |
| `exportToBlob()` | `Blob` (PNG) |
| `exportToSvg()` | `SVGElement` |
| `serializeAsJSON()` | JSON string |

---

## 5. Technical Constraints

### 5.1 Architecture Constraints

| Constraint | Detail |
|---|---|
| **Client-only rendering** | Excalidraw cannot run in SSR (Next.js requires `{ ssr: false }` dynamic import) |
| **React peer dependency** | Requires React 17.0.2 or 18.x or 19.x |
| **Canvas-based renderer** | Dual-canvas architecture (interactive + static) — not DOM/SVG |
| **Browser storage limits** | Scene data stored in IndexedDB/localStorage; large scenes may hit browser quotas |
| **Monorepo coupling** | 5 interdependent packages must be released together (`@excalidraw/*` 0.18.0) |

### 5.2 Performance Constraints

| Constraint | Detail |
|---|---|
| **Dual canvas overhead** | Two canvas layers per render cycle; mitigates re-renders but adds GPU memory pressure |
| **Scene graph in memory** | All elements held in JS memory; no virtual windowing for very large scenes |
| **Async font loading** | Virgil, Cascadia, Assistant fonts load lazily; initial render may use fallback fonts |
| **Asset path requirement** | Self-hosters must configure `VITE_APP_DISABLE_SENTRY` and font asset paths |

### 5.3 Feature Limitations

| Limitation | Notes |
|---|---|
| No rich text | Text elements are plain; no inline bold/italic/strikethrough editing |
| Session-only undo/redo | History is not persisted to cloud; lost on page reload |
| No video/animation | Static diagrams only |
| No version branching | No git-like history or named snapshots |
| Mobile UX gaps | Touch drawing works; complex gestures and toolbar UX not fully optimized for phones |
| Max collaborators | Technically unbounded; practical limit depends on Firebase/socket.io infrastructure |
| No native PDF export | Only PNG, SVG, JSON natively; PDF requires external tooling |

### 5.4 Browser Support

| Browser | Minimum version |
|---|---|
| Chrome | 70 |
| Firefox | Latest |
| Safari | 12 |
| Edge | 79 |
| Samsung Internet | 10 |
| Android Chrome | 13 |
| **Not supported** | IE 11, Opera Mini, KaiOS ≤ 2.5 |

### 5.5 Runtime Requirements (self-hosted)

- Node.js >= 18.0.0
- Yarn 1.22.x (workspaces)
- Firebase project (Firestore + Auth) for collaboration
- Socket.IO-compatible server for real-time sessions

---

## 6. External Integrations

| Integration | Role | Notes |
|---|---|---|
| **Firebase Firestore** | Collaboration session storage | Separate dev/prod projects |
| **Socket.IO 4.7** | Real-time presence & element sync | Custom server required for self-hosting |
| **OpenAI API** | TTD / Magic Frame AI features | API key provided by user; GPT-4 Vision |
| **Sentry 9.0** | Error tracking & performance monitoring | Disabled via env var for self-hosting |
| **Rough.js 4.6** | Hand-drawn SVG path generation | Core rendering dependency |
| **Perfect-freehand 1.2** | Pressure-sensitive stroke simulation | Core rendering dependency |
| **Vercel** | Primary hosting & CDN | Auto-deployment from main branch |

---

## 7. Package Structure

| Package | Version | Responsibility |
|---|---|---|
| `excalidraw-app` | 1.0.0 | Web SPA + Firebase + Socket.IO backend glue |
| `@excalidraw/excalidraw` | 0.18.0 | Core React component & public API |
| `@excalidraw/element` | 0.18.0 | Element types, scene graph, transforms, bounds |
| `@excalidraw/common` | 0.18.0 | Shared constants, utilities, device detection, event bus |
| `@excalidraw/math` | 0.18.0 | 2D geometry primitives (Vector, Point, Matrix) |
| `@excalidraw/utils` | 0.1.2 | Export helpers (`exportToCanvas`, `exportToBlob`, `exportToSvg`) |

---

## 8. Out of Scope

The following are explicitly outside the current product scope:

- Real-time audio/video conferencing (delegate to Zoom/Meet)
- Rich text formatting inside elements
- Cloud version history / branching
- Native mobile apps (iOS/Android)
- PDF export (native)
- Role-based access control for shared sessions
- Comments / annotation threads

---

## 9. Open Questions

| # | Question | Owner |
|---|---|---|
| 1 | What is the intended monetization model for excalidraw.com (currently no paywall)? | Product |
| 2 | What SLA applies to the hosted collaboration infrastructure? | Infra |
| 3 | Should the AI (TTD) feature require users to supply their own OpenAI key, or does Excalidraw intend to proxy it? | Product / Legal |
| 4 | What are the plans for mobile-first UX improvements? | Design |
| 5 | Is Mermaid import the primary "diagram-to-Excalidraw" path, or will other DSLs (PlantUML, D2) be supported? | Engineering |
