# Decision Log — Archive

> Architectural and policy decisions from ~2021–2026. Active undocumented-behavior entries: [../memory/decisionLog.md](../memory/decisionLog.md)

## How to read this log

Status tags: `[ACTIVE]` — in effect now | `[SUPERSEDED]` — replaced (see linked entry) | `[REVERSED]` — tried and explicitly undone | `[PENDING]` — identified, not finalized.
Entries are chronological, oldest first. Each entry is self-contained — no cross-entry reading required.
This log is append-only. Superseded decisions are marked, never deleted.

---

### ~2021 — Architecture — Yarn workspaces monorepo over single package
<!-- date approximate — exact commit not verified -->

**Status:** ACTIVE

**Context**
Excalidraw ships both a deployed web app (excalidraw.com) and a published npm library (`@excalidraw/excalidraw`). Without a monorepo, the library and the app would need to be separate repos kept in sync, or the app would depend on the published npm package, making it impossible to develop both simultaneously without `npm link` hacks.

**Decision**
The repository is a Yarn 1.22 workspaces monorepo with five packages (`math`, `common`, `element`, `excalidraw`, `utils`) and one app (`excalidraw-app`).

**Alternatives considered**
- Single package (app + library merged): Would require consumers to take the entire web app as a dependency; prevents clean library/app separation.
- Separate repos with npm dependency: Requires publishing a new library version to test any change in the app; makes atomic commits across the boundary impossible.
- npm workspaces: Yarn 1 workspaces were chosen — adopted by default before npm workspaces were stable; no explicit re-evaluation recorded.

**Consequences**
- *Makes easier:* Library changes are immediately reflected in the app without publishing; a single CI pipeline covers everything; version bumps are atomic.
- *Makes harder:* Build order matters (`common` → `math` → `element` → `excalidraw`); local development requires `yarn build:packages` before running the app against local package changes.

**Do not re-open unless:** The library and app need to evolve on independent release cadences, or a Turborepo/nx migration is being evaluated for build performance.

---

### ~2020 — State — App.tsx as a React class component (not functional)
<!-- date approximate — original project architecture, exact commit not verified -->

**Status:** ACTIVE

**Context**
`App.tsx` is 12,800+ lines and is the central coordinator of four concurrent state systems: React `this.state`, mutable `Scene`, `Store`/`History`, and Jotai atoms. Refactoring it to a functional component was not completed before React class components became the established pattern in this file.

**Decision**
Adopted by default — never explicitly evaluated as a class-vs-hooks decision. `App` remains a class component with `componentDidMount`, `componentDidUpdate`, `componentWillUnmount` lifecycle methods.

**Alternatives considered**
- Functional component with hooks: Would enable cleaner effect management and easier testing, but refactoring 12,800 lines carries extreme risk of regressions across all four state systems.
- Partial migration (extract hooks while keeping class shell): Technically possible but creates an inconsistent pattern that is harder to reason about than either extreme.

**Consequences**
- *Makes easier:* Lifecycle ordering is explicit and deterministic (`componentDidMount` wiring always before `initializeScene`); `this.unmounted` guard pattern is straightforward in a class.
- *Makes harder:* Cannot use hooks directly inside the `App` class component itself — child functional components use hooks normally; `App` bridges to Jotai via `this.updateEditorAtom(atom, ...args)` instead of `useSetAtom`; `flushSync` is needed more often due to class-based batching behavior.

**Do not re-open unless:** A deliberate, scoped refactor of `App.tsx` is planned with full test coverage established first.

---

### ~2020 — State — Elements stored as mutable objects in Scene (outside React state)
<!-- date approximate — original project architecture, exact commit not verified -->

**Status:** ACTIVE

**Context**
Excalidraw scenes can contain thousands of elements. Storing them in React state (`this.setState({ elements })`) would trigger a full React reconciliation on every pointer move during drag/resize — potentially at 60fps. This is a hard performance constraint, not a preference.

**Decision**
Elements are stored as mutable objects in a `Scene` instance outside React state. React is notified only when explicitly needed via `scene.triggerUpdate()` → `setState({})`.

