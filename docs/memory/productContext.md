# Product Context

> **See also**: [projectbrief](projectbrief.md) | [techContext](techContext.md) | [systemPatterns](systemPatterns.md) | [decisionLog](decisionLog.md) | [activeContext](activeContext.md) | [progress](progress.md)
> **Technical docs**: [Architecture](../technical/architecture.md) | [Dev Setup](../technical/dev-setup.md)
> **Product docs**: [PRD](../product/PRD.md) | [Domain Glossary](../product/domain-glossary.md)

UX goals, user scenarios, and interaction patterns of Excalidraw.

## Core Product Identity

Excalidraw is a virtual whiteboard for sketching hand-drawn-like diagrams. The rough.js rendering engine gives all elements a deliberately imperfect, sketch-like appearance — this is the core differentiator from tools like draw.io or Figma.

## Target Users

- Software engineers creating architecture diagrams
- Teams brainstorming collaboratively in real time
- Educators and presenters illustrating concepts
- Designers prototyping low-fidelity wireframes
- Anyone needing quick visual communication

## Drawing Tools (16 Total)

From `ToolType` in `packages/excalidraw/types.ts`:

| Tool | Purpose |
|------|---------|
| `selection` | Select and move elements |
| `lasso` | Freeform area selection |
| `rectangle` | Rectangular shapes |
| `diamond` | Diamond/rhombus shapes |
| `ellipse` | Circles and ellipses |
| `arrow` | Directional arrows (straight, elbowed) |
| `line` | Straight and multi-point lines |
| `freedraw` | Freehand drawing |
| `text` | Text labels |
| `image` | Embed images |
| `eraser` | Remove elements |
| `hand` | Pan canvas |
| `frame` | Visual grouping frame |
| `magicframe` | AI-powered frame |
| `embeddable` | External content embed |
| `laser` | Laser pointer for presentations |

## Key User Scenarios

### 1. Solo Sketching
User opens Excalidraw → selects tool → draws on infinite canvas → exports as PNG/SVG/JSON. Supports undo/redo, zoom, pan, grid snapping, and object alignment.

### 2. Real-Time Collaboration
User clicks Share → generates encrypted room link → shares via clipboard/QR code → collaborators join → all see live cursors and element changes. Socket.io handles ephemeral sync; Firebase persists state.

### 3. Library Management
User selects elements → adds to personal library → reuses across sessions. Libraries can be exported as JSON, imported, and published with metadata (author, preview image).

### 4. Presentation Mode
Zen Mode (`Alt+Z`) hides all UI for clean canvas. View Mode enables read-only presentation. Laser pointer tool for live pointing during screen share.

### 5. Text-to-Diagram (AI Beta)
User types natural language description → TTDDialog generates diagram via AI → renders on canvas. Chat-based interface with history persistence via IndexedDB.

### 6. Export & Embedding
Canvas export (PNG), vector export (SVG with embedded scene data), JSON export for re-import. Scene metadata can be embedded in exported images for round-trip editing.

## Collaboration UX Flow

```
User A: Click Share → Generate room link (key in URL #fragment)
         ↓
Link shared: clipboard / native Share API / QR code
         ↓
User B: Open link → Auto-join room → See live cursors
         ↓
Both: Real-time element sync (encrypted via AES-GCM)
         ↓
Persistence: Firebase stores encrypted scene + files
```

Source: `excalidraw-app/share/ShareDialog.tsx`, `excalidraw-app/collab/Collab.tsx`

## Interaction Patterns

### Canvas Navigation
- **Pan**: Hand tool, middle-click drag, or Space+drag
- **Zoom**: Ctrl+scroll, pinch gesture, zoom controls
- **Grid**: `Ctrl+'` toggles visual grid; `Alt+S` toggles object snapping

### Element Manipulation
- **Multi-select**: Click+drag rectangle or Shift+click
- **Lasso select**: Freeform selection area
- **Duplicate**: `Ctrl+D` or Alt+drag
- **Group**: `Ctrl+G` / `Ctrl+Shift+G`
- **Lock**: Prevent accidental edits

### Keyboard Shortcuts
- `Ctrl+/` or `Ctrl+Shift+P` — Command Palette (fuzzy search across all actions)
- `Ctrl+Shift+E` — Export to image
- `Alt+Z` — Zen Mode
- `Delete` — Delete selected
- Tool shortcuts: `R` rectangle, `D` diamond, `O` ellipse, `A` arrow, `L` line, `P` freedraw, `T` text

Source: `packages/excalidraw/actions/shortcuts.ts`

## Theming

- Light mode (default) and dark mode — toggled via `Shift+Alt+D`
- Theme affects both UI and canvas rendering
- Export respects theme setting (`exportWithDarkMode`)

## Internationalization

- **58+ languages** supported via Crowdin localization
- Source file: `packages/excalidraw/locales/en.json`
- RTL support for Arabic, Persian, Hebrew
- 85% completion threshold for language inclusion

## Responsive Design

Three form factors detected by `EditorInterface` (`packages/common/src/editorInterface.ts`):

| Form Factor | Width | Panel Mode |
|-------------|-------|------------|
| Phone | ≤599px | `mobile` (collapsed) |
| Tablet | 600–1180px | `compact` |
| Desktop | >1180px | `full` or `compact` |

Touch handling includes: double-tap text insertion, Apple Pencil Scribble support, two-finger pinch zoom.

## Accessibility

- ARIA labels on action buttons and interactive elements
- RTL text direction support (`dir="auto"`)
- Focusable element detection and management
- Role attributes on decorative elements
- QR code with `role="img"` and descriptive labels

## Error Recovery

- `TopErrorBoundary` catches React errors with Sentry logging
- Recovery options: Reload, Clear Canvas & Reload, Create GitHub Issue
- `ErrorDialog` for runtime errors with modal dismiss

## Welcome Experience

Composable `WelcomeScreen` component (`packages/excalidraw/components/welcome-screen/`):
- `<Center />` — Onboarding message
- `<MenuHint />` — Navigation guidance
- `<ToolbarHint />` — Tool usage hints
- `<HelpHint />` — Help dialog pointer

## PWA Support

- Installable via `vite-plugin-pwa` + `pwacompat`
- Workbox for offline service worker caching
- Home screen support on iOS/Android
