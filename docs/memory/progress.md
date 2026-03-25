# Progress

> **See also**: [projectbrief](projectbrief.md) | [techContext](techContext.md) | [systemPatterns](systemPatterns.md) | [decisionLog](decisionLog.md) | [productContext](productContext.md) | [activeContext](activeContext.md)
> **Technical docs**: [Architecture](../technical/architecture.md) | [Dev Setup](../technical/dev-setup.md)
> **Product docs**: [PRD](../product/PRD.md) | [Domain Glossary](../product/domain-glossary.md)

Project maturity, feature completion, and known gaps.

## Release Status

**Version 0.18.0** — stable release with active beta features (AI/TTD).

## Package Maturity

| Package | Version | Status |
|---------|---------|--------|
| `@excalidraw/excalidraw` | 0.18.0 | Stable — main editor library |
| `@excalidraw/common` | 0.18.0 | Stable — shared utilities |
| `@excalidraw/element` | 0.18.0 | Stable — element types and logic |
| `@excalidraw/math` | 0.18.0 | Stable — geometry primitives |
| `@excalidraw/utils` | 0.1.2 | Separate release cycle |

## Feature Completion

### Core Drawing — Complete
- [x] 16 drawing tools (selection, lasso, shapes, arrows, text, freedraw, image, eraser, hand, frame, magicframe, embeddable, laser)
- [x] Infinite canvas with pan/zoom
- [x] Undo/redo (delta-based)
- [x] Copy/paste/duplicate
- [x] Element grouping and alignment
- [x] Z-ordering with fractional indexing
- [x] Grid mode and object snapping
- [x] Element locking

### Shapes & Styling — Complete
- [x] rough.js hand-drawn rendering
- [x] Fill styles: solid, hachure, cross-hatch, zigzag
- [x] Stroke styles: solid, dashed, dotted
- [x] Stroke width: thin, bold, extra-bold
- [x] Rounded corners
- [x] Opacity control
- [x] Arrowheads: arrow, bar, dot, triangle

### Arrows & Bindings — Complete
- [x] Straight arrows
- [x] Elbow arrows with dedicated binding logic
- [x] Auto-binding to element edges
- [x] Multi-point lines and arrows

### Text — Complete
- [x] WYSIWYG in-place text editing
- [x] Text-in-shape (bound text)
- [x] Font families: Virgil (hand-drawn), Helvetica, Cascadia (code), Nunito, Lilita One, Comic Shanns, Liberation Sans, Excalifont
- [x] RTL text support

### Collaboration — Complete
- [x] Real-time sync via socket.io
- [x] Persistent storage via Firebase
- [x] AES-GCM end-to-end encryption
- [x] Room link sharing (clipboard, QR, native Share API)
- [x] Live cursor display
- [x] Element reconciliation with version/nonce
- [x] Offline detection

### Export — Complete
- [x] PNG export (canvas)
- [x] SVG export (vector, with embedded scene metadata)
- [x] JSON export/import
- [x] Embedded scene data for round-trip editing
- [x] Theme-aware export (dark mode)

### Library — Complete
- [x] Personal library management
- [x] Drag-drop insertion
- [x] JSON import/export
- [x] Library publishing with metadata and preview
- [x] Multi-select with range selection

### UI/UX — Complete
- [x] Light/dark theme (Shift+Alt+D)
- [x] Zen mode (Alt+Z)
- [x] View mode (read-only)
- [x] Command palette (Ctrl+/ or Ctrl+Shift+P)
- [x] Welcome screen (composable)
- [x] Keyboard shortcuts
- [x] Responsive design (phone/tablet/desktop)
- [x] Touch and Apple Pencil support
- [x] PWA installable

### Internationalization — Complete
- [x] 58+ languages via Crowdin
- [x] RTL support (Arabic, Persian, Hebrew)
- [x] 85% completion threshold for inclusion

### Error Handling — Complete
- [x] React error boundary with Sentry
- [x] Recovery options (reload, clear, create issue)
- [x] Runtime error dialog

### AI Features — Beta
- [x] Text-to-Diagram (TTDDialog)
- [x] Diagram-to-Code plugin
- [x] Chat interface with history
- [x] IndexedDB persistence for chat

## Test Coverage

- **~75 test files** across packages and excalidraw-app
- **Coverage thresholds** enforced:
  - Lines: 60%
  - Branches: 70%
  - Functions: 63%
  - Statements: 60%
- Key areas tested: element operations, binding, frames, alignment, lasso, elbow arrows, data restore, collaboration

## Known Gaps & Technical Debt

### Performance
- Large scene rendering bottleneck (noted in code TODOs)
- Free-drawing shake optimization pending
- Binding calculations expensive for many elements

### Code Quality
- ~50+ TODO/FIXME comments — standard level, no blockers
- Circular dependency workarounds (`disableSideHack`)
- 3 deprecated fonts still in font metadata
- Legacy CRA service worker cleanup pending (migrated to Vite)

### Deprecated APIs
- UMD bundle removed (ES modules only)
- `excalidraw-assets` folder paths deprecated
- `commitToHistory` → `captureUpdate`
- `UIOptions.welcomeScreen` → `<WelcomeScreen>` component

## Examples

| Example | Framework | Status |
|---------|-----------|--------|
| `with-nextjs` | Next.js 14.1 + React 19 | Functional |
| `with-script-in-browser` | Vite 5 + React 19 | Functional |

Both examples expose TTDDialog for AI feature testing.

## Deployment Targets

- **Vercel** — production hosting with `vercel.json` config
- **Docker** — `Dockerfile` + `docker-compose.yml` for self-hosting
- **NPM** — packages publishable via `yarn build:package`

## Documentation

| Document | Lines | Status |
|----------|-------|--------|
| `docs/technical/architecture.md` | ~378 | Complete |
| `docs/product/domain-glossary.md` | ~458 | Complete |
| `docs/memory/projectbrief.md` | ~77 | Complete |
| `docs/memory/techContext.md` | ~123 | Complete |
| `docs/memory/systemPatterns.md` | ~148 | Complete |
| `docs/memory/decisionLog.md` | ~100 | Complete |
| `docs/memory/productContext.md` | ~150 | Complete |
| `docs/memory/activeContext.md` | ~100 | Complete |
| `docs/memory/progress.md` | This file | Complete |
| `packages/excalidraw/CHANGELOG.md` | Extensive | Maintained |