**Alternatives considered**
- Immutable React state (standard React pattern): Every drag event would create a new array of element objects, trigger reconciliation, and paint the canvas — unacceptable at 60fps with hundreds of elements.
- Zustand/Redux external store: Would still produce a new reference on every update, causing downstream re-renders unless heavily memoized; adds a dependency without solving the core problem.

**Consequences**
- *Makes easier:* `mutateElement()` during drag is O(1) with no React overhead; `ShapeCache` can be invalidated per-element without triggering a re-render.
- *Makes harder:* React does not know about element changes unless explicitly notified; callers must understand the two mutation paths (`mutateElement` vs `scene.mutateElement({ informMutation: true })`); testing requires manual trigger of scene updates.

**Do not re-open unless:** A concurrent/offscreen rendering approach is needed that requires React to own element state.

---

### ~2020 — Rendering — Five separate canvas/DOM layers over a single canvas

**Status:** ACTIVE

**Context**
The editor must render thousands of elements at 60fps during drag/resize while simultaneously showing selection handles that update on every pointer event, an in-progress element being actively drawn, and static UI chrome. A single canvas would require repainting everything on every pointer move. Pure React DOM cannot achieve canvas-level performance for the shape rendering.

**Decision**
The renderer uses five stacked layers: StaticCanvas (throttled, all persisted elements), InteractiveCanvas (pointer-rate handles and cursors), NewElementCanvas (the element being actively drawn), SVG layer (resize handles), and React DOM (UI chrome).

**Alternatives considered**
- Single canvas for everything: Every pointer event triggers a full repaint of all elements — unacceptable at 60fps with hundreds of shapes.
- Two canvases (static + interactive): Considered, but the actively-drawn new element needs its own layer to avoid flicker between the throttled static canvas and the pointer-rate interactive canvas.
- Pure React DOM with CSS transforms: Cannot match canvas rendering performance for RoughJS-generated hand-drawn strokes.

**Consequences**
- *Makes easier:* StaticCanvas throttling is independent of pointer-rate InteractiveCanvas updates; new element rendering does not pollute the persisted element layer.
- *Makes harder:* z-order across layers is managed by CSS stacking, not a single draw order; testing rendering requires understanding which layer is responsible for each visual element.

**Do not re-open unless:** A WebGL or OffscreenCanvas approach is being evaluated that could handle all layers in a single composited context.

---

### ~2020 — Performance — withBatchedUpdates on all DOM event handlers

**Status:** ACTIVE

**Context**
`App` is a React class component with DOM `addEventListener` calls managed outside React's synthetic event system. In React 17 and earlier, only React synthetic event handlers received automatic state batching. Direct DOM listeners calling `setState` multiple times would trigger one re-render per call. With thousands of pointer events per second during drag, unbatched re-renders would cause severe performance degradation.

**Decision**
All DOM `addEventListener` handlers and pointer event handlers in `App` are wrapped in `withBatchedUpdates`, which calls `React.unstable_batchedUpdates` to coalesce multiple `setState` calls into a single re-render.

**Alternatives considered**
- React 18 automatic batching: React 18 batches all state updates by default, including in setTimeout and native event handlers. However, `App` pre-dates React 18 and the pattern is retained for compatibility. Removing `withBatchedUpdates` would require verifying no regressions across all pointer handlers.
- Consolidating state updates manually: Requires every handler to be refactored to compute all state changes in one `setState` call — error-prone at 12,800 lines.

**Consequences**
- *Makes easier:* Pointer events are performant regardless of how many `setState` calls a handler makes; pattern is explicit and greppable.
- *Makes harder:* New event handlers must remember to apply `withBatchedUpdates`; React synthetic event handlers and `useEffect` do not need it (React handles those) — applying it unnecessarily is harmless but confusing.

**Do not re-open unless:** `App` is refactored to a functional component, at which point React 18 automatic batching makes `withBatchedUpdates` unnecessary in most cases.

---

### ~2022 — State — Jotai with jotai-scope isolation over global Jotai store
<!-- date approximate — introduced when library became embeddable, exact commit not verified -->

**Status:** ACTIVE

**Context**
`@excalidraw/excalidraw` is an embeddable library. Multiple instances can appear on the same page (e.g., a page with two editors). Standard Jotai uses a global atom store; atoms defined at module scope would be shared across all instances, leaking state between editors.

