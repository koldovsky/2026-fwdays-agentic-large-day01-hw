# Decision Log — Excalidraw Monorepo

## 1. Monorepo with Yarn Workspaces

| | |
|---|---|
| **Date** | Pre-2026 |
| **Status** | Active |
| **Context** | The project grew from a single app into a reusable library plus multiple supporting packages. Code sharing across packages (common, math, element, excalidraw, utils) needed to be frictionless. |
| **Decision** | Organize as a Yarn workspaces monorepo with five packages under `packages/` plus the app at `excalidraw-app/`. Use Yarn 1 Classic (1.22.22) as the package manager. |
| **Rationale** | Yarn workspaces provide zero-install cross-package linking, shared `node_modules` hoisting, and a single lockfile. Yarn 1 was the stable default when the monorepo was established. |
| **Consequences** | All packages share one `yarn.lock`. Path aliases must be duplicated across TS, Vite, and Vitest configs. Yarn 1 lacks modern features (PnP, workspace protocol) but is well-understood and stable. |

## 2. Library / App Separation

| | |
|---|---|
| **Date** | Pre-2026 |
| **Status** | Active |
| **Context** | Third-party developers wanted to embed Excalidraw's drawing editor in their own apps without pulling in Firebase, Sentry, collaboration, or other product-specific code. |
| **Decision** | Split the codebase into a reusable library (`@excalidraw/excalidraw` in `packages/excalidraw/`) and a product shell (`excalidraw-app/`). The library is published to npm; the app is deployed but not published. |
| **Rationale** | Clean separation lets library consumers get the full editor without product dependencies. The app layer adds Firebase storage, Sentry error tracking, Socket.IO collaboration, and PWA — none of which should be forced on embedders. |
| **Consequences** | The library must remain backend-agnostic — no assumptions about storage, auth, or real-time transport. Feature additions must consider which layer they belong to. The app peer-depends on the library. |

## 3. Jotai for State Management

| | |
|---|---|
| **Date** | Pre-2026 |
| **Status** | Active |
| **Context** | The editor needed fine-grained reactive state that could be consumed by deeply nested React components without prop drilling or excessive re-renders. |
| **Decision** | Use Jotai (atomic state management) instead of Redux, Zustand, or plain React Context. |
| **Rationale** | Jotai's atom model provides granular subscriptions — components re-render only when their specific atoms change, not on every state update. No boilerplate reducers or actions. Atoms compose naturally and colocate with the components that use them. |
| **Consequences** | State is distributed across many atoms rather than centralized in one store shape. Debugging requires atom-level inspection rather than a single state tree. Jotai is a less common choice than Redux/Zustand, which may affect contributor onboarding. |

## 4. Jotai Store Isolation (editor-jotai / app-jotai)

| | |
|---|---|
| **Date** | Pre-2026 |
| **Status** | Active |
| **Context** | The library and app both use Jotai, but their atoms must not leak between layers. An editor atom should not accidentally read or write app-level state, and vice versa. |
| **Decision** | Create two isolated Jotai stores: `editor-jotai` (in `packages/excalidraw/`) for editor internals, and `app-jotai` (in `excalidraw-app/`) for the product layer. Enforce via `jotai-scope` and an ESLint `no-restricted-imports` rule that forbids direct `jotai` imports. |
| **Rationale** | Store isolation prevents atom cross-contamination. The ESLint rule catches violations at lint time rather than at runtime. `jotai-scope` provides the isolation mechanism natively. |
| **Consequences** | All Jotai usage must go through the appropriate store module. Contributors unfamiliar with the pattern may trip the ESLint rule. Two stores add a small amount of conceptual overhead. |

## 5. Canvas Rendering with roughjs

