# Architectural Decisions — Full Detail

> Synoptic index: [docs/memory/decisionLog.md](../memory/decisionLog.md) Related: [Technical Architecture](architecture.md) | [PRD](../product/PRD.md)

---

## Decision 1: Monorepo with Dual Artifacts (App + npm Package)

**Decision**: Split the project into a private web app (`excalidraw-app`) and a publishable npm package (`@excalidraw/excalidraw`), co-located in the same Yarn workspace.

**Tradeoffs visible in code**:

- (+) The library can be versioned and consumed independently (`@excalidraw/excalidraw@0.18.0`, MIT license).
- (+) Development uses `tsconfig.json` path aliases to resolve `@excalidraw/*` to local `src/` files — no need to rebuild packages during development.
- (-) The `excalidraw-app` directly imports internal sub-paths of the library (`@excalidraw/excalidraw/components/ErrorDialog`, `@excalidraw/excalidraw/data/reconcile`, etc.) — these are not in the official `exports` map and would break in external consumers. This is a known coupling pattern accepted for the app.
- (+) Build order is enforced (`common → math → element → excalidraw`) so library consumers always get consistent type definitions.

**Source**: `package.json` (root scripts), `tsconfig.json` (path aliases), `packages/excalidraw/package.json` (exports map), `excalidraw-app/App.tsx` (import patterns).

---

## Decision 2: React Class Component for the Core Editor (`App.tsx`)

**Decision**: `packages/excalidraw/components/App.tsx` is a `React.Component` class (~12,800 lines), not a functional component with hooks.

**Rationale visible in code**:

- Long-lived mutable instance variables (`this.scene`, `this.history`, `this.actionManager`, `this.renderer`, `this.fonts`, `this.animationFrameHandler`, trail instances) benefit from stable object identity without `useRef` boilerplate.
- `componentDidUpdate` access to previous state is used for delta computation.
- `Collab.tsx` is also a `PureComponent` for the same reasons (stable socket reference, timer management).
- Jotai atoms handle the isolated UI state that benefits from reactive subscriptions (dialogs, popovers).

**Tradeoffs**:

- (-) Testing is harder — tests must render the full component and simulate events rather than unit-test hooks.
- (-) `AppState` has grown to ~200 fields; with hooks this might have been split into multiple state atoms.
- (+) All editor state is centralized and auditable in one place, simplifying debugging.

**Source**: `packages/excalidraw/components/App.tsx` class declaration, instance variable declarations, `excalidraw-app/collab/Collab.tsx` `PureComponent` declaration.

---

## Decision 3: Transport-Agnostic Collaboration API in the Library

**Decision**: The library provides no WebSocket or Firebase code. Collaboration is injected via `ExcalidrawImperativeAPI` callbacks (`updateScene`, `applyDeltas`, `onIncrement`, `onPointerUpdate`) and props (`isCollaborating`, `collaborators`).

**Rationale**:

- Embedding developers may use any transport (WebRTC, Yjs, Socket.IO, etc.).
- Keeps the npm package bundle free of Firebase and Socket.IO (significant size reduction).
- `reconcileElements()` and `applyDeltas()` are exported for consumers to use with their own transport.

**Tradeoffs**:

- (-) Higher integration complexity for host apps that want collaboration.
- (+) The npm package is genuinely transport-agnostic; documented integration examples in `examples/`.
- The app shell (`excalidraw-app`) demonstrates the full reference implementation using Socket.IO + Firebase.

See the [collaboration data flow in the Technical Architecture](architecture.md) for the full Socket.IO encryption and reconciliation sequence, and [PRD §4.4](../product/PRD.md) for the embedding scenario.

**Source**: `packages/excalidraw/index.tsx` (exports), `packages/excalidraw/types.ts` (`ExcalidrawProps.isCollaborating`, `ExcalidrawImperativeAPI`), `excalidraw-app/collab/Collab.tsx`.

---

## Decision 4: AES-GCM End-to-End Encryption with Key-in-Fragment

**Decision**: All collaborative scenes and share links are encrypted with AES-GCM. The decryption key is embedded only in the URL fragment (`#room=<id>,<key>`, `#json=<id>,<key>`) and is never transmitted to the server.

**Rationale visible in code**:

- `Portal._broadcastSocketData()` encrypts before emitting; `Collab.decryptPayload()` decrypts on receipt.
- Firebase Firestore stores `{ iv, ciphertext }` — no key stored server-side.
- Firebase Storage files are compressed + AES-GCM encrypted before upload.
- This provides E2E privacy even for users of the hosted service.

**Tradeoffs**:

- (-) Losing the URL fragment loses access to the room forever (no key recovery).
- (-) Cannot implement server-side search or moderation of scene content.
- (+) Strong privacy guarantee without running a custom E2E encryption service.

See [PRD §5.7 and §7 Security](../product/PRD.md) for the product-level security requirements derived from this design.