**Decision**
All Jotai usage inside `packages/excalidraw` goes through `editor-jotai.ts`, which uses `jotai-scope`'s `createIsolation()` to produce per-instance versions of `useAtom`, `useSetAtom`, `useAtomValue`, and `useStore`. Direct `jotai` imports are a lint error.

**Alternatives considered**
- Direct `jotai` with `Provider`: Would require wrapping every atom in a `Provider` context, adding boilerplate at every use site and making it easy to accidentally use a global atom.
- Zustand with `createStore()`: Each instance creates its own store natively, but Zustand lacks Jotai's atom composition model, which is relied upon for fine-grained subscriptions.
- Context-only (no external state library): For the scale and number of independent UI atoms in Excalidraw (~30+), prop drilling or context nesting would produce deeply coupled component trees.

**Consequences**
- *Makes easier:* Multiple editors on one page work correctly without any additional configuration from the host app.
- *Makes harder:* New code must never import from `jotai` directly — the lint rule enforces this, but it surprises contributors unfamiliar with the pattern; atoms defined outside the isolation scope will silently share state.

**Do not re-open unless:** `jotai-scope` stops being maintained or a breaking incompatibility with a new Jotai major version appears.

---

### ~2022 — Z-order — FractionalIndex strings over integer z-index
<!-- date approximate — introduced with collaboration improvements, exact commit not verified -->

**Status:** ACTIVE

**Context**
In a real-time collaborative editor, two clients may independently insert elements between the same pair of elements. Integer z-indices require renumbering the entire array on conflict; this produces unbounded write amplification and conflict resolution complexity.

**Decision**
Elements use `index: FractionalIndex | null` (a string type from the `fractional-indexing` package) for z-ordering. New indices are generated between existing neighbours; no renumbering is ever required.

**Alternatives considered**
- Integer z-index with conflict resolution: Conflicts require a canonical ordering pass that must be agreed upon by all collaborating clients — complex and expensive.
- Floating-point index: Suffers from precision exhaustion after many insertions between the same two elements; not a reliable long-term solution.

**Consequences**
- *Makes easier:* Concurrent insertions by two clients never conflict; the ordering is merge-friendly by construction.
- *Makes harder:* String sorting must be used for display order instead of numeric comparison; `null` indices (legacy or invalid elements) must be handled explicitly; the `Ordered<T>` type wrapper adds a layer of type ceremony.

**Do not re-open unless:** The `fractional-indexing` library is abandoned or a simpler CRDT ordering primitive becomes available in the ecosystem.

---

### ~2023 — History — CaptureUpdateAction with three modes over binary undo/no-undo
<!-- date approximate — Store/History refactor, exact commit not verified -->

**Status:** ACTIVE

**Context**
Some operations (remote collaboration updates, scene initialization) must never appear in the undo stack. Others (multi-step async operations like image upload) should be merged into a single undo entry rather than producing a separate undo step for each async phase.

**Decision**
`Store` uses a `CaptureUpdateAction` enum with three values: `IMMEDIATELY` (record now), `EVENTUALLY` (defer and merge into next IMMEDIATELY), `NEVER` (remote/init, never recorded).

**Alternatives considered**
- Boolean `captureUndo: true/false`: Cannot express the deferred/merge case; async operations would either create too many undo steps or be unrecordable.
- Transaction API (group multiple updates into one undo step explicitly): More expressive but requires callers to explicitly open and close transactions; the `EVENTUALLY`→`IMMEDIATELY` pattern is simpler for the common async case.

**Consequences**
- *Makes easier:* Remote collaboration updates never pollute the local undo stack; multi-step ops produce clean single-step undo behavior transparently.
- *Makes harder:* Callers must choose the right enum value; choosing `NEVER` by mistake silently makes an action non-undoable with no warning.

**Do not re-open unless:** The deferred-merge behavior of `EVENTUALLY` causes bugs with concurrent async operations, requiring a proper transaction model.

---

### ~2023 — Rendering — flushSync to force synchronous re-renders in specific flows

**Status:** ACTIVE

