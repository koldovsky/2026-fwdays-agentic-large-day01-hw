# System patterns — Excalidraw architecture

## Layered model

1. **Shell** — React tree in `packages/excalidraw/` (`components/App.tsx`, menus, hooks) plus, for the full product, **`excalidraw-app/App.tsx`** wiring collab, library adapters, and app-only props (e.g. `detectScroll={false}` — see `decisionLog.md` UB-003).
2. **Scene** — ordered **`ExcalidrawElement[]`** with validation and history helpers in **`@excalidraw/element`** (`packages/element/`).
3. **Application state** — **`AppState`** (tool, zoom, selection, view mode, etc.) in the excalidraw package (`appState`, `types.ts`).
4. **Rendering** — HTML **Canvas** for interactive frames; **Rough.js** for stroke style; SVG export via **`renderer/staticSvgScene.ts`** (`renderSceneToSvg`, etc.) and **`@excalidraw/utils`** export helpers (`exportToSvg`, `exportToCanvas` in tests/APIs).

## Action system

- **`ActionManager`** (`packages/excalidraw/actions/manager.tsx` and action modules) registers **actions** (menu, keyboard, API).
- UI uses **`useExcalidrawActionManager()`** from `components/App` (e.g. `components/main-menu/DefaultItems.tsx`).
- **Pattern**: one action → consistent mutation path → history capture where applicable (not every `AppState` field participates in undo—see upstream changelog for edge cases).

## State: Jotai vs scene

- **Jotai** (`jotai`, `jotai-scope`) backs editor-scoped and UI state in React.
- **Elements + `AppState`** remain the **authoritative drawing model** for serialization, export, and collaboration sync—not ad hoc React state per graphic primitive.

## Collaboration (app package only)

- **`excalidraw-app/collab/`** — `Collab` + `Portal` use **Socket.IO** rooms; optional **Firebase** for file payloads when room keys exist.
- **Not mounted** when `isRunningInIframe()` (`excalidraw-app/App.tsx`) — collaboration stack is absent in that mode (`decisionLog.md` UB-001).

## Canvas vs DOM

- **Canvas** — primary pointer hit-testing and drawing.
- **DOM** — WYSIWYG text (`wysiwyg/`), overlays, focusable UI; must stay in sync with canvas coordinates (scroll handling controlled by **`detectScroll`** prop).

## Package boundaries

| Package | Responsibility |
|---------|----------------|
| `@excalidraw/element` | Element types, bindings, geometry, history deltas |
| `@excalidraw/common` | Shared utilities, constants, `isRunningInIframe`, etc. |
| `@excalidraw/math` | Vector/matrix math |
| `@excalidraw/utils` | Export helpers and shared non-UI utilities |
| `@excalidraw/excalidraw` | Full editor, renderer, public API |

## Extension pattern

- Add **tools**/**actions** through the **action manager** and existing registration flows.
- **Export** should reuse **renderer/export** paths so pixels match the canvas.

## Related reading

- **Commands & versions**: `techContext.md`
- **Product summary**: `projectbrief.md`
- **Code vs docs gaps**: `decisionLog.md` (UB-* entries)
- **Deeper doc (if present)**: `docs/technical/architecture.md`
