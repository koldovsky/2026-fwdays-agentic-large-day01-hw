# Domain glossary

Vocabulary for **this Excalidraw monorepo**: names as they appear in code, meanings **inside** the editor and packages—not generic programming or UI words.

For repo layout, state layers, and command flow, see [`docs/memory/projectbrief.md`](../memory/projectbrief.md), [`docs/memory/systemPatterns.md`](../memory/systemPatterns.md), and [`docs/memory/techContext.md`](../memory/techContext.md). For end-to-end runtime behavior (actions, Scene, rendering), see [`docs/technical/architecture.md`](../technical/architecture.md). For product goals, personas, and feature inventory, see [`docs/product/PRD.md`](./PRD.md). For onboarding, see [`docs/technical/dev-setup.md`](../technical/dev-setup.md). Deeper package notes: [`docs/findings/`](../findings/).

Each term uses: **Definition** → **Where used** → **Don't confuse with** (Ukr. *не плутати з*: colloquial or generic meaning vs this codebase).

---

## Element

**Definition.** Informal name for **one drawable record** in the scene graph. In TypeScript the concrete type is **`ExcalidrawElement`** (a discriminated union); instances live in **`Scene`**.

**Where used.** Same surfaces as **ExcalidrawElement**—[`packages/element/src/types.ts`](../../packages/element/src/types.ts), [`packages/element/src/Scene.ts`](../../packages/element/src/Scene.ts), [`packages/element/src/mutateElement.ts`](../../packages/element/src/mutateElement.ts), [`packages/element/src/renderElement.ts`](../../packages/element/src/renderElement.ts).

**Don't confuse with.** A DOM node, a React element, an SVG tag, or a generic UI “widget”—here **element** means **serializable scene data**, not a rendering-tree node.

---

## ExcalidrawElement

**Definition.** Discriminated union of all drawable / scene-owned records (rectangle, text, arrow, image, frame, etc.). Intended to stay **JSON-serializable** and **peer-shareable** without host-local-only fields (see in-file comment in [`packages/element/src/types.ts`](../../packages/element/src/types.ts)).

**Where used.** Core model in `@excalidraw/element`; consumed by `@excalidraw/excalidraw` (`App`, actions, restore/export), [`packages/element/src/Scene.ts`](../../packages/element/src/Scene.ts), [`packages/element/src/renderElement.ts`](../../packages/element/src/renderElement.ts), and tests.

**Don't confuse with.** DOM nodes, React elements, or SVG primitives—`ExcalidrawElement` is **typed JSON-shaped scene data** for one drawable object, not a live DOM subtree.

---

## NonDeleted / `isDeleted` (soft delete)

**Definition.** Elements are usually **removed logically**: `isDeleted: true` keeps the record in the scene array and maps so **undo**, **history**, **collaboration**, and **reconciliation** can still see tombstones. **`NonDeleted<T>`** is the type-level helper for “this element is not deleted.” It is **not** the same as deleting a key from a map or dropping an array entry.

**Where used.** [`packages/element/src/types.ts`](../../packages/element/src/types.ts) (`NonDeleted`, `NonDeletedExcalidrawElement`); queries on [`packages/element/src/Scene.ts`](../../packages/element/src/Scene.ts); export and library types in [`packages/excalidraw/types.ts`](../../packages/excalidraw/types.ts).

**Don't confuse with.** Hard-deleting a row from a database, dropping an array slot with no tombstone, or “optional” fields that simply omit data—soft delete here keeps **merge/undo/collab** semantics.

---

## OrderedExcalidrawElement

**Definition.** An `ExcalidrawElement` whose `index` (fractional index for z-order and multiplayer ordering) is **non-null**. “Ordered” here means **assigned a scene ordering key**, not merely “sorted”.

**Where used.** [`packages/element/src/types.ts`](../../packages/element/src/types.ts); action signatures and APIs that assume committed scene order (e.g. [`packages/excalidraw/actions/types.ts`](../../packages/excalidraw/actions/types.ts), `onChange` in [`packages/excalidraw/types.ts`](../../packages/excalidraw/types.ts)).

