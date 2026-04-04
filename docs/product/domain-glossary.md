# Domain glossary — Excalidraw

Definitions follow **names and concepts as they appear in TypeScript and runtime code** (`packages/excalidraw`, `packages/element`, `excalidraw-app`). This file satisfies the workshop **domain glossary** checklist in **`.coderabbit.yaml`** (`path: docs/product/domain-glossary.md`) and **`pre_merge_checks` → “Domain glossary”** (≥5 well-defined terms; examples given there: Element, Scene, AppState, Tool, Action).

---

## Element

| Field | Detail |
|-------|--------|
| **Definition (Excalidraw)** | Informal name for **one drawable object** in the editor: shapes, lines, text, images, frames, etc. In code, the scene is an ordered list of elements stored inside **`Scene`**; undo/redo and collaboration operate on that list. |
| **Where it is used** | `packages/element/src/Scene.ts` (element maps and ordering); `packages/excalidraw/components/App.tsx` (editor drives mutations). |
| **Do not confuse with** | **DOM “elements”** (HTML nodes). Here, **element** almost always means **`ExcalidrawElement`** data, not a React or browser element. |

---

## ExcalidrawElement

| Field | Detail |
|-------|--------|
| **Definition (Excalidraw)** | The **TypeScript union type** of all drawable records: rectangles, ellipses, **linear** elements (arrows/lines), text, images, frames, freedraw, etc. It is intended to be **JSON-serializable** and is the payload for save/load and export (see comment in `packages/element/src/types.ts`). |
| **Where it is used** | `packages/element/src/types.ts` (`export type ExcalidrawElement = …`); actions consume `readonly ExcalidrawElement[]` / `OrderedExcalidrawElement[]` (`packages/excalidraw/actions/types.ts`). |
| **Do not confuse with** | A **React component**. `ExcalidrawElement` is **plain data**; rendering turns it into canvas/SVG output. |

---

## Scene

| Field | Detail |
|-------|--------|
| **Definition (Excalidraw)** | The **`Scene`** class holds the **authoritative ordered list** of `ExcalidrawElement`s, maps by id, selection caches, frame lists, and a **scene nonce** for render invalidation. It is the **document model** for “what is on the canvas.” |
| **Where it is used** | `packages/element/src/Scene.ts`; instantiated in `packages/excalidraw/components/App.tsx` (`this.scene = new Scene()`); **`Renderer`** (`packages/excalidraw/scene/Renderer.ts`) reads from `Scene` for visibility culling. |
| **Do not confuse with** | **“Scene” in 3D engines** (meshes/lights). Here it is strictly **2D drawing state** plus ordering and selection bookkeeping. |

---

## AppState

| Field | Detail |
|-------|--------|
| **Definition (Excalidraw)** | **`AppState`** (`export interface AppState` in `packages/excalidraw/types.ts`) is the **editor UI and viewport state**: `activeTool`, `selectedElementIds`, `scrollX`/`scrollY`, `zoom`, theme, open dialogs, export options, transient drag/resize (`newElement`, `selectionElement`, …). It is **`App` React state**, separate from the element list owned by **`Scene`**. |
| **Where it is used** | `packages/excalidraw/types.ts`; `App` constructor initializes from `getDefaultAppState()`; **`ActionResult`** may include `Partial<AppState>` (`packages/excalidraw/actions/types.ts`). |
| **Do not confuse with** | **Application global state** in Redux sense for the whole website. **`AppState`** is **per-editor-instance** state for the Excalidraw editor. |

---

## Tool

| Field | Detail |
|-------|--------|
| **Definition (Excalidraw)** | **`ToolType`** names the built-in tools: `selection`, `rectangle`, `arrow`, `line`, `text`, `freedraw`, `hand`, `eraser`, `frame`, `image`, `embeddable`, `laser`, etc. (`packages/excalidraw/types.ts`). The editor tracks the **active tool** in **`AppState.activeTool`** (`ActiveTool`: either a `ToolType` or `custom`). |
| **Where it is used** | `packages/excalidraw/types.ts` (`ToolType`, `ActiveTool`); toolbar and keyboard handlers switch tools via **`setActiveTool`** on `App`. |
| **Do not confuse with** | **Browser DevTools** or generic “tooling.” Here **tool** means **pointer mode** (what a drag on the canvas creates or how selection behaves). |

---

## Action