| | |
|---|---|
| **Date** | Pre-2026 |
| **Status** | Active |
| **Context** | The product's core differentiator is its hand-drawn aesthetic. The rendering engine needed to produce sketchy, informal-looking shapes at interactive frame rates. |
| **Decision** | Render on HTML Canvas (not SVG DOM) using roughjs for shape rendering and perfect-freehand for stroke generation. |
| **Rationale** | Canvas provides better performance than SVG for scenes with many elements — no DOM node per shape, direct pixel manipulation, hardware-accelerated compositing. roughjs generates the hand-drawn look procedurally. SVG export is handled separately (serialization from the element model, not from the live canvas). |
| **Consequences** | Hit-testing and accessibility are harder on Canvas than SVG (no native DOM events per element). Custom hit-testing logic is required. Text rendering on Canvas requires manual layout. The renderer has separate passes for static elements, interactive elements, and selection UI. |

## 6. Fractional Indexing for Z-Order

| | |
|---|---|
| **Date** | Pre-2026 |
| **Status** | Active |
| **Context** | Elements need a stable z-ordering that supports inserting new elements between existing ones — especially important during collaboration when multiple users rearrange simultaneously. |
| **Decision** | Use fractional indexing (`fractional-indexing@3.2.0`) to assign z-order positions. Each element gets a string-based fractional index rather than an integer array position. |
| **Rationale** | Integer indices require renumbering all subsequent elements on insertion (O(n) updates, merge conflicts in collaboration). Fractional indices allow O(1) insertion between any two elements by generating a midpoint string. This is critical for conflict-free concurrent reordering. |
| **Consequences** | Index strings grow over time with many insertions in the same gap (theoretical, rarely a problem in practice). All element sorting must use fractional index comparison rather than simple numeric sort. The `OrderedExcalidrawElement` type encodes this requirement. |

## 7. Vite for App / esbuild for Packages

| | |
|---|---|
| **Date** | Pre-2026 |
| **Status** | Active |
| **Context** | The app and packages have different build requirements. The app needs HMR, PWA plugin, chunk splitting, and HTML processing. Packages need fast, simple ESM/CJS output with type declarations. |
| **Decision** | Use Vite (5.0.12) for the app's dev server and production build. Use esbuild (0.19.10) directly via `scripts/buildPackage.js` for package builds. |
| **Rationale** | Vite provides the full SPA build pipeline (React Fast Refresh, PWA, code splitting, asset handling). For packages, Vite's overhead is unnecessary — esbuild alone is faster and produces clean ESM output. Packages build to `dist/dev/`, `dist/prod/`, and `dist/types/`. |
| **Consequences** | Two build systems to maintain. Package builds are sequential (common → math → element → excalidraw) due to dependency order — no parallelization without a task runner like Turborepo. Vite config and esbuild config must stay compatible (same TS target, same module format). |

## 8. E2E Encryption for Collaboration

| | |
|---|---|
| **Date** | Pre-2026 |
| **Status** | Active |
| **Context** | Collaboration requires transmitting drawing data through a server (Socket.IO). Users expect their diagrams to be private — the server should not be able to read the content. |
| **Decision** | Encrypt all collaboration data end-to-end. The encryption key is placed in the URL hash fragment (`#key=...`), which browsers do not send to the server. Only clients with the full URL can decrypt. |
| **Rationale** | URL hash is the simplest key-sharing mechanism that preserves server-blindness. No key exchange protocol needed — sharing the link shares the key. The server relays opaque encrypted blobs without being able to inspect them. |
| **Consequences** | If the URL is leaked, the content is accessible. Key rotation requires generating a new room link. The server cannot index, search, or moderate content. No server-side backup of readable data. |

## 9. Firebase for Cloud Storage

| | |
|---|---|
| **Date** | Pre-2026 |
| **Status** | Active |
| **Context** | The web app (excalidraw.com) needs persistent cloud storage for scenes that users want to save and share beyond a browser session. |
| **Decision** | Use Firebase (Firestore) for cloud persistence. Firebase is an app-only dependency — it does not exist in the library packages. Initialization is lazy (loaded only when cloud features are used). |
| **Rationale** | Firebase provides a managed, serverless database with real-time sync capabilities and generous free tier. Lazy initialization avoids loading the Firebase SDK for users who only draw locally. Keeping it app-only ensures the npm package stays backend-agnostic. |
| **Consequences** | The app is coupled to Firebase for cloud features. Self-hosters must either configure their own Firebase project or replace the storage layer. The library remains clean — no Firebase dependency leaks into `@excalidraw/excalidraw`. |