**Source**: `excalidraw-app/collab/Portal.tsx` `_broadcastSocketData()`, `excalidraw-app/data/firebase.ts` document structure (lines 87–91), `packages/excalidraw/data/encryption.ts`.

---

## Decision 5: Separate Packages for Math, Element, Common, Utils

**Decision**: Extract geometry (`@excalidraw/math`), element logic (`@excalidraw/element`), shared utilities (`@excalidraw/common`), and file utilities (`@excalidraw/utils`) as independent versioned packages.

**Rationale**:

- Allows external consumers to use geometry or element logic without pulling in the full React editor.
- Enforces strict dependency direction (compile-time enforced via TypeScript path resolution).
- `@excalidraw/math` exports coordinate-space-branded types (`GlobalPoint`, `LocalPoint`) preventing accidental mixing at the type level.

**Tradeoffs**:

- (-) Boilerplate: each package has its own `package.json`, build script, `tsconfig`, and `exports` map.
- (-) `@excalidraw/utils` is at version `0.1.2` vs `0.18.0` for others, suggesting different release cadences or a newer addition that hasn't been fully integrated.
- (+) Clean dependency graph: `math` and `common` are leaves; `element` sits one level above; `excalidraw` editor is the top consumer.

**Source**: `packages/*/package.json` (versions and dependencies), `packages/math/src/types.ts` (branded coordinate types), `package.json` (root build order in `build:packages`).

---

## Decision 6: roughjs + Deterministic Seeds for Hand-Drawn Style

**Decision**: All shapes (rectangle, diamond, ellipse, line, arrow, polygon) are rendered via `roughjs`. Each element stores a `seed: number` for deterministic rendering — the same element always produces the same roughjs output.

**Tradeoffs**:

- (+) The hand-drawn aesthetic is preserved across sessions, devices, and collaborators.
- (-) Shapes cannot be "smoothed" without changing the roughness setting; there's no vector-exact mode for individual elements.
- The `roughness: 0` setting (`smooth`) still uses roughjs; the `preserveVertices: true` option is applied for near-exact output.
- `roughness` is auto-reduced for small elements (`minSize < 20`) to avoid over-distortion at small scales.

**Source**: `packages/element/src/newElement.ts` (`seed: randomInteger()`), `packages/element/src/shape.ts` (`generateRoughOptions()`), `packages/element/src/types.ts` (`seed`, `roughness` fields).

---

## Decision 7: Two Stacked Canvases (Static + Interactive)

**Decision**: The editor renders on two stacked `<canvas>` elements: a static canvas for committed elements (throttled re-render) and an interactive canvas for UI overlays (always current).

**Rationale**:

- Committed element rendering is expensive (offscreen canvas cache + roughjs). Throttling it via `throttleRAF` reduces CPU load during frequent pointer events.
- Selection handles, collaborator cursors, and snap lines must update on every pointer event — separating them avoids re-rendering all elements.

**Tradeoffs**:

- (+) Significant rendering performance benefit during selection and pan/zoom.
- (-) Coordinate math must account for two separate canvases with potentially different hit regions.
- A third `NewElementCanvas` renders only the element being actively drawn, further limiting re-render scope.

**Source**: `packages/excalidraw/components/canvases/` (StaticCanvas, InteractiveCanvas, NewElementCanvas), `packages/excalidraw/renderer/staticScene.ts` (throttleRAF usage), `packages/excalidraw/renderer/interactiveScene.ts`.

---

## Decision 8: Fractional Indexing for Element Order

**Decision**: Elements carry a `FractionalIndex` string (`index` field) for stable ordering compatible with concurrent multi-user insertions.

**Tradeoffs**:

- (+) Two users inserting elements simultaneously can both succeed without reordering each other's work.
- (-) Fractional index strings can grow in length with many sequential insertions between the same two elements (mitigated by periodic reindexing).
- `packages/element/src/fractionalIndex.ts` and `packages/element/src/sortElements.ts` manage the lifecycle.

**Source**: `packages/element/src/types.ts` (`index: FractionalIndex | null`), `packages/element/src/fractionalIndex.ts`, `packages/excalidraw/package.json` (`fractional-indexing` dependency).

---

## Source Evidence

- `package.json` (root) — workspace structure, build order scripts
- `tsconfig.json` — path aliases, `include`/`exclude`
- `packages/excalidraw/components/App.tsx` — class component, instance variables
- `excalidraw-app/collab/Collab.tsx` — `PureComponent`, `startCollaboration()`
- `excalidraw-app/collab/Portal.tsx` — `_broadcastSocketData()`, encryption
- `excalidraw-app/data/firebase.ts` — Firestore document structure
- `packages/element/src/types.ts` — `seed`, `roughness`, `index: FractionalIndex`, `polygon`
- `packages/element/src/shape.ts` — `generateRoughOptions()`, `adjustRoughness()`, `ShapeCache`
- `packages/excalidraw/renderer/staticScene.ts`, `interactiveScene.ts`
- `packages/*/package.json` — version numbers, dependencies
- `packages/math/src/types.ts` — branded coordinate type definitions