**Don't confuse with.** “Sorted array” in the everyday sense, or CSS `z-index` alone—**ordered** means a **fractional index** is assigned for stable multiplayer ordering.

---

## `version` / `versionNonce` / `FractionalIndex` (`index`)

**Definition.** Fields on each element that support **ordering and conflict resolution**:

- **`version`**: Monotonic counter bumped on change; used with remote updates and save/reconcile paths.
- **`versionNonce`**: Random per-change value so two edits with the same `version` still **tie-break deterministically** (e.g. in [`reconcileElements`](../../packages/excalidraw/data/reconcile.ts)).
- **`index`**: Branded **fractional index** string (or `null` before assignment) for **z-order** and **multiplayer** ordering; kept consistent with array order via helpers such as `syncMovedIndices` / `syncInvalidIndices` (see comments in [`packages/element/src/types.ts`](../../packages/element/src/types.ts)).

**Where used.** Element base shape in [`packages/element/src/types.ts`](../../packages/element/src/types.ts); [`packages/excalidraw/data/reconcile.ts`](../../packages/excalidraw/data/reconcile.ts); [`packages/excalidraw/history.ts`](../../packages/excalidraw/history.ts) (undo/redo vs collab versions).

**Don't confuse with.** npm **semver**, Git commits, or React **`key`**—these fields are **per-element collaboration / merge metadata**.

---

## Scene (`Scene` class)

**Definition.** **Authoritative container** for the ordered element list and maps (including deleted), selection caches, frame-related bookkeeping, and `sceneNonce` for render invalidation. This is **not** the same as “everything on the canvas visually”—it is the **element graph** owned by one editor instance.

**Where used.** [`packages/element/src/Scene.ts`](../../packages/element/src/Scene.ts); instantiated and owned by [`packages/excalidraw/components/App.tsx`](../../packages/excalidraw/components/App.tsx); read by [`packages/excalidraw/scene/Renderer.ts`](../../packages/excalidraw/scene/Renderer.ts).

**Don't confuse with.** A 3D engine scene, a “saved .excalidraw file” blob by itself, or the React component tree—**`Scene`** is the **in-memory element graph** for one editor instance.

---

## `mutateElement` / `newElementWith` / `Scene.replaceAllElements`

**Definition.**

- **`mutateElement`** (module in element package; **`Scene.mutateElement`** on the instance): Updates **one** element in the scene maps, bumping version metadata and related invariants as needed—typical path for **targeted** edits.
- **`newElementWith`**: Returns a **new element object** with shallow updates (immutable-style replacement pattern) without going through `Scene`—often composed before a replace or assignment.
- **`replaceAllElements`**: Replaces the **entire** ordered element list and rebuilds internal maps—used when applying **full scene** payloads (e.g. `updateScene` with `elements`, load, remote sync).

**Where used.** [`packages/element/src/mutateElement.ts`](../../packages/element/src/mutateElement.ts); [`packages/element/src/Scene.ts`](../../packages/element/src/Scene.ts); [`packages/excalidraw/components/App.tsx`](../../packages/excalidraw/components/App.tsx) (`mutateElement` delegating to `scene.mutateElement`).

**Don't confuse with.** ORM “mutate,” Immer patches for unrelated state, or ad hoc `setState`—these APIs are **scene element graph** updates with version/index invariants.

---

## Frame (`ExcalidrawFrameElement` / `frameId` / `frameRendering`)

**Definition.** A **frame** is a scene element (`type: "frame"` or **`magicframe`**) that **groups** other elements via **`frameId`**, supports a **name**, and participates in **clipping / outline / label** rendering controlled by **`AppState.frameRendering`**. Child elements point **up** with `frameId`; frames are part of the same `ExcalidrawElement` model as shapes.

**Where used.** Types in [`packages/element/src/types.ts`](../../packages/element/src/types.ts); structure helpers [`packages/element/src/frame.ts`](../../packages/element/src/frame.ts); `AppState` in [`packages/excalidraw/types.ts`](../../packages/excalidraw/types.ts); host APIs like `updateFrameRendering` on [`packages/excalidraw/types.ts`](../../packages/excalidraw/types.ts) (`ExcalidrawImperativeAPI`).

