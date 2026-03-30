# Domain glossary

Business and product terms used in this repository (Excalidraw monorepo). Definitions align with how concepts appear in code and UX, not third-party marketing copy.

---

## A

- **Action** — A named editor command (e.g. delete selection, export) registered with `ActionManager` and often bound to UI or shortcuts. See `packages/excalidraw/actions/`.

- **App state (`AppState`)** — React-held editor UI and session state: active tool, zoom, scroll, selection, dialogs, theme, view modes, etc. Distinct from the list of drawn **elements** (see **Scene**).

- **Arrow (tool / element)** — Connector geometry between shapes; supports arrowheads and **binding** to other elements. Tool constant: `TOOL_TYPE.arrow` in `packages/common/src/constants.ts`.

---

## B

- **Binding (arrow binding)** — Logical attachment of an arrow endpoint to a **bindable** shape so the arrow moves when the shape moves. User-facing preference: binding enabled/disabled in editor state.

- **Binary file / `BinaryFiles`** — Map of image (and similar) assets referenced by file IDs from **image** elements; passed with scene data in APIs like `onChange`.

---

## C

- **Canvas** — The drawable surface (and related interactive layer) where **elements** are rendered; implemented with HTML canvas and Rough.js-style drawing in the editor package.

- **Capture update** — Policy for whether a change is recorded in the **Store** for undo/redo (`IMMEDIATELY`, `NEVER`, `EVENTUALLY`). Documented on `updateScene` in `packages/excalidraw/components/App.tsx`.

- **Collaboration / collaborating** — Multiple users working on related scene data; in the app layer this involves **collaborators**, realtime transport (e.g. socket.io in `excalidraw-app`), and optional `onIncrement` for hosts.

- **Collaborator** — Remote participant represented in `AppState` (e.g. cursor, identity); stored in a collaborators map during live sessions.

---

## D

- **Delta / increment** — A structured change emitted by the **Store** so **History** or external sync (`onIncrement`) can apply or record updates.

---

## E

- **Element** — One drawable object on the **scene** (rectangle, text, arrow, image, frame, etc.). Typed as `ExcalidrawElement` and related types in `@excalidraw/element`.

- **Embeddable** — An element type that hosts external web content (iframe-like); subject to validation and security rules in the editor.

- **Excalidraw (product)** — The hand-drawn style diagramming / whiteboard experience delivered as the **excalidraw-app** and as the **`@excalidraw/excalidraw`** React package.

- **Export** — Output of the current **scene** as image (PNG/SVG), JSON, or other formats via editor actions and host hooks (`onExport`).

---

## F

- **Frame / magic frame** — Container-like elements for grouping and presentation; `TOOL_TYPE.frame`, `TOOL_TYPE.magicframe` in `packages/common/src/constants.ts`.

- **Freedraw** — Freehand pencil strokes (`TOOL_TYPE.freedraw`).

---

## G

- **Grid mode** — Optional alignment grid for placement and snapping (`gridModeEnabled` in app state).

---

## H

- **Hand tool** — Pan the viewport without editing (`TOOL_TYPE.hand`).

- **History** — Undo/redo stack driven by durable **Store** increments; exposed via API (`history.clear`, etc.).

- **Host application** — Product that embeds `<Excalidraw />` and receives callbacks / imperative API (`onChange`, `updateScene`, …).

---

## I

- **Initial data** — Optional payload (elements, app state fragment, library items, files) passed into the editor on load; restored during initialization.

---

## L

- **Laser pointer** — Presentation-style pointer overlay (`TOOL_TYPE.laser`).

- **Library (shape library)** — Reusable templates users can insert into the **scene**; can be updated via API (`updateLibrary`) and persisted per product integration.

- **Linear element** — Multi-point line or arrow (as opposed to a simple bounding-box shape).

---

## M

- **Monorepo** — Single repository (`excalidraw-monorepo`) containing app, packages (`common`, `element`, `math`, `excalidraw`, `utils`), and **examples**.

---

## R

- **Renderer** — Subsystem that draws **scene** content to canvas (`Renderer` in editor code).

- **Rough style** — Hand-drawn visual appearance (Rough.js) applied to many shapes.

---

## S

- **Scene** — The current document: ordered **elements** plus associated files; `Scene` class holds elements and notifies on updates.

- **Scene data** — Serializable bundle (elements, app state slice, collaborators, files) used for load/save and **export**.

- **Selection / lasso** — Modes for picking elements (`TOOL_TYPE.selection`, `TOOL_TYPE.lasso`).

- **Store** — Domain layer that snapshots **AppState** and elements for undo/redo and emits **increments** for collaboration or observability.

---

## T

- **Tool** — Active drawing or navigation mode from `TOOL_TYPE` (rectangle, text, eraser, embeddable, etc.).

---

## U

- **UIOptions** — Host-configurable flags for which canvas actions and tools appear in the packaged editor (`DEFAULT_UI_OPTIONS` in `@excalidraw/common`).

---

## V

- **View mode** — Read-only or restricted interaction so users can view without editing (`viewModeEnabled`).

---

## Z

- **Zen mode** — Reduced UI chrome for focus (`zenModeEnabled`).

---

## Source verification

- `packages/common/src/constants.ts` — `TOOL_TYPE`, `LIBRARY_DISABLED_TYPES`, `ARROW_TYPE`, `DEFAULT_FILENAME`, editor keys.
- `packages/excalidraw/README.md` — embed and integration terminology.
- `packages/excalidraw/components/App.tsx` — `AppState`, `Scene`, `Store`, `History`, `updateScene`, `onChange`.
- `docs/memory/productContext.md` — product-facing summary.
