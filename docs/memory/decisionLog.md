# Decision Log

_Key architectural decisions and ADRs derived from source code and CHANGELOG._

---

## ADR-001: Yarn Monorepo with Workspace Packages

**Decision**: Use Yarn 1.22 workspaces with `packages/` (math, common, element, excalidraw, utils) and `excalidraw-app/`.

**Rationale**:
- Enables independent versioning and publishing of `@excalidraw/excalidraw` to npm.
- Internal packages resolve from source via Vite path aliases (`vite.config.mts`), eliminating build-first requirement during development.
- Clear layering enforces import discipline (lower packages cannot import higher).

---

## ADR-002: ESM-Only Bundle (UMD Deprecated in 0.18.0)

**Decision**: Ship `@excalidraw/excalidraw` as ES modules only; remove UMD bundle.

**Rationale**:
- Tree-shaking: consumers only bundle what they import.
- Aligns with modern bundler expectations (Vite, Next.js, esbuild).
- Requires `"moduleResolution": "bundler"` (or `node16`/`nodenext`) in consumer `tsconfig.json`.

**Trade-off**: CRA no longer works without ejecting. Webpack consumers must set `resolve.fullySpecified: false`.

*Source*: CHANGELOG 0.18.0 breaking changes.

---

## ADR-003: Branded Types for Coordinates

**Decision**: `GlobalPoint`, `LocalPoint`, `ViewportPoint` are distinct branded types, not plain `{x, y}`.

**Rationale**:
- Prevents silently passing viewport coords to scene-space functions and vice versa.
- All math functions in `@excalidraw/math` accept/return branded types.
- `Point` convenience type still exists; `pointFrom(x, y)` constructs it.

*Source*: `packages/math/src/types.ts`.

---

## ADR-004: Immutable Elements with Version Stamps

**Decision**: `ExcalidrawElement` objects are structurally immutable; mutations go through `mutateElement()` or `newElementWith()`.

**Rationale**:
- Enables cheap change detection via `element.version` (integer, incremented on each mutation).
- `ShapeCache` invalidates roughjs `Drawable` objects using `element.version`.
- Simplifies delta computation in `Store` (compare snapshots by version).

*Source*: `packages/element/src/mutateElement.ts`, `renderElement.ts`.

---

## ADR-005: Store + Delta for Undo/Redo (Multiplayer-Safe)

**Decision**: Replace boolean `commitToHistory` with `CaptureUpdateAction` enum (`IMMEDIATELY` / `EVENTUALLY` / `NEVER`) and property-level deltas (`ElementsDelta`, `AppStateDelta`).

**Rationale**:
- Full-snapshot undo is prohibitive in collaborative sessions with large scenes.
- Property-level diffs enable correct undo of local changes even when remote edits have modified the same elements.
- `NEVER` mode allows remote updates and scene init to bypass the undo stack cleanly.

*Source*: `packages/element/src/store.ts`, `packages/element/src/delta.ts`, CHANGELOG 0.18.0.

---

## ADR-006: Dual Jotai Store Isolation via `jotai-scope`

**Decision**: Two separate Jotai stores: `editorJotaiStore` (inside the component) and `appJotaiStore` (excalidraw-app level).

**Rationale**:
- Prevents atom state from the hosted app leaking into an embedded instance (e.g., if multiple `<Excalidraw />` components are mounted).
- `createIsolation()` from `jotai-scope` wraps hooks to bind them to their respective store.

*Source*: `packages/excalidraw/editor-jotai.ts`, `excalidraw-app/app-jotai.ts`.

---

## ADR-007: End-to-End Encrypted Collaboration

**Decision**: All scene data transmitted over WebSocket and stored in Firebase is AES-GCM encrypted client-side.

**Rationale**:
- Excalidraw server (Socket.io relay + Firebase) never sees plaintext scene contents.
- Encryption key is embedded in the URL fragment (`#roomId,key`) and never sent to the server.
- `encryptData` / `decryptData` in `packages/excalidraw/data/encryption.ts`.

*Source*: `excalidraw-app/collab/Collab.tsx`, `excalidraw-app/data/firebase.ts`.

---

## ADR-008: Font CDN by Default, Self-Hostable via `EXCALIDRAW_ASSET_PATH`

