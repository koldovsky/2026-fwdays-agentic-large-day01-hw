# Product Requirements Document (PRD)

> Reverse-engineered PRD for Excalidraw based on codebase analysis.

## 1. Product Vision

**Mission**: Provide a free, instant, browser-based whiteboard for creating hand-drawn style diagrams and sketches — with zero friction to start and real-time collaboration built in.

**Core Value Proposition**: Excalidraw makes visual ideation approachable by combining the informality of hand-drawn sketches with the precision of digital tools, accessible to anyone with a browser.

## 2. Target Audience

| Segment | Use Case | Key Needs |
|---------|----------|-----------|
| **Developers** | Architecture diagrams, technical sketches, flowcharts | Speed, keyboard shortcuts, embed in docs |
| **Designers/UX** | Wireframing, ideation, low-fi mockups | Hand-drawn aesthetic, shape tools, export |
| **Teams** | Collaborative brainstorming, planning | Real-time sync, presence, sharing |
| **Educators** | Teaching, explaining concepts visually | Simplicity, laser pointer, library |
| **Third-party apps** | Embedding diagram editor | React component API, customization |

## 3. Key Features

### Core (Must-Have)
| Feature | Description | Status |
|---------|-------------|--------|
| Drawing tools | Freehand, rectangle, diamond, ellipse, line, arrow, text | ✅ Shipped |
| Selection & manipulation | Select, lasso, move, resize, rotate, group | ✅ Shipped |
| Hand-drawn rendering | RoughJS-based sketchy visual style | ✅ Shipped |
| Canvas navigation | Zoom, pan, fit-to-screen | ✅ Shipped |
| Undo/Redo | Full history with keyboard shortcuts | ✅ Shipped |
| Export | PNG (with embedded scene), SVG, JSON, clipboard | ✅ Shipped |
| Local persistence | Auto-save via IndexedDB | ✅ Shipped |
| Dark mode | Light/dark theme toggle | ✅ Shipped |

### Secondary (Important)
| Feature | Description | Status |
|---------|-------------|--------|
| Real-time collaboration | WebSocket sync with presence, cursors, idle status | ✅ Shipped |
| Library system | Reusable element collections, cloud sync | ✅ Shipped |
| Command palette | Fuzzy search for all actions | ✅ Shipped |
| PWA | Installable, offline-capable | ✅ Shipped |
| i18n | 60+ languages via i18next/Crowdin | ✅ Shipped |
| Snapping | Object snap, midpoint snap, grid | ✅ Shipped |
| Eraser | Custom lasso-based eraser tool | ✅ Shipped |
| Image support | Embed, crop, scale images | ✅ Shipped |
| Frames | Container grouping for elements | ✅ Shipped |

### Experimental/Advanced
| Feature | Description | Status |
|---------|-------------|--------|
| AI diagram-to-code | Convert drawings to code | ✅ Shipped |
| Mermaid conversion | Mermaid syntax → Excalidraw elements | ✅ Shipped |
| Magic frames | AI-generated element compositions | ✅ Shipped |
| Embeddable iframes | Embed external content | ✅ Shipped |
| Laser pointer | Presentation tool for collaboration | ✅ Shipped |

## 4. Technical Constraints

| Constraint | Details |
|-----------|---------|
| **Runtime** | Modern browsers with HTML5 Canvas, IndexedDB, ResizeObserver |
| **Rendering** | Canvas-based (not DOM) — custom hit-testing required |
| **Offline** | PWA with Service Worker caching; works fully offline |
| **Bundle** | Vite with chunk splitting (locales, CodeMirror, Mermaid) |
| **Collaboration** | Requires WebSocket server; Firebase for persistence |
| **Fonts** | Custom WOFF2 fonts (Excalifont, Virgil, Cascadia, Nunito) |

## 5. Non-Functional Requirements

### Performance
- Canvas rendering optimized with multi-layer approach (static + interactive)
- Batched state updates via `unstable_batchedUpdates`
- Throttled collaboration sync (`SYNC_FULL_SCENE_INTERVAL_MS = 20s`)
- Cursor sync at ~30fps (`CURSOR_SYNC_TIMEOUT = 33ms`)

### Security
- No mandatory authentication for basic usage
- Optional Firebase auth for cloud features
- URL sanitization (`@braintree/sanitize-url`)
- Scene data encoded in PNG metadata (no server required for basic sharing)

### Accessibility
- Keyboard navigation and shortcuts
- Command palette for keyboard-driven workflow
- WCAG considerations in UI components

### Privacy
- SimpleAnalytics (privacy-friendly, no cookies)
- Tracking disabled in production by default
- Offline-first — data stays local unless user opts into collaboration

## 6. Analytics & Success Metrics

Tracked event categories (via `trackEvent()`):
- `toolbar` — tool selection
- `element` — element creation/modification
- `canvas` — zoom, pan, navigation
- `export` — export format usage
- `history` — undo/redo
- `collab` — collaboration events
- `hyperlink` — link interactions
- `command_palette` — palette usage
- `shape_switch` — tool switching
- `search_menu` — search usage

## 7. Competitive Positioning

| Feature | Excalidraw | Miro | draw.io | FigJam |
|---------|-----------|------|---------|--------|
| Hand-drawn style | ✅ Core identity | ❌ | ❌ | Partial |
| No account needed | ✅ | ❌ | ✅ | ❌ |
| Open source | ✅ | ❌ | Partial | ❌ |
| Real-time collab | ✅ | ✅ | ✅ | ✅ |
| Embeddable component | ✅ React | ❌ | ❌ | ❌ |
| Offline support | ✅ PWA | ❌ | ✅ | ❌ |
| Self-hostable | ✅ | ❌ | ✅ | ❌ |
| Free | ✅ | Freemium | ✅ | Freemium |

**Unique differentiators**: Hand-drawn aesthetic, zero-friction entry, embeddable React component, fully open-source, offline-first.

## 8. Integration Points

| Integration | Type | Purpose |
|-------------|------|---------|
| `@excalidraw/excalidraw` | npm package | Embed editor in React apps |
| Firebase | Backend | Auth, Firestore, Cloud Storage |
| WebSocket (socket.io) | Protocol | Real-time collaboration |
| JSON API | REST | Scene sharing/persistence |
| Mermaid | Library | Diagram syntax conversion |
| Sentry | Monitoring | Error tracking (production) |
| SimpleAnalytics | Analytics | Privacy-friendly usage tracking |

## Related Docs
- [Domain Glossary](./domain-glossary.md) — project terminology
- [Product Context](../memory/productContext.md) — feature details and UX principles
- [Decision Log](../memory/decisionLog.md) — architectural decisions