**Don't confuse with.** HTML `<iframe>`, browser “frame” timing, or Figma “frames” as a generic layout concept without `ExcalidrawFrameElement` / `frameId` semantics.

---

## AppState

**Definition.** React `state` on the **`App`** class: active tool, selection, dialogs, scroll/zoom, theme, **collaborators map**, ephemeral in-progress edits (`newElement`, `editingTextElement`, …), export-related flags, etc. It is the **editor chrome + interaction state** layer, complementary to the element graph in `Scene`.

**Where used.** [`packages/excalidraw/types.ts`](../../packages/excalidraw/types.ts) (`interface AppState`), [`packages/excalidraw/appState.ts`](../../packages/excalidraw/appState.ts) (defaults / helpers); [`packages/excalidraw/components/App.tsx`](../../packages/excalidraw/components/App.tsx); actions in [`packages/excalidraw/actions/`](../../packages/excalidraw/actions/).

**Don't confuse with.** Global Redux for the whole site, router location state, or **`Scene`**—`AppState` is **editor UI + interaction state on `App`**, not the ordered element list.

---

## UIAppState

**Definition.** `AppState` **minus** fields that churn on pointer moves (`scrollX`, `scrollY`, `cursorButton`, `startBoundElement`) so UI subtrees can subscribe without excessive re-renders.

**Where used.** [`packages/excalidraw/types.ts`](../../packages/excalidraw/types.ts); [`packages/excalidraw/context/ui-appState.ts`](../../packages/excalidraw/context/ui-appState.ts) and hooks that consume `UIAppStateContext`.

**Don't confuse with.** Full **`AppState`** or a server session record—`UIAppState` is a **rerender-friendly slice** that omits high-churn pointer/scroll fields.

---

## Store (`Store` class)

**Definition.** Change-capture layer attached to **`App`**: builds **snapshots** of scene + observed `AppState` slices, diffs them into **`StoreDelta`**, and emits **`DurableIncrement` / `EphemeralIncrement`** for history and `onIncrement`-style sync. Coordinates **when** edits become undo steps via scheduled **`CaptureUpdateAction`** semantics.

**Where used.** [`packages/element/src/store.ts`](../../packages/element/src/store.ts); constructed in [`packages/excalidraw/components/App.tsx`](../../packages/excalidraw/components/App.tsx); consumed by [`packages/excalidraw/history.ts`](../../packages/excalidraw/history.ts).

**Don't confuse with.** Redux **`Store`**, TanStack Store, or browser **`localStorage`**—this **`Store`** is **change capture / deltas** attached to **`App`**.

---

## CaptureUpdateAction

**Definition.** Enum-like object **`IMMEDIATELY` | `NEVER` | `EVENTUALLY`** declaring whether the current edit should be captured for **local undo/redo** immediately, never (e.g. remote init), or batched for a later durable step. **`ActionResult.captureUpdate`** in the excalidraw package threads this into the store.

**Where used.** [`packages/element/src/store.ts`](../../packages/element/src/store.ts) (`CaptureUpdateAction`, `CaptureUpdateActionType`); [`packages/excalidraw/actions/types.ts`](../../packages/excalidraw/actions/types.ts) (`ActionResult`).

**Don't confuse with.** Generic UI debounce flags or HTTP cache policies—these values control **undo/history capture** for the element **`Store`**.

---

## History / HistoryDelta

**Definition.** **`History`** maintains undo/redo stacks of deltas; **`HistoryDelta`** is a `StoreDelta` specialization that knows how to **apply** or **invert** changes onto element maps and `AppState` for undo/redo (with collaboration-aware rules around `version` / `versionNonce`).

**Where used.** [`packages/excalidraw/history.ts`](../../packages/excalidraw/history.ts); wired from [`packages/excalidraw/components/App.tsx`](../../packages/excalidraw/components/App.tsx).

