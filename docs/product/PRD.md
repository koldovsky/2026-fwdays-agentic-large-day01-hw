# Product Requirements Document (PRD): Excalidraw

**Document type:** reverse engineering (deriving requirements from product behavior, UX copy, and code architecture).  
**Version:** 1.0  
**Status:** working draft for learning / domain alignment.

**Related materials:** [`domain-glossary.md`](domain-glossary.md) (terms as in code), [`../memory/productContext.md`](../memory/productContext.md) (scenarios and constraints from the repository).

---

## 1. Product goals

### 1.1 One-liner

**Excalidraw** is a web editor for diagrams and sketches with a hand-drawn look, focused on fast drawing, collaboration, and embedding in other applications.

### 1.2 Problem it solves

- Professional diagramming tools are often heavy, require an account, or produce perfectly straight lines, which slows quick thinking sessions and explaining ideas.
- A **low barrier to entry** is needed: open a tab and draw; minimal setup before the first useful result.
- Teams need **real-time collaboration**, **view links**, and **export** to images / scene files without vendor lock-in at the data format level (JSON-compatible scene).

### 1.3 Value proposition

| Aspect | User expectation |
|--------|------------------|
| Speed | Tools, shortcuts, command palette; minimal modal steps before drawing |
| Style | Default “sketch” / hand-drawn look (distinct from “corporate” vector) |
| Data control | Local browser persistence + save to file; warnings about data loss when storage is cleared |
| Integration | NPM package, imperative API for embedders; PNG/SVG export, etc. |
| Collaboration (hosted) | Rooms, cursors, reconciling scene changes across clients |

### 1.4 Product goals (measurable intents, reverse-engineered)

- **Time-to-first-stroke:** the user sees tool hints and can start drawing without mandatory registration (in the baseline web app).
- **Safety of destructive flows:** loading a file or link **does not overwrite** the current scene without explicit confirmation; modal copy mentions backup options (export image, save to disk, etc.).
- **Reach:** multilingual support via locales with translation coverage metadata.

### 1.5 Non-goals (explicit product boundaries)

- Full replacement for professional CAD / print layout / 3D.
- A single mandatory cloud account as a condition of use (baseline scenario is local in the browser).
- Guaranteed offline-first with no platform limits (depends on PWA / network for collaboration).

---

## 2. Target audience

### 2.1 Primary segments

| Segment | Needs | How the product addresses them |
|---------|--------|--------------------------------|
| **Developers and tech leads** | Fast architecture sketches, sequence / flow, explanations in PRs and docs | Shapes, arrows, frames, Mermaid import, image export |
| **Product / UX / design** | Workshops, journey maps, low-fi diagrams | Hand-drawn style, element library, collaboration |
| **Teachers and facilitators** | A board for sessions without installing a client | Web, laser / presentation modes where available, sharing |
| **Embedders** | Diagrams inside their own apps | `@excalidraw/excalidraw` package, `ExcalidrawImperativeAPI`, external scene and file control |

### 2.2 Secondary segments

- Mobile users (UI adaptation: e.g. hidden shortcut hints on phones).
- Users who generate diagrams from text / Mermaid (TTD / chat flows in the hosted shell where implemented).

### 2.3 Competency assumptions

- Basic computer literacy; for collaboration, understanding of links and rooms.
- For Mermaid / AI features, willingness to read messages about limits, generation errors, and short prompts.

---

## 3. Key capabilities

### 3.1 Canvas and drawing tools

- **Tools:** selection, lasso, basic shapes (rectangle, diamond, ellipse), line, arrow, freedraw, text, image, eraser, hand (pan), frame, magic frame, embeddable / iframe elements, laser (where enabled).
- **Scene:** canonical element list (`Scene`), z-order (including fractional indices for multiplayer), groups, arrow bindings, deletion with recovery via history.
- **UI state:** separate from the scene (`AppState`): active tool, selection, zoom/scroll, open dialogs, theme, collaborators, etc.

### 3.2 History and commands

- **Undo / redo** via change deltas (`History` / `Store`), with collaboration in mind (e.g. limiting `version` / `versionNonce` updates when applying history).
- **Editor operations** as commands (`Action` + `ActionManager`): keyboard shortcuts, panels, command palette.

### 3.3 Export, import, persistence

- Export to images and other formats (depends on build).
- Save / load scene from file; **overwrite confirmation** when replacing the current scene.
- Messaging about **data loss risk** when relying on browser storage (hosted variant).

### 3.4 Library

- Personal element library (`Library`, `LibraryItem`), persistence via adapters; loading libraries with an allowed-domain allowlist.
- URL token support for opening library content (in the app shell).

### 3.5 Collaboration and sharing (hosted app)

- **Live collaboration:** WebSocket events, remote cursors and selection (`Collaborator`), periodic full scene sync, cross-tab sync timeouts.
- **Element reconciliation** across clients (`reconcile`): rules for discarding stale remote updates during local editing, comparing `version` / `versionNonce`.
- **Collaboration links** (dialog in the shell; storage with prefixes for file types).

### 3.6 Mermaid and diagram generation

- Converting a subset of Mermaid diagrams into Excalidraw elements (UI lists supported families; others may behave as images).
- Chat / TTD flows: natural language → diagram; handling short prompts, errors, rate limits; chat persistence in **IndexedDB** (storage constants in the app).

### 3.7 Internationalization and accessibility

- Locale set with coverage percentage.
- Help and shortcuts as part of first-run experience (welcome screen).

### 3.8 Developer integration

- Imperative API for updating elements, files, scroll, selection.
- Element types remain **JSON-serializable** and suitable for peer exchange (no client-only fields on the element record).

---

## 4. Technical constraints

### 4.1 Platform and rendering

- **Client web application:** React, drawing on **Canvas** (static, interactive, and intermediate layers for in-progress gestures).
- Performance depends on element count, image size, and collaboration update frequency; viewport visibility is optimized by the renderer.

### 4.2 Data and storage

- Large binary data (images) is kept separate from the element array: **`BinaryFiles`** / `BinaryFileData`, referenced from elements via `fileId`.
- Browser limits: **IndexedDB**, quotas, user data clearing.
- **Maximum upload file size:** guideline **4 MiB** (constant in hosted app code).

### 4.3 Network and collaboration

- Latency and disconnects affect consistency; there are **full-scene resync intervals** and **cross-tab sync timeouts**.
- Cursor updates are **throttled** (~30 fps) to reduce load.

### 4.4 Compatibility and data schema evolution

- Elements carry **`version`** / **`versionNonce`** for conflict resolution and migrations.
- Element order for collaboration: **`OrderedExcalidrawElement`** with mandatory fractional **`index`**; new elements may temporarily have `index: null` until reconciled.
- Library migrations (v1 → v2) are supported in the data layer.

### 4.5 Security and trust

- External library loading is restricted by a **domain allowlist**.
- Embedded resources (iframe / embeddable) carry standard XSS / clickjacking risks—embedders need discipline and CSP policies.

### 4.6 Hosted product dependencies

- External services (e.g. **Firebase** for link/room storage prefixes) affect availability of sharing and collaboration unless self-hosted / another backend is used.

---

## 5. Success criteria (PRD-style, reverse-engineered)

- The user can **produce a clear diagram** in one session without a training course.
- **Critical actions** (replacing the scene) are protected by confirmation with save options.
- **Collaboration:** two clients see a consistent scene on a stable network; conflicts are resolved by predictable reconcile logic.
- An **embedder** can update the scene and files via the API without knowing the internal React component structure.

---

## 6. Open questions (for clarification, not from code)

- Commercial model for separate tiers (Excalidraw+, enterprise)—outside the scope of this reverse PRD.
- Long-term roadmap is aligned publicly with maintainers; this document does **not** replace the official roadmap.

---

_This document is aligned with in-repo notes (`productContext`, `domain-glossary`) and typical Excalidraw product behavior; update sections 3–4 when the code changes materially._
