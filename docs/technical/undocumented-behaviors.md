# Undocumented Behaviors

## Undocumented Behavior #1
- **File**: `packages/excalidraw/components/App.tsx`
- **Issue**: Double-click handling is split across two event paths. The canvas stores browser click positions in `lastCompletedCanvasClicks` for mouse-driven double-click gating, while pointer-up events separately derive `lastPointerUpIsDoubleClick` for touch and text-edit flows. This creates an implicit state machine spanning click history, pointer history, and input type.
- **Risks**: Device-specific regressions, inconsistent mouse vs. touch behavior, stale click history affecting later interactions, and accidental text insertion or caret placement when the two detection paths drift.

## Undocumented Behavior #2
- **File**: `packages/excalidraw/components/App.tsx`
- **Issue**: Transform handles are intentionally suppressed for linear elements in some cases. A `HACK` disables them on mobile devices and for 2-point linear elements until a better presentation exists, so selection affordances depend on element shape and platform rather than a documented capability rule.
- **Risks**: Hidden feature gaps on mobile, platform-specific editing semantics, impossible-to-discover resize/transform behavior for users, and future regressions if other code assumes selected elements always expose transform handles.

## Undocumented Behavior #3
- **File**: `packages/excalidraw/wysiwyg/textWysiwyg.tsx`
- **Issue**: The WYSIWYG editor manually mirrors theme changes by subscribing to the general `onChangeEmitter` and comparing against a local `LAST_THEME` variable because the Store does not emit `appState.theme` updates directly. Theme propagation therefore depends on a workaround and an unrelated scene-change channel.
- **Risks**: Theme/UI desynchronization, hidden coupling between text editing and scene updates, missed style refreshes when app-state changes bypass the emitter, and extra maintenance cost when Store update semantics change.

## Undocumented Behavior #4
- **File**: `packages/excalidraw/tests/selection.test.tsx`
- **Issue**: The selection interaction relies on `pointerup` cleanup to avoid leaking state. The tests explicitly fire `pointerUp` with a `TODO` noting a memory leak otherwise, which implies an undocumented lifecycle contract in the selection state machine: `pointerdown` must always be paired with a successful completion path.
- **Risks**: Leaked listeners or transient selection state after interrupted gestures, flaky tests, hard-to-reproduce interaction bugs when the browser cancels or drops `pointerup`, and degraded long-running editor sessions.