**Don't confuse with.** Browser **History API**, Git history, or audit logs—this is **local undo/redo** over **`StoreDelta`**.

---

## Action / ActionResult / ActionManager

**Definition.**

- **`Action`**: Declarative command: `(elements, appState, formData, app) => ActionResult | false` (see [`packages/excalidraw/actions/types.ts`](../../packages/excalidraw/actions/types.ts)).
- **`ActionResult`**: Optional new `elements`, partial `appState`, `files`, plus required **`captureUpdate`** (and related flags)—the **declared delta** from a command.
- **`ActionManager`**: Registers actions, resolves shortcuts / context menu / command palette, runs `perform`, and forwards results to the app’s **`syncActionResult`** updater.

**Where used.** [`packages/excalidraw/actions/types.ts`](../../packages/excalidraw/actions/types.ts), [`packages/excalidraw/actions/manager.tsx`](../../packages/excalidraw/actions/manager.tsx), [`packages/excalidraw/actions/register.ts`](../../packages/excalidraw/actions/register.ts); individual actions under [`packages/excalidraw/actions/`](../../packages/excalidraw/actions/).

**Don't confuse with.** Redux actions, HTTP “actions,” shell CLI commands, or GitHub Actions—**`Action`** here is the **Excalidraw command** shape executed via **`ActionManager`**.

---

## syncActionResult

**Definition.** **`App`** method that applies an **`ActionResult`**: schedules store capture, replaces scene elements when needed, merges `AppState`, handles **files** / image cache, then **`setState`**. Central **apply pipeline** for the action system (see [`docs/memory/systemPatterns.md`](../memory/systemPatterns.md)).

**Where used.** Implemented in [`packages/excalidraw/components/App.tsx`](../../packages/excalidraw/components/App.tsx); referenced from `ActionManager` setup and many UI call sites (e.g. [`packages/excalidraw/components/Stats/DragInput.tsx`](../../packages/excalidraw/components/Stats/DragInput.tsx)); exposed on **`AppClassProperties`** in [`packages/excalidraw/types.ts`](../../packages/excalidraw/types.ts).

**Don't confuse with.** A bare `setState` helper or arbitrary middleware—**`syncActionResult`** is **`App`’s apply pipeline** for **`ActionResult`** into **`Scene`**, **`Store`**, files, and React state.

---

## ToolType / ActiveTool

**Definition.**

- **`ToolType`**: String union of built-in editor tools (`selection`, `rectangle`, `arrow`, `text`, `hand`, `frame`, `laser`, …).
- **`ActiveTool`**: Either `{ type: ToolType; customType: null }` or `{ type: "custom"; customType: string }` for extensibility.

**Where used.** [`packages/excalidraw/types.ts`](../../packages/excalidraw/types.ts); toolbar and pointer routing in [`packages/excalidraw/components/App.tsx`](../../packages/excalidraw/components/App.tsx) and related UI under [`packages/excalidraw/components/`](../../packages/excalidraw/components/).

**Don't confuse with.** OS-level “tools,” design-app plugin toolkits, or CSS `cursor`—**`ToolType` / `ActiveTool`** describe **canvas editing modes** in the editor.

---

## LinearElementEditor

**Definition.** Stateful helper class for **multi-point linear geometry** (lines, arrows): editing **points**, handles, and constraints while the user interacts with the canvas. It is **not** generic “line math”—it is the **editing controller** for `ExcalidrawLinearElement` / arrow flows used from `App` and hit-testing.

**Where used.** [`packages/element/src/linearElementEditor.ts`](../../packages/element/src/linearElementEditor.ts); referenced from [`packages/excalidraw/components/App.tsx`](../../packages/excalidraw/components/App.tsx) and rendering / selection paths.

**Don't confuse with.** VS Code–style editors, pure linear-algebra libraries, or Bézier math in isolation—this class **edits polyline arrows/lines** on the canvas.

---

## Library / LibraryItems / LibraryItem

**Definition.**