## 10. Vitest over Jest

| | |
|---|---|
| **Date** | Pre-2026 |
| **Status** | Active |
| **Context** | The project uses Vite for development and builds. Jest required separate configuration and didn't natively understand Vite's module resolution, path aliases, or plugin pipeline. |
| **Decision** | Migrate from Jest to Vitest (3.0.6) as the test runner. |
| **Rationale** | Vitest shares Vite's config, module resolution, and transform pipeline — path aliases, plugins, and TypeScript work identically in tests and dev. It's faster (native ESM, parallel test execution) and has Jest-compatible APIs, making migration straightforward. V8-based coverage (`@vitest/coverage-v8`) replaces Istanbul. |
| **Consequences** | Vitest is a younger project with a smaller ecosystem than Jest. Some Jest-specific plugins or patterns may not have direct equivalents. The team now runs `vitest` in watch mode by default, with `vitest run` for CI. Coverage thresholds are enforced in `vitest.config.mts`. |

---

# Undocumented Behavior Catalog

> Discovered via codebase audit on 2026-03-26.
> Covers: implicit state machines, non-obvious side effects, initialization order dependencies, and HACK/FIXME/TODO/WORKAROUND markers.

---

## Undocumented Behavior #1 — Module-scoped mutable gesture state shared across instances
- **File**: `packages/excalidraw/components/App.tsx` (lines 587–615)
- **What happens**: 14 mutable `let` variables (`didTapTwice`, `isPanning`, `isDraggingScrollBar`, `IS_PLAIN_PASTE`, `lastPointerUp`, `gesture`, etc.) are declared at **module scope**, outside the `App` class. They are shared by all `<Excalidraw>` instances in the same JS realm. If two editor instances exist on one page, they silently share panning, double-tap, paste, and multi-touch state.
- **Where documented**: Nowhere.
- **Risk**: AI may suggest rendering multiple `<Excalidraw>` components on one page without realizing they will corrupt each other's gesture tracking. Any "extract to hook" refactor that assumes per-instance state will also break.

## Undocumented Behavior #2 — `polyfill()` mutates global prototypes on import
- **File**: `packages/excalidraw/polyfill.ts` (lines 1–33)
- **What happens**: Importing `@excalidraw/excalidraw` calls `polyfill()` which uses `Object.defineProperty` to add `Array.prototype.at` and replaces `Element.prototype.replaceChildren`. These affect the **entire JS realm** — all libraries, all components. The same polyfill is also called a second time from `excalidraw-app/App.tsx` (line 151).
- **Where documented**: Nowhere.
- **Risk**: AI may suggest removing the "redundant" second call, not realizing the first runs at library import time and the second at app shell import time (different entry paths). Or it may suggest a polyfill that conflicts with these global mutations.

## Undocumented Behavior #3 — `window.EXCALIDRAW_THROTTLE_RENDER` flag bridges app shell and library
- **File**: `excalidraw-app/App.tsx` (line 155, sets flag) → `packages/excalidraw/reactUtils.ts` (lines 34–62, reads flag)
- **What happens**: The app shell sets `window.EXCALIDRAW_THROTTLE_RENDER = true` at module scope. The library package reads it via a closure-cached `isRenderThrottlingEnabled()` that also checks `React >= 18`. If the library is embedded **without** the app shell (npm consumers), the flag is never set and render throttling is silently disabled.
- **Where documented**: Inline comment in `reactUtils.ts` references issue #5439 but does not explain the cross-package contract.
- **Risk**: AI may suggest performance optimizations assuming throttling is always active. Or it may move the flag into the library, breaking the intentional opt-in design for third-party embedders.

