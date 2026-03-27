# Current Focus — Active Context

## Current Branch

- **Branch**: `day1/repetantil`
- **Base branch**: `master`
- **Latest commit on master**: `4451b1e` — "updates" (added `.coderabbit.yaml` and `.github/PULL_REQUEST_TEMPLATE.md`)
- **Total commits on master**: 4 (`Initial` → `initial` → `check-instructions` → `updates`)

## Recent Commits

| SHA | Message | Changes |
|-----|---------|---------|
| `4451b1e` | updates | Added `.coderabbit.yaml`, `.github/PULL_REQUEST_TEMPLATE.md` |
| `da795d2` | check-instructions | Configuration/instructions updates |
| `5247322` | initial | Initial codebase setup |
| `a345399` | Initial | Repository creation |

## Open TODOs Found (selected, from grep)

- `packages/math/src/types.ts` — TODO: remove `GlobalCoord`/`LocalCoord` once migrated to Point tuples
- `packages/math/src/point.ts` — TODO: remove overloads once migrated to Point tuples
- `packages/excalidraw/types.ts:189-191` — TODO: move `editingGroupId`, `selectedElementIds`, `frameToHighlight` to interactive canvas
- `packages/excalidraw/types.ts:631` — TODO: come up with better API before v0.18.0
- `packages/excalidraw/snapping.ts:44` — TODO: increase or remove element limit once optimized
- `packages/excalidraw/renderer/interactiveScene.ts:1880` — TODO: support multiplayer selected group IDs
- `packages/utils/src/shape.ts:361` — TODO: replace with final rounded rectangle code
- `packages/excalidraw/subset/woff2/woff2-loader.ts:30` — TODO: support fetching wasm from URL
- `excalidraw-app/collab/Collab.tsx:499` — TODO: `ImportedDataState` type seems abused
- `excalidraw-app/App.tsx:417` — TODO: maybe remove library migration adapter (shipped 24-03-11)

## Open FIXMEs Found

- `packages/excalidraw/index.tsx:105` — FIXME: normalize/set defaults in parent component for memo resolver
- `packages/excalidraw/wysiwyg/textWysiwyg.test.tsx:335` — FIXME: too flaky, no one knows why
- `packages/excalidraw/wysiwyg/textWysiwyg.tsx:964` — FIXME: after emitting updates from Store for appState.theme
- `packages/excalidraw/actions/actionCanvas.tsx:73` — FIXME: move action to DefaultItems.tsx
- `packages/element/tests/zindex.test.tsx:1322-1325` — FIXME: incorrect frame ordering behavior
- `packages/utils/tests/export.test.ts:94` — FIXME: exportToSvg no longer filters deleted elements

## Known Hacks in Code

- `excalidraw-app/collab/Collab.tsx:380` — hack to disregard new browser state during collaboration stop
- `packages/element/src/linearElementEditor.ts:1446` — temp hack for line point addition bounding box
- `packages/excalidraw/hooks/useOutsideClick.ts:64` — hack for radix popup outside-click detection
- `packages/excalidraw/scene/export.ts:99` — tempScene hack for element duplication during export

## Work-in-Progress Features

- **Point tuple migration**: Multiple TODOs indicate ongoing migration from `{x, y}` objects to `[x, y]` tuples in `@excalidraw/math`
- **Interactive canvas state separation**: TODOs to move selection-related AppState fields to interactive canvas only
- **Library migration**: Legacy localStorage → IndexedDB migration adapter still present (shipped 2024-03-11, marked for removal)
- **WASM loader flexibility**: Font subsetting WASM (woff2, harfbuzz) currently bundled, TODO to support external CDN loading

## Cross-References

- For project progress → see [`docs/memory/progress.md`](progress.md)
- For decision log → see [`docs/memory/decisionLog.md`](decisionLog.md)
- For architecture → see [`docs/technical/architecture.md`](../technical/architecture.md)
