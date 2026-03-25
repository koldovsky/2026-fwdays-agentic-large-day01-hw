# Project Progress

_Last updated: 2026-03-25_

---

## Release Status

| Version | Date | Status |
|---------|------|--------|
| Unreleased | — | In development (API lifecycle, lasso tool, `onExport`) |
| **0.18.0** | 2025-03-11 | Latest stable published to npm |

---

## Feature Completion (as of 0.18.0)

### Core Drawing

- [x] Shapes: rectangle, ellipse, diamond, arrow, line, freedraw, text, image
- [x] Freehand drawing (freedraw element)
- [x] Text with wrapping and font picker
- [x] Image embedding + cropping
- [x] Embeddable iframes (YouTube, etc.)

### Organisation

- [x] Groups (group/ungroup)
- [x] Frames (named regions, clip-to-frame)
- [x] Z-index ordering (fractional indices)
- [x] Element locking
- [x] Element linking (hyperlink between elements)
- [x] Flowchart auto-connect
- [x] Elbow arrows (smart routing)
- [x] Scene search
- [x] Command palette

### Interaction

- [x] Lasso selection tool (post-0.18.0, in-progress)
- [x] Laser pointer (animated SVG trail)
- [x] Snap-to-grid and object snapping
- [x] Copy/paste, clipboard image import
- [x] Undo / redo (multiplayer-aware `Store` + `HistoryDelta`)
- [x] Duplicate, align, distribute

### Export / Import

- [x] Export to PNG, SVG, JSON (`.excalidraw`)
- [x] SVG font subsetting on export
- [x] `onExport` async hook (post-0.18.0, in-progress)
- [x] Import from clipboard, file, URL
- [x] `convertToExcalidrawElements` helper

### Collaboration

- [x] Real-time multiplayer via Socket.io + Firebase
- [x] E2E AES encryption of scene data
- [x] Collaborator cursor display
- [x] Follow-mode (viewport follow)
- [x] Multiplayer undo/redo

### Internationalisation

- [x] 40+ locales via Crowdin
- [x] CJK font support (Chinese, Japanese, Korean)
- [x] Auto-detect browser locale

### AI / Productivity

- [x] Text-to-diagram via AI (`TTDDialog`)
- [x] Mermaid-to-diagram conversion
- [x] Diagram-to-code plugin

### Embedding API

- [x] `<Excalidraw />` React component
- [x] `ExcalidrawImperativeAPI` imperative handle
- [x] `onMount` / `onInitialize` / `onUnmount` props (post-0.18.0)
- [x] `ExcalidrawAPIProvider` + `useExcalidrawAPI()` (post-0.18.0)
- [x] `api.onStateChange` / `useOnExcalidrawStateChange` hooks (post-0.18.0)
- [x] `api.onEvent` for lifecycle events (post-0.18.0)

---

## Known Limitations

- `App.tsx` is a React **class component** — React 19 concurrent features (transitions, Suspense in render) are partially constrained by this.
- Fonts load from `esm.run` CDN by default; self-hosting requires manual config of `window.EXCALIDRAW_ASSET_PATH`.
- `localStorage` scene autosave has no size limit guard beyond `MAX_ALLOWED_FILE_BYTES` for images.
- CRA (Create React App) is no longer supported out-of-the-box due to ESM strict resolution.
- `@excalidraw/utils` package is underdocumented and not part of the public API contract.

---

## Test Coverage Areas

| Area | Location |
|------|---------|
| Unit tests | `packages/*/tests/` and `packages/*/src/__tests__/` |
| App integration tests | `packages/excalidraw/components/` (`*.test.tsx`) |
| Collab tests | `excalidraw-app/tests/collab.test.tsx` |
| Snapshot tests | `excalidraw-app/tests/__snapshots__/` |
| Runner | Vitest 3.0.6 + jsdom + vitest-canvas-mock |

## Details
For detailed architecture → see `docs/technical/architecture.md`
For domain glossary → see `docs/product/domain-glossary.md`
