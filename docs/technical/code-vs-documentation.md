# Code vs documentation

This note **compares** actual implementation behavior with what is already described under [`docs/`](../). The goal is to surface **gaps**, not to duplicate full architecture write-ups.

**See also (Memory Bank & technical docs):**

- [Project brief](../memory/projectbrief.md)
- [Tech context](../memory/techContext.md)
- [System patterns](../memory/systemPatterns.md)
- [Decision log](../memory/decisionLog.md)
- [Active context](../memory/activeContext.md)
- [Progress](../memory/progress.md)
- [Product context](../memory/productContext.md)
- [Architecture](./architecture.md)
- [Domain glossary](../product/domain-glossary.md)

**What existing docs cover (at time of writing):**

| Document | Scope |
|----------|--------|
| [projectbrief.md](../memory/projectbrief.md) | Monorepo, packages, top-level layout |
| [techContext.md](../memory/techContext.md) | Build, tests, CI, dependencies, scripts |
| [systemPatterns.md](../memory/systemPatterns.md) | Workspaces, esbuild/Vite, aliases, ESLint, Vitest |
| [decisionLog.md](../memory/decisionLog.md) | Recorded technical choices (tooling, ESLint, share-link hash, Firebase prefixes, Socket.IO transports) |
| [architecture.md](./architecture.md) | Layers, `App` / `Scene` / `ActionManager`, render path |
| [domain-glossary.md](../product/domain-glossary.md) | Domain terms (`ExcalidrawElement`, `AppState`, `Action`, …) |
| [productContext.md](../memory/productContext.md) | Host-app UX flows (collab, share, AI) |
| [activeContext.md](../memory/activeContext.md) | TODO/FIXME as debt markers |
| [progress.md](../memory/progress.md) | CI coverage signals, partial gaps (e.g. bounds, align) |

Below: **what the code does** (files and comments) vs **what is not reflected** in those documents (or only partially).

---

## 1. Tooling decisions: alignment with [decisionLog.md](../memory/decisionLog.md)

These topics are **already documented** in the decision log and match the repo (workspaces, aliases, esbuild for packages, Vite for the app, `jotai` import restriction, Vitest, share-link hash, excluding `examples` from root `tsc`, Firebase prefixes, Socket.IO transports, duplicated aliases).

**Gap:** [decisionLog.md](../memory/decisionLog.md) does **not** spell out **day-to-day consequences** (e.g. why maintaining three alias copies risks config drift).

---

## 2. Editor behavior not spelled out in [architecture.md](./architecture.md) / [domain-glossary.md](../product/domain-glossary.md)

[architecture.md](./architecture.md) correctly describes the **main path**: `Action` → `syncActionResult` → `Scene` / `setState`, canvas rendering. [domain-glossary.md](../product/domain-glossary.md) pins down **types** and roles.

The following is **additional** behavior that is **not** first-class sections there (or only implied).

### 2.1. Hidden side effects on state updates

| What the code does | What is documented | Gap |
|--------------------|-------------------|-----|
| `syncActionResult` forces `contextMenu: null` when merging `appState` (in-code comment: opening context menu from an action would need a rewrite) | [architecture.md](./architecture.md) describes `syncActionResult` without this rule | No explicit doc contract: “any action result clears context menu” |
| `updateEditorAtom` calls `editorJotaiStore.set` and **`triggerRender()`** | Glossary / architecture mention Jotai separately from React state | Not documented: “Jotai atom update + forced render” |

**Evidence:** `packages/excalidraw/components/App.tsx` (`syncActionResult` ~2791–2800; `updateEditorAtom` ~854–860).

### 2.2. Constructor initialization order in `App`

| What the code does | What is documented | Gap |
|--------------------|-------------------|-----|
| `ActionManager` is constructed **before** `new Scene()`, but receives **`() => this.scene.getElementsIncludingDeleted()`** — safe only because the getter runs **later** | [architecture.md](./architecture.md) says `App` owns `scene` and `actionManager`, not construction order | **Implicit closure contract** not documented |
| `createExcalidrawAPI()` in the constructor, with a comment about **StrictMode** / `componentWillUnmount` | [architecture.md](./architecture.md) mentions the API, not React lifecycle | **Double mount in dev** risk not in docs |
| Two consecutive assignments `this.history = new History(this.store)` (~832–833 and ~840–841) | — | **Not explained** (possible dead code or historical duplicate) |

**Evidence:** `packages/excalidraw/components/App.tsx` (~819–851).

### 2.3. Undo policy (`CaptureUpdateAction`) and code debt