**Decision**: Fonts load automatically from `esm.run` CDN; self-hosting via `window.EXCALIDRAW_ASSET_PATH`.

**Rationale**:
- Removes per-project setup cost for font files.
- Self-hosting option retains full control (copy `dist/prod/fonts/` to the asset path).

*Source*: CHANGELOG 0.18.0; `packages/common/src/font-metadata.ts`.

---

## ADR-009: Three-Canvas Rendering (Static / NewElement / Interactive)

**Decision**: Split rendering across three `<canvas>` elements rather than one.

**Rationale**:
- `StaticCanvas` only redraws on `sceneNonce` change (expensive per-element render amortised).
- `NewElementCanvas` redraws each frame only for the actively drawn element.
- `InteractiveCanvas` redraws for selection, cursors, handles — separate from element redraws.
- Avoids clearing and redrawing finalized elements on every pointer move.

*Source*: `packages/excalidraw/components/canvases/`.

---

## ADR-010: Slot Components (Compound Component Pattern) for Extensible UI

**Decision**: `WelcomeScreen`, `MainMenu`, `DefaultSidebar`, `Toolbar` are compound components with named sub-components as slots (e.g., `<WelcomeScreen.Center.Logo />`).

**Rationale**:
- Host apps can replace individual slots without reimplementing the full container.
- Tunnel-based rendering (`TunnelsContext`) allows `excalidraw-app` components to inject content into the library's UI tree.
- Avoids prop-explosion on the root `<Excalidraw />` component.

*Source*: `packages/excalidraw/components/LayerUI.tsx`, `excalidraw-app/components/AppWelcomeScreen.tsx`.

## Undocumented Behaviors

### Undocumented Behavior #1
- **File**: `packages/excalidraw/components/App.tsx` (L689)
- **What happens**: Double-click detection for desktop uses native browser `dblclick` events, but for touch it is emulated manually via the `lastPointerUpIsDoubleClick` class field. The two paths are never unified, so touch double-tap and mouse double-click go through different code flows with different timing thresholds.
- **Documentation**: None. Comment reads `// TODO this is a hack and we should ideally unify touch and pointer events`.
- **Risk**: AI might add a single `onDoubleClick` handler expecting it to cover all devices, silently missing all touch-based double-taps.

### Undocumented Behavior #2
- **File**: `packages/element/src/store.ts` (L109)
- **What happens**: `Store.scheduleCapture()` (which enqueues an undo-history snapshot) is called from many uncoordinated call sites across the codebase. The store resolves conflicts by precedence (`IMMEDIATELY` > `NEVER` > `EVENTUALLY`), but there is no centralized policy on who should call it when.
- **Documentation**: None. Comment reads `// TODO: Suspicious that this is called so many places. Seems error-prone.`
- **Risk**: AI adding a new action that calls `scheduleCapture()` may silently cause double undo entries or suppress expected history entries depending on order of execution in the same frame.

### Undocumented Behavior #3
- **File**: `packages/element/src/store.ts` (L978)
- **What happens**: `StoreSnapshot` deep-clones only elements that changed in the current commit. Unchanged elements are stored by reference. This assumes all reference-typed properties on unchanged elements are immutable — which is not yet enforced or verified at runtime.
- **Documentation**: None. Comments read `// TODO: consider just creating new instance, once we can ensure that all reference properties on every element are immutable` and `// TODO: consider creating a lazy deep clone`.
- **Risk**: AI mutating an element property in-place (without going through `mutateElement`) will silently corrupt the snapshot store, causing incorrect undo/redo behavior without any error thrown.

### Undocumented Behavior #4
- **File**: `excalidraw-app/collab/Collab.tsx` (L380)
- **What happens**: When a user stops collaboration and chooses to keep remote state, `resetBrowserStateVersions()` is called to invalidate any localStorage state saved by other open tabs during the session. This is a cross-tab side effect with no UI indication.
- **Documentation**: None. Comment reads `// hack to ensure that we prefer we disregard any new browser state that could have been saved in other tabs while we were collaborating`.
- **Risk**: AI adding a "stop collaboration" flow without this call will silently allow stale local-only state from other tabs to overwrite the remote scene on next load.

