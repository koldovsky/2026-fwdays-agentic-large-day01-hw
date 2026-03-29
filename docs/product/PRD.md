# Product Requirements Document — Excalidraw

**Document type:** Reverse-engineered from the `excalidraw-monorepo` source tree, `docs/technical/architecture.md`, and product memory notes. It describes intent inferred from implementation, not an official commercial PRD.

**Scope:** The browser whiteboard product (web app + embeddable library) as reflected in this repository.

---

## 1. Product goal

Deliver a **fast, approachable virtual whiteboard** that sketches in a **hand-drawn visual style** so diagrams feel informal and low-friction, while still supporting **structured editing**, **export**, and **optional real-time collaboration**.

Secondary goals evident in the codebase:

- **Embeddability:** Ship `@excalidraw/excalidraw` as a React component so other products can embed the full canvas without reimplementing rendering or tools.
- **Resilience:** Work **offline** (PWA, local persistence) and treat the network as an enhancement for sync, sharing, and collaboration—not a hard dependency for drawing.
- **Privacy-oriented sharing:** Use **client-side encryption** for shareable and collaborative sessions so scene keys are not exposed in plaintext to the backend.
- **Extensibility for power users:** Command palette, search, library, Mermaid bridge, and optional AI-assisted flows (text-to-diagram, diagram-to-code) when a backend is configured.

---

## 2. Target audience

| Segment | Needs | How the product serves them |
|--------|--------|------------------------------|
| **Individual users** | Quick sketches, notes, informal diagrams without accounts | Guest-first UX; welcome screen; full drawing without sign-in |
| **Teams & facilitators** | Live co-editing and presentation-style sharing | Encrypted collab rooms (Socket.io + Firebase), remote cursors, share dialog with QR / native share |
| **Developers & technical writers** | Whiteboard inside apps, docs, or internal tools | npm package, React peer API, examples (Vite, Next.js), `onChange` and export APIs |
| **Viewers & stakeholders** | Consume a finished diagram without editing | Read-only shareable links; clone-to-own-canvas |
| **Excalidraw+ subscribers** (where applicable) | Cloud identity and cross-device workflows | Integration points in host app (sign-in / Plus branding in welcome flows—see `excalidraw-app`) |

Personas align with flows in `excalidraw-app` (welcome, share, collab) and the embeddable library’s integration constraints (client-only rendering, CSS + height requirements).

---

## 3. Key features

Features below are grouped by product area; presence is grounded in packages and `excalidraw-app` as described in `docs/technical/architecture.md` and product context.

### 3.1 Core canvas and editing

- **Hand-drawn rendering** via Rough.js on a **static + interactive canvas** split (performance and hit-testing separation).
- **Drawing tools:** shapes (rectangle, ellipse, diamond), arrows/lines, freehand, text, image, eraser, frame, embed, laser pointer.
- **Selection & manipulation:** Multi-select, group/ungroup, align, distribute, z-order, flip, duplicate, delete, link elements, text binding, linear element reshaping, image crop.
- **View & comfort:** Zoom/pan, grid and snapping options, zen mode, stats overlay, themes (light/dark/system), canvas background color.
- **Undo/redo** with history tied to durable scene changes (not incidental navigation-only updates).

### 3.2 File, export, and portability

- Load/save **`.excalidraw`** scene files (browser file APIs where available).
- Export **PNG/SVG**; copy to clipboard; paste style between elements.
- **Shareable link:** compressed, encrypted scene payload with key in URL fragment (backend post for hosted snapshot as configured).

### 3.3 Collaboration and sync

- **Live collaboration:** Room id + encryption key in URL; real-time updates over **Socket.io**; **Firestore** and **Firebase Storage** for scene/binary assets as implemented in the host app.
- **Collaborator presence:** Remote pointers and identities.
- Host can end collaboration and return to a local canvas URL.

### 3.4 Library and reuse

- Personal **shape library**; import/export **`.excalidrawlib`**; share via URL tokens where supported.

### 3.5 Discoverability and accessibility of actions