## Undocumented Behavior #4 — `bindMode` implicit timed state machine (orbit → skip → inside)
- **File**: `packages/excalidraw/components/App.tsx` (lines 926–1040)
- **What happens**: Arrow binding uses three modes (`orbit`, `skip`, `inside`) with transitions driven by `setTimeout`, `flushSync`, and pointer-move events. `handleSkipBindMode` transitions `orbit` → `skip` synchronously via `flushSync`. `resetDelayedBindMode` schedules a return to `orbit` via `setTimeout(0)`. `handleDelayedBindModeChange` uses a debounced timeout (`BIND_MODE_TIMEOUT`) to transition to `inside` on sustained hover over a bindable element. These three methods form a state machine, but there is no state diagram, no enum documenting transitions, and no central place describing valid sequences.
- **Where documented**: Nowhere. Logic is split across three private methods.
- **Risk**: AI may refactor one transition without understanding the full state machine, breaking arrow binding UX. Replacing `flushSync` with normal `setState` will desynchronize the skip mode from pointer handlers.

## Undocumented Behavior #5 — `componentDidUpdate` encodes implicit cross-field state transitions
- **File**: `packages/excalidraw/components/App.tsx` (lines 3424–3474)
- **What happens**: `componentDidUpdate` contains a series of `if` guards that enforce hidden invariants: (1) selecting elements while eraser is active forces tool back to `selection`; (2) switching away from `selection` tool auto-closes the hyperlink popup; (3) toggling `viewModeEnabled` re-runs `addEventListeners` + `deselectElements`; (4) opening/closing `elementLinkSelector` dialog clears selection and hovers. These are not expressed as a state machine — they are **imperative patches** that fire on every update.
- **Where documented**: Nowhere as a whole; individual conditions have no explanatory comments.
- **Risk**: AI may add new tool types or dialog states without adding the corresponding cleanup guard in `componentDidUpdate`, causing stale UI or phantom selections. Moving to functional components would require explicitly replicating every guard in `useEffect`.

## Undocumented Behavior #6 — Action registration depends on module import order
- **File**: `packages/excalidraw/actions/register.ts` (lines 1–15)
- **What happens**: `register()` appends actions to a **global mutable array** (`let actions`). The array's order is determined entirely by the order that action modules are first imported. `App.tsx` imports action modules in a specific order, and that import order determines keyboard shortcut priority and action resolution. Any action module that is never imported is silently absent.
- **Where documented**: Nowhere. No comment in `register.ts` explains the ordering dependency.
- **Risk**: AI may reorder imports in `App.tsx` or tree-shake an action module, silently changing shortcut priority or removing an action entirely. Adding a new action without importing it in the right place means it will never be registered.

## Undocumented Behavior #7 — `isSomeElementSelected` uses closure-cached memoization (stateful utility)
- **File**: `packages/element/src/selection.ts` (lines 138–163)
- **What happens**: `isSomeElementSelected` is an IIFE that caches `lastElements`, `lastSelectedElementIds`, and `isSelected` in closure variables. It returns a cached result if reference equality holds. This makes a pure-looking utility function **stateful** — it retains references to previous elements arrays, preventing garbage collection. The FIXME comment says "move this into the editor instance to keep utility methods stateless" but this has not been done.
- **Where documented**: Only the FIXME comment acknowledges the problem.
- **Risk**: AI may call this function in tests or multiple contexts assuming it is stateless. Stale cached references can return incorrect results if the same array reference is reused with different contents (mutation).

## Undocumented Behavior #8 — `setLanguage` mutates `document.documentElement` globally
- **File**: `packages/excalidraw/i18n.ts` (lines 89–109)
- **What happens**: `setLanguage()` sets `document.documentElement.dir` and `document.documentElement.lang` for the entire HTML document, then writes to the singleton `editorJotaiStore`. In multi-instance scenarios, the last editor to call `setLanguage` wins for the entire page. Module-scoped `currentLang` and `currentLangData` are also shared singletons.
- **Where documented**: Nowhere.
- **Risk**: AI may suggest per-editor locale support without realizing `document.documentElement` is page-global and cannot be scoped per instance.