- **`LibraryItem`**: One saved **stencil**: metadata (`id`, `status`, `created`, optional `name`) plus `elements: readonly NonDeleted<ExcalidrawElement>[]`.
- **`LibraryItems`**: Readonly list of items; persisted shape includes **`LibraryPersistedData`** (`libraryItems`) in [`packages/excalidraw/data/library.ts`](../../packages/excalidraw/data/library.ts).
- **`Library` (class)**: Internal helper on **`App`** for load/update/persist flows, imperative **`updateLibrary`**, and integration with **Jotai** `libraryItemsAtom`.

**Where used.** Types in [`packages/excalidraw/types.ts`](../../packages/excalidraw/types.ts); logic in [`packages/excalidraw/data/library.ts`](../../packages/excalidraw/data/library.ts); sidebar UI (library tab) under [`packages/excalidraw/components/`](../../packages/excalidraw/components/).

**Don't confuse with.** An npm package “library,” a macOS **Library** folder, or a React “component library” in marketing terms—here **Library** means **saved stencil items** in the product.

---

## Collaboration (product) / Collab / Portal

**Definition.**

- **Collaboration (in the hosted app)** refers to **room-based realtime sync**: Socket.IO client, Firebase-backed files, shareable room links—implemented outside the core embed package in **`excalidraw-app`**.
- **`Collab`** (component class): Orchestrates **starting/stopping** collaboration, **room** lifecycle, **broadcast/receive** scene updates, and **file** sync via **`FileManager`**.
- **`Portal`**: Low-level **socket + room** adapter used by `Collab` (not a UI “portal” in the React sense).

**Where used.** [`excalidraw-app/collab/Collab.tsx`](../../excalidraw-app/collab/Collab.tsx), [`excalidraw-app/collab/Portal.tsx`](../../excalidraw-app/collab/Portal.tsx); scene init paths in [`excalidraw-app/App.tsx`](../../excalidraw-app/App.tsx).

**Don't confuse with.** Async code review on GitHub, comments-only “collab,” or any generic “teamwork”—here **collaboration** is **realtime room sync** in **`excalidraw-app`**.

---

## Collaborator

**Definition.** **Remote participant snapshot** stored in **`AppState.collaborators`**: pointer (or laser) position, optional selection, username, idle state, colors, avatar, socket id, call state flags, etc. Used to **render** others’ cursors and awareness on the **interactive canvas**, not to describe app users in general.

**Where used.** [`packages/excalidraw/types.ts`](../../packages/excalidraw/types.ts) (`Collaborator`, `CollaboratorPointer`); updated from collab code and consumed by interactive rendering in [`packages/excalidraw/renderer/interactiveScene.ts`](../../packages/excalidraw/renderer/interactiveScene.ts) (and related).

**Don't confuse with.** Any logged-in user profile or billing “seat”—**`Collaborator`** is **awareness payload** under **`AppState.collaborators`** for **live cursors/overlays**.

---

## FileId / BinaryFileData / BinaryFiles

**Definition.**

- **`FileId`**: Branded string id for **binary assets** (e.g. images) referenced from elements such as **`ExcalidrawImageElement.fileId`** ([`packages/element/src/types.ts`](../../packages/element/src/types.ts)).
- **`BinaryFileData`**: Payload for one file (`id: FileId`, `mimeType`, `dataURL`, timestamps, optional `version`).
- **`BinaryFiles`**: In-memory map **`Record<ExcalidrawElement["id"], BinaryFileData>`** held on **`App`** for assets tied to the current scene (see [`packages/excalidraw/types.ts`](../../packages/excalidraw/types.ts)).

**Where used.** Types in [`packages/excalidraw/types.ts`](../../packages/excalidraw/types.ts); `App`’s `files` / `imageCache`; import/export in [`packages/excalidraw/data/`](../../packages/excalidraw/data/); collab file sync in [`excalidraw-app/collab/Collab.tsx`](../../excalidraw-app/collab/Collab.tsx).

**Don't confuse with.** Random string IDs with no scene map, or opaque browser **`File`** handles alone—**`FileId`** ties **binary assets** into **`BinaryFiles`** on **`App`**.

---

## ExcalidrawImperativeAPI

