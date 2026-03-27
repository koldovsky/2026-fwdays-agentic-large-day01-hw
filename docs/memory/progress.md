# Progress Snapshot

Evidence drawn from: package manifests, source file structure, tests, and TODO/FIXME comments in the codebase.

## Current Package Versions

- `@excalidraw/common` — `0.18.0`
- `@excalidraw/math` — `0.18.0`
- `@excalidraw/element` — `0.18.0`
- `@excalidraw/excalidraw` — `0.18.0`
- `@excalidraw/utils` — `0.1.2`

---

## Implemented Areas

### Editor capabilities present in source
- Drawing tools include `selection`, `lasso`, `rectangle`, `diamond`, `ellipse`, `arrow`, `line`, `freedraw`, `text`, `image`, `eraser`, `hand`, `frame`, `magicframe`, `embeddable`, and `laser`.
- Text editing uses the inline WYSIWYG editor in `packages/excalidraw/wysiwyg/textWysiwyg.tsx`.
- Collaboration uses Socket.io in `excalidraw-app/collab/Collab.tsx` and encrypted room/share URLs in `excalidraw-app/data/index.ts`.
- Export paths exist for PNG, SVG, clipboard, and `.excalidraw` files.
- The public component API exposes `onExcalidrawAPI`, `onMount`, `onInitialize`, `onUnmount`, `onChange`, `onStateChange`, and `onEvent` in `packages/excalidraw/types.ts`.

### Monorepo and build structure
- The app lives in `excalidraw-app/`.
- Publishable packages live in `packages/`.
- Root `build:packages` builds `common`, `math`, `element`, and `excalidraw` in order.
- `@excalidraw/utils` is published from the same monorepo, but it is built separately via `scripts/buildUtils.js`.

### Testing coverage visible in repo
- `packages/excalidraw/tests/` covers areas including lifecycle, arrow binding, clipboard, export, history, images, lasso, library, Mermaid, move, search, selection, and view mode.
- `packages/math/tests/` exists and covers point, vector, line, range, segment, ellipse, and curve behavior.
- `packages/utils/tests/` exists and covers export helpers and geometry utilities.

---

## In-Progress Or Incomplete Areas

These items are supported by TODO/FIXME comments or partially migrated code, not by release notes.

### Point representation migration
- `packages/math/src/types.ts` still defines both tuple-based point types and legacy object-shaped coordinate types.
- `packages/math/src/point.ts` keeps overloads that support both forms.

### Remote group-selection rendering
- `packages/excalidraw/renderer/interactiveScene.ts` contains `// TODO: support multiplayer selected group IDs`.

### Static vs interactive app-state split
- `packages/excalidraw/types.ts` marks `editingGroupId`, `selectedElementIds`, and `frameToHighlight` as candidates to move to the interactive canvas state.

### Library atom scoping
- `packages/excalidraw/data/library.ts` documents deferred cleanup tied to per-instance Jotai scoping.

### Store/theme update gap
- `packages/excalidraw/wysiwyg/textWysiwyg.tsx` contains a FIXME noting that theme changes are not yet emitted by `Store`.

---

## Notable Technical Debt

| Area | Location | Evidence |
|---|---|---|
| Arrow vs linear-element separation | `packages/excalidraw/data/restore.ts` | `// TODO: Separate arrow from linear element` |
| Soft-delete restore edge case | `packages/excalidraw/data/restore.ts` | comment about deleted empty text affecting store sync |
| Stale deprecated state field | `packages/excalidraw/data/types.ts` | `isSidebarDocked` removal TODO remains |
| Mobile pointer/touch handling | `packages/excalidraw/components/App.tsx` | `HACK` comment around event unification |
| Mobile transform handles for linear elements | `packages/excalidraw/components/App.tsx` | `HACK` comment disabling them |
| Snapping gap limit | `packages/excalidraw/snapping.ts` | `VISIBLE_GAPS_LIMIT_PER_AXIS = 99999` with TODO |
| WASM loading from URL | `packages/excalidraw/subset/*loader.ts` | TODO comments about URL-based loading |

---

## Details

For active development focus → see [docs/memory/activeContext.md](activeContext.md)
For architecture → see [docs/technical/architecture.md](../technical/architecture.md)
For domain terminology → see [docs/product/domain-glossary.md](../product/domain-glossary.md)
For known undocumented behaviors → see [docs/memory/decisionLog.md](decisionLog.md)
