# Domain glossary

Terms used across the Excalidraw monorepo product and libraries. Definitions are aligned with code and UX, not external marketing copy.

## Core data model

| Term | Meaning |
|------|---------|
| **Scene** | The drawable content: ordered **elements** plus **app state** (zoom, theme, selected ids, etc.) that the editor persists and restores. Used in: `packages/excalidraw/scene/`. Not to be confused with: the visible viewport — scene includes off-screen elements too. |
| **ExcalidrawElement** | Discriminated union of all canvas element variants — the base type for every shape, text, image, frame, etc. Every variant extends `_ExcalidrawElementBase` carrying common fields (`id`, `x`, `y`, `width`, `height`, `angle`, `version`, `isDeleted`, `boundElements`, …). Defined in: `packages/element/src/types.ts`. Not to be confused with: `ExcalidrawElementType` (the string literal union of `type` discriminators, e.g. `"rectangle"` \| `"text"`, not the full element object). |
| **Element** | Informal shorthand for **ExcalidrawElement** — a shape, text, image, frame, or other object in the scene. Elements have geometry, style, and versioning for sync. Used in: `@excalidraw/element` types. Not to be confused with: a DOM element — Excalidraw renders on `<canvas>`, not individual DOM nodes. |
| **ExcalidrawLinearElement** | Specialized element for lines and arrows: `_ExcalidrawElementBase` plus `points`, `startBinding` / `endBinding`, `startArrowhead` / `endArrowhead`. Covers `type: "line" \| "arrow"`. Defined in: `packages/element/src/types.ts`. Editing logic lives in `LinearElementEditor` (`packages/element/src/linearElementEditor.ts`). Not to be confused with: `ExcalidrawLineElement` (linear with `type: "line"` only) or `ExcalidrawArrowElement` (linear with `type: "arrow"` and `elbowed` flag) — both are narrower sub-types. |
| **BoundElement** | A small record `{ id, type: "arrow" \| "text" }` stored in `_ExcalidrawElementBase.boundElements` to list other elements that attach to this element. Defined in: `packages/element/src/types.ts`. Not to be confused with: `FixedPointBinding` / `startBinding` / `endBinding` on `ExcalidrawLinearElement` (describe how an arrow endpoint binds to a shape, not the back-reference list) or `ExcalidrawBindableElement` (the union of shapes that *can* be bound to). |
| **App state** | UI and viewport state (not always the same as "application settings"): selection, open dialogs, scroll, zen mode, collab flags. Defined in: `AppState` / `UIAppState` in `packages/excalidraw/types.ts`. Not to be confused with: **Scene** — app state is the non-element portion of the scene (UI controls, not canvas objects). |

## Editor & interaction

| Term | Meaning |
|------|---------|
| **Tool / ToolType** | The active drawing / interaction instrument selected in the toolbar. `ToolType` is a string union: `"selection"`, `"lasso"`, `"rectangle"`, `"diamond"`, `"ellipse"`, `"arrow"`, `"line"`, `"freedraw"`, `"text"`, `"image"`, `"eraser"`, `"hand"`, `"frame"`, `"magicframe"`, `"embeddable"`, `"laser"`. Defined in: `packages/excalidraw/types.ts`. See also: `ActiveTool` and `ElementOrToolType` in the same file. Not to be confused with: `ExcalidrawElementType` — a tool is the UI mode for creating elements; an element type is the discriminator on stored shapes. |
| **Action** | A command descriptor for a user or programmatic operation: has `name: ActionName`, `label`, optional `icon`, **`perform`** function (the core logic), optional `keyTest`, `predicate`, `PanelComponent`, and `trackEvent` config. Defined in: `packages/excalidraw/actions/types.ts`. Not to be confused with: `ActionName` (string union of action identifiers, not the full action object) or generic "user action" — here it is a structured, registered command. |
| **ActionManager** | Registry and dispatcher for **Action** objects. Holds `actions: Record<ActionName, Action>`. Key methods: `registerAction` / `registerAll`, `handleKeyDown` (picks best-matching action by `keyPriority` + `keyTest`), `executeAction` (runs from code), `renderAction` (renders `PanelComponent`). Defined in: `packages/excalidraw/actions/manager.tsx`. Not to be confused with: individual actions — the manager is the orchestration layer, not a single command. |
| **Excalidraw (component)** | The main React editor exported from `@excalidraw/excalidraw`; renders canvas, toolbars, and editor dialogs. Not to be confused with: **excalidraw-app** (the full product SPA that wraps this component). |
| **Zen mode** | Reduced chrome / focus mode for drawing (editor state flag). Not to be confused with: **View mode** — zen mode still allows editing, view mode is read-only. |
| **View mode** | Read-only or presentation-style viewing (editor props / state). Not to be confused with: **Zen mode** — view mode disables editing, zen mode only hides UI chrome. |