| Field | Detail |
|-------|--------|
| **Definition (Excalidraw)** | An **`Action`** is a **registered command object** (`export interface Action` in `packages/excalidraw/actions/types.ts`): `name`, `perform`, optional `keyTest`, `PanelComponent`, etc. **`ActionManager`** dispatches actions from UI, keyboard, context menu, API, or command palette (`ActionSource`). **`perform`** returns an **`ActionResult`** (new elements and/or `appState` patch, `captureUpdate` for history) or `false`. |
| **Where it is used** | `packages/excalidraw/actions/manager.tsx` (`ActionManager`); `packages/excalidraw/components/App.tsx` (`registerAll`, undo/redo actions). |
| **Do not confuse with** | **Redux actions** or HTTP “actions.” Here an **Action** is an **editor-level command** with a stable **`ActionName`** union (`copy`, `undo`, `gridMode`, …). |

---

## Collaboration

| Field | Detail |
|-------|--------|
| **Definition (Excalidraw)** | **Live multi-user editing** for the hosted app: **Socket.IO** rooms (`excalidraw-app/collab/Portal.tsx`, `Collab.tsx`), optional **Firebase** for room files, pointer and scene sync. Not all embeds or iframes expose the same behavior (see `isRunningInIframe()` / `docs/memory/decisionLog.md` UB-001). |
| **Where it is used** | `excalidraw-app/collab/`; `excalidraw-app/App.tsx` (collab API, `isCollabEnabled` props). |
| **Do not confuse with** | **Comments or Git collaboration.** Here it means **real-time shared canvas state** over the network when enabled. |

---

## Library

| Field | Detail |
|-------|--------|
| **Definition (Excalidraw)** | The **shape library** sidebar: saved **library items** (templates) users can insert into the scene. Implemented by the **`Library`** class (`packages/excalidraw/data/library.ts`), with persistence adapters (e.g. **IndexedDB** in the app via `useHandleLibrary` in `excalidraw-app/App.tsx`). |
| **Where it is used** | `packages/excalidraw/data/library.ts`; `packages/excalidraw/components/App.tsx` (`this.library = new Library(this)`); library hooks in `packages/excalidraw/hooks/useHandleLibrary.ts`. |
| **Do not confuse with** | **`node_modules` or npm “library.”** Here **Library** is the **user’s saved shapes** UI and storage. |

---

## Bound element (bound text)

| Field | Detail |
|-------|--------|
| **Definition (Excalidraw)** | **Text bound to a container shape** (e.g. rectangle/diamond with associated **`ExcalidrawTextElement`**), or more generally **binding** between arrows and **bindable** shapes (`startBoundElement`, `suggestedBinding` in `AppState`). Helpers include **`getBoundTextElement`**, **`hasBoundTextElement`** (`packages/element`). |
| **Where it is used** | `packages/element` (text layout, type checks); `packages/excalidraw/types.ts` (`editingTextElement`, binding fields); rendering skips in-canvas text while editing in WYSIWYG (`Renderer` / `staticScene`). |
| **Do not confuse with** | **CSS `position` binding** or data-binding frameworks. Here **bound** means **geometry and id links** between Excalidraw elements (text ↔ container, arrow ↔ shape). |

---

## Linear element

| Field | Detail |
|-------|--------|
| **Definition (Excalidraw)** | **`ExcalidrawLinearElement`** — lines and arrows with **polyline/polygon control points** (`points` array), optional arrowheads, and **binding** to other elements. Created via line/arrow tools; data lives in `packages/element/src/types.ts`. |
| **Where it is used** | `packages/element/src/types.ts`; `packages/excalidraw/renderer/interactiveScene.ts` (linear point handles); `AppState.multiElement`, `selectedLinearElement`. |
| **Do not confuse with** | **Linear algebra** “linear” or **linear workflow** in PM jargon. Here it means **piecewise-linear strokes** (segments between points) on the canvas. |

---

## CodeRabbit alignment

| Config | Requirement |
|--------|--------------|
| **`.coderabbit.yaml` → `path: docs/product/domain-glossary.md`** | Excalidraw-specific terms; for each: name (English, as in code), definition, key files, **“не плутати з”** (here: **Do not confuse with**); required terms **Element, Scene, AppState, ExcalidrawElement, Tool, Action**; desired **Collaboration, Library, Bound Element, Linear Element**. |
| **`pre_merge_checks` → “Domain glossary”** | File exists; **≥5** domain terms with definitions and context (this document lists **10** head terms above). |

---

## Related docs

- **Product-level scope**: `docs/product/PRD.md`
- **Architecture**: `docs/technical/architecture.md`
- **Memory Bank**: `docs/memory/systemPatterns.md`
