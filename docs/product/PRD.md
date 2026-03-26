# Product Requirements Document (reverse-engineered): Excalidraw

**Document type:** Reverse-engineered PRD derived from the open-source Excalidraw monorepo, internal discovery notes, and public product behavior—not an official vendor specification.

**Scope:** Covers the **product intent** of the **embeddable editor** (`@excalidraw/excalidraw`) and the **hosted web application** (`excalidraw-app`), as reflected in this workspace (`excalidraw-monorepo`, library `@0.18.0`).

**Related internal sources:** [`docs/memory/projectbrief.md`](../memory/projectbrief.md), [`docs/memory/productContext.md`](../memory/productContext.md) (UX scenarios), [`docs/memory/systemPatterns.md`](../memory/systemPatterns.md), [`docs/memory/techContext.md`](../memory/techContext.md), [`docs/technical/architecture.md`](../technical/architecture.md) (runtime and data flow), [`docs/technical/dev-setup.md`](../technical/dev-setup.md) (onboarding), [`docs/product/domain-glossary.md`](./domain-glossary.md), [`docs/findings/project-overview.md`](../findings/project-overview.md), [`docs/findings/excalidraw-package-architecture.md`](../findings/excalidraw-package-architecture.md), [`docs/findings/element-package-architecture.md`](../findings/element-package-architecture.md).

**Terminology:** Capitalized domain terms (`Scene`, `AppState`, `Store`, `reconcileElements`, etc.) match [`domain-glossary.md`](./domain-glossary.md).

---

## 1. Product purpose

Excalidraw is a **canvas-based virtual whiteboard** that prioritizes a **hand-drawn, sketch-like visual style** while remaining suitable for **diagrams, flows, annotations, and lightweight presentations**. The codebase serves two primary delivery modes:

1. **Library** — A **React** component package (`@excalidraw/excalidraw`) that third-party applications embed in a sized container, with published **CSS** and optional deep imports (`./element/*`, `./common/*`, etc.) for advanced integrators.
2. **Application** — A **Vite-built** full product shell (`excalidraw-app`) that adds **hosting-oriented** concerns: collaboration transport hooks, analytics/observability, progressive web app behavior, and persistence integrations (e.g. browser storage, Firebase-related assets in-repo).

The editor’s **authoritative document model** is a JSON-serializable **ordered element graph** (`ExcalidrawElement` union) with explicit support for **undo/redo**, **incremental sync signals**, and **multiplayer reconciliation** (version fields, fractional indices, soft deletes). The **command surface** is structured around **declarative actions** applied through a central pipeline (`ActionManager` → `syncActionResult`), while **realtime room collaboration** is implemented primarily at the **app** layer on top of the library’s imperative API.

---

## 2. Goals of the project

### 2.1 Primary product goals

| ID | Goal | Observable success criteria |
|----|------|-----------------------------|
| **G-1** | **Fast, low-friction sketching** | Users can place shapes, text, arrows, and freeform marks without modal setup; defaults favor immediacy over configuration. |
| **G-2** | **Readable “informal” output** | Visual language reads as **hand-drawn** (Rough.js-style rendering, organic strokes) while staying **vector-based** and scalable. |
| **G-3** | **Shareable, portable documents** | Scenes serialize to **structured data** (elements + `AppState` + binary file map) suitable for export, import, and embedding in other tools. |
| **G-4** | **Embeddability as a first-class product** | Hosts integrate via **React props** and **`ExcalidrawImperativeAPI`** (`updateScene`, `onChange`, `onIncrement`, library APIs, etc.) without forking the core. |
| **G-5** | **Collaborative awareness (hosted app)** | Multiple participants see **shared scene state**, **remote cursors/lasers**, and **file sync** patterns appropriate to a room-based session. |

### 2.2 Engineering and ecosystem goals