### Undocumented Behavior #5
- **File**: `packages/excalidraw/data/restore.ts` (L408)
- **What happens**: When `deleteInvisibleElements: true` is passed to `restoreElement`, empty text elements are set to `isDeleted: true` directly on the element object and `bumpVersion()` is called — bypassing the `Store` entirely. The deletion is never recorded as a delta, so undo/redo cannot reverse it.
- **Documentation**: None. Comment reads `// TODO: we should not do this since it breaks sync / versioning when we exchange / apply just deltas`.
- **Risk**: AI triggering `restoreElements` with `deleteInvisibleElements: true` (e.g. during import/paste) will cause silently unrecoverable deletions in collaborative sessions.

### Undocumented Behavior #6
- **File**: `packages/excalidraw/wysiwyg/textWysiwyg.tsx` (L964)
- **What happens**: The WYSIWYG text editor listens for theme changes via `app.onChangeEmitter` — not via the `Store` — because the Store does not yet emit `appState.theme` updates. If that emitter fires for any other reason, the theme is re-applied based on `LAST_THEME` captured in a closure.
- **Documentation**: None. Comment reads `// FIXME after we start emitting updates from Store for appState.theme`.
- **Risk**: AI refactoring theme updates to go only through Store will silently break dark-mode text color in the WYSIWYG editor until the Store emitter is also updated.

### Undocumented Behavior #7
- **File**: `packages/excalidraw/hooks/useOutsideClick.ts` (L64)
- **What happens**: Any click whose `event.target` has a `[data-radix-portal]` ancestor is treated as an "inside" click and silently swallows the outside-click callback — regardless of where in the DOM the portal actually lives. Radix `Modal` mode additionally disables `pointer-events` on `<body>`, causing the root `<html>` element to be the click target, which is also special-cased.
- **Documentation**: None. Comment reads `// Obviously this is a terrible hack`.
- **Risk**: AI adding a new Radix-based popover or dialog without the `[data-radix-portal]` attribute pattern will cause clicks inside it to incorrectly close any parent component using `useOutsideClick`.

### Undocumented Behavior #8
- **File**: `packages/excalidraw/components/App.tsx` (L10007)
- **What happens**: During drag-to-duplicate (Alt+drag), the duplicated element's `frameId` is explicitly reset to the original element's `frameId`. Frame membership is deliberately not recalculated immediately — it is deferred until `pointerup`. Until then, the duplicated element's frame assignment is in an inconsistent transient state.
- **Documentation**: None. Comment reads `// NOTE this is a hacky solution and should be done differently`.
- **Risk**: AI reading `element.frameId` during a drag operation will see stale/incorrect frame membership. Any logic that acts on `frameId` during pointer-move handlers will be wrong.

### Undocumented Behavior #9
- **File**: `packages/excalidraw/data/library.ts` (L253)
- **What happens**: `Library.destroy()` (called on `<Excalidraw>` instance unmount) intentionally does **not** reset the `libraryItemsAtom` in the global Jotai store. Because the Jotai store is currently shared across all Excalidraw instances on the page, resetting it on one unmount would corrupt the library state of any other instance still mounted.
- **Documentation**: None. The reset code is commented out with `// TODO uncomment after/if we make jotai store scoped to each excal instance`.
- **Risk**: AI mounting multiple `<Excalidraw>` instances and expecting each to have its own isolated library will see them share a single library. Unmounting one will not clear library state; the next mount will inherit the previous instance's library.

### Undocumented Behavior #10
- **File**: `packages/element/src/sizeHelpers.ts` (L27)
- **What happens**: Invisibly small elements (`width/height < 0.1px`, or linear elements with fewer than 2 points) are detected by `isInvisiblySmallElement()`, but are **not** consistently removed — they pass through the Store, get exported to JSON, broadcasted to collaborators, and persisted to localStorage.
- **Documentation**: None. Comment reads `// TODO: remove invisible elements consistently in actions, so that invisible elements are not recorded by the store, exported, broadcasted or persisted`.
- **Risk**: AI filtering elements for export or sync by checking `isInvisiblySmallElement()` will behave inconsistently with what the app actually persists, since the app itself does not apply this filter consistently. Invisible ghost elements will appear in exported files.

## Details
For detailed architecture → see `docs/technical/architecture.md`
For domain glossary → see `docs/product/domain-glossary.md`
