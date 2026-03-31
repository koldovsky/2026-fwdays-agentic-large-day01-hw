# Product Context (Verified UX Surface)

## Summary
- User-facing behavior snapshot verified from current implementation.
- Captures practical UX flows exposed by the editor package.

## Current State

- Embed Excalidraw as a React component (`@excalidraw/excalidraw` package surface).
- Provide an interactive editor experience with:
  - an empty-state welcome screen (`showWelcomeScreen` and `renderWelcomeScreen` via `LayerUI`)
  - collaboration entry points (`LiveCollaborationTrigger`)
  - keyboard-driven flows (paste handling and shortcuts)
- Support sharing and restoring editor state through the Web Share Target flow (`web-share-target` URL parameter).
- Expose export and serialization helpers on the public component package.

1. Restore a shared file on load
   - On mount, if `window.location.search` includes `web-share-target`, `restoreFileFromShare()` runs.
   - `restoreFileFromShare()`:
     - opens `caches.open("web-share-target")`
     - reads `shared-file`
     - converts the cached response blob into a `File`
     - calls `loadFileToCanvas(file, null)`
     - deletes `shared-file` from cache
     - calls `window.history.replaceState(...)`

2. Show welcome screen for an empty scene
   - `componentDidUpdate` sets `showWelcomeScreen: true` when `!showWelcomeScreen && !elements.length`.
   - `LayerUI` renders `renderWelcomeScreen` only when all of the following are true:
     - `!this.state.isLoading`
     - `this.state.showWelcomeScreen`
     - `this.state.activeTool.type === this.state.preferredSelectionTool.type`
     - `!this.state.zenModeEnabled`
     - `!this.scene.getElementsIncludingDeleted().length`

3. Live collaboration trigger in UI
   - `LiveCollaborationTrigger` renders a `Button` with active styling tied to `isCollaborating`.
   - The button shows:
     - share icon or share text based on `editorInterface?.formFactor` and `appState.width`
     - collaborator count from `appState.collaborators.size`

4. Plain paste behavior (Ctrl/Cmd+Shift+V)
   - In `onKeyDown`, when `event[KEYS.CTRL_OR_CMD]` and `event.key.toLowerCase() === KEYS.V`:
     - `IS_PLAIN_PASTE = event.shiftKey`
     - the flag resets after 100ms via `IS_PLAIN_PASTE_TIMER`
   - Paste handling reads `const isPlainPaste = !!IS_PLAIN_PASTE`.
   - If paste is not plain and all pasted lines are embeddable URLs, the editor inserts embeddable elements instead of plain text.

### Export and Serialization Entrypoints

- Public entrypoint `packages/excalidraw/index.tsx` re-exports:
  - `exportToCanvas`, `exportToBlob`, `exportToSvg`, `exportToClipboard`
  - `serializeAsJSON`, `serializeLibraryAsJSON`

## Actions
- Keep scenarios aligned with UX behavior in `App.tsx`.
- Refresh this document when collaboration, onboarding, or paste UX changes.

## Source Checkpoints
- `packages/excalidraw/index.tsx`
- `packages/excalidraw/components/App.tsx`
- `packages/excalidraw/components/live-collaboration/LiveCollaborationTrigger.tsx`

## Related Documentation
- [`./projectbrief.md`](./projectbrief.md)
- [`./systemPatterns.md`](./systemPatterns.md)
- [`../technical/architecture.md`](../technical/architecture.md)
- [`../product/domain-glossary.md`](../product/domain-glossary.md)