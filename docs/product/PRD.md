# Excalidraw Product Requirements Document (PRD)

**Reverse-Engineered from Codebase | Last Updated: 2026-03-31**

---

## Executive Summary

Excalidraw is a browser-based, hand-drawn style whiteboard and diagramming tool designed to reduce friction in visual idea capture and communication. The product serves as both a standalone web application and an embeddable React component, enabling users to quickly create sketches, flows, architecture diagrams, wireframes, and collaborative notes with minimal setup friction.

Core differentiation: **Sketch-first visual language** that encourages early-stage thinking over pixel-perfect design, combined with **real-time collaboration** and **lightweight, portable embedding capabilities**.

---

## 1. Product Goals

### 1.1 Primary Goals
- **Enable fast idea-to-visual translation** with low cognitive and operational overhead, leveraging hand-drawn aesthetics to signal "work-in-progress" thinking.
- **Facilitate real-time collaborative diagramming** for synchronous and asynchronous teamwork, enabling multiple users to contribute to the same canvas with awareness (cursors, viewports, presence).
- **Provide embeddable editor capabilities** for third-party applications and custom workflows via a reusable React package exposed through a public JavaScript API.
- **Maintain backward compatibility and predictable behavior** across releases for both standalone users and external integrators relying on Excalidraw APIs.

### 1.2 Secondary Goals
- Support portable, shareable drawing artifacts with flexible export formats (PNG, SVG, JSON) and import recovery from embedded metadata.
- Offer a reusable, modular library of drawing snippets that users can build over time and inject into new canvases.
- Enable end-to-end encryption for collaborative sessions, protecting user content during real-time sync and persistence.
- Maintain high interactive performance at scale (large canvases, many elements) by optimizing viewport-aware rendering and incremental scene updates.

---

## 2. Target Audience

### 2.1 Primary Users

#### **Product Designers & UX Researchers**
- **Use cases**: Quick wireframe sketches, user journey mapping, flow diagrams, annotation during research discussions.
- **Key needs**: Fast tool switching, freehand annotation, frame organization for multi-screen work, collaborative feedback loops.

#### **Software Engineers & Architects**
- **Use cases**: System architecture diagrams, data flow sketches, API design whiteboarding, technical decision trees, deployment topology sketches.
- **Key needs**: Quick shape composition, arrow/connector flexibility, layer organization, easy export for documentation.

#### **Product & Business Teams**
- **Use cases**: Feature roadmaps, business process diagrams, org charts, strategy sketches, pitch preparation.
- **Key needs**: Simplicity, collaboration without account friction, shareable/exportable artifacts, basic text and shape composition.

#### **Educators & Students**
- **Use cases**: Classroom whiteboarding, assignment sketching, collaborative learning canvases, visual problem-solving.
- **Key needs**: Browser-native access, no login friction, ease of sharing, classroom-scale collaboration support.

### 2.2 Secondary Users

#### **Internal App Developers & Integrators**
- **Use cases**: Embed Excalidraw editor in SaaS products, knowledge management tools, educational platforms, content authoring systems.
- **Key needs**: Programmatic control via API, event callbacks (onChange, onPointerUpdate, onExport), library management, collaboration API, extensibility hooks.

#### **Open-Source Contributors & Community**
- **Use cases**: Contribute feature enhancements, localization, bug fixes, experimental tools, runtime optimizations.
- **Key needs**: Clear API boundaries, modular package design, reproducible build/test workflows, transparent decision-making.

---

## 3. Key Functionalities

### 3.1 Core Drawing & Editing

#### **Supported Element Types** (13 total)
- **Shapes**: Rectangle, Diamond, Ellipse
- **Connectors**: Line, Arrow (3 variants with different head/tail styles)
- **Freehand**: Freedraw (sketchy hand-drawn path)
- **Text**: Inline and block text with font/color/alignment customization
- **Content**: Image, Frame, Iframe, Embeddable (custom components)

#### **Tool Set** (14 available)
| Tool | Purpose |
|------|---------|
| Selection | Select, multi-select, and manipulate elements |
| Lasso | Free-form multi-element selection |
| Hand | Pan/scroll the canvas without drawing |
| Shape tools | Draw rectangles, diamonds, ellipses |
| Line/Arrow | Draw connectors with style variants |
| Freedraw | Sketch with hand-drawn paths |
| Text | Insert and edit text |
| Image | Import images onto canvas |
| Eraser | Delete drawn strokes |
| Frame | Create grouping/artboard containers |
| Embeddable | Embed custom components |
| Laser (pointer) | Highlight/annotate during presentations |