**Definition.** Stable **imperative handle** passed to hosts: `updateScene`, `getAppState`, `getSceneElements`, `resetScene`, `addFiles`, `onChange` / `onIncrement` subscriptions, `registerAction`, etc. This is the main **embedding contract** alongside React props.

**Where used.** [`packages/excalidraw/types.ts`](../../packages/excalidraw/types.ts) (`interface ExcalidrawImperativeAPI`); implemented by **`App`** and exposed via [`packages/excalidraw/index.tsx`](../../packages/excalidraw/index.tsx) / context ([`packages/excalidraw/context/`](../../packages/excalidraw/context/)).

**Don't confuse with.** `document.execCommand`, Electron `ipc`, or ad hoc `window.*` globals—this is the **typed embedding contract** next to React props.

---

## `updateScene` / `applyDeltas`

**Definition.**

- **`updateScene`**: Imperative **`App`** method (exposed on **`ExcalidrawImperativeAPI`**) that applies a **`SceneData`-shaped** payload: optional **`elements`** (triggers **`scene.replaceAllElements`**), partial **`appState`**, **`collaborators`**, and optional **`captureUpdate`** so the **`Store`** schedules capture consistently with undo/increment rules.
- **`applyDeltas`**: Takes **`StoreDelta[]`**, **squashes** them, and applies to copies of the current **element map** and **`AppState`** via **`StoreDelta.applyTo`**—used for **incremental** remote or batched sync without replacing the whole scene through `updateScene` alone.

**Where used.** [`packages/excalidraw/components/App.tsx`](../../packages/excalidraw/components/App.tsx); signatures in [`packages/excalidraw/types.ts`](../../packages/excalidraw/types.ts) (`ExcalidrawImperativeAPI`); delta types in [`packages/element/src/store.ts`](../../packages/element/src/store.ts) (`StoreDelta`).

**Don't confuse with.** Blind `setState` merges or generic JSON PATCH—both methods preserve **`Scene` + `Store` capture** rules for undo and sync.

---

## ImportedDataState / SceneData

**Definition.**

- **`ImportedDataState`**: Shape for **loaded** document payloads: optional `elements`, `appState`, `files`, `libraryItems`, metadata (`type`, `version`, `source`), plus `scrollToContent`.
- **`SceneData`**: Smaller **update** payload type used by `updateScene`-style APIs: optional `elements`, `appState`, `collaborators`, `captureUpdate`.

**Where used.** [`packages/excalidraw/data/types.ts`](../../packages/excalidraw/data/types.ts) (`ImportedDataState`); [`packages/excalidraw/types.ts`](../../packages/excalidraw/types.ts) (`SceneData`, `ExcalidrawInitialDataState`); restore pipeline [`packages/excalidraw/data/restore.ts`](../../packages/excalidraw/data/restore.ts).

**Don't confuse with.** Arbitrary REST payloads—both types are **document import/update contracts** consumed by restore / `updateScene` paths.

---

## reconcileElements

**Definition.** Merges **local** ordered elements with **remote** ordered elements using **`version`**, **`versionNonce`**, and **in-progress local edits** (`editingTextElement`, `newElement`, etc.) so multiplayer (or late-arriving payloads) **deterministically** pick winners per element id.

**Where used.** [`packages/excalidraw/data/reconcile.ts`](../../packages/excalidraw/data/reconcile.ts); collaboration and scene init in [`excalidraw-app/App.tsx`](../../excalidraw-app/App.tsx).

**Don't confuse with.** Generic deep-merge utilities or textual diff—**`reconcileElements`** is **per-id multiplayer merge** using **`version` / `versionNonce` / `index`**.

---

## BoundElement

**Definition.** Lightweight **reference** `{ id, type }` (arrow or text) stored in **`boundElements`** on an element: **which other shapes are attached** (e.g. arrow ends, bound text) without duplicating full element data.

**Where used.** [`packages/element/src/types.ts`](../../packages/element/src/types.ts); binding logic [`packages/element/src/binding.ts`](../../packages/element/src/binding.ts) and linear-element editing.

