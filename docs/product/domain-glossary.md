# Domain glossary

Short definitions of core concepts in this **Excalidraw** codebase. Wording is aligned with types and classes in the repository (not a marketing glossary).

| Term | Meaning in this project |
|------|-------------------------|
| **Excalidraw** | The **product** (virtual whiteboard) and the **embeddable delivery**: the npm package `@excalidraw/excalidraw` exports the React `Excalidraw` component from `packages/excalidraw/index.tsx`, plus styles and APIs in `packages/excalidraw/README.md`. The **hosted** shell (Firebase, collab, PWA, backend URLs) is **`excalidraw-app/`** and composes the library—it is not required for a minimal embed. |
| **Element** | A single drawable or structural item on the canvas, modeled by the **`ExcalidrawElement`** union in `@excalidraw/element` (`packages/element/src/types.ts`). Shapes include rectangles, arrows, text, frames, images, and more. The type is intended to stay **JSON-serializable** and **peer-shareable** (see comment on `ExcalidrawElement` in that file). Elements carry geometry, style, grouping, deletion flags, and ordering metadata (`Ordered` / fractional index). |
| **Scene** | The **`Scene`** class (`packages/element/src/Scene.ts`, re-exported from `@excalidraw/element`) that owns the **current graph of elements**: maps and ordered lists of all elements (including deleted), non-deleted views, frames, selection helpers, and subscribers for updates. The editor’s `App` (`packages/excalidraw/components/App.tsx`) holds a `Scene` instance; **`Renderer`** and interaction logic read from it. |
| **AppState** | The large **`AppState`** interface (`packages/excalidraw/types.ts`) backing the editor `App` React **`state`**. It covers UI mode (welcome screen, dialogs, context menu), **active tool** and selection, in-progress edits (`newElement`, `multiElement`, …), viewport (**scroll**, **zoom**), export options, theme, collaborators, snap lines, and many transient editor flags. It is **editor chrome and session state**, distinct from the serializable element list held in the scene. |
| **Tool** | The user’s **current drawing or navigation mode**, represented by **`ActiveTool`** in `packages/excalidraw/types.ts`: a **`ToolType`** (e.g. `selection`, `rectangle`, `arrow`, `text`, `hand`, `eraser`, `frame`, …) or `type: "custom"` with a `customType` string, plus fields such as **`locked`** and **`lastActiveTool`**. `AppState.activeTool` drives pointer handling and toolbar highlighting. |
| **Action** | A **named editor command** object implementing **`Action`** in `packages/excalidraw/actions/types.ts`: **`name`**, **`perform`** (current elements, `appState`, optional form payload, `App`), optional **`keyTest`** / **`predicate`**, UI **`PanelComponent`**, **`trackEvent`**. **`ActionManager`** in `packages/excalidraw/actions/manager.tsx` routes keyboard, UI panels, and `executeAction` into **`perform`**; results are **`ActionResult`** (elements / `appState` / files updates). Default actions are registered via `packages/excalidraw/actions/register.ts`; undo/redo are extra actions wired to **`History`** (`packages/excalidraw/components/App.tsx`). |

## Boundaries (quick reference)

- **Document data** — the ordered element graph and maps live in **`Scene`** (`packages/element/src/Scene.ts`), not inside **`AppState`**.
- **Transient editor UI** — **`AppState`** (`packages/excalidraw/types.ts`) is React state on **`App`**: tools, selection, dialogs, viewport, collaborators, etc.
- **Library vs. host** — **`@excalidraw/excalidraw`** (`packages/excalidraw/`) is the embeddable editor; **`excalidraw-app/`** is the product shell (inferred from workspace layout and dependencies in `excalidraw-app/package.json`).

## Related documentation

- [`docs/memory/productContext.md`](../memory/productContext.md) — audiences and flows.  
- [`docs/memory/projectbrief.md`](../memory/projectbrief.md) — repo purpose and surfaces.  
- [`docs/technical/architecture.md`](../technical/architecture.md) — runtime and package boundaries.  
- [`docs/memory/systemPatterns.md`](../memory/systemPatterns.md) — action pattern and editor core summary.