- **Command palette** (e.g. ⌘/Ctrl+K) over the action registry.
- **Search** to find and highlight elements on canvas.
- **Internationalization** (i18next, Crowdin-sourced locales).

### 3.6 Optional / host-configured capabilities

- **AI-assisted diagramming** when `VITE_APP_AI_BACKEND` (or equivalent) is set: natural-language to diagram (streaming), diagram-to-code with CodeMirror review surfaces.
- **Mermaid → Excalidraw** bridge for diagram import/generation paths.
- **Excalidraw+** and analytics/error reporting (e.g. Sentry) as wired in `excalidraw-app`.

### 3.7 Embeddable library product

- Single **`Excalidraw`** React component entry (`packages/excalidraw/index.tsx`), props for initial data, change callbacks, and UI toggles (`UIOptions` / `canvasActions`).
- Published as **ESM** with **React 17–19** as peers; **client-side only** in SSR frameworks (dynamic import, `ssr: false`).

---

## 4. Technical constraints

Constraints are architectural boundaries implied by the monorepo layout and implementation—not an exhaustive SLA.

### 4.1 Platform and runtime

- **Browser-first:** Core UX is **Canvas 2D** + DOM overlays; no native desktop runtime in-repo.
- **JavaScript environment:** Assumes **DOM**, **Canvas**, **IndexedDB** (local persistence), and modern **file / clipboard** APIs where features need them; mobile/desktop parity attempted via PWA and polyfills (e.g. `browser-fs-access`).

### 4.2 Frontend stack

- **React** controls editor chrome and orchestration; **scene geometry** lives in a non-React **`Scene`** model with a **`Store`** for undo/redo and change capture (`packages/element`, `packages/excalidraw/components/App.tsx`).
- **TypeScript strict** across packages; **Vite** for the host app; **esbuild** for library builds.
- **Canvas rendering** is bounded by **main-thread** drawing (Rough.js, element renderers); large scenes depend on viewport culling and render throttling (`Renderer`, static vs interactive layers).

### 4.3 Monorepo and dependencies

- **Yarn classic workspaces:** `excalidraw-app`, `packages/*`, `examples/*`.
- **Layered packages:** `@excalidraw/common` → `@excalidraw/math` → `@excalidraw/element` → `@excalidraw/excalidraw`; build order enforced by `build:packages`.
- **Peer dependency:** Consumers must provide compatible **React** / **ReactDOM** versions per `package.json`.

### 4.4 Embedding and SSR

- **No SSR for the canvas:** Embeds must run on the client; Next.js and similar require **dynamic import** and **no SSR** for the component.
- **Layout:** Parent container must have **non-zero height**; package **CSS** must be imported for correct layout and controls.

### 4.5 Assets and deployment

- Default font/asset loading may use a **CDN**; self-hosting requires copying `dist/prod/fonts` and setting `window.EXCALIDRAW_ASSET_PATH`.
- **Host app** is static-buildable (e.g. nginx, Vercel); **collab** requires configured Firebase/Socket endpoints and env for AI/backend URLs.

### 4.6 Security and privacy model (as implemented)

- **End-to-end style encryption** for shared/collab payloads relies on **keys in the URL fragment**; backend stores ciphertext for link-based sharing—exact threat model is implementation-specific and should be reviewed for production deployments.

### 4.7 Testing and quality gates

- **Vitest** + jsdom for unit/integration-style tests; **ESLint** / **Prettier** / **tsc** in CI; changes to rendering and `Scene`/`Store` contracts affect undo, multiplayer, and embed stability.

---

## 5. Related documentation

| Document | Purpose |
|----------|---------|
| `docs/technical/architecture.md` | Monorepo layout, data flow, rendering pipeline |
| `docs/memory/projectbrief.md` | Repository map and stack summary |
| `docs/memory/productContext.md` | Personas and UX scenarios |
| `docs/product/domain-glossary.md` | Domain terms (Scene, AppState, elements) |

---

## 6. Revision note

This PRD should be updated when major product surfaces change (e.g. new tools, new backends, or embedding API breaks). It is **descriptive** of the current tree, not a prescriptive roadmap.