**Don't confuse with.** SQL foreign keys or generic “linked records”—**`boundElements`** are **arrow/text attachment edges** between shapes.

---

## ExcalidrawBindableElement / binding

**Definition.** **`ExcalidrawBindableElement`** is the union of shape types **arrows (and similar) may attach to**—rectangles, ellipses, text, images, frames, embeds, etc. **Binding** is geometry + metadata (e.g. **`FixedPointBinding`**, **`BindMode`**) that ties a **linear element endpoint** to such a host; **`AppState`** carries transient UI such as **`startBoundElement`**, **`suggestedBinding`**, and **`isBindingEnabled`**. Distinct from generic “data binding” or React props.

**Where used.** [`packages/element/src/types.ts`](../../packages/element/src/types.ts) (`ExcalidrawBindableElement`, `BindMode`, `FixedPointBinding`); [`packages/element/src/binding.ts`](../../packages/element/src/binding.ts); [`packages/excalidraw/types.ts`](../../packages/excalidraw/types.ts) (`AppState` binding fields).

**Don't confuse with.** React “data binding,” two-way form models, or MVVM binding—here **binding** is **geometry that attaches linear endpoints** to hosts.

---

## Renderer (scene package)

**Definition.** Class that, given **`Scene`** + viewport parameters, computes **visible / renderable** element sets (memoized) and drives **throttled static canvas** drawing via `renderStaticSceneThrottled`.

**Where used.** [`packages/excalidraw/scene/Renderer.ts`](../../packages/excalidraw/scene/Renderer.ts); wired from [`packages/excalidraw/components/App.tsx`](../../packages/excalidraw/components/App.tsx).

**Don't confuse with.** ReactDOM’s renderer, SSR, or a game engine—this **`Renderer`** computes **visible elements** and drives **throttled static canvas** drawing.

---

## StaticCanvasAppState / InteractiveCanvasAppState

**Definition.** **Typed slices** of `AppState` passed to **static** vs **interactive** canvas renderers: shared viewport/theme/selection subset plus layer-specific fields (e.g. `activeTool`, `collaborators`, `snapLines` on the interactive side).

**Where used.** [`packages/excalidraw/types.ts`](../../packages/excalidraw/types.ts); [`packages/excalidraw/renderer/staticScene.ts`](../../packages/excalidraw/renderer/staticScene.ts), [`packages/excalidraw/renderer/interactiveScene.ts`](../../packages/excalidraw/renderer/interactiveScene.ts).

**Don't confuse with.** Duplicating all of **`AppState`** “for fun”—these are **intentional subsets** fed to **static vs interactive** canvas passes.

---

## DurableIncrement / EphemeralIncrement

**Definition.** **`StoreIncrement`** subtypes emitted when the **`Store`** commits: **durable** increments carry a full **`StoreDelta`** for undo/history and durable sync; **ephemeral** increments carry only **`StoreChange`** for lighter-weight observers.

**Where used.** [`packages/element/src/store.ts`](../../packages/element/src/store.ts); `ExcalidrawProps.onIncrement` in [`packages/excalidraw/types.ts`](../../packages/excalidraw/types.ts).

**Don't confuse with.** Network “durable” delivery guarantees alone—here **durable vs ephemeral** distinguishes **undo-grade `StoreDelta`** vs **lightweight observer** payloads.

---

## App (editor host class)

**Definition.** Large **class component** that **owns** `Scene`, `Store`, `History`, `ActionManager`, canvases, **`Library`**, fonts, and the **imperative API** surface. It is the runtime **orchestrator** for `@excalidraw/excalidraw`, distinct from the **`Excalidraw`** wrapper component in `index.tsx`.

**Where used.** [`packages/excalidraw/components/App.tsx`](../../packages/excalidraw/components/App.tsx); mounted from [`packages/excalidraw/index.tsx`](../../packages/excalidraw/index.tsx) via `InitializeApp`.

**Don't confuse with.** Small route-level “App” components or mobile shell apps—the **`App` class** is the **large editor orchestrator** inside **`@excalidraw/excalidraw`**.
