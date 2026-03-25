# Product Context (Verified UX Surface)

## UX goals reflected in code
- Embed Excalidraw as a React component (`@excalidraw/excalidraw` package description and entrypoint).
- Provide an interactive editor UI with:
  - an empty-state welcome screen (`showWelcomeScreen` + `renderWelcomeScreen` passed to `LayerUI`)
  - collaboration-related UI (`LiveCollaborationTrigger`)
  - keyboard-driven behaviors (paste handling, shortcuts)
- Support sharing/restoring editor state via the Web Share Target flow (`web-share-target` URL param).
- Provide export/serialization helpers as part of the public component package surface.

## Key user scenarios (verified from implementation)
1. Restoring a shared file on load
   - On mount, if `window.location.search` contains `web-share-target`, `restoreFileFromShare()` is called.
   - `restoreFileFromShare()`:
     - opens `caches.open("web-share-target")`
     - reads `shared-file`
     - converts the cached response blob into a `File`
     - calls `loadFileToCanvas(file, null)`
     - deletes `shared-file` from the cache
     - calls `window.history.replaceState(...)`.

2. Welcome screen for an empty scene
   - `componentDidUpdate` sets `showWelcomeScreen: true` when `!showWelcomeScreen && !elements.length`.
   - The welcome screen is rendered via `LayerUI`’s `renderWelcomeScreen` prop when all conditions hold:
     - `!this.state.isLoading`
     - `this.state.showWelcomeScreen`
     - `this.state.activeTool.type` matches `this.state.preferredSelectionTool.type`
     - `!this.state.zenModeEnabled`
     - no elements exist (`!this.scene.getElementsIncludingDeleted().length`).

3. Live collaboration UI surface
   - `LiveCollaborationTrigger` renders a `Button` whose active styling is based on `isCollaborating`.
   - It shows:
     - a share icon or share text depending on `editorInterface?.formFactor` / `appState.width`
     - a collaborator count using `appState.collaborators.size`.

4. “Plain paste” behavior for Ctrl/Cmd+V with Shift
   - In `onKeyDown`, when `event[KEYS.CTRL_OR_CMD]` and `event.key.toLowerCase() === KEYS.V`, it sets:
     - `IS_PLAIN_PASTE = event.shiftKey`
     - resets the flag after 100ms using `IS_PLAIN_PASTE_TIMER`.
   - Paste handling uses `const isPlainPaste = !!IS_PLAIN_PASTE`.
   - When not plain paste and the pasted lines are all embeddable URLs, it inserts embeddable elements instead of treating input as plain text.

## Export/serialization entrypoints (public re-exports)
- The package public entrypoint (`packages/excalidraw/index.tsx`) re-exports:
  - `exportToCanvas`, `exportToBlob`, `exportToSvg`, `exportToClipboard`
  - `serializeAsJSON`, `serializeLibraryAsJSON`



## Details
For detailed architecture → see docs/technical/architecture.md
For domain glossary → see docs/product/domain-glossary.md