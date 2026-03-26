# PRD Appendix — Source Evidence

> Traceability annex for [Product Requirements Document](PRD.md). All files listed were inspected to produce the PRD claims.

```text
# Product identity and purpose
packages/excalidraw/README.md
excalidraw-app/components/AppWelcomeScreen.tsx
excalidraw-app/components/GitHubCorner.tsx

# Element types and data model
packages/element/src/types.ts
packages/element/src/newElement.ts
packages/element/src/groups.ts
packages/element/src/binding.ts
packages/element/src/elbowArrow.ts
packages/element/src/Shape.ts

# Tools and actions
packages/excalidraw/types.ts            (ToolType, AppState, UIOptions, AppProps)
packages/excalidraw/actions/actionProperties.ts
packages/excalidraw/actions/actionExport.tsx
packages/excalidraw/actions/shortcuts.ts
packages/common/src/constants.ts       (TOOL_TYPE, FONT_FAMILY, ZOOM, GRID, STROKE_WIDTH, etc.)
packages/excalidraw/constants.ts

# Collaboration
excalidraw-app/collab/Collab.tsx
excalidraw-app/collab/Portal.tsx
excalidraw-app/app_constants.ts        (WS_SUBTYPES, WS_EVENTS, timeouts)
excalidraw-app/data/firebase.ts
excalidraw-app/data/LocalData.ts
excalidraw-app/data/localStorage.ts
packages/excalidraw/data/reconcile.ts
packages/excalidraw/data/encrypt.ts

# Export / import / sharing
excalidraw-app/share/ShareDialog.tsx
excalidraw-app/data/index.ts           (exportToBackend, importFromBackend)
packages/excalidraw/scene/export.ts
packages/excalidraw/data/encode.ts
packages/excalidraw/data/json.ts
packages/excalidraw/data/blob.ts
packages/excalidraw/components/ImageExportDialog.tsx

# Library and TTD
packages/excalidraw/data/library.ts
packages/excalidraw/components/LibraryMenu.tsx
packages/excalidraw/components/LibraryMenuBrowseButton.tsx
packages/excalidraw/components/TTDDialog/TTDDialog.tsx
packages/excalidraw/components/TTDDialog/TTDChatPanel.tsx

# Configuration and i18n
.env.development
.env.production
packages/excalidraw/i18n.ts
packages/excalidraw/locales/           (58 locale files)
excalidraw-app/vite.config.mts

# Tests used for behaviour verification
packages/excalidraw/tests/history.test.tsx
packages/excalidraw/tests/arrowBinding.test.tsx
packages/excalidraw/tests/elementLocking.test.tsx
packages/excalidraw/tests/clipboard.test.tsx
packages/excalidraw/tests/export.test.tsx
packages/excalidraw/tests/viewMode.test.tsx
packages/excalidraw/tests/selection.test.tsx
packages/element/tests/binding.test.tsx
packages/element/tests/elbowArrow.test.tsx
packages/element/tests/frame.test.tsx
packages/element/tests/linearElementEditor.test.tsx
packages/element/tests/textElement.test.ts
excalidraw-app/tests/collab.test.tsx
```
