# Appendix A — Feature to Source Map

Non-exhaustive feature-to-code trace index extracted from the PRD source review.

| Capability | Primary evidence |
| ---------- | ---------------- |
| Tool palette and shortcuts | `packages/excalidraw/components/shapes.tsx`, `components/Actions.tsx` |
| Canvas static and interactive render | `packages/excalidraw/components/canvases/StaticCanvas.tsx`, `InteractiveCanvas.tsx` |
| Rough sketch rendering | `packages/excalidraw/components/App.tsx` |
| Undo/redo and history | `packages/excalidraw/actions/actionHistory.tsx` |
| Zoom and canvas actions | `packages/excalidraw/actions/actionCanvas.tsx` |
| Clipboard and copy operations | `packages/excalidraw/actions/actionClipboard.tsx` |
| Styling and properties | `packages/excalidraw/actions/actionProperties.tsx`, `components/ColorPicker/*` |
| Layout operations | `packages/excalidraw/actions/actionAlign.tsx`, `actionDistribute.tsx`, `actionZindex.tsx` |
| Grouping and frames | `packages/excalidraw/actions/actionGroup.tsx`, `actionFrame.ts` |
| Embeds and hyperlinks | `packages/excalidraw/actions/actionEmbeddable.ts`, `actionLink.tsx` |
| Library and publish | `packages/excalidraw/components/LibraryMenu.tsx`, `PublishLibrary.tsx` |
| Import/export pipeline | `packages/excalidraw/actions/actionExport.tsx`, `components/ImageExportDialog.tsx` |
| Encoding and encryption | `packages/excalidraw/data/encode.ts`, `data/encryption.ts` |
| Command palette and search | `packages/excalidraw/components/CommandPalette/*`, `SearchMenu.tsx` |
| TTD and Mermaid flows | `packages/excalidraw/components/TTDDialog/*` |
| Hosted collaboration stack | `excalidraw-app/collab/*`, `excalidraw-app/data/index.ts` |
| Firebase shared files | `excalidraw-app/data/firebase.ts` |
| PWA registration and caching | `excalidraw-app/vite.config.mts`, `excalidraw-app/index.tsx` |
| Hosted observability | `excalidraw-app/sentry`, `@sentry/browser` |

See `feature-trace-long-map.md` for expanded traces.
