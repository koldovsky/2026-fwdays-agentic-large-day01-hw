# Product Requirements Document (PRD) — Excalidraw

> Reverse-engineered from source code analysis. Not an official document.

---

## 1. Executive Summary

Excalidraw is an open-source, browser-based virtual whiteboard for creating hand-drawn style diagrams and sketches. It supports real-time collaboration, multiple export formats, AI-powered features, and can be embedded as a React component in third-party applications.

---

## 2. Product Goals

1. Provide an intuitive, zero-friction drawing experience in the browser
2. Deliver a distinctive hand-drawn aesthetic that makes informal diagrams approachable
3. Enable seamless real-time collaboration between distributed teams
4. Offer a reusable React SDK for embedding in other applications
5. Maintain open-source accessibility with MIT licensing

---

## 3. Target Audience

| Segment | Primary Use Case |
| ------- | ---------------- |
| Designers & UX professionals | Wireframes, mockups, user flows |
| Software engineers | Architecture diagrams, system design |
| Product managers | Quick prototyping, process documentation |
| Remote teams | Collaborative brainstorming |
| Educators & students | Teaching materials, visual explanations |
| Developers (SDK) | Embedding drawing in their apps |

---

## 4. Feature Requirements

### 4.1 Drawing Tools

| Tool | Description |
| ---- | ----------- |
| Selection | Click or box-select elements; move, resize, rotate |
| Lasso | Free-form path selection for complex groupings |
| Hand/Pan | Navigate the infinite canvas without selecting |
| Rectangle | Draw rectangles with optional rounded corners |
| Diamond | Draw rhombus/diamond shapes |
| Ellipse | Draw circles and ovals |
| Arrow | Directional lines with configurable arrowheads; supports binding to elements |
| Line | Multi-point paths without arrowheads |
| Freedraw | Freehand pencil drawing |
| Text | Create and edit text blocks with font, size, alignment options |
| Image | Insert and manipulate raster images |
| Frame | Container for grouping and clipping child elements |
| Eraser | Remove elements from canvas |
| Laser Pointer | Ephemeral trail for presentations (not persisted) |

### 4.2 Element Styling

| Property | Options |
| -------- | ------- |
| Stroke color | Full color palette + custom hex |
| Stroke width | Thin, bold, extra-bold (1–20px) |
| Stroke style | Solid, dashed, dotted |
| Fill color | Full color palette + custom hex |
| Fill style | Hachure, cross-hatch, solid, none |
| Opacity | 0–100% |
| Roughness | Hand-drawn sloppiness level |
| Corner roundness | Sharp or rounded |
| Font family | Virgil, Helvetica, Cascadia, Excalifont, Nunito, Lilita One, Comic Shanns, Liberation Sans, Assistant |
| Font size | Small, Medium, Large, Extra Large |
| Text alignment | Left, center, right; top, middle, bottom |
| Arrowheads | None, arrow, dot, bar (start and end independently) |

### 4.3 Element Operations

- **Grouping / Ungrouping** — combine elements into logical groups
- **Layering** — bring forward, send backward, bring to front, send to back
- **Alignment** — align left, right, top, bottom, center (horizontal/vertical)
- **Distribution** — distribute spacing evenly
- **Flipping** — horizontal and vertical mirroring
- **Duplication** — clone with offset
- **Locking** — prevent accidental modifications
- **Linking** — attach hyperlinks to elements
- **Binding** — connect arrows to shapes (arrows follow when shapes move)
- **Cropping** — crop images and containers

### 4.4 Canvas Features

| Feature | Details |
| ------- | ------- |
| Infinite canvas | Pan freely in any direction |
| Zoom | 10%–600% range; zoom-to-fit, zoom-to-selection |
| Grid mode | Toggleable grid with snap-to-grid |
| Object snapping | Snap to other elements during move/resize |
| Background color | Customizable canvas background |
| Dark mode | Full light/dark theme support |

### 4.5 View Modes

| Mode | Description |
| ---- | ----------- |
| Edit (default) | Full editing capabilities |
| Zen | Minimal UI — hides chrome for focused drawing |
| View | Read-only — pan and zoom only |

### 4.6 Export & Import

| Format | Import | Export | Notes |
| ------ | ------ | ------ | ----- |
| `.excalidraw` (JSON) | Yes | Yes | Full scene with metadata |
| PNG | — | Yes | Configurable scale (1x, 2x, 3x) |
| SVG | — | Yes | Vector output |
| `.excalidraw.png` | Yes | Yes | PNG with embedded scene data |
| `.excalidraw.svg` | Yes | Yes | SVG with embedded scene data |
| Clipboard (PNG) | — | Yes | Copy as image |
| Clipboard (SVG) | — | Yes | Copy as SVG |

