# Decision Log

## Purpose

This document captures five examples of undocumented or under-documented behavior found in the source code.
The focus is on:

- implicit state machines
- non-obvious side effects
- initialization-order dependencies

Each example compares:

- what the code is doing
- what the current documentation already says
- what is still undocumented in practical terms

## Current Documentation Baseline

The current docs already describe some behavior at a high level:

- `docs/technical/architecture.md` explains the layered architecture, state objects, rendering pipeline, and startup/data flow
- the root `decisionLog.md` explains the hybrid state model and several implicit state machines inside `packages/excalidraw/components/App.tsx`
- `docs/memory/systemPatterns.md` describes local persistence, collaboration, and PWA patterns

However, the current docs usually describe these systems at a structural level.
They do not consistently capture specific hacks, fragile invariants, or code paths marked by `HACK`, `FIXME`, or `TODO`.

## Example 1: Double-click behavior is split across touch and pointer logic

### Code evidence

File:

- `packages/excalidraw/components/App.tsx`

Source comment:

- `TODO this is a hack and we should ideally unify touch and pointer events`
- the surrounding comment explicitly says the editor currently mixes native browser click handling and manual touch handling

### What the code is doing

The editor stores click-related state in instance fields such as:

- `lastPointerDownEvent`
- `lastPointerUpEvent`
- `lastPointerUpIsDoubleClick`
- `lastCompletedCanvasClicks`

This indicates that double-click detection is not handled through one unified interaction model.
Instead, the runtime mixes browser-native behavior with custom pointer/touch bookkeeping.

### Behavior type

- implicit interaction state machine
- non-obvious input-model workaround

### What is already documented

The root `decisionLog.md` already says `App.tsx` contains an implicit interaction state machine around pointer down, move, drag, resize, rotate, bind, and edit behavior.

### What is still undocumented

The current docs do not mention that double-click handling is explicitly described in code as a hack and that touch/pointer logic is known to be only partially unified.
That matters because future changes to pointer events can break click semantics in subtle ways.

## Example 2: Transform handles for linear elements are intentionally disabled on mobile

### Code evidence

File:

- `packages/excalidraw/components/App.tsx`

Source comment:

- `HACK: Disable transform handles for linear elements on mobile until a better way of showing them is found`

### What the code is doing

When deciding whether to show transform handles, the code contains a special-case exclusion for linear elements on mobile, and also for specific point-count conditions.
This means the UI behavior is intentionally inconsistent across device classes.

### Behavior type

- implicit UI state machine
- device-specific workaround

### What is already documented

`docs/product/PRD.md` and `docs/memory/productContext.md` mention that some visible UI differs by form factor.

### What is still undocumented

The docs do not currently say that this specific mobile behavior is enforced via a `HACK` in the editor runtime.
The distinction matters because it is not a clean product rule documented at the UX level; it is a code-level workaround with potential downstream effects on selection/editing behavior.

## Example 3: Store capture semantics are acknowledged as error-prone

### Code evidence

File:

- `packages/element/src/store.ts`

Source comment:

- `TODO: Suspicious that this is called so many places. Seems error-prone.`

The comment is attached to `scheduleCapture()`.

### What the code is doing

The store supports multiple capture modes and scheduling paths:

- `scheduleAction(...)`
- `scheduleCapture()`
- `scheduleMicroAction(...)`
- `commit(...)`

These cooperate with:

- `CaptureUpdateAction.IMMEDIATELY`
- `CaptureUpdateAction.NEVER`
- `CaptureUpdateAction.EVENTUALLY`

This is a change-capture state machine that directly affects undo/redo and event emission.

### Behavior type

- implicit mutation-capture state machine
- non-obvious side effects through event emission and history recording

### What is already documented

- `docs/technical/architecture.md` documents the `Store` and capture modes
- the root `decisionLog.md` documents the history/delta capture machine at a conceptual level

### What is still undocumented

The current docs do not state that the code itself flags the capture scheduling surface as suspicious and error-prone.
That missing note is important because contributors may otherwise assume the update/capture flow is more stable and centralized than the code comments suggest.

## Example 4: WYSIWYG theme sync depends on side effects outside the Store contract

### Code evidence

File:

- `packages/excalidraw/wysiwyg/textWysiwyg.tsx`

Source comment:

- `FIXME after we start emitting updates from Store for appState.theme`

Nearby behavior:

- subscribes to `app.onChangeEmitter`
- subscribes to `app.scene.onUpdate(...)`
- calls `updateWysiwygStyle()`
- focuses the editable element from scene updates

### What the code is doing

The text editing overlay currently updates theme-sensitive styling through editor-side emitters and scene updates, not through a fully documented Store-based state propagation path.
That means text editing correctness depends on side effects and subscriptions that are separate from the main store/update model.

### Behavior type

- non-obvious side effects
- partial state propagation workaround

### What is already documented

The root `decisionLog.md` documents that `App.tsx` has many side effects and that observers and emitters are part of the design.

### What is still undocumented

The current docs do not mention that WYSIWYG theme updates are explicitly waiting on a future Store-based mechanism and currently rely on side-effect subscriptions.
This gap matters because text editing UI may not behave like the rest of the app-state propagation model.

## Example 5: Scene initialization depends on entry path and handler order

### Code evidence

Files:

- `excalidraw-app/App.tsx`

Source comments:

- `Adding a listener outside of the component as it may (?) need to be subscribed early to catch the event.`
- `necessary if we're invoking from a hashchange handler which doesn't go through App.initializeScene() that resets this flag`

### What the code is doing

Two separate initialization-order dependencies are visible:

1. The `beforeinstallprompt` listener is attached outside the React component and caches the event in a module-level variable `pwaEvent`.
2. Scene restoration from collaboration or share links has a special `isLoading: false` correction because the hashchange entry path does not go through the normal initialization path.

This means some product behavior depends on:

- listener registration happening early enough
- which path invoked scene restoration
- whether initialization happened via initial load or hashchange-driven flow

### Behavior type

- initialization-order dependency
- non-obvious lifecycle side effect

### What is already documented

- `docs/technical/architecture.md` explains startup flow and `initializeScene(...)`
- `docs/memory/systemPatterns.md` documents PWA and scene initialization at a high level

### What is still undocumented

The current docs do not call out that the implementation depends on two distinct entry paths with different state-reset behavior, nor that the PWA install event is intentionally captured outside the component lifecycle.
That matters because refactoring startup code without preserving this order could silently break install prompts or loading-state transitions.

## Summary Of Gaps

Across these five examples, the existing docs are strongest on:

- architecture
- major state containers
- high-level runtime patterns

They are weaker on:

- code-level hacks that encode product behavior
- device-specific or path-specific workarounds
- fragile ordering assumptions
- known weak points identified by maintainers through `TODO`, `FIXME`, or `HACK`

## Suggested Documentation Direction

If this repository continues documenting architectural decisions, the next useful additions would be:

- a dedicated note for input and gesture edge cases
- a note on store capture invariants and undo/redo correctness
- a note on scene initialization entry paths
- a note on side-effect-driven subsystems such as WYSIWYG and collaboration presence

## Source Basis

This document was derived from:

- `packages/excalidraw/components/App.tsx`
- `packages/element/src/store.ts`
- `packages/excalidraw/wysiwyg/textWysiwyg.tsx`
- `excalidraw-app/App.tsx`
- `docs/technical/architecture.md`
- `docs/memory/systemPatterns.md`
- the root `decisionLog.md`