## Undocumented Behavior #9 — `normalizeFile` stamps browser `File` objects with a Symbol property
- **File**: `packages/excalidraw/data/blob.ts` (lines 462–490)
- **What happens**: `normalizeFile()` attaches a `Symbol("fileNormalized")` property to `File` objects via `(file as any)[normalizedFileSymbol] = true` to prevent double normalization. This mutates browser-native `File` instances, which are normally immutable value objects.
- **Where documented**: Inline comment "to prevent double normalization (perf optim)" explains intent but not the mutation risk.
- **Risk**: AI may clone or re-create `File` objects (e.g., via `new File()`), losing the symbol and causing double normalization. Or it may assume `File` objects are never mutated and introduce strict type checks that break.

## Undocumented Behavior #10 — WYSIWYG theme sync uses `onChangeEmitter` as a workaround
- **File**: `packages/excalidraw/wysiwyg/textWysiwyg.tsx` (line 964)
- **What happens**: The text editor subscribes to `app.onChangeEmitter` to detect theme changes and restyle the WYSIWYG editor. The FIXME comment reads: "FIXME after we start emitting updates from Store for appState.theme". This means the Store does **not** emit theme changes — the code works around this by listening to all element changes and manually checking `app.state.theme !== LAST_THEME`.
- **Where documented**: Only the FIXME comment.
- **Risk**: AI may refactor the change emitter or assume all appState changes are emitted by Store. If the `onChangeEmitter` subscription is removed during cleanup, the WYSIWYG editor will stop responding to theme toggles.

## Undocumented Behavior #11 — `Store.scheduleCapture()` called from too many places
- **File**: `packages/element/src/store.ts` (line 109)
- **What happens**: `scheduleCapture()` triggers delta calculation for undo/redo. The TODO comment reads: "Suspicious that this is called so many places. Seems error-prone." There is no centralized documentation of which call sites are intentional vs. redundant, making it unclear whether removing any single call will break undo history.
- **Where documented**: Only the TODO comment expresses concern.
- **Risk**: AI may deduplicate calls thinking they are redundant, silently breaking undo/redo for specific user actions. Or it may add new calls without understanding the capture lifecycle.

## Undocumented Behavior #12 — Sentry initializes at module load before React tree exists
- **File**: `excalidraw-app/sentry.ts` (loaded from `excalidraw-app/index.tsx` line 4)
- **What happens**: `import "../excalidraw-app/sentry"` is a side-effect-only import that calls `Sentry.init()` at module evaluation time — before `createRoot`, before React mounts, before `App` is even imported. It reads `window.location.hostname` and `import.meta.env` to decide DSN. Feature flags are also registered at module scope.
- **Where documented**: Nowhere beyond inline Sentry config.
- **Risk**: AI may reorder imports in `index.tsx` or move Sentry to lazy loading, causing early errors to go unreported. Or it may add code that depends on React context inside the Sentry config, which won't exist yet.

## Undocumented Behavior #13 — `updateActiveTool` / `lastActiveToolBeforeEraser` is overloaded for both eraser and hand tool
- **File**: `packages/common/src/utils.ts` (lines 376–407), consumed in `packages/excalidraw/components/App.tsx` (~7621–7673) and `packages/excalidraw/actions/actionCanvas.tsx` (~567–604)
- **What happens**: The parameter `lastActiveToolBeforeEraser` is used to stash/restore the previous tool not just for the eraser but also for the hand (pan) tool. The name suggests eraser-only, but `actionToggleHandTool` passes through the same channel. On pointer-up with a physical eraser button, the code restores via `lastActiveTool` (fallback `selection`) — a completely different path from the hand tool restore.
- **Where documented**: The parameter name is actively misleading. No comment explains the dual-use.
- **Risk**: AI may rename or refactor the eraser path without realizing it breaks the hand tool restore, or vice versa.

