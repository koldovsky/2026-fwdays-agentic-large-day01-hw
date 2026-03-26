# Product Requirements Document (PRD) — Reverse Engineered

This PRD captures implemented product behavior in this monorepo. It is evidence-based and traces capabilities to `packages/excalidraw/` (editor library) and `excalidraw-app/` (hosted shell).

---

## 1. Executive Summary

- **Product**: Excalidraw in this repo is delivered as the hosted app (`excalidraw-app`) and embeddable library (`@excalidraw/excalidraw`).
- **Positioning**: Browser whiteboard for fast sketch-style diagramming with infinite canvas, structured editing, export/import, and optional live collaboration.
- **User value**: Minimize friction from rough ideation to shareable artifacts while preserving readability, speed, and privacy-aware collaboration options.
- **Scope note**: Hosted-only features (collab backend wiring, PWA, Sentry/Firebase, Plus integrations) are documented but are not guaranteed for minimal library embeds.

---

## 2. Target Audience

| Persona | Primary jobs-to-be-done |
| -------- | ------------------------ |
| Engineers and architects | Sketch systems quickly, use connectors/frames, export PNG/SVG/JSON, collaborate in sessions. |
| Product managers and facilitators | Run workshops with quick drawing, presentation cues, review/read-only modes, and shared boards. |
| Designers and UX practitioners | Build low-fidelity flows with shape/text/image tools, layout operations, and reusable libraries. |
| Educators and content creators | Produce approachable visual explanations and export/embed outputs for external docs/slides. |
| Integrators and host apps | Embed the editor as a configurable React component with controlled UI surfaces. |

---

## 3. Functional Requirements (Features)

### 3.1 Canvas and rendering core

- Dual-canvas architecture (static + interactive) for scene rendering and editing affordances.
- Rough.js-backed sketch visual style and modern pan/zoom/scroll interactions.
- Scene store with undo/redo and mode toggles (view, zen, grid, stats, theme/background).
- Traceability: `packages/excalidraw/components/App.tsx`, `components/canvases/*`, `actions/actionCanvas.tsx`, `actions/actionHistory.tsx`.

### 3.2 Authoring tools and element model

- Core tools: selection/lasso, hand, basic shapes, lines/arrows, free draw/eraser, text, image, laser.
- Advanced tools: frames, embeddables, crop, shape switching, linking, locking, snapping/binding, chart/flow support.
- Traceability: `components/shapes.tsx`, `actions/actionFrame.ts`, `actions/actionEmbeddable.ts`, `actions/actionLink.tsx`, `actions/actionElementLock.ts`.

### 3.3 Editing, styling, and layout operations

- Rich property editing (stroke/fill, typography, arrow properties, opacity/roughness/roundness, eyedropper).
- Selection operations (clipboard, duplicate/delete, z-order, align/distribute, flip, group/ungroup, select all).
- Text container behavior and style copy/paste.
- Traceability: `actions/actionProperties.tsx`, `actions/actionClipboard.tsx`, `actions/actionAlign.tsx`, `actions/actionGroup.tsx`, `components/ColorPicker/*`.

### 3.4 Library and reusable assets

- Built-in library UI to browse, insert, and save reusable components.
- Add selection to library and publish library workflows in hosted usage.
- Local persistence backed by app storage adapters.
- Traceability: `components/LibraryMenu.tsx`, `actions/actionAddToLibrary.ts`, `components/PublishLibrary.tsx`, `data/library.ts`.

### 3.5 Import, export, and interoperability

- Scene file IO and JSON import/export.
- Image export with configurable scale/background/dark-mode/selection and optional embedded scene metadata.
- SVG export support and encoded/encrypted payload pipeline where applicable.
- Traceability: `actions/actionExport.tsx`, `components/ImageExportDialog.tsx`, `components/JSONExportDialog.tsx`, `data/encode.ts`, `data/encryption.ts`.

### 3.6 Navigation and productivity features

- Command palette, search, and shortcuts/help dialogs for power users.
- Context menu and responsive sidebar layout for library/search discovery.
- Traceability: `components/CommandPalette/*`, `components/SearchMenu.tsx`, `components/HelpDialog.tsx`, `components/ContextMenu.tsx`, `components/DefaultSidebar.tsx`.

### 3.7 Text-to-diagram and Mermaid flows

- TTD dialog with text-to-diagram and Mermaid conversion tabs.
- Lazy-loaded parser/editor chunks to keep initial load lean.
- Optional chat/streaming helper surface in hosted app.
- Traceability: `components/TTDDialog/*`, `excalidraw-app/vite.config.mts`, `excalidraw-app/app_constants.ts`.

### 3.8 Collaboration and sharing (hosted app)

- Live session triggers, presence indicators, follow mode, and collaborator navigation.
- Realtime sync via socket transport, with encrypted payload helpers and share dialogs.
- Backend/file integrations for blob storage and Firebase in hosted deployments.
- Traceability: `excalidraw-app/collab/*`, `excalidraw-app/data/index.ts`, `excalidraw-app/data/firebase.ts`, `components/live-collaboration/*`.

### 3.9 Application shell and platform UX

- Welcome/onboarding, desktop/mobile toolbar adaptations, dialogs, i18n, and analytics hooks.
- PWA registration and hosted observability wiring.
- Traceability: `components/welcome-screen/*`, `components/LayerUI.tsx`, `components/MobileToolBar.tsx`, `excalidraw-app/index.tsx`, `excalidraw-app/package.json`.

### 3.10 Extensibility and hosted integrations

- Repo includes extension points for Excalidraw+ flows, debugging overlays, and AI shell wiring in hosted app.
- These are integration surfaces; feature availability may depend on external services/configuration.
- Traceability: `excalidraw-app/components/AI.tsx`, `excalidraw-app/components/DebugCanvas.tsx`, `excalidraw-app/*ExcalidrawPlus*`.

---

## 4. User Flows

### 4.1 Primary creation flow

1. Open app to welcome/blank canvas.
2. Pick tool and create content on infinite canvas.
3. Refine with properties and layout actions.
4. Save locally or continue to share/collab paths.

### 4.2 Export/share flow

1. Open main menu export actions.
2. Export image (PNG/SVG options) or JSON scene.
3. For live sharing, start collab and copy room/share links.

### 4.3 Reuse and discovery flow

1. Reuse library items or add selection into library.
2. Use command palette/search/context menu for navigation and edits.
3. Optionally open TTD/Mermaid conversion for text-driven diagram authoring.

---

## 5. Non-Functional Requirements

### 5.1 Performance

- UI interactions target animation-frame-aligned updates and throttled expensive handlers.
- Collaboration cursor sync targets near real-time cadence.
- Export pipeline enforces practical scene-size limits.

### 5.2 UX and accessibility

- Minimal floating-island UI with keyboard-first actions and contextual dialogs.
- Hand-drawn visual identity is a core usability and differentiation choice.
- Menu components include ARIA-oriented structure in core surfaces.

### 5.3 Security and privacy

- Client-side crypto helpers support encrypted collaboration/share payloads.
- Security messaging and constraints are reflected in locale copy and app behavior.

### 5.4 Reliability and observability

- Hosted app includes error boundaries and Sentry instrumentation.

---

## 6. Technical Constraints

### 6.1 Platform and runtime

- Modern evergreen browsers only (per browserslist).
- Node `>=18` and strict TypeScript assumptions.
- React 19 + modern ES module toolchain baseline.

### 6.2 Build and delivery

- Vite-based build, PWA plugin, and monorepo workspace structure.
- Chunking/lazy-load strategy for heavy editors/parsers/locales.

### 6.3 Networking and storage

- Live collaboration requires backend websocket/blob services in hosted deployment.
- Local persistence uses localStorage/IndexedDB adapters.
- Upload and image processing honor configured size limits.

### 6.4 Cryptographic constraints

- Web Crypto APIs are required where encrypted flows are enabled.
- Collaboration key format/length constraints are enforced by app UX and validation.

### 6.5 Embedding and security surface

- Embeddables rely on URL validation, provider allow rules, and constrained postMessage handling.

### 6.6 Non-goals

- The product is **not** a CAD/precision drafting suite with engineering-grade measurement guarantees.
- The product is **not** a full project/wiki/content-management platform beyond whiteboarding and export/share workflows.
- The core library is **not** responsible for provisioning hosted backend infrastructure (socket servers, blob stores, identity).
- The product does **not** guarantee feature parity between hosted integrations and every third-party embed.
- The product does **not** target legacy browsers outside configured modern runtime baselines.

---

## 7. Traceability Note (Methodology)

- Action-level behavior maps primarily to `packages/excalidraw/actions/*.ts(x)` and `actions/register`.
- UI composition lives primarily in `packages/excalidraw/components/LayerUI.tsx` and adjacent component modules.
- Hosted-only behavior is implemented under `excalidraw-app/` and should be treated as deployment-specific.

---

## 8. Appendices (Moved)

Detailed appendices were split out to keep this PRD within size constraints while preserving evidence links:

- Appendix A — Feature to source map: [appendix-a-feature-source-map.md](appendices/appendix-a-feature-source-map.md)
- Appendix B — Engineering quality gates: [appendix-b-quality-gates.md](appendices/appendix-b-quality-gates.md)
- Appendix C — UX strategy notes: [appendix-c-ux-strategy.md](appendices/appendix-c-ux-strategy.md)

Long-form feature traces are also available in:

- [feature-trace-long-map.md](appendices/feature-trace-long-map.md)

---

*Verified against source: Yes*
