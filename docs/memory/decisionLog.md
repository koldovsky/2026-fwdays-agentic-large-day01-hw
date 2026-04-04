# Excalidraw — Decision Log

## Architectural Decisions

### 1. Canvas-Based Rendering over DOM/SVG

Excalidraw renders all elements on HTML Canvas instead of DOM nodes or inline SVG. This gives full control over the rendering pipeline and enables smooth 60fps interaction even with hundreds of elements. The trade-off is that accessibility (screen readers) and native browser text selection are unavailable on the canvas layer.

### 2. Jotai for State Management

The project adopted Jotai (atomic state management) over Redux or Context API. Jotai's atom-based approach avoids the "single store" bottleneck and enables fine-grained re-renders. See `packages/excalidraw/editor-jotai.ts` and `excalidraw-app/app-jotai.ts`.

### 3. Fractional Indexing for Element Ordering

Instead of array indices, elements use fractional indices (`packages/element/src/fractionalIndex.ts`) for z-ordering. This allows concurrent insertions in multiplayer without reordering the entire array — critical for conflict-free collaboration.

### 4. Delta-Based History (not Snapshot-Based)

The undo/redo system records deltas (incremental changes) rather than full state snapshots. This reduces memory usage and aligns with the collaboration delta-sync model. See `packages/excalidraw/history.ts` and `packages/element/src/store.ts`.

### 5. Monorepo Package Split

Core logic is split into five packages (`common`, `element`, `excalidraw`, `math`, `utils`) to enable independent versioning, tree-shaking, and third-party embedding. The `excalidraw-app` package consumes these as a reference implementation.

---

## Undocumented Behaviors

### UB-1: Silent Shift+Paste for Plain Text

**File:** `packages/excalidraw/components/App.tsx` (lines 605-606, 4923-4931)

When pressing Ctrl/Cmd+Shift+V, the app sets an internal `IS_PLAIN_PASTE` flag that strips HTML formatting from clipboard data, pasting only plain text. The flag auto-resets after 100ms. This behavior is not documented in help dialogs or keyboard shortcut lists.

### UB-2: Safari-Specific Font Loading Workaround

**File:** `packages/excalidraw/components/App.tsx` (lines 3966-3971)

During paste operations in Safari, fonts are manually loaded via `Fonts.loadElementsFonts()` because Safari does not fire the `FontFace loadingdone` event during paste. This silent workaround means pasted elements may briefly render with incorrect fonts in Safari before the manual load completes.

### UB-3: Double-Tap Position Threshold (Mobile)

**File:** `packages/excalidraw/components/App.tsx` (lines 3605-3632)
**Constant:** `DOUBLE_TAP_POSITION_THRESHOLD = 35` (`packages/common/src/constants.ts`, line 508)

On mobile, text creation via double-tap only triggers if the second tap is within 35px of the first. If the finger moves farther, the action silently fails with no feedback to the user.

### UB-4: Zoom-Aware Freedraw Loop Detection

**File:** `packages/element/src/utils.ts` (lines 467-483)
**Constant:** `LINE_CONFIRM_THRESHOLD = 8` (`packages/common/src/constants.ts`, line 21)

When drawing freehand, the app detects whether the path forms a closed loop by checking if start and end points are within `LINE_CONFIRM_THRESHOLD / zoomValue` pixels. At 0.5x zoom, the threshold doubles to 16px; at 2x zoom, it halves to 4px. This means the same physical hand movement produces different results at different zoom levels.

### UB-5: Clipboard Fallback Chain

**File:** `packages/excalidraw/clipboard.ts` (lines 556-636)

Copy-to-clipboard silently tries three methods in sequence:
1. `ClipboardEvent.setData()` (preferred)
2. `navigator.clipboard.writeText()` (modern API)
3. `document.execCommand("copy")` via hidden textarea at position -9999px (legacy fallback)

Each failure silently attempts the next method. The user sees no indication of which method succeeded.

### UB-6: Dynamic Arrow Binding Distance

**File:** `packages/element/src/binding.ts` (lines 107-137)
**Constant:** `BASE_BINDING_DISTANCE = 15` (same file)

Arrow binding "stickiness" to shapes dynamically adjusts with zoom: `BASE_BINDING_DISTANCE / (zoomValue * 1.5)`, clamped between 15px and 30px. At low zoom, arrows snap from farther away; at high zoom, binding is tighter. Users cannot control this threshold.
