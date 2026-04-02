# Product Requirements Document (PRD)

**Product:** Excalidraw-style virtual whiteboard (library + full web app)  
**Scope:** Requirements inferred from product principles embodied in this repository (`excalidraw-monorepo`): embeddable React editor, hand-drawn canvas output, and optional hosted application shell.

---

## 1. Product Overview

### Product goal

Deliver a **hand-drawn–style, infinite-canvas diagramming experience** that works as:

1. **An embeddable React component** (`@excalidraw/excalidraw`) so other applications can add whiteboarding without rebuilding editor, rendering, or file semantics.
2. **A standalone web application** (`excalidraw-app`) that composes the same editor with product-level concerns (hosting UX, collaboration hooks, storage integrations, PWA, analytics).

Supporting packages (`@excalidraw/common`, `@excalidraw/math`, `@excalidraw/element`, `@excalidraw/utils`) exist to keep the editor **modular, testable, and shippable** as focused libraries.

### Problem statement

Teams need **fast, low-friction visual communication** (architecture sketches, flows, teaching boards, meeting artifacts) without the rigidity of formal diagramming tools or the lock-in of proprietary whiteboards. Developers need the same capabilities **inside their own products** with stable APIs, serializable scene data, and predictable export paths—without reimplementing canvas math, undo, selection, or RoughJS-style rendering.

---

## 2. Target Audience

### Primary users

| Segment | Need |
|--------|------|
| **Individual creators & teams** | Quick diagrams and boards with a friendly, sketch-like look; shareable artifacts. |
| **Engineers & technical leads** | System sketches, RFCs, incident timelines, API maps. |
| **Educators & facilitators** | Live boards, simple shapes, text, and emphasis without design-tool overhead. |
| **Product engineers** | A **drop-in React editor** with callbacks and imperative API for syncing scene data to their backend or UI. |

### Use cases

- Whiteboard a system or user flow in a meeting; refine and export as image or portable scene file.
- Embed drawing in an internal tool (wiki, ticket system, LMS) with host-controlled persistence via `onChange` / API.
- Collaborate in real time when the hosted app and backend services are enabled (live pointers, shared scene updates).
- Work offline or as a PWA where the product shell supports it.
- Reuse **examples** (e.g. script tag, Next.js) to validate integration patterns.

---

## 3. Core Features

| Feature | Description |
|--------|-------------|
| **Infinite canvas & viewport** | Pan and zoom; scroll position and zoom are first-class state; rendering restricts work to visible elements for responsiveness. |
| **Hand-drawn rendering** | Shapes and strokes rendered with a sketch aesthetic (RoughJS-backed pipeline in the architecture). |
| **Drawing tools** | Primitives such as rectangles, ellipses, lines, arrows, freedraw, text, images, frames, and related editor interactions (resize, rotate, edit points). |
| **Selection & manipulation** | Multi-select, groups, alignment helpers, bindings between connectors and shapes where enabled. |
| **Undo / redo** | History integrated with the element store and capture semantics (immediate vs deferred recording). |
| **Scene model** | Ordered, JSON-serializable elements (`ExcalidrawElement`) with versioning fields; scene held in `Scene`, separate from React UI state. |
| **Export** | Raster/vector export paths and configurable export options (background, scale, dark mode, embed scene in file where supported). |
| **Library & reusable assets** | Shape library for dragging predefined items onto the canvas. |
| **Theming & display modes** | Light/dark and UI modes (e.g. zen, view-only) appropriate for focus or embedding. |
| **Internationalization** | Localized UI strings across supported locales. |
| **Embeddable API** | React props (`initialData`, `onChange`, custom UI slots) and imperative API for host integration. |
| **Product shell (app)** | Full SPA: menus, optional collaboration, storage and analytics hooks, PWA build path—layered on the same editor package. |

---

## 4. Technical Constraints

### Platform requirements

- **Runtime:** Modern evergreen browsers with Canvas 2D and required Web APIs used by the editor and app.
- **Node.js:** `>= 18` for monorepo tooling and builds (root `engines`).
- **Framework:** React with compatible `react` / `react-dom` peer versions as declared by `@excalidraw/excalidraw` (supports React 17–19 range in package metadata).
- **Build:** Yarn workspaces monorepo; Vite-based app (`excalidraw-app`); ESM builds for internal packages per workspace scripts.
- **SSR:** Editor must run **on the client**; SSR frameworks must load the component dynamically with SSR disabled (documented embed constraint).

### Performance considerations

- **Viewport culling:** Only elements intersecting the viewport are passed into static rendering paths to limit draw cost.
- **Layer split:** Static scene vs interactive overlay (selection, collaborators) to throttle or animate layers independently.
- **Scene invalidation:** `sceneNonce` drives cache invalidation; hosts should avoid unnecessary full-scene churn when syncing data.

### Limitations

- **Not a generic design suite:** Focus is diagramming and whiteboarding, not print layout or advanced vector illustration.
- **Client-heavy:** Core editing and rendering depend on browser canvas; server-side rendering of the live editor is out of scope.
- **Host responsibility:** Persistence, auth, and multi-tenant rules are owned by embedders unless using the full app’s integrated services.
- **Collaboration:** Real-time features depend on configured backends and app wiring; the library alone does not mandate a specific server.

---

## 5. Optional — Future improvements

Non-binding directions consistent with an Excalidraw-class product; priority is outside this document.

- Deeper **accessibility** (keyboard-first workflows, screen reader coverage for panels and canvas semantics).
- Broader **import/export** interoperability (additional formats, tighter round-trips).
- **Performance** for very large scenes (aggressive virtualization, worker offload where feasible).
- **Embedding ergonomics:** smaller bundles, clearer SSR/hydration patterns, first-class framework adapters.
- **Collaboration:** richer presence, permissions, and conflict UX at scale.

---

## References (in-repo)

- `docs/memory/projectbrief.md` — workspace purpose and layout  
- `docs/technical/architecture.md` — data flow, rendering, packages  
- `docs/product/domain-glossary.md` — `Scene`, `AppState`, `ExcalidrawElement`, etc.  
- `packages/excalidraw/README.md` — embed setup, SSR note, CSS requirement  
