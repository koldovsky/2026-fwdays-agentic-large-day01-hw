# Decision Log

## Scope

This is a reconstructed decision log from the current source tree, not a historical ADR set.

## 1. Separate hosted app from reusable editor package

- Decision: keep the hosted web app in `excalidraw-app` and the reusable editor in `packages/excalidraw`.
- Why: the repo ships both an end-user product and an embeddable React editor library.
- Evidence: root workspaces include `excalidraw-app` and `packages/*`; `packages/excalidraw/package.json` is publishable; `excalidraw-app/App.tsx` builds app behavior on top of the editor package.

## 2. Use a monorepo with internal package boundaries

- Decision: split shared logic into `common`, `element`, `math`, `utils`, and the editor package.
- Why: this keeps core logic reusable and prevents app-shell concerns from dominating the editor runtime.
- Evidence: workspace layout in `package.json`; TS aliases in `tsconfig.json`; matching alias setup in `excalidraw-app/vite.config.mts` and `vitest.config.mts`.

## 3. Expose a facade-style public API

- Decision: use `packages/excalidraw/index.tsx` as the main public surface.
- Why: consumers get one stable import surface for components, hooks, helpers, and selected re-exports.
- Evidence: `packages/excalidraw/index.tsx` exports `Excalidraw`, hooks, UI components, data helpers, and selected exports from other packages.

## 4. Use Jotai with separate app and editor stores

- Decision: keep distinct state containers for the app shell and the editor internals.
- Why: app-specific state should not collapse into the reusable editor state model.
- Evidence: `excalidraw-app/app-jotai.ts`; `EditorJotaiProvider` in `packages/excalidraw/index.tsx`.

## 5. Split persistence by data type

- Decision: store scene/app state in `localStorage` and binary files in IndexedDB.
- Why: lightweight JSON fits `localStorage`, while larger file payloads fit IndexedDB better.
- Evidence: `excalidraw-app/data/LocalData.ts`; `idb-keyval` usage for file storage.

## 6. Separate realtime collaboration from durable shared storage

- Decision: use Socket.IO for realtime transport and Firebase for persisted scenes/files.
- Why: live sync and durable shared state have different failure modes and responsibilities.
- Evidence: `excalidraw-app/collab/Portal.tsx` handles socket events and encrypted outbound payloads; `excalidraw-app/data/firebase.ts` handles Firebase persistence.

## 7. Encrypt collaboration data

- Decision: encrypt collaboration payloads and persisted shared scene data.
- Why: the room-link sharing model carries privacy-sensitive collaboration state.
- Evidence: `encryptData` / `decryptData` in collaboration and Firebase flows; room id/key handling in `excalidraw-app/data/index.ts`.

## 8. Use incremental sync with reconciliation

- Decision: do not always broadcast or overwrite the full scene; sync eligible changes and reconcile local/remote state.
- Why: this reduces bandwidth and supports safer convergence in collaborative sessions.
- Evidence: `isSyncableElement` / `getSyncableElements` in `excalidraw-app/data/index.ts`; `reconcileElements(...)` use in sync and persistence paths; version tracking in `excalidraw-app/collab/Portal.tsx`.

## 9. Build the app as a PWA

- Decision: use Vite PWA support, service-worker registration, and runtime cache rules.
- Why: this supports installability and more resilient loading of fonts, locales, and split chunks.
- Evidence: `registerSW()` in `excalidraw-app/index.tsx`; `VitePWA(...)` in `excalidraw-app/vite.config.mts`.

## 10. Treat library integration as a first-class use case

- Decision: keep examples and package docs in the repo for host-application adoption.
- Why: the embeddable editor is one of the primary outputs of the repository, not a side artifact.
- Evidence: `packages/excalidraw/README.md`; `examples/with-nextjs`; `examples/with-script-in-browser`.

## Related Docs

- Architecture rationale context: `docs/technical/architecture.md`
- Product requirement framing: `docs/product/PRD.md`
- Shared terminology for decisions: `docs/product/domain-glossary.md`

## Verified From Source

- `package.json`
- `tsconfig.json`
- `vitest.config.mts`
- `excalidraw-app/App.tsx`
- `excalidraw-app/app-jotai.ts`
- `excalidraw-app/index.tsx`
- `excalidraw-app/vite.config.mts`
- `excalidraw-app/collab/Collab.tsx`
- `excalidraw-app/collab/Portal.tsx`
- `excalidraw-app/data/LocalData.ts`
- `excalidraw-app/data/firebase.ts`
- `excalidraw-app/data/index.ts`
- `packages/excalidraw/index.tsx`
- `packages/excalidraw/package.json`
- `packages/excalidraw/README.md`

