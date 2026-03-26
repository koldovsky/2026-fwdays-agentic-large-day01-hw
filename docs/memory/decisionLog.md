# Decision Log — Excalidraw

This document captures architectural decisions and undocumented behaviors discovered through code analysis. Each entry describes what the code does vs. what is documented.

---

## Undocumented Behaviors

### 1. Hidden Debug Hook: `window.h`

**What the code does:** In development and test environments, a global `window.h` object is silently created that provides direct access to the internal scene, elements, and app instance. It allows reading/writing all drawing elements from the browser console.

**Where:** `packages/excalidraw/components/App.tsx` (~line 12792–12817)

**What's documented:** Nothing — this is not mentioned in any README, docs, or comments.

**Impact:** Useful for debugging but could be a security concern if accidentally exposed in production. The guard (`isTestEnv() || isDevEnv()`) mitigates this.

---

### 2. Silent Font Loading Fallback Chain

**What the code does:** When a font fails to load from the primary URL, the system silently catches the error, logs to console, and tries the next URL in a fallback chain (from `window.EXCALIDRAW_ASSET_PATH` array or default CDN). If all fail, it returns the last URL as a string — no error is raised to the user.

**Where:** `packages/excalidraw/fonts/ExcalidrawFontFace.ts` (lines 58–88)

**What's documented:** The `EXCALIDRAW_ASSET_PATH` global is declared in TypeScript definitions but the fallback behavior and silent failure mode are not documented.

**Impact:** Users may see incorrect fonts without understanding why. Debugging requires checking browser console.

---

### 3. Undocumented Global: `EXCALIDRAW_THROTTLE_RENDER`

**What the code does:** Setting `window.EXCALIDRAW_THROTTLE_RENDER = true` enables per-animation-frame React render throttling. If React < 18, a console warning is emitted and throttling is disabled.

**Where:** `packages/excalidraw/reactUtils.ts` (lines 34–62), `packages/excalidraw/global.d.ts` (line 5)

**What's documented:** Only the TypeScript type declaration exists. No user-facing or developer-facing docs explain this performance knob.

**Impact:** Embedders who experience rendering performance issues have no way to discover this option without reading source code.

---

### 4. Hidden Feature Flag: `COMPLEX_BINDINGS`

**What the code does:** A localStorage-based feature flag system reads `excalidraw-feature-flags` from localStorage. The `COMPLEX_BINDINGS` flag alters arrow-to-element binding behavior across 9+ call sites in App.tsx.

**Where:** `packages/common/src/utils.ts` (lines 1292–1324), used in `App.tsx` at lines 4993, 5077, 5332, 7033, 7927, 9272, 9666, 9675, 10453

**What's documented:** Nothing. The flag system has no public API, UI toggle, or documentation. Only accessible via `localStorage.setItem('excalidraw-feature-flags', JSON.stringify({COMPLEX_BINDINGS: true}))`.

**Impact:** Experimental binding behavior is completely invisible to users and embedders.

---

### 5. Silent Fallback for File Hash Generation

**What the code does:** When generating unique IDs for uploaded files, the system attempts SHA-1 crypto digest. If `crypto.subtle.digest` fails (e.g., non-HTTPS context), it silently falls back to a random 40-character nanoid.

**Where:** `packages/excalidraw/data/blob.ts` (lines 258–272)

**What's documented:** No documentation. Only a code comment explains the 40-character length choice.

**Impact:** File IDs are non-deterministic in insecure contexts — the same file could get different IDs across sessions, potentially causing duplicate storage.

---

### 6. Device Pixel Ratio Controls Default Export Scale

**What the code does:** The default export scale (1x, 2x, 3x) is automatically set to `window.devicePixelRatio` if it matches one of the allowed values `[1, 2, 3]`. Otherwise defaults to 1x.

**Where:** `packages/excalidraw/appState.ts` (lines 18–20, 65)

**What's documented:** No documentation or comments explaining this coupling between device hardware and export output.

**Impact:** Users on Retina displays unknowingly get 2x exports by default, which doubles file size. Users on standard displays get 1x.

---

### 7. Silent localStorage Error Handling

**What the code does:** All localStorage operations (get/set/delete) silently catch exceptions, log warnings to console only, and return false/null on failure. No errors propagate to the application.

**Where:** `packages/excalidraw/data/EditorLocalStorage.ts` (lines 6–52)

**What's documented:** No documentation. The silent failure is by design but undocumented.

**Impact:** Users in private browsing or with full storage will silently lose settings, API keys, and preferences without any UI indication.

---

### 8. Test-Only Default Behavior Differences

**What the code does:** In test environments (`isTestEnv()`), the default element roundness is set to `"sharp"` instead of the production default `"round"`.

**Where:** `packages/excalidraw/appState.ts` (line 39)

**What's documented:** No comment or documentation explaining why test and production have different defaults.

**Impact:** Test snapshots and visual output differ from production, potentially masking rendering bugs.

---

### 9. Hidden Keyboard Modifier Behaviors

**What the code does:** Three keyboard modifiers alter drawing behavior:
- **Alt** during resize → resize from center
- **Shift** during resize → maintain aspect ratio
- **Shift** during rotate → snap to discrete angles

**Where:** `packages/common/src/keys.ts` (lines 143–151)

**What's documented:** These behaviors exist as pure utility functions with no inline comments, help text, or inclusion in the keyboard shortcuts dialog.

**Impact:** Power-user features are completely undiscoverable through the UI.

---

## Architectural Decisions

### Canvas over SVG DOM
**Decision:** Use HTML5 Canvas for rendering instead of SVG DOM elements.
**Rationale:** Performance — Canvas handles thousands of elements without DOM overhead. SVG is used only for file export.

### Jotai over Redux
**Decision:** Migrate state management from Redux to Jotai atomic state.
**Rationale:** Lighter weight, better performance through granular subscriptions, simpler API.

### Immutable Element Data
**Decision:** Elements are treated as immutable — mutations produce new objects.
**Rationale:** Enables reliable undo/redo, simplifies collaboration reconciliation, prevents accidental mutation bugs.

### Monorepo with Yarn Workspaces
**Decision:** Single repository with workspace packages instead of separate repos.
**Rationale:** Atomic cross-package changes, shared tooling, simpler dependency management.

### Fractional Indexing for Collaboration
**Decision:** Use fractional indexing for element ordering in collaborative sessions.
**Rationale:** Avoids conflicts when multiple users insert elements simultaneously.

---

## Related Documentation

- [System Patterns](systemPatterns.md) — architecture patterns in detail
- [Tech Context](techContext.md) — technology choices
- [Architecture](../technical/architecture.md) — system diagrams