| ID | Goal | Notes |
|----|------|--------|
| **G-6** | **Monorepo modularity** | Separate packages (`common`, `math`, `element`, `utils`, `excalidraw`) align with **build order** and **dependency direction** (see [`systemPatterns.md`](../memory/systemPatterns.md)). |
| **G-7** | **Predictable change capture** | `Store` + `CaptureUpdateAction` (`IMMEDIATELY` / `NEVER` / `EVENTUALLY`) ties **user intent** to **undo** and **incremental replication** semantics. |
| **G-8** | **Performance on large boards** | **Viewport culling**, **throttled static canvas** rendering, and **selective React subscriptions** (`UIAppState`, `onStateChange` selectors) reduce work as scenes grow. |
| **G-9** | **Internationalization** | Locales and translation infrastructure ship with the library; language detection appears in the app stack. |
| **G-10** | **Open-source distribution** | Public npm packages, examples (Next.js, script-in-browser), and static **Docker/nginx** deployment path for the app build artifact. |

---

## Non-goals and constraints

*Inferred from repository architecture—not an official vendor commitment.*

These are **out of scope** for the core product as reflected in this repository:

- **Replacing** dedicated vector design tools (Figma, Illustrator) or CAD-grade precision workflows.
- **Mandating** a single vendor backend: the **library** does not hard-require Firebase or Socket.IO; the **app** wires those.
- **Guaranteeing** pixel-perfect WYSIWYG across every PDF/SVG consumer without export-time constraints.
- **Providing** a full document management system (permissions, enterprise SSO, retention) inside the embed package—hosts own identity and storage.