#### **Transformation & Organization**
- **Transform**: Rotate, scale, skew elements with bound box manipulation.
- **Grouping**: Group multiple elements into a single unit; support nested groups.
- **Layering**: Reorder elements via z-index (send to back, bring to front, forward, backward).
- **Duplication**: Clone elements and groups with optional offset.
- **Alignment & Distribution**: Snap-to-grid, alignment guides, distribution helpers.
- **Undo/Redo**: Full history capture with granular restore support.

### 3.2 Scene & Viewport Management

#### **Infinite Canvas**
- Unlimited drawing surface; users can pan and zoom freely.
- Viewport-aware rendering: only visible elements are rendered to optimize performance.
- Zoom controls: preset levels (1x, 2x, 3x), fit-to-screen, zoom-to-selection.

#### **Scene Persistence**
- **Local Storage**: Auto-save to browser IndexedDB/LocalStorage; manual save points.
- **In-Memory Model**: Scene graph (`Scene` class) maintains ordered elements, non-deleted maps, frame caches, and selection state.
- **State Capture**: `AppState` tracks interaction mode, tool selection, viewport position, export settings, selection, undo/redo position.

### 3.3 Collaboration & Sharing

#### **Real-Time Co-Editing**
- **Transport**: WebSocket-based sync via Socket.IO with end-to-end AES encryption.
- **Presence**: Live cursor positions, viewport awareness, user color coding, idle/active state detection.
- **Conflict Resolution**: Optimistic updates with version tracking and fractional indexing for ordering.
- **Awareness**: User presence indicators, active collaborators, typing states.

#### **Session Management**
- Create shareable links with optional password protection.
- Invite teammates to live collaborative sessions.
- Encrypt payloads server-side with client-side key management.
- Track file versions and sync state with reconciliation.

#### **Data Sync**
- Delta-based updates: only changed elements are transmitted.
- Retention windows: deleted elements kept for recovery within configurable timespan.
- Self-healing reconciliation: server-side persistence + client-side caching ensure eventual consistency.

### 3.4 Export & Import

#### **Export Formats**
- **PNG**: Rasterized image with configurable scale (1x–3x), background color, dark mode support.
- **SVG**: Scalable vector with element styling, text paths, and embedding options.
- **JSON**: Native scene format with full element/state capture for re-import or API integration.
- **Clipboard**: Copy as image/JSON for pasting into other tools.
- **Canvas**: Direct HTML5 canvas rendering via imperative API.

#### **Export Options**
- Scale factor (1x–3x for PNG/SVG).
- Background color (transparent, solid, dark mode).
- Cropping to selection or scene bounds.
- Scene embedding in exported PNG metadata (re-import without losing original).

#### **Import Capabilities**
- **Native JSON**: Restore full scene with elements, state, and history.
- **Library Items**: Reuse saved snippets from personal library.
- **PNG/SVG with Metadata**: Extract embedded Excalidraw scene from exported images.

### 3.5 Library & Asset Management

#### **Reusable Snippets**
- Build a personal library of frequently-used shapes, icons, components.
- Organize by tags/categories.
- Quick insert into active canvas with one click.
- Share and publish libraries for other users.

#### **Library Metadata**
- LibraryItem schema: id, elements payload, creation timestamp, publish status, optional tags/description.
- Sync with cloud for cross-device access (optional).

### 3.6 Styling & Customization

#### **Element Styling**
- **Fill**: Solid color, cross-hatch, or transparent.
- **Stroke**: Color, width (hairline to thick), style (solid, dashed).
- **Opacity**: Per-element alpha transparency.
- **Font**: Typography for text elements (family, size, weight, alignment).

#### **Canvas Theme**
- Light and dark mode toggle.
- Custom background colors.
- Grid visibility and snap-to-grid settings.

---

## 4. Technical Constraints & Limitations

### 4.1 Architecture Constraints

#### **Monorepo Structure**
The product is organized as a Yarn workspaces monorepo with explicit package boundaries:
- **`excalidraw-app/`**: Standalone product shell, collaboration wiring, Firebase integration, local persistence adapters.
- **`packages/excalidraw/`**: Reusable editor runtime (React component), action system, renderer orchestration, history management.
- **`packages/element/`**: Canonical scene model, element types (`ExcalidrawElement` union), mutation helpers, store snapshot.
- **`packages/math/`**: Geometry and numeric primitives for layout, collision, rendering.
- **`packages/common/`**: Shared constants, event helpers, type utilities.
- **`packages/utils/`**: Export/import logic, utilities.

