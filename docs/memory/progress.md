# Progress: Excalidraw

_Reflects state as of 2026-03-25. Based on CHANGELOG.md and codebase inspection._

---

## What Works (Shipped & Stable)

### Core Editor (`packages/excalidraw`)
- [x] All element types: rectangle, diamond, ellipse, line, arrow, text, image, freedraw, frame, magicframe, iframe/embeddable
- [x] Elbow arrows with smart routing and binding
- [x] Flowchart creation from arrows/shapes
- [x] Freehand drawing (perfect-freehand)
- [x] Text editing with wrapping
- [x] Image embedding and cropping
- [x] Element grouping and frames
- [x] Element locking
- [x] Undo / redo (including multiplayer undo/redo as of 0.18.0)
- [x] Copy / paste / duplicate
- [x] Z-order management with fractional indexing
- [x] Element stats panel (editable as of 0.18.0)
- [x] Element linking (hyperlinks between elements, as of 0.18.0)
- [x] Scene search (as of 0.18.0)
- [x] Command palette (as of 0.18.0)

### Rendering
- [x] Hand-drawn aesthetic via Rough.js
- [x] Canvas-based rendering (no DOM elements for shapes)
- [x] Dark / light theme
- [x] Grid mode / snap-to-grid
- [x] Zen mode (distraction-free)
- [x] View mode (read-only embedding)

### Export / Import
- [x] PNG export (with scene data embedded in PNG metadata)
- [x] SVG export (with font subsetting as of 0.18.0)
- [x] JSON export (`.excalidraw` format)
- [x] Clipboard export
- [x] Import from JSON / image

### Fonts & i18n
- [x] Extended font picker (as of 0.18.0)
- [x] CJK font support — Chinese, Japanese, Korean (as of 0.18.0)
- [x] 40+ language localizations

### Collaboration (`excalidraw-app`)
- [x] Real-time multiplayer via Socket.io rooms
- [x] Version-based conflict reconciliation
- [x] Full sync every 60s + incremental updates
- [x] Firebase persistence for room data
- [x] Multiplayer undo / redo (as of 0.18.0)

### Infrastructure
- [x] PWA with offline support (Service Worker + localStorage + IndexedDB)
- [x] Docker deployment (multi-stage: Node build → nginx serve)
- [x] GitHub Actions CI/CD pipeline
- [x] Sentry error tracking
- [x] ESM-only bundle (UMD deprecated in 0.18.0)

---

## What's Left / In Progress

### Unreleased (on `master`, not yet versioned)
- [ ] `onExcalidrawAPI` prop rename (breaking, replaces `excalidrawAPI`)
- [ ] `ExcalidrawAPI.isDestroyed` flag
- [ ] `onMount` / `onInitialize` / `onUnmount` lifecycle props
- [ ] `api.onEvent(name, callback)` imperative event system
- [ ] `ExcalidrawAPIProvider` + `useExcalidrawAPI()` hook exported from package
- [ ] `useAppStateValue()` / `useOnExcalidrawStateChange()` hooks exported
- [ ] `onExport` async export handler with progress reporting
- [ ] Migration plan: deprecate all `excalidrawAPI.on*` subscriptions in favor of `api.onEvent(name)`

---

## Known Issues & Constraints

### Breaking Changes Pending
- `excalidrawAPI` prop renamed to `onExcalidrawAPI` — consumers must update
- TypeScript `"moduleResolution": "node"` / `"node10"` no longer supported — must use `"bundler"`, `"node16"`, or `"nodenext"`
- CRA (Create React App) users: ESM strict resolution breaks without ejecting or using craco
- Webpack users: must set `resolve.fullySpecified: false` for ESM imports

### Architectural Constraints
- Library (`packages/`) must not import Firebase or Socket.io — app-layer only
- Library must be SSR-safe (no top-level `window`/`document` access)
- All element mutations must go through `newElementWith()` — direct mutation breaks collaboration versioning

### Test Coverage Thresholds (enforced in CI)
| Metric | Threshold | Status |
|--------|-----------|--------|
| Lines | 60% | Enforced |
| Branches | 70% | Enforced |
| Functions | 63% | Enforced |

---

## Package Versions

| Package | Current Version |
|---------|----------------|
| `@excalidraw/excalidraw` | 0.18.0 (latest released) |
| `@excalidraw/utils` | See `packages/utils/CHANGELOG.md` |
| Next release | Unreleased (on master) |

---

## Related Documents

| Document | Relevance |
|----------|-----------|
| [activeContext.md](./activeContext.md) | Current branch state, unreleased changes detail, coding reminders |
| [decisionLog.md](./decisionLog.md) | Decisions behind shipped features (ESM-only, multiplayer undo, immutability) |
| [techContext.md](./techContext.md) | CI coverage thresholds, test commands, full stack versions |
| [systemPatterns.md](./systemPatterns.md) | Architectural constraints referenced in known issues |
| [PRD.md](../product/PRD.md) | Full feature requirements — context for what's in scope vs out of scope |