### 4.7 Collaboration

| Feature | Details |
| ------- | ------- |
| Real-time editing | Multiple users on same canvas via WebSocket |
| Live cursors | See collaborator pointer positions and tools |
| Username labels | Random usernames for anonymous collaborators |
| Share link | Generate shareable URL with optional QR code |
| Conflict resolution | Automatic reconciliation with fractional indexing |
| End-to-end encryption | Optional encryption for shared sessions |

### 4.8 AI Features

| Feature | Description |
| ------- | ----------- |
| Text-to-Diagram (TTD) | Natural language → diagram via streaming generation |
| Diagram-to-Code | Convert drawings to HTML/CSS/JavaScript |
| Magic Frame | AI-powered frame content generation |
| Mermaid import | Convert Mermaid syntax to Excalidraw elements |

### 4.9 Library System

- Save reusable element groups as library items
- Browse and insert library items
- Publish libraries for sharing
- Import community-published libraries

### 4.10 Persistence

| Mechanism | Purpose |
| --------- | ------- |
| Browser IndexedDB | Auto-save for offline persistence |
| localStorage | Settings, preferences, API keys |
| File system | Manual save/load via native file dialogs |
| Firebase | Cloud storage for collaborative sessions |

---

## 5. Technical Constraints

### 5.1 Browser Support

| Browser | Minimum Version |
| ------- | --------------- |
| Chrome | 70+ |
| Firefox | Latest 1 |
| Safari | 12+ |
| Edge | 79+ |
| Samsung Internet | 10+ |
| Internet Explorer | Not supported |

### 5.2 Performance Boundaries

| Constraint | Value |
| ---------- | ----- |
| Zoom range | 10%–600% |
| Export scales | 1x, 2x, 3x |
| Canvas rendering | HTML5 Canvas 2D (not WebGL) |
| Collaboration transport | WebSocket (socket.io) |
| State management | Jotai atoms (granular subscriptions) |

### 5.3 Platform Support

- **Desktop:** Windows, macOS, Linux (all modern browsers)
- **Mobile/Tablet:** iOS Safari 12+, Android Chrome/Firefox
- **Touch:** Full multi-touch support with mobile-optimized UI
- **Pen/Stylus:** Pressure-sensitive input, eraser button support

---

## 6. Internationalization

- **60+ languages** supported via i18next
- Auto-detection of browser language preference
- Manual language override
- RTL (right-to-left) support for Arabic, Hebrew, etc.
- Translation files in `packages/excalidraw/locales/`
- Coverage tracked via `yarn locales-coverage`

---

## 7. Accessibility

- Keyboard shortcuts for all tools and operations
- Command palette for action search
- ARIA labels on interactive elements
- Dark mode for low-light environments
- Canvas zoom up to 600% for magnification
- Pen/stylus alternative input support

---

## 8. SDK / Embedding API

### Installation
```bash
npm install react react-dom @excalidraw/excalidraw
```

### Core Component
```tsx
<Excalidraw
  initialData={{ elements, appState, files }}
  onChange={(elements, appState, files) => { /* save */ }}
  theme="dark"
  viewModeEnabled={false}
  zenModeEnabled={false}
  gridModeEnabled={false}
  langCode="en"
/>
```

### Imperative API
```typescript
const api = useExcalidrawAPI();
api.updateScene({ elements });
api.getSceneElements();
api.getAppState();
api.setActiveTool({ type: "rectangle" });
api.exportToBlob({ mimeType: "image/png" });
api.scrollToContent();
```

### Customization Points
- `renderTopLeftUI` / `renderTopRightUI` — custom UI injection
- `renderEmbeddable` — custom embedded content renderer
- `UIOptions` — toggle toolbar items, canvas actions, export options
- `onPointerUpdate` — collaboration cursor broadcasting
- `onLinkOpen` — custom link handling
- `validateEmbeddable` — URL validation for iframes

---

## 9. Deployment Options

| Method | Details |
| ------ | ------- |
| **Vercel** | Primary hosting; configured via `vercel.json` |
| **Docker** | Self-hosted via `docker-compose.yml`; nginx-based |
| **npm** | `@excalidraw/excalidraw` package for embedding |

---

## Related Documentation

- [Architecture](../technical/architecture.md) — system design and data flow
- [Domain Glossary](domain-glossary.md) — terminology reference
- [Dev Setup](../technical/dev-setup.md) — developer onboarding
- [Decision Log](../memory/decisionLog.md) — architectural decisions
- [Product Context](../memory/productContext.md) — audience and workflows