Further **technical constraints and limitations** (what the product does not guarantee in practice) are detailed in **[§6. Technical limitations](#6-technical-limitations)**.

---

## 3. Target Audience

### 3.1 Personas — end users (canvas)

| Persona | Needs | How Excalidraw serves them |
|---------|--------|----------------------------|
| **Engineer / PM (diagrammer)** | Quick **architecture sketches**, **sequence-ish** flows, **annotated screenshots** | Frames, arrows with **bindings**, text, images, align/distribute, export to PNG/SVG. |
| **Educator / facilitator** | **Live board** feel, emphasis on clarity over polish | Laser-style tools, collaboration **cursors**, simple color/stroke vocabulary. |
| **Designer / writer** | **Mood boards**, **storyboards**, **lo-fi** layouts | Free positioning, libraries of reusable **stencils**, hand-drawn aesthetic. |
| **Individual contributor** | **Personal** boards, paste from clipboard, offline-friendly **PWA** (app) | Local persistence patterns, import/export, installable web app behavior where enabled. |

### 3.2 Personas — integrators (library)

| Persona | Needs | How the product serves them |
|---------|--------|------------------------------|
| **Frontend engineer embedding React** | Stable **component API**, **CSS** loading story, **TypeScript** types | `Excalidraw` wrapper, `index.css` export map, `dist/types` publishing. |
| **Platform engineer** | **Incremental sync**, **server-side** or **CRDT-adjacent** merge | `onIncrement`, `applyDeltas`, `reconcileElements`, element **version** / **versionNonce** / **index** fields. |
| **Product team customizing UX** | Reduce default chrome, hook **commands** | `UIOptions`, `renderCustomStats`, `registerAction`, context hooks. |

### 3.3 Personas — operators (hosted app)

| Persona | Needs | How `excalidraw-app` reflects this |
|---------|--------|-------------------------------------|
| **SRE / DevOps** | **Static** deployability, **container** image | Vite → static `build/`; multi-stage **Dockerfile** with nginx. |
| **Team admin (lightweight)** | **Room links**, **shared sessions** | Collab stack: **Socket.IO client**, **Firebase** (per app dependencies), room lifecycle in `collab/`. |

### 3.4 Accessibility and inclusivity expectations (product-level)

The codebase includes **keyboard-first command routing**, **i18n**, and **URL sanitization** for embeds (`@braintree/sanitize-url`, embed validation props per architecture notes). **Full WCAG parity for canvas-heavy UIs** is a known industry challenge; requirements below in §6 address **inherent limitations**.

---

## 4. Key Features

Features are grouped by **user-visible capability**. Implementation references point to findings and glossary entries.

### 4.1 Canvas editing and tools

| Feature | Description | PRD notes |
|---------|-------------|-----------|
| **Shape tools** | Rectangles, ellipses, diamonds, lines, arrows, freedraw, text | Tools routed via `ToolType` / `ActiveTool`; geometry in `@excalidraw/math` / `element`. |
| **Selection & transform** | Marquee selection, multi-select, resize handles, rotate, flip | `Scene` selection caches; transform modules in `element` package. |
| **Linear element editing** | Polyline editing for lines/arrows | `LinearElementEditor` coordinates handles and constraints. |
| **Arrow bindings** | Attach arrow endpoints to shapes | `ExcalidrawBindableElement`, `binding.ts`, `boundElements` model. |
| **Frames** | Group/clipping regions with labels | `ExcalidrawFrameElement`, `frameId`, `frameRendering` in `AppState`. |
| **Text** | WYSIWYG text on canvas | Text measurement, wrapping, in-place editing (`wysiwyg/`). |
| **Images** | Raster placement, crop flows | `BinaryFiles`, `FileId`, `ExcalidrawImageElement`. |
| **Embeds** | Validated embeddable content | `validateEmbeddable`, `renderEmbeddable` hooks for safe embedding. |
| **Charts & diagram assists** | Chart parsing, Mermaid-related flows | `charts/`, TTD/Mermaid UI areas in package map. |
| **Eraser & lasso** | Destructive/selective editing modes | `eraser/`, `lasso/` modules. |

### 4.2 Document structure and productivity

| Feature | Description |
|---------|-------------|
| **Undo / redo** | Stack of `HistoryDelta` applied through `History` + `Store` capture semantics. |
| **Grouping & z-order** | Stack ordering with **fractional indices** for stable multiplayer ordering. |
| **Alignment & distribution** | Arrange selected elements to grids and equal spacing. |
| **Library (stencils)** | Persist reusable `LibraryItem` collections; integrate with sidebar UI and Jotai atoms. |
| **Command palette & actions** | Registered `Action` set with shortcuts and palette discovery. |
| **Stats / precision inputs** | Numeric editing where offered (e.g. drag inputs in Stats UI). |

### 4.3 Import, export, and interoperability

| Feature | Description |
|---------|-------------|
| **JSON scene I/O** | Serialize/deserialize via `data/json`, `restore`, with reconciliation for merges. |
| **Raster/vector export** | PNG and SVG export paths (export settings live in `AppState` slices). |
| **Clipboard** | Paste images and scene fragments where supported by browser capabilities. |
| **Filesystem hooks** | `data/filesystem.ts` patterns for host-controlled load/save. |

### 4.4 Collaboration and awareness (hosted application)

| Feature | Description |
|---------|-------------|
| **Room sessions** | `Collab` orchestrates lifecycle; `Portal` adapts socket + room. |
| **Live cursors / laser** | `AppState.collaborators` drives interactive canvas overlays. |
| **File sync in collab** | `FileManager` patterns with Firebase-related stack in app dependencies. |
| **Reconciliation** | `reconcileElements` merges local and remote element lists deterministically. |

### 4.5 Theming, localization, and presentation

| Feature | Description |
|---------|-------------|
| **Themes** | Light/dark and related `AppState` visual settings. |
| **Locales** | `locales/` + `i18n/` in library; language detection in app. |
| **Export background / padding** | Controls for how exports look on non-canvas backgrounds. |

### 4.6 Developer-facing features (embedding contract)

| Capability | Purpose |
|------------|---------|
| **`onChange(elements, appState, files)`** | Full-scene persistence hook for hosts. |
| **`onIncrement`** | Efficient streaming of **durable** vs **ephemeral** increments. |
| **`updateScene` / `applyDeltas`** | Imperative scene updates with correct capture/undo behavior. |
| **Subpath exports** | Import `@excalidraw/excalidraw/element/*` etc. for advanced tooling. |
| **Custom actions & UI** | `registerAction`, custom stats, controlled menu areas. |

### 4.7 Font and text rendering pipeline

| Feature | Description |
|---------|-------------|
| **Bundled fonts** | In-repo font sources and metadata under `packages/excalidraw/fonts/`. |
| **Subsetting** | WASM-backed subsetting (Harfbuzz / WOFF2) for efficient font delivery—see `subset/` and `scripts/wasm/`. |

---

## 5. User journeys (requirements-style)

The following **journey requirements** are inferred from architecture and UI modules; they are not exhaustive acceptance tests.

1. **Sketch a flow** — User opens editor, selects arrow/rectangle tools, binds arrows to boxes, adds labels, exports SVG for a document.
2. **Embed in product** — Developer installs `@excalidraw/excalidraw`, imports `index.css`, renders `<Excalidraw />` in a sized parent, persists `onChange` payloads to their backend.
3. **Collaborate** — Host user starts a session (app), shares room link, remote users see live updates and awareness; binary assets sync without corrupting `FileId` references.
4. **Recover from conflicts** — Concurrent edits merge per-element using `version`, `versionNonce`, and fractional `index` ordering; local in-progress edits (`editingTextElement`, `newElement`) are respected per `reconcileElements` rules.
5. **Undo a mistaken edit** — Operations captured as `IMMEDIATELY` enter `History`; remote-only init may use `NEVER` to avoid polluting local undo.

---

## 6. Technical limitations

Limitations are **product- and architecture-level**: they constrain what Excalidraw reasonably promises, independent of any single bug backlog.

### 6.1 Canvas and rendering constraints

| Limitation | Impact |
|------------|--------|
| **DOM + Canvas hybrid** | Rich UI uses React/DOM; the document is drawn on **canvas** layers. Screen readers and search engines **do not** “see” canvas content as structured text without parallel representations. |
| **Performance scaling** | Very large element counts stress **static render** scheduling, **hit-testing**, and **memory**. Mitigations exist (culling, throttling) but **do not remove asymptotic costs**. |
| **Pixel-perfect export variance** | Export pipelines may differ slightly from on-screen composition due to **font loading**, **device pixel ratio**, and **browser canvas** implementations. |
| **Dual-layer rendering** | Static vs interactive canvases depend on **careful state slicing**; misuse of APIs bypassing `syncActionResult` can desynchronize visuals and history. |

### 6.2 Platform and environment

| Limitation | Impact |
|------------|--------|
| **Browser dependency** | Requires modern **Canvas 2D**, **ES modules**, and related Web APIs; **iframe** automation and some embedded contexts cannot access subframes (documented in tooling notes for browser MCP—mirrors real embed limits). |
| **React coupling (library)** | The primary embed surface is **React**. Non-React hosts need wrappers or indirect integration. |
| **Node version drift** | Tooling expects **Node ≥ 18**; Docker build uses **Node 22**—CI/local drift can cause “works on my machine” issues if ignored. |
| **Yarn 1 workspaces** | Lockfile and workspace assumptions are **Yarn classic**-shaped; other package managers may work unofficially. |

### 6.3 Collaboration and consistency

| Limitation | Impact |
|------------|--------|
| **Transport not in core library** | Realtime **Socket.IO/Firebase** wiring lives in **`excalidraw-app`**. Embedders must supply their own **network** and **authorization** model. |
| **CRDT completeness** | Reconciliation is **deterministic** and field-aware, but **complex concurrent structural edits** (e.g. conflicting reparenting) still require careful host policies and testing. |
| **Binary asset consistency** | Images require **`BinaryFiles`** coordination; incomplete file sync yields **broken references** in scenes. |
| **Awareness vs. authority** | **Collaborator** presence is **ephemeral UI state**; authoritative document merges still center on **element lists** and capture rules. |

### 6.4 Data model and extensibility

| Limitation | Impact |
|------------|--------|
| **JSON-serializable elements** | Deep host-specific metadata on elements is discouraged; exotic types must map into supported `ExcalidrawElement` shapes or live **outside** the scene. |
| **Soft deletes** | `isDeleted` tombstones remain in maps for **history/collab**; exporters and host queries must **filter** non-deleted elements explicitly. |
| **Monolithic `App` class** | The orchestration surface is **large** (`App.tsx`), raising the cost of **contributor onboarding** and **risk** for cross-cutting changes. |
| **Package coupling** | `Store` references `App` types (`element` → `excalidraw` inward reference). Reuse of `@excalidraw/element` **without** the editor shell is **not** a supported goal. |

### 6.5 Security and content safety

| Limitation | Impact |
|------------|--------|
| **Embed attack surface** | Embeds and URLs must pass **sanitization** and validation hooks; hosts overriding defaults assume **XSS** responsibility. |
| **Clipboard and file paste** | Pasted content can include **large binaries**; hosts should enforce **quota** and **malware scanning** policies at integration boundaries. |

### 6.6 Build, distribution, and observability

| Limitation | Impact |
|------------|--------|
| **Dual dev/prod bundles** | Consumers must align **development** vs **production** entry points with bundler conditions to avoid **dev-only** behavior in production. |
| **WASM/font payload** | Subsetting WASM and font assets **increase bundle complexity** and build toolchain requirements (see `scripts/wasm/`). |
| **Sentry coupling (app)** | Production monitoring is **optional** but configured in app dependencies; **docker** build scripts may disable Sentry for reproducible artifacts—error telemetry is then reduced. |

### 6.7 Accessibility limitations (explicit)

| Limitation | Impact |
|------------|--------|
| **Canvas as primary representation** | Without a **parallel accessible model**, diagram semantics may not be exposed to assistive tech beyond surrounding UI chrome. |
| **Pointer-centric tools** | Drawing workflows assume **fine pointer control**; keyboard coverage focuses on **commands**, not every geometric gesture. |

---

## 7. Traceability matrix (features → architectural anchors)

Quick map from **§4** themes to **where** the codebase grounds them (for reviewers and agents).

| Theme | Primary anchor (docs) | Code neighborhoods |
|-------|------------------------|------------------|
| Command pipeline | [`excalidraw-package-architecture.md`](../findings/excalidraw-package-architecture.md) §4, §7 | `actions/`, `syncActionResult` in `App.tsx` |
| Scene & undo | [`element-package-architecture.md`](../findings/element-package-architecture.md) §3 | `Scene`, `Store`, `delta.ts` |
| Rendering | [`excalidraw-package-architecture.md`](../findings/excalidraw-package-architecture.md) §5 | `scene/Renderer.ts`, `renderer/staticScene.ts`, `interactiveScene.ts` |
| Collaboration | [`domain-glossary.md`](./domain-glossary.md) “Collaboration” | `excalidraw-app/collab/*`, `reconcile.ts` |
| Build & toolchain | [`techContext.md`](../memory/techContext.md) | Root `package.json`, `scripts/buildPackage.js`, `Dockerfile` |

---

## 8. Document maintenance

- **Update triggers:** major version bumps of `@excalidraw/excalidraw`, new collaboration transports, or material changes to the element schema.
- **Owner (workspace):** product/docs maintainers; keep in sync with [`projectbrief.md`](../memory/projectbrief.md) for high-level goals.
- **Version:** 1.0 (2026-03-26), aligned with discovery session dates in [`project-overview.md`](../findings/project-overview.md).

---

*This PRD intentionally balances **product language** with **engineering truth** from the monorepo. For exhaustive API contracts, refer to TypeScript definitions under `packages/excalidraw` and published `dist/types`; for operational runbooks, refer to root scripts and `Dockerfile`.*
