# Decision Log

## Architecture Decisions

### 1. Monorepo with Yarn Workspaces
- **Decision**: Organize codebase as a monorepo with separate packages (see `techContext.md` for full list)
- **Rationale**: Enables independent versioning, clear separation of concerns, and allows the core library to be published as a standalone React component for third-party embedding
- **Trade-off**: More complex build/publish pipeline, but better code organization and reusability

### 2. Jotai over Redux for State Management
- **Decision**: Use Jotai (atomic state) instead of Redux (see `systemPatterns.md` → State Management for implementation details)
- **Rationale**: Atomic model reduces boilerplate, smaller bundle, better composability. `jotai-scope` enables per-editor-instance isolation — critical for embedding multiple Excalidraw instances on one page
- **Trade-off**: Less ecosystem tooling than Redux (e.g., devtools), but simpler mental model and less code

### 3. Canvas-Based Rendering (not DOM)
- **Decision**: Render all drawing elements on HTML Canvas, not as DOM elements (see `systemPatterns.md` → Rendering Pipeline for layer details)
- **Rationale**: Performance — canvas handles thousands of elements efficiently without DOM overhead. Enables smooth zooming, panning, and transformations
- **Trade-off**: Requires custom hit-testing, accessibility challenges, no CSS styling for elements

### 4. RoughJS for Hand-Drawn Aesthetic
- **Decision**: Use RoughJS library to render all shapes with a sketchy, hand-drawn look
- **Rationale**: Core brand differentiator — makes diagrams feel informal and approachable, reducing the "perfectionism barrier" in sketching
- **Trade-off**: Additional rendering cost vs. native canvas primitives, but defines the product identity

### 5. Tunnel/Portal Pattern for UI Composition
- **Decision**: Use `tunnel-rat` library for component portals (see `systemPatterns.md` → Context Patterns for tunnel list)
- **Rationale**: Allows deeply nested or external components to render into specific UI slots without prop drilling. Essential for the plugin/extension model — host apps can inject custom UI into Excalidraw
- **Trade-off**: Less obvious data flow (portals break the visual component hierarchy), but necessary for extensibility

### 6. Imperative API (`ExcalidrawImperativeAPI`)
- **Decision**: Expose an imperative API alongside declarative React props
- **Rationale**: Canvas-based rendering means many operations (getAppState, updateElement, scrollToContent) can't be expressed declaratively. Host applications need programmatic control
- **Trade-off**: Mixes imperative and declarative paradigms, but required for canvas-based architecture

### 7. Firebase for Collaboration Backend
- **Decision**: Use Firebase (Firestore + Storage) for persistence and asset storage, with a separate WebSocket server for real-time sync
- **Rationale**: Firebase provides scalable, managed infrastructure for auth and file storage. Separate WebSocket server (socket.io) gives more control over real-time message routing
- **Trade-off**: Vendor lock-in on Firebase, but operational simplicity for an open-source project

### 8. Conflict Resolution via Version + Nonce
- **Decision**: Resolve collaboration conflicts using `version` counter + `versionNonce` for deterministic tie-breaking (see `systemPatterns.md` → Conflict Resolution for flow diagram)
- **Rationale**: Simple, stateless algorithm that doesn't require central authority. Both clients independently arrive at the same winner
- **Trade-off**: Possible loss of concurrent edits to the same element (last-write-wins semantics), but acceptable for a drawing tool

### 9. PNG Metadata Embedding for Exports
- **Decision**: Embed full scene JSON data into exported PNG files as text chunks
- **Rationale**: Users can share a single PNG file that looks like an image but can be re-imported into Excalidraw with full editability. Zero-friction sharing
- **Trade-off**: Larger file sizes, but eliminates the "save as .excalidraw" step for casual sharing

### 10. Vite over Webpack
- **Decision**: Use Vite as the bundler for both development and production
- **Rationale**: Significantly faster dev server startup (ESM-based), better HMR, simpler configuration. Manual chunk splitting for optimization (locales, mermaid, CodeMirror)
- **Trade-off**: Less mature plugin ecosystem than Webpack at time of adoption, but faster developer experience

### 11. SCSS with Colocated Styles
- **Decision**: Use SCSS modules colocated with components (same filename, `.scss` extension)
- **Rationale**: Clear ownership of styles per component, SCSS features (nesting, variables, mixins), easy to find and maintain
- **Trade-off**: Not CSS-in-JS (no dynamic theming via JS), but simpler build pipeline and better caching