**Context**
React 18 automatic batching defers state updates asynchronously by default. In certain flows — committing text edits, processing specific keyboard sequences, and working around a Chromium 131 crash on focus during DOM transitions — the DOM must reflect updated state synchronously before the current JS call stack continues. Without synchronous re-render, subsequent code reads stale DOM state or triggers browser bugs.

**Decision**
`flushSync` is used at 15+ specific call sites in `App.tsx` where a synchronous DOM update is required before continuing. Each site has a distinct reason; `flushSync` is never used for convenience, only for correctness.

**Alternatives considered**
- `useLayoutEffect` / `useEffect` with dependencies: Cannot guarantee synchronous execution in the same call stack; unsuitable for event handler flows that need immediate DOM consistency.
- Restructuring state to avoid the need for synchronous renders: Would require decomposing tightly coupled pointer-event → state → DOM flows that span thousands of lines in the class component.

**Consequences**
- *Makes easier:* Text commit, keyboard flows, and browser-crash workarounds are correct without complex async coordination.
- *Makes harder:* `flushSync` forces a synchronous render which can cause performance issues if overused; it bypasses React's scheduler and should never be added without a specific verified reason. Each existing call site is load-bearing — do not remove without testing the specific flow.

**Do not re-open unless:** The class component is fully refactored and all flows are re-examined for whether synchronous rendering is still required.

---

### 2026-03-25 — Memory Bank — docs/memory/ files capped at ~200 lines

**Status:** ACTIVE

**Context**
Memory Bank files (`projectbrief.md`, `techContext.md`, `systemPatterns.md`, `productContext.md`, `activeContext.md`, `progress.md`) are loaded into the AI's context at the start of every session. Context window space is finite. Files that grow unbounded will eventually be truncated, causing the AI to have partial or missing orientation data. `decisionLog.md` is append-only by policy and will grow indefinitely, making it incompatible with the pre-loaded cap.

**Decision**
Memory Bank files in `docs/memory/` are capped at approximately 200 lines. Deeper reference material lives in `docs/technical/` and `docs/product/` and is read on demand, not pre-loaded. `decisionLog.md` is explicitly exempt from the pre-loaded set — it lives in `docs/memory/` but is listed under reference docs in `CLAUDE.md` due to its append-only nature.

**Alternatives considered**
- No size limit, allow files to grow: Files become too large to be reliably read in full; the AI skims rather than absorbs them, defeating their purpose.
- Single combined memory file: Easier to maintain but harder to update selectively; a session focused on architecture should not require rewriting product context.

**Consequences**
- *Makes easier:* Each session starts with a complete, untruncated picture of the project state; files are fast to update at session end.
- *Makes harder:* Decisions about what to include vs. defer to reference docs require judgment; information that doesn't fit must be cut or moved, not simply appended.

**Do not re-open unless:** Context window sizes increase to the point where pre-loading 1000+ lines of memory is practical.

---

### 2026-03-25 — Memory Bank — Facts-only policy for all documentation

**Status:** ACTIVE

**Context**
During Memory Bank creation, there was a risk of writing plausible-sounding but unverified architectural claims (e.g., "the Store uses event sourcing" without checking the actual code). AI-generated documentation that contains inaccuracies is worse than no documentation — it produces confident wrong answers in future sessions.

**Decision**
All Memory Bank and reference documentation is written only from facts verified directly in source files, with file paths and line numbers cited where specific. If something cannot be verified, it is marked as a question, not stated as fact.

**Alternatives considered**
- Allow inferred/synthesized claims with a disclaimer: Reduces the effort to produce docs but shifts the burden of verification to each future session — negating the purpose of pre-written docs.
- Generate docs from type signatures only (no behavioral claims): Too shallow; misses the non-obvious behavioral patterns (initialization order, flushSync usage, StrictMode workarounds) that are the most valuable things to document.

**Consequences**
- *Makes easier:* Future sessions can trust documented claims without re-verifying; the AI can confidently act on memory file content.
- *Makes harder:* Documentation takes longer to produce; any claim requires tracing it to a specific file and line; gaps in knowledge must be called out explicitly rather than papered over.

**Do not re-open unless:** A faster, structured code-extraction tool makes automated verification practical at scale.