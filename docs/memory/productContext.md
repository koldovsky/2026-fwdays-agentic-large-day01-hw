# Product Context

## Related Docs
- [PRD — full reverse-engineered requirements](../product/PRD.md)
- [Project Brief — high-level purpose & structure](projectbrief.md)
- [Decision Log — undocumented product behaviors](decisionLog.md)

---

## Problem Being Solved

Excalidraw provides **quick, friction-free collaborative diagramming** in the browser with a hand-drawn aesthetic — no desktop software, no account required for basic use. It targets the gap between heavyweight tools (Visio, Figma) and ephemeral whiteboards (sticky notes).

## Users & Use Cases

| User | Use Case |
|------|----------|
| Individual | Sketch diagrams, wireframes, flowcharts, system designs |
| Teams | Real-time collaborative whiteboarding sessions |
| Developers | Embed `@excalidraw/excalidraw` into their own apps |
| Educators | Teaching architecture, flows, data structures |
| Product teams | Rapid UI prototyping, journey mapping |

## UX Philosophy

- **Hand-drawn aesthetic** — Rough.js (v4.6.4) renders shapes with intentional imperfection; feels approachable, not formal
- **Simplicity first** — Minimal tool palette: rectangle, diamond, ellipse, arrow, line, freehand, text, image, frame
- **Zero friction** — Works without sign-in; cloud sync is optional
- **Intuitive layout** — Tools left, properties right, canvas center (standard whiteboard pattern)
- **Accessible** — 59 locales, keyboard shortcuts, screen reader support via Radix UI

## Main User Flows

### Create an element
1. Select tool from toolbar (or press keyboard shortcut)
2. Click/drag on canvas → element created via `newElement()` → rendered by Rough.js
3. Properties (stroke, fill, opacity, font) adjustable in sidebar

### Collaborate in real-time
1. Click share → `LiveCollaborationTrigger` → Socket.io WebSocket connection opens
2. Elements sync via `Collab.syncElements()` → `reconcileElements()` resolves conflicts
3. Collaborators shown on canvas with cursor + name label

### Export
- PNG / SVG — via `exportToCanvas()` / `exportToBlob()` (canvas-to-image pipeline)
- JSON — full scene serialization for restore
- Clipboard — copy as PNG or SVG

### Use element library
- Sidebar → Library tab → drag items to canvas
- Save selection as library item → shareable via token URL

## Public Component API (verified from `packages/excalidraw/types.ts`)

```typescript
<Excalidraw
  initialData={ExcalidrawInitialDataState}   // seed elements on mount
  onChange={(elements, appState, files) => {}}
  onExcalidrawAPI={(api) => {}}               // imperative API handle
  isCollaborating={boolean}
  theme="light" | "dark"
  viewModeEnabled={boolean}                  // read-only mode
  zenModeEnabled={boolean}                   // hide UI chrome
  gridModeEnabled={boolean}
  renderTopRightUI={() => ReactNode}          // inject custom UI
  renderTopLeftUI={() => ReactNode}
  validateEmbeddable={(url) => boolean}       // custom embed validation
  renderEmbeddable={(element, appState) => ReactNode}
  UIOptions={{ canvasActions, tools }}        // toggle visibility of UI parts
  handleKeyboardGlobally={boolean}
  detectScroll={boolean}
  autoFocus={boolean}
  onMount={(payload) => {}}
  onUnmount={() => {}}
/>
```

## Integrations

| Integration | Location | Purpose |
|-------------|----------|---------|
| Firebase 11.3.1 | `excalidraw-app/data/firebase.ts` | Cloud storage for scenes & files |
| Socket.io 4.7.2 | `excalidraw-app/collab/Collab.tsx` | Real-time collaboration sync |
| YouTube / Vimeo | `App.tsx` `onWindowMessage` | Embedded video state sync |
| Figma / iframes | `ExcalidrawEmbeddableElement` | Embed external content in canvas |
| Excalidraw Plus | `excalidraw-app/components/` | Premium cloud features, OAuth sign-in |
| AI (text→diagram) | `excalidraw-app/components/AIComponents` | Generate diagrams from text |

## App-layer UI Components (`excalidraw-app/components/`)

- `AppMainMenu` — File ops, theme toggle, help links
- `AppSidebar` — Library + element properties
- `AppFooter` — Collaboration status, zoom controls
- `ExportToExcalidrawPlus` — Save to cloud CTA
- `AIComponents` — Text-to-diagram generation
- `DebugCanvas` — Dev-only render debug overlay
- `TopErrorBoundary` — Full-page error recovery