### 12. Vitest over Jest
- **Decision**: Use Vitest as the test runner
- **Rationale**: Native Vite integration (shared config), faster execution, ESM-native, compatible API with Jest for easy migration
- **Trade-off**: Younger project than Jest, but better aligned with Vite-based build

## Course-Specific Decisions

### 13. CodeRabbit CI Integration
- **Decision**: Add `.coderabbit.yaml` for automated PR code review
- **Rationale**: Course requirement — learn AI-assisted code review workflows
- **Date**: Initial setup commits

### 14. Memory Bank Documentation
- **Decision**: Generate a comprehensive Memory Bank (`memory-bank/` directory) with 7 standardized files
- **Rationale**: Course requirement — document project context for AI-assisted development workflows (Cursor/Windsurf style)
- **Date**: 2026-03-25

---

## Undocumented Behaviors

> Cases where the code does something not documented in user-facing docs or where behavior is implicit/surprising.

### UB-1. Silent Pen Mode Auto-Detection
- **File**: `packages/excalidraw/components/App.tsx` (~line 7588)
- **What code does**: When the app first detects a stylus/pen pointer event (`pointerType === "pen"`), it silently enables `penMode: true` and sets `penDetected: true`. This fires only once per session.
- **What is documented**: Nothing user-facing. Only an inline comment: "fires only once, if pen is detected, penMode is enabled."
- **Impact**: Users don't know their tool settings change automatically based on hardware. Touch input behavior changes without UI indication.

### UB-2. Test Environment Changes Default Roundness
- **File**: `packages/excalidraw/appState.ts` (line 39)
- **What code does**: `currentItemRoundness: isTestEnv() ? "sharp" : "round"` — elements default to "sharp" corners in test environments but "round" in production.
- **What is documented**: Nothing. No comment explains why tests use different defaults.
- **Impact**: Screenshots and visual regression tests produce different shapes than what users see in production.

### UB-3. Eraser, Laser, and MagicFrame Cannot Be Restored from Saved State
- **File**: `packages/excalidraw/data/restore.ts` (lines 99-120)
- **What code does**: `AllowedExcalidrawActiveTools` explicitly sets `eraser: false`, `laser: false`, `magicframe: false`. When restoring a scene, if one of these tools was active, it silently reverts to the default tool.
- **What is documented**: No user-facing documentation. The allowlist is only visible in source code.
- **Impact**: If a user saves while using the eraser/laser, reopening the file will silently switch them to a different tool.

### UB-4. Implicit Export Scale Based on Device Pixel Ratio
- **File**: `packages/excalidraw/appState.ts` (lines 18-20)
- **What code does**: `const defaultExportScale = EXPORT_SCALES.includes(devicePixelRatio) ? devicePixelRatio : 1` — export resolution automatically matches the display's DPI (1x, 2x, 3x for Retina).
- **What is documented**: No documentation about automatic scaling behavior.
- **Impact**: Same user action ("Export PNG") produces different file sizes on different displays. A Retina user gets 2x resolution (4x file size) without knowing.

### UB-5. Silent Arrow Binding Repair on File Load
- **File**: `packages/excalidraw/data/restore.ts` (lines 254-262)
- **What code does**: When loading a scene, if arrow bindings are broken (target element missing or incompatible), the restore function silently drops the binding and returns `null`. Errors are logged to `console.error` but no UI notification is shown.
- **What is documented**: Only inline code comments mention repair attempts.
- **Impact**: Users may open a file and find arrows disconnected from shapes without any explanation.

### UB-6. Magic Timing Constants Without Documented Rationale
- **File**: `excalidraw-app/app_constants.ts` (lines 1-9)
- **What code does**:
  - `DELETED_ELEMENT_TIMEOUT = 24 * 60 * 60 * 1000` — deleted elements kept for 24 hours
  - `SYNC_FULL_SCENE_INTERVAL_MS = 20000` — full scene sync every 20 seconds
  - `CURSOR_SYNC_TIMEOUT = 33` — cursor sync at ~30fps
- **What is documented**: Comments say "1 day" and "~30fps" but never explain **why** these specific values were chosen.
- **Impact**: Performance and data retention behavior is driven by unexplained magic numbers. Changing them could break collaboration without understanding the tradeoffs.