**Implication**: Changes to element schema or renderer must be carefully versioned and tested across both the standalone app and embedded use cases.

#### **TypeScript Runtime Type System**
- All element types are represented as TypeScript union types (`ExcalidrawElement`).
- Scene state is immutable where possible; mutations use explicit helper functions.
- AppState and Scene are captured and diffed for undo/redo and persistence.

**Implication**: Adding new element properties requires updates to type definitions, store snapshots, migration logic, and serialization paths.

### 4.2 Performance Constraints

#### **Viewport-Aware Rendering**
- Only elements within the visible viewport are rendered to the canvas.
- Rendering pipeline filters and culls off-screen elements before rasterization.
- Large canvases (1000+ elements) must maintain 60 FPS interaction latency.

**Implication**: Element-heavy scenes demand careful optimization of filtering, mutation, and re-render triggering.

#### **Canvas Scale Limits**
- Practical scene size: up to ~10,000 elements on consumer hardware.
- Beyond that, performance degrades due to:
  - Store snapshot size (memory and serialization overhead).
  - Undo/redo memory consumption (full snapshots at each history state).
  - Collaboration sync payload size (fractional indexing scales with element count).

### 4.3 Collaboration & Security Constraints

#### **WebSocket Transport**
- Real-time sync relies on a stateful WebSocket connection (Socket.IO).
- Offline editing is supported; delta sync happens on reconnect.
- End-to-end encryption (AES) is applied to payloads, but encryption keys must be managed by the client.

**Implication**: Collaboration features are opt-in and require a backend server with Socket.IO support.

#### **Firebase Persistence**
- The standalone app uses Firebase for long-term storage, user authentication, and share links.
- Embedded Excalidraw instances may use different persistence backends (customer-provided).

**Implication**: Embedded instances need custom adapters for persistence; collaboration must be wired separately.

#### **Data Privacy**
- Scene content is encrypted with client-generated keys during collaboration.
- Export/import formats are JSON-serializable and human-readable; no built-in file encryption at rest.
- User data is stored in Firebase according to Excalidraw's privacy policy.

### 4.4 Browser & API Constraints

#### **Browser Support**
- Modern browsers only (Chrome, Firefox, Safari, Edge).
- Requires HTML5 Canvas, ES2020+ JavaScript, and localStorage/IndexedDB.
- Mobile support is best-effort; touch gestures are supported but UX is optimized for desktop.

**Implication**: Older browsers (IE 11, older Safari) are not supported.

#### **Canvas Rendering Engine**
- Uses **Rough.js** for hand-drawn aesthetics on HTML5 Canvas.
- Primary rendering is rasterization; SVG export is generated from scene reconstruction.
- WebGL acceleration is not used; CPU-bound rendering may be a bottleneck on very large scenes.

#### **Image Support**
- Images can be imported but are rasterized into the scene.
- Vector images (SVG) are rasterized on import; no native SVG element support within scene.
- Image format support depends on browser (PNG, JPEG, WebP, etc.).

### 4.5 Data Model Constraints

#### **JSON Serialization**
- All scene data must be JSON-serializable for export/import and collaboration sync.
- Element properties must avoid circular references, non-primitive values, and Dates (use timestamps).
- Versioning is handled via `fileVersion` in the scene snapshot to enable migration.

**Implication**: Complex object graphs or computed state cannot be stored; only capture primitives and arrays.

#### **SyncableExcalidrawElement Subset**
- Not all elements are synced in collaboration mode (e.g., invisibly small elements are excluded).
- Deleted elements are kept within a configurable retention window for recovery.
- Out-of-band metadata (e.g., AI generation context) is not persisted unless explicitly captured as element properties.

### 4.6 Integration Constraints

#### **React Component Integration**
- Excalidraw is exported as a React functional component (`<Excalidraw />`).
- Embedding requires React 17+ and sharing context via `ExcalidrawAPIProvider`.
- Custom styling via CSS modules; limited support for theme injection.

**Implication**: Integrators must manage React dependencies and version compatibility.

#### **Imperative API**
- The `ImperativeAPI` allows programmatic control: create/delete elements, change state, trigger exports.
- API calls are queued and processed asynchronously; some operations may have latency.
- Callbacks (onChange, onPointerUpdate, onExport) fire at high frequency and must be throttled/debounced by consumers.

