# Product context

UX-oriented view of **Excalidraw** in this monorepo: who uses it, what “good” feels like on the canvas, and concrete scenarios. Requirements and feature inventory live in [`docs/product/PRD.md`](../product/PRD.md); vocabulary in [`docs/product/domain-glossary.md`](../product/domain-glossary.md).

## Details

For technical architecture → [`docs/technical/architecture.md`](../technical/architecture.md).

For repository and delivery split (library vs app) → [`projectbrief.md`](./projectbrief.md).

For onboarding (install, scripts, troubleshooting) → [`docs/technical/dev-setup.md`](../technical/dev-setup.md).

For tooling versions and script matrix → [`techContext.md`](./techContext.md).

---

## Audiences (summary)

| Audience | What they need from the product |
|----------|----------------------------------|
| **Canvas users** (engineers, PMs, educators, designers) | Fast sketching, hand-drawn readability, sharing exports, light collaboration in the hosted app. |
| **Embedders** (frontend / platform engineers) | A stable **React** surface, published **CSS**, imperative API (`ExcalidrawImperativeAPI`), and hooks for scene sync (`onChange`, `onIncrement`, reconciliation helpers). |
| **Operators** (SRE, self-hosters) | A **Vite**-built static app and a **Docker/nginx** deployment path for the shell around the library. |

Aligned with persona tables in [`docs/product/PRD.md`](../product/PRD.md) §3.

---

## UX goals

- **Low ceremony:** Users reach drawing tools quickly; defaults favor placing shapes, text, arrows, and freehand marks without heavy upfront configuration (see PRD **G-1**).
- **Informal but clear output:** The board reads as **sketch-like** and vector-sharp when zoomed or exported—not a polished DTP tool (PRD **G-2**).
- **Portable scenes:** Users expect to **save, reload, and share** a document made of **elements** plus editor state and file references, not a host-opaque binary (PRD **G-3**).
- **Embeds feel native:** In a host app, the editor should sit in a sized parent, respect **UIOptions** / custom chrome, and expose **updateScene**-style control without forking core rendering (PRD **G-4**).
- **Shared presence in the app:** In `excalidraw-app`, multi-user sessions imply **shared scene updates**, **remote pointers**, and room-oriented flows—not mandatory for the standalone library package (PRD **G-5**).

---

## Scenarios

### S1 — Embed the whiteboard in a product

A team embeds `<Excalidraw />` with `initialData`, loads **`index.css`** from the package export map, and listens to **`onChange`** to persist `elements` and `appState`. **Success:** the board renders correctly at container size, updates propagate to the host store, and TypeScript types match published `dist/types`.

### S2 — Sketch an architecture diagram quickly

A user selects rectangle / arrow / text tools, binds arrow endpoints to shapes, groups and aligns elements, then exports **PNG** or **SVG**. **Success:** bindings stay consistent when shapes move; export matches on-screen framing (within known export constraints in PRD non-goals).

### S3 — Reuse stencils from the library sidebar

A user adds shapes to the **library**, names items, and drags them back onto the **Scene**. **Success:** library items round-trip as structured data; the sidebar reflects current **`LibraryItem`** state (see glossary **Library** / **Scene**).

### S4 — Undo a mistaken edit

A user draws, moves, and deletes elements, then uses **undo/redo**. **Success:** steps map to **`History`** / **`Store`** capture semantics; soft-deleted elements (`isDeleted`) still reconcile with collaboration rules where applicable (glossary **NonDeleted** / **CaptureUpdateAction**).

### S5 — Join a collaborative session (hosted app)

A user opens a room in **`excalidraw-app`**, sees remote **collaborators** and scene updates, and uses app-wired transport (e.g. **Socket.IO** / **Firebase** per app dependencies). **Success:** local edits merge without corrupting **`Scene`** order (`index`, **version** fields); presence feels responsive (PRD §4.4 / architecture collab notes).

---

## Out of scope for this document

No API reference, shortcut tables, or full feature matrix—use PRD §4 and the glossary.