## Undocumented Behavior Examples

### Example 1: Finalize deletes "invisible" elements, but history may still remember them

### What the code does

Code treats too-small elements as effectively invalid and converts them to `isDeleted: true` during finalize flow. This happens for linear and free-draw elements in `packages/element/src/sizeHelpers.ts:27-30`, and the cleanup is applied inside `packages/excalidraw/actions/actionFinalize.tsx:141-150` and `packages/excalidraw/actions/actionFinalize.tsx:231-238`.

### Why this is undocumented behavior

This is a hidden side effect of finishing an interaction: user action "finish drawing" can silently mutate the scene by deleting an element instead of merely ending edit mode.

### What is documented in code

The code is partially documented by TODO comments:

- `packages/element/src/sizeHelpers.ts:27-29` says invisible elements are not removed consistently and may still be recorded, exported, broadcasted, or persisted.
- `packages/excalidraw/actions/actionFinalize.tsx:142` and `packages/excalidraw/actions/actionFinalize.tsx:232` explicitly note that undo/redo may restore such invisible elements.
- `packages/excalidraw/actions/actionFinalize.tsx:346` says the code currently captures "everything" because narrower capture causes inconsistencies.

### Example 2: Collaboration startup is an implicit state machine gated by `socketInitialized`

### What the code does

Collaboration startup depends on an internal flag `portal.socketInitialized`, which blocks broadcasting until initialization finishes. The flag starts as `false` in `excalidraw-app/collab/Portal.tsx:28`, is reset on close in `excalidraw-app/collab/Portal.tsx:72`, and is used by `isOpen()` in `excalidraw-app/collab/Portal.tsx:76-82` to decide whether socket messages may be emitted. During startup, `Collab.tsx` races several initialization paths: `connect_error` fallback, timeout fallback, `first-in-room`, Firebase load, and remote `INIT` message handling in `excalidraw-app/collab/Collab.tsx:512-565`, `excalidraw-app/collab/Collab.tsx:584-598`, and `excalidraw-app/collab/Collab.tsx:717-750`.

### Why this is undocumented behavior

This is an implicit state machine even though there is no explicit enum/state object. Correct behavior depends on timing and order:

- socket exists but is not yet allowed to emit;
- room may initialize from Firebase or from a peer `INIT` packet;
- fallback handlers must be detached at the right moment;
- setting `socketInitialized = true` changes the behavior of `isOpen()` and queued persistence/broadcast logic.

### What is documented in code

The code contains only partial inline documentation:

- `excalidraw-app/collab/Portal.tsx:28` says the socket must not emit updates before full initialization.
- `excalidraw-app/collab/Collab.tsx:560-561` documents the timeout fallback when `SCENE_INIT` is missing.
- `excalidraw-app/collab/Collab.tsx:744-747` documents that Firebase load failure is tolerated because other peers may sync the scene later.

### Example 3: Linear element editing relies on a hidden invariant that the first point stays at `[0,0]`

### What the code does

`LinearElementEditor.movePoints()` does not freely move the first point. Instead, when point `0` is moved, the code preserves the invariant that the origin point remains `[0,0]` and compensates by shifting all other points in the opposite direction and updating `element.x/y`. This behavior is described in `packages/element/src/linearElementEditor.ts:1581-1585` and implemented immediately below in `packages/element/src/linearElementEditor.ts:1587-1607`. There is also a separate temporary hack in `packages/element/src/linearElementEditor.ts:1446-1459` that moves the last point after insertion so the line does not visually jump when the bounding box expands.

### Why this is undocumented behavior

For a reader of the public API, moving one point does not obviously imply a compensating move of every other point plus the element position. The editor behaves like a coordinate-space transformer, not a simple point mutator. This is a hidden geometric contract and an implicit local state machine around edit operations.

### What is documented in code

The behavior is only documented by comments:

- `packages/element/src/linearElementEditor.ts:1446-1447` marks the bounding-box stabilization as a "temp hack".
- `packages/element/src/linearElementEditor.ts:1581-1585` explains the invariant and states that these hacks should be transparent to the user.