| What the code does | What is documented | Gap |
|--------------------|-------------------|-----|
| `IMMEDIATELY` / `NEVER` / `EVENTUALLY` control what enters the undo stack | [domain-glossary.md](../product/domain-glossary.md) defines `CaptureUpdateAction` | [architecture.md](./architecture.md) has **no** “when to use which flag” diagram |
| `Store` comment **TODO: Suspicious that this is called so many places** | [activeContext.md](../memory/activeContext.md) cites this TODO | Full semantics **not formalized** in [architecture.md](./architecture.md) |

**Evidence:** `packages/element/src/store.ts` (~38–69, ~109); `packages/excalidraw/components/App.tsx` (`updateScene` with `captureUpdate`).

---

## 3. Library (stencils) and races

| What the code does | What is documented | Gap |
|--------------------|-------------------|-----|
| `setLibrary` recommends updates via **callback after** `getLastUpdateTask` to avoid **race conditions** between tasks | [domain-glossary.md](../product/domain-glossary.md) describes `LibraryItem` / `LibraryItems` | No doc of the **update queue** and **concurrent** usage |
| `LibraryMenu.tsx`: **StrictMode double render** forces updating selected-element versions in a **separate** effect; comment notes a possible **race** | [productContext.md](../memory/productContext.md) does not detail sidebar library | **StrictMode behavior** not documented for integrators |
| `Library.destroy` clears SVG cache; **commented-out** reset of `libraryItemsAtom` with TODO for **jotai per instance** | [decisionLog.md](../memory/decisionLog.md) covers ESLint for `jotai`, not Library semantics | **Global** `editorJotaiStore` vs multiple instances **not** consolidated in one place |

**Evidence:** `packages/excalidraw/data/library.ts` (~351–357, ~248–258); `packages/excalidraw/components/LibraryMenu.tsx` (~236–241).

---

## 4. HACK / FIXME comments and test workarounds

These are **partially** listed in [activeContext.md](../memory/activeContext.md) as TODO/FIXME, but **without** “what the code does today” semantics.

| What the code does | What is documented | Gap |
|--------------------|-------------------|-----|
| On mobile, transform handles for **linear** elements are **disabled** (**HACK** until a better UX) | — | Not in product/UX-oriented docs |
| `test-utils.ts`: “hack-awaiting” scene readiness (`isLoading`) to avoid test **races** | [progress.md](../memory/progress.md) mentions tests, not this workaround | **Test initialization order** not in [techContext.md](../memory/techContext.md) |
| `index.tsx` **FIXME**: `UIOptions` memo compares non-normalized values | — | **Extra re-renders** possibility not documented |

**Evidence:** `packages/excalidraw/components/App.tsx` (~7126–7132); `packages/excalidraw/tests/test-utils.ts` (~93–97); `packages/excalidraw/index.tsx` (~105–106).

---

## 5. Host (`excalidraw-app`) and collaboration

| What the code does | What is documented | Gap |
|--------------------|-------------------|-----|
| `roomId` / `roomKey` from `#room=...` hash; encrypted socket payloads | [productContext.md](../memory/productContext.md), [decisionLog.md](../memory/decisionLog.md) (Socket.IO) | **Reasonably** covered at flow level |
| Firebase paths for room files vs share links | [decisionLog.md](../memory/decisionLog.md) (prefixes) | Behavior summarized there; depth **not** in [architecture.md](./architecture.md) (by design) |

---

## 6. Partial implementation vs [progress.md](../memory/progress.md)

| What the code does | What is documented | Gap |
|--------------------|-------------------|-----|
| `bounds.ts`: some path ops (`lineTo`, `qcurveTo`) marked **TODO: Implement this** | [progress.md](../memory/progress.md) lists partial bounds | **Aligned** — gap is between code completeness and full bounds model |
| Align / distribute for frame-like elements **disabled** (TODO in predicate) | [progress.md](../memory/progress.md) | **Aligned** |

**Evidence:** `packages/element/src/bounds.ts` (~671–674); `packages/excalidraw/actions/actionAlign.tsx` (~50–51).

---

## 7. Summary

| Area | Recommendation |
|------|----------------|
| Tooling / ESLint / build | Mostly covered by [decisionLog.md](../memory/decisionLog.md) + [techContext.md](../memory/techContext.md) |
| Data-flow architecture | [architecture.md](./architecture.md) + [domain-glossary.md](../product/domain-glossary.md); consider subsections on hidden effects (`contextMenu`, `triggerRender` after Jotai) |
| Init order / StrictMode | Today **code-only**; add a short subsection in [architecture.md](./architecture.md) or keep tracking here |
| Library / races / queue | Not consolidated; extend [systemPatterns.md](../memory/systemPatterns.md) or this file |
| HACK / test hacks | [activeContext.md](../memory/activeContext.md) lists; **semantics** live here or a future `known-quirks` doc |

Update this file when `docs/` changes or when refactors remove the listed gaps.