## Undocumented Behavior #14 — Z-index reordering has known bugs in frame-group interactions
- **File**: `packages/element/tests/zindex.test.tsx` (lines 1322–1325), `packages/element/tests/frame.test.tsx` (lines 336–340)
- **What happens**: Multiple FIXME-marked test cases document incorrect z-ordering behavior: "FIXME incorrect, should put F1_1 after R3", "FIXME should be noop from previous step after it's fixed", and frame tests that "fail in tests but work in browser" with `getElementsCompletelyInFrame()` not working correctly in test environment.
- **Where documented**: Only in FIXME comments inside skipped tests.
- **Risk**: AI may refactor z-index logic and accidentally "fix" tests that were intentionally skipped, or break the current workaround that makes browser behavior correct despite test failures.

## Undocumented Behavior #15 — `isElementInFrame` is a known performance bottleneck
- **File**: `packages/element/src/frame.ts` (lines 752–753)
- **What happens**: The TODO reads: "this is a huge bottleneck for large scenes, optimise". The function checks whether an element belongs to a frame by iterating, and it is called frequently during rendering and interaction.
- **Where documented**: Only the TODO comment.
- **Risk**: AI may call this function in hot paths (e.g., during drag operations) without realizing it has O(n) complexity on the full element set. Optimization attempts need to understand the full call graph.

## Undocumented Behavior #16 — `positionElementsOnGrid` is "mostly vibe-coded"
- **File**: `packages/element/src/positionElementsOnGrid.ts` (line 6)
- **What happens**: The TODO reads: "rewrite (mostly vibe-coded)". This function positions elements on a grid layout and is used in production, but the implementation was written without rigorous testing or design.
- **Where documented**: Only the TODO comment.
- **Risk**: AI may trust this function's behavior for grid layout logic and build on top of it. Edge cases (overlapping elements, mixed sizes, negative coordinates) may produce incorrect results.

## Undocumented Behavior #17 — Circular dependency forces `pick` utility into `colors.ts`
- **File**: `packages/common/src/colors.ts` (line 116)
- **What happens**: The FIXME reads: "can't put to utils.ts rn because of circular dependency". A generic `pick` helper is defined in the colors module instead of the utils module because moving it would create a circular import chain.
- **Where documented**: Only the FIXME comment.
- **Risk**: AI may move this function to `utils.ts` during a "clean up code organization" refactor, reintroducing the circular dependency and causing bundler errors or runtime crashes.

## Undocumented Behavior #18 — Deleted elements leak through `exportToSvg` utils
- **File**: `packages/utils/tests/export.test.ts` (lines 94–96)
- **What happens**: The FIXME reads: "the utils.exportToSvg no longer filters out deleted elements. It's already supposed to be passed non-deleted elements but we're not type-checking for it correctly." The related test is `.skip`ped.
- **Where documented**: Only the FIXME comment in the test.
- **Risk**: AI may use `exportToSvg` assuming it handles deleted elements, or it may remove the `.skip` and get a failing test without understanding the underlying type contract violation.

## Undocumented Behavior #19 — HACK: Mobile transform handles disabled for linear elements
- **File**: `packages/excalidraw/components/App.tsx` (line 7126)
- **What happens**: The HACK comment reads: "Disable transform handles for linear elements on mobile until a better way of showing them is found." This means mobile users cannot resize/rotate lines and arrows using transform handles — a significant UX limitation hidden in a conditional check.
- **Where documented**: Only the HACK comment.
- **Risk**: AI may implement mobile UX improvements assuming all transform handles work uniformly, not realizing linear elements are intentionally excluded.

## Undocumented Behavior #20 — Memory leak if pointer-up is not triggered
- **File**: `packages/excalidraw/tests/selection.test.tsx` (lines 250, 273)
- **What happens**: The TODO reads: "There is a memory leak if pointer up is not triggered." The selection system attaches event handlers on pointer-down that are only cleaned up on pointer-up. If pointer-up never fires (e.g., browser tab switch, touch cancellation), handlers leak.
- **Where documented**: Only the TODO comment in tests.
- **Risk**: AI may refactor pointer handling without adding cleanup for the case where pointer-up is lost, perpetuating or worsening the leak.