## Product & infrastructure

| Term | Meaning |
|------|---------|
| **excalidraw-app** | The full product SPA: wraps `<Excalidraw>` with sharing, collab, Firebase/Plus hooks, analytics, PWA, and shell menus. Not to be confused with: the `@excalidraw/excalidraw` npm package (the embeddable editor component). |
| **Workspace package** | An internal npm package in `packages/*` (`@excalidraw/common`, `math`, `element`, `utils`, `excalidraw`) built and linked via Yarn workspaces. |
| **Collab / collaboration** | Real-time multi-user editing using the app's collab layer (`socket.io-client`, `Collab.tsx`). Disabled when the app runs inside an **iframe**. Not to be confused with: **Shareable link** — collab is live sync, shareable link is a one-time scene snapshot URL. |
| **Library (shape library)** | Reusable sets of shapes users can drag onto the canvas; stored locally (IndexedDB via `idb-keyval`) and mergeable from **URL tokens**. Not to be confused with: `@excalidraw/excalidraw` (the npm library) — "library" here means the shape palette. |
| **Shareable link** | Flows that encode or load scene data via URL/backend (`ShareableLinkDialog`, collaboration link helpers in `excalidraw-app/data`). Not to be confused with: **Collab** — shareable link is a static snapshot, not real-time sync. |
| **TTD (text to diagram)** | Dialogs and pipeline that turn text (e.g. Mermaid) into canvas elements (`TTDDialog`, `@excalidraw/mermaid-to-excalidraw`). |
| **PWA** | Progressive Web App: service worker registration in `excalidraw-app/index.tsx` for installability and offline-oriented caching. |
| **Excalidraw Plus** | Cloud-oriented export/integration path in the app (`ExportToExcalidrawPlus`, dedicated iframe export route). Not to be confused with: the open-source Excalidraw — Plus is the commercial cloud layer. |
| **Reconcile** | Merging remote and local element lists with version and deletion semantics (`reconcileElements`, `RemoteExcalidrawElement`). Not to be confused with: **Restore** — reconcile merges two lists, restore parses persisted data. |
| **Restore** | Parsing persisted JSON/blob into validated elements and app state (`restoreElements`, `restoreAppState`). Not to be confused with: **Reconcile** — restore reads from storage, reconcile merges concurrent edits. |
| **Welcome screen** | First-run hints on an empty canvas (`WelcomeScreen`, `showWelcomeScreen`), layout differs on mobile vs desktop. |
| **Top-level vs iframe** | `getFrame()` returns `"top"` or `"iframe"`; drives collab enablement and some UX constraints. |
| **Conditional exports** | Node resolution entries in package `package.json` that pick `development` vs `production` build artifacts for `@excalidraw/*` packages. |
| **Alias (Vite)** | Dev-time path mapping from `@excalidraw/...` to `packages/.../src` so the app does not require a prior `build:packages`. |

## Related docs

- Product goals and scenarios: `docs/memory/productContext.md`
- Architecture summary: `docs/memory/systemPatterns.md`
- Deep dive: `docs/technical/architecture.md`
