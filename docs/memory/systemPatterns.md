# System Patterns

**Scope:** Recurring structural and code patterns (actions, Jotai, tunnels, naming). **Mermaid diagrams, Store/History/Renderer walkthroughs, and canvas layer detail** live in [docs/technical/architecture.md](../technical/architecture.md).

## High-level Architecture

* **Pattern**: **Modular monolith** (Yarn workspaces): a publishable editor library (`@excalidraw/excalidraw`), shared domain packages (`@excalidraw/common`, `element`, `math`, `utils`), a first-party **Vite** host app (`excalidraw-app`), and optional **examples** (e.g. Next.js, script tag). There is **no single repository-wide `src/`**; library UI lives at `packages/excalidraw/`, shared logic often under `packages/<pkg>/src/`, and the app under `excalidraw-app/`.
* **Separation of concerns**:
    * **UI / editor shell**: React components, actions, hooks, canvas/scene orchestration in `packages/excalidraw` (notably `components/`, `scene/`, `renderer/`).
    * **Domain & algorithms**: Geometry, element model, mutations, z-order, bindings in `packages/element` and `packages/math`; cross-cutting helpers, events, constants in `packages/common`; IO/export helpers in `packages/utils`.
    * **Product & I/O**: Collaboration, Firebase, local persistence, marketing UI, and app-level Jotai in `excalidraw-app/` (`data/`, `collab/`, `components/`).

## Core Design Patterns

* **Command / action dispatcher**: User intents are modeled as **`Action`** objects executed by **`ActionManager`**. Each action returns an **`ActionResult`** (partial `appState`, element list deltas, files, capture metadata) rather than mutating ad hoc. Sources are explicit (`ui`, `keyboard`, `contextMenu`, `api`, `commandPalette`).
* **Observer / event bus**: **`AppEventBus`** and **`Emitter`** (`packages/common`) provide typed publish–subscribe for app lifecycle and integration hooks; React **`useEmitter`** bridges subscriptions into the UI layer where needed.
* **Imperative API + context**: The embeddable surface exposes **`ExcalidrawImperativeAPI`** via **`ExcalidrawAPIContext`** / **`ExcalidrawAPISetContext`**, allowing host apps and hooks (e.g. **`useAppStateValue`**, **`useOnAppStateChange`**) to live outside the inner editor tree when wrapped with **`ExcalidrawAPIProvider`**.
* **Atomic UI state (Jotai)**: **`editor-jotai.ts`** uses **`jotai`** with **`jotai-scope`** (`createIsolation`) so each editor instance gets an isolated store. The host app uses a separate **`appJotaiStore`** (`excalidraw-app/app-jotai.ts`) for shell-level atoms (e.g. collaboration flags).
* **Tunnel / slot composition**: **`tunnel-rat`** plus **`TunnelsContext`** exposes named “tunnels” (MainMenu, Footer, Welcome screen slots, dialogs) so the core layout can render **host-injected** UI without tight coupling.
* **Higher-order component**: **`withInternalFallback`** wraps selected components to coordinate **multi-instance** rendering (host vs. internal default) using Jotai counters and tunnel scope.
* **Class-based root controller**: The main **`App`** component is a **`React.Component`** class that holds the editor lifecycle, **`ActionManager`**, and **`roughjs`** instance—central imperative coordination while child UI is largely functional.
* **Compound-style UI**: Complex widgets (e.g. **dropdown menu** stack, **TTDDialog** tabs, **CommandPalette**, **Sidebar**) split into small leaf components sharing local React context for props (e.g. menu content context).
* **Hooks**: **`hooks/`** holds **`use*`** helpers for DOM, scroll, transitions, stable callbacks, clipboard indicators, and **`useAppStateValue`** for API-driven reads of editor state.

## Project Conventions

* **Naming**
    * **React components**: **`PascalCase`** files (e.g. `LayerUI.tsx`, `MainMenu.tsx`).
    * **Hooks**: **`use` + camelCase** in `hooks/` (e.g. `useStableCallback.ts`, `useAppStateValue.ts`).
    * **Actions**: typically **`action<ActionName>.ts(x)`** under `actions/`; central registry in `actions/register`, types in `actions/types.ts`.
    * **Constants / enums**: shared **`UPPER_SNAKE`** and named exports from `@excalidraw/common` (e.g. `KEYS`, `TOOL_TYPE`); app constants in `excalidraw-app/app_constants.ts`.
    * **Contexts**: **`XxxContext`** + **`useXxx`** accessors (e.g. `UIAppStateContext`, `useUIAppState`).
* **File structure** (library): feature folders under `components/` (sometimes with `index.tsx` barrels); **`actions/`**, **`data/`** (encode, restore, blob, library), **`scene/`**, **`renderer/`**, **`context/`**, **`hooks/`** at package root—not a strict “one folder per component with CSS module” rule.
* **Styling**: **Global and partial SCSS** (`css/*.scss`) plus **`clsx`** for conditional class names; shared **`CLASSES`** helpers from `@excalidraw/common`. **CSS Modules are not the default** in the main library.
* **Imports**: **`@excalidraw/<package>`** workspace imports; type-only **`import type`** widely used; eslint guards on some Jotai import paths (`no-restricted-imports` on editor vs app stores).

## Data Flow

* **Editor (unidirectional core loop)**: **Pointer / keyboard / UI** → **`ActionManager.executeAction`** → **`ActionResult`** → central **`App`** updater merges **`AppState`**, **`elements`**, and **`files`** → **canvas/scene** re-render and **`onChange`** (and related callbacks) notify the host. **`CaptureUpdateActionType`** distinguishes history / persistence granularity.
* **Library ↔ host**: Initial data via **`ExcalidrawProps`** / **`initialData`**; ongoing sync via **`onChange`**, **`onPointerUpdate`**, and **`ExcalidrawImperativeAPI`** (load, export, scene helpers). **`reconcileElements`** / **`restore`** paths normalize persisted or remote payloads into the element model.
* **Server / network (app only)**: **`excalidraw-app/data/`** and **`collab/`** integrate **Firebase** and **socket.io**; remote updates feed the same restore/reconcile flows, not a separate global Redux layer.
* **State management summary**: **React state in `App`** for authoritative editor snapshot; **Jotai** for scoped UI and shell concerns; **Context** for drilling API, tunnels, and read-only UI slices (**`UIAppState`**). **No React Query** in the documented stack for editor data; collaboration is app-specific.

## Component Guidelines

* **Logic location**: **Heavy editor logic** stays in **`App`** (class), **`Action`** implementations, and **`scene/` / `data/`** utilities. **Prefer hooks** for reusable UI behaviour, side effects, and subscriptions; use **context** for deep prop avoidance (API, tunnels, sidebar, menus).
* **Styling**: **SCSS layers + `clsx`**; prefer shared constants for class names and layout tokens; **Radix-style primitives** under **`components/`** for accessible overlays/popovers where used.
* **Extensibility**: **Tunnel slots** and **`renderTopLeftUI` / `renderTopRightUI`** props decorate chrome; **`ExcalidrawAPIProvider`** supports tools that must sit **outside** `<Excalidraw>` yet read API.

## Details

- For detailed system architecture and rendering pipeline → see [docs/technical/architecture.md](../technical/architecture.md)