**Implication**: Naive use of API callbacks can cause performance issues in integrator code.

#### **Library API**
- Libraries are client-local; no native cloud sync without custom backend.
- Library schema is versioned; migration is automatic on first load.

### 4.7 Undo/Redo & History Constraints

#### **Full Snapshot Capture**
- Undo/redo is implemented by capturing full scene snapshots at each history state.
- No operation-based (differential) history; scaling to 1000+ undo states may consume significant memory.

**Implication**: Undo stack must be bounded (typically ~50 states) to prevent memory runaway.

#### **Non-Undoable Operations**
- Collaboration syncs and remote updates do not create undo states; they update the scene in-place.
- This prevents undo from affecting collaborative content; only local edits can be undone.

### 4.8 Rendering & Styling Constraints

#### **Limited Typography**
- Font support is limited to system fonts or web fonts loaded via `@font-face`.
- Custom font upload is not natively supported.
- Font rendering uses canvas `fillText`; complex text layout (RTL, ligatures) may not render correctly.

#### **Shape Stylization**
- Shapes are always rendered with hand-drawn roughness via Rough.js.
- Stroke width, opacity, and fill pattern are configurable.
- No support for gradients, blur, shadow effects, or advanced SVG filters.

#### **Symbol/Icon Support**
- No built-in symbol/icon library; users must import images or use text as placeholders.
- Custom components via the Embeddable tool are not rendered to SVG/PNG (they appear as placeholders).

---

## 5. Success Metrics & Key Assumptions

### 5.1 Key Success Metrics
- **Adoption**: Monthly active users, share of diagram creation vs. competitors.
- **Engagement**: Average session duration, daily/weekly active return rate.
- **Quality**: Bug report rate, crash rate, user satisfaction (NPS, ratings).
- **Performance**: Time-to-first-draw, frame rate under load (60 FPS target), undo/redo latency <100ms.
- **Collaboration**: Active collaborative sessions, unique collaborators per session, sync consistency rate.
- **Embedding**: Number of third-party integrations, API adoption metrics, community feedback.

### 5.2 Key Assumptions
- **Browser adoption**: Users have access to modern browsers; no IE 11 or legacy platform support is required.
- **Network availability**: Collaboration features assume stable internet; offline-first is nice-to-have but not required.
- **Device capability**: Typical desktop/laptop hardware with sufficient RAM and GPU for 60 FPS rendering; mobile is secondary.
- **User expertise**: Users are comfortable with modern web apps and basic diagramming concepts; no training is required.
- **Backend availability** (app version): Firebase and Socket.IO backend are operational and funded; no multi-region failover is required.

---

## 6. Out-of-Scope

The following are explicitly out of scope for Excalidraw:

- **Complex diagram automation** (e.g., graph layout, auto-routing of connectors).
- **AI-powered generation** (e.g., code-to-diagram, text-to-flow); any AI features must be add-on modules.
- **3D visualization** (e.g., 3D shapes, z-depth effects).
- **Pixel-perfect design tools** (e.g., precision alignment to 0.1px, typography kerning).
- **Enterprise features** (e.g., SAML/SSO, role-based permissions, audit logs) in the open-source version.
- **Mobile app** (native iOS/Android); web-based mobile UX is supported but not optimized.
- **Offline-first sync** without a backend (all platforms must have a server for collab).

---

## 7. Glossary

| Term | Definition |
|------|-----------|
| **Element** | A single drawable object (shape, text, arrow, image, frame, etc.) in the scene. |
| **Scene** | The in-memory container of ordered elements and supporting data (selection, frame cache, nonce). |
| **AppState** | Runtime state covering interaction mode, tool selection, viewport, export settings, and UI visibility. |
| **Tool** | A selected interaction mode (selection, lasso, shape, arrow, freedraw, text, etc.). |
| **Action** | A command contract with perform/predicate/hotkey metadata, registered and executed by ActionManager. |
| **Library** | A user-maintained collection of reusable drawing snippets. |
| **Collaboration** | Real-time co-editing with presence awareness, delta sync, and end-to-end encryption. |
| **Import/Export** | File format conversion (JSON, SVG, PNG) and scene round-trip. |

---

## References

- **Product Context**: `docs/memory/productContext.md`
- **Project Brief**: `docs/memory/projectbrief.md`
- **Architecture**: `docs/technical/architecture.md`
- **Domain Glossary**: `docs/product/domain-glossary.md`
- **Active Context**: `docs/memory/activeContext.md`
