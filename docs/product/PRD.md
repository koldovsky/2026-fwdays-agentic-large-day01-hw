# Product Requirements Document — Excalidraw

> Reverse-engineered from the open-source codebase (`excalidraw@0.18.0`),
> public GitHub repository, and community documentation.

---

## 1. Product Goal

**Provide the fastest path from idea to visual sketch on the web.**

Excalidraw exists because existing diagramming tools (Figma, Miro, Lucidchart,
draw.io) optimize for precision and polish. They are powerful but heavyweight —
account creation, complex UIs, subscription tiers, and a steep learning curve
for casual use.

Excalidraw targets a fundamentally different need: **fast, low-friction visual
thinking**. When you need a diagram in 30 seconds, not 30 minutes. When the
sketch should feel informal and approachable, not corporate and final.

### Design Philosophy

Every product decision flows from one constraint: **the hand-drawn aesthetic is
deliberate, not a limitation**. Shapes rendered via roughjs look intentionally
sketchy. This signals "this is a draft, not a specification" and removes the
pressure to make things pixel-perfect — encouraging faster ideation and broader
participation from non-designers.

### Success Criteria (inferred)

| Metric | Signal |
|--------|--------|
| Time to first shape | < 3 seconds from URL open (no signup, no onboarding) |
| Adoption breadth | 119k+ GitHub stars; npm package embedded across ecosystems |
| Collaboration uptake | E2E-encrypted rooms with zero server-side content visibility |
| Offline reliability | PWA caches code, fonts, locales — functional without network |
| Ecosystem reach | Embeddable React component used in docs platforms, note apps, internal tools |

---

## 2. Target Audience

### Primary: App Users (excalidraw.com)

| Persona | Description | Key Workflow |
|---------|-------------|--------------|
| **Solo sketchers** | Individuals who need a quick-and-dirty diagram for personal use or async sharing | Open URL, draw, export PNG/SVG, done |
| **Collaborative teams** | Engineering, design, or product teams running real-time sessions — design reviews, retrospectives, brainstorming | Click "Live collaboration", share link, draw simultaneously |
| **Developers** | Software engineers creating architecture diagrams, flowcharts, sequence diagrams | Draw or paste Mermaid syntax, export to docs or PRs |
| **Educators** | Teachers, trainers, workshop facilitators creating classroom illustrations, assignment visuals, interactive explanations | Sketch on shared board, export or embed in LMS |

### Secondary: Library Consumers (npm package)

| Consumer Type | Use Case |
|---------------|----------|
| **Documentation platforms** | Embed `<Excalidraw />` for interactive diagrams inside docs (e.g., Docusaurus, GitBook) |
| **Note-taking apps** | Whiteboard canvas inside a notes or knowledge-management product |
| **Internal tools** | Custom drawing/annotation UIs within enterprise dashboards |
| **Educational software** | Interactive diagram editors for courses, assessments, or lab environments |

Library consumers import `@excalidraw/excalidraw` — the same editor, stripped of
Firebase, Sentry, and collaboration backend opinions. They bring their own
storage and real-time layers.

---

## 3. Key Functions

### 3.1 Drawing Engine

| Feature | Details |
|---------|---------|
| **Element types** | Rectangle, diamond, ellipse, arrow (with bindings, arrowheads, elbow/round/sharp routing), line, freedraw, text, image, frame, magic frame (AI), embeddable/iframe |
| **Hand-drawn rendering** | roughjs for all shape rendering; configurable sloppiness (roughness) per element |
| **Freehand drawing** | perfect-freehand library for pressure-sensitive stroke paths |
| **Infinite canvas** | Pan and zoom; zoom range 0.1x–30x |
| **Grid & snapping** | Optional grid overlay, object snap, arrow midpoint snapping |
| **Styling controls** | Stroke/background color, fill style, stroke width/style, opacity, font family selection, text alignment, roundness, arrowhead type |
| **Editing operations** | Undo/redo, duplicate, delete, select all, group/ungroup, 6-way alignment, distribute, z-order (send to back/front, step backward/forward), copy/cut/paste, copy/paste styles |
| **Frames** | Wrap selection in frame, frame naming, nested rendering control |
| **Image handling** | Drag-and-drop images, crop editor, max upload 4 MiB, default max dimension 1440px, high-quality resize via pica |
| **Hyperlinks** | Attach URLs to any element; sanitized via `@braintree/sanitize-url` |
| **Element links** | Deep link to specific elements within a scene |
| **Selection modes** | Rectangle selection and lasso selection (user preference toggle) |

### 3.2 Collaboration

| Feature | Details |
|---------|---------|
| **Real-time multi-user** | Socket.IO WebSocket transport; cursor awareness with ~30 fps sync |
| **E2E encryption** | AES-GCM 128-bit symmetric encryption; key lives in URL hash fragment (never transmitted to server) |
| **Room sharing** | Room ID = 10 random bytes (hex); collaboration key = 22-char segment in URL |
| **Reconciliation** | Concurrent edit merging via `reconcileElements()` algorithm |
| **Periodic full sync** | Full scene resync every 20 seconds to ensure consistency |
| **Deleted element retention** | Soft-deleted elements retained for 24 hours to support late-joining collaborators |
| **Laser pointer** | Real-time laser tool visible to all collaborators with configurable color |
| **User presence** | Collaborator avatars, idle/active states with configurable thresholds |

### 3.3 Import / Export

| Format | Direction | Notes |
|--------|-----------|-------|
| **`.excalidraw` JSON** | Import & Export | Native format; MIME type `application/vnd.excalidraw+json` |
| **PNG** | Export | Scales 1x/2x/3x; optional scene data embedded in PNG metadata for re-import |
| **SVG** | Export | 2-decimal precision for path data |
| **Clipboard** | Export | Copy as PNG or SVG to system clipboard |
| **Mermaid** | Import | Paste Mermaid diagram syntax; converted via `@excalidraw/mermaid-to-excalidraw` |
| **Spreadsheet data** | Import | Paste tabular data to generate bar/line/radar charts |
| **Shareable links** | Export | Read-only links for sharing without collaboration |

### 3.4 Library System

Reusable component library with a sidebar panel. Users can save element groups
as library items for reuse. Certain element types (iframe, embeddable, image)
are disabled for library items.

### 3.5 AI Features

| Feature | Details |
|---------|---------|
| **Text-to-diagram** | Streaming chat interface; sends prompts to `VITE_APP_AI_BACKEND`; rate-limited (HTTP 429 redirects to Excalidraw+) |
| **Diagram-to-code** | Captures frame + children as JPEG, sends to backend `diagram-to-code` endpoint |
| **Magic frame** | AI-generation metadata on iframe elements |

### 3.6 PWA & Offline

| Feature | Details |
|---------|---------|
| **Service worker** | Auto-updating via `vite-plugin-pwa` + Workbox |
| **Offline caching** | Fonts (90 days), locales (30 days), code chunks (90 days); max precache asset 2.3 MB |
| **File handler** | OS-level `.excalidraw` file association |
| **Share target** | Receives shared files from other apps (mobile) |
| **Local-first** | Auto-saves to IndexedDB + localStorage; works without network after first load |

### 3.7 Internationalization

55+ locale files via i18next. Browser language auto-detection. Language
selectable from the main menu.

### 3.8 Theming & UI

| Feature | Details |
|---------|---------|
| **Light / dark mode** | Manual toggle or follow system preference |
| **Zen mode** | Hides all UI chrome; canvas only |
| **View mode** | Read-only canvas (no editing tools) |
| **Stats panel** | Scene and element statistics |
| **Command palette** | Quick action search (Ctrl/Cmd+/ or Ctrl/Cmd+Shift+P) |
| **Search** | Find elements on canvas (Ctrl/Cmd+F) |
| **Responsive layout** | Breakpoints for phone, tablet, desktop; mobile-specific menu |

### 3.9 Keyboard Shortcuts

Single-key tool activation: `R` (rectangle), `D` (diamond), `O` (ellipse),
`A` (arrow), `L` (line), `P`/`X` (freedraw), `T` (text), `E` (eraser),
`H` (hand/pan), `K` (laser), `V`/`1` (selection). Full shortcut map accessible
via Help dialog.

### 3.10 Embeddable Component API

| Capability | Details |
|------------|---------|
| **React component** | `<Excalidraw />` — drop-in editor with initial data, theme, and callbacks |
| **Imperative API** | `ExcalidrawImperativeAPI` via React context — update scene, export, zoom, etc. |
| **React compatibility** | Peer supports React 17, 18, and 19 |
| **SSR safety** | Client-only; requires dynamic import or `ssr: false` in frameworks |
| **Asset self-hosting** | Configurable via `EXCALIDRAW_ASSET_PATH` for fonts/assets |

---

## 4. Technical Limitations

### 4.1 Browser Requirements

| Requirement | Details |
|-------------|---------|
| **Minimum browsers** | Chrome 70+, Edge 79+, Safari 12+, Firefox (modern), Samsung Internet 10+ |
| **Excluded** | IE (all versions), Opera Mini, KaiOS <=2.5 |
| **Required APIs** | Canvas 2D, Web Crypto (`crypto.subtle` for AES-GCM), IndexedDB, Service Workers |
| **SSR restriction** | Component is client-side only; parent element must have non-zero height |

### 4.2 Performance Constraints

| Constraint | Details |
|------------|---------|
| **No hard element cap** | No codified maximum element count; performance degrades proportionally with scene complexity |
| **Render throttling** | `EXCALIDRAW_THROTTLE_RENDER` flag; RAF-based throttling for laser/eraser trails |
| **Canvas rendering** | All rendering is Canvas 2D-based; no WebGL acceleration |
| **Bundle splitting** | Mermaid and CodeMirror loaded as separate chunks to avoid bloating main bundle |
| **Memory** | Large scenes with many images can exhaust browser memory; no built-in memory budget |

### 4.3 File & Data Limits

| Limit | Value |
|-------|-------|
| Max image upload size | 4 MiB |
| Default max image dimension | 1440px (width or height) |
| SVG export decimal precision | 2 decimals |
| Custom color palette slots | 5 per canvas |
| PWA precache max file | ~2.3 MB |
| Service worker font cache | 1000 entries, 90-day TTL |

### 4.4 Collaboration Constraints

| Constraint | Details |
|------------|---------|
| **No max collaborator cap (client)** | Server-side limits are outside this codebase |
| **Cursor sync rate** | ~33ms throttle (~30 fps) |
| **Full scene resync** | Every 20 seconds |
| **Deleted element TTL** | 24 hours (late joiners may miss elements deleted before that) |
| **Encryption** | AES-GCM 128-bit; IV regenerated per operation (12-byte IV) |
| **Room key transport** | URL hash only — if link is leaked, room content is accessible |

### 4.5 Storage Constraints

| Constraint | Details |
|------------|---------|
| **Local storage** | IndexedDB + localStorage; subject to browser quota limits |
| **Quota handling** | `QuotaExceededError` is caught and handled gracefully |
| **Cloud storage** | Firebase (optional, app-layer only); not available in the embeddable library |

### 4.6 Mobile & Touch

| Constraint | Details |
|------------|---------|
| **Responsive but not native** | Web app with mobile breakpoints; no native mobile apps |
| **Reduced UI on phone** | Eye dropper hidden; some toolbar adjustments for small screens |
| **Touch gestures** | Supported (pinch-to-zoom, tap, long-press context menu) but not as fluid as native apps |

### 4.7 Accessibility

| Constraint | Details |
|------------|---------|
| **Partial a11y** | Radix UI primitives, `aria-label` on tools and menus, `role` attributes on key regions |
| **Canvas limitation** | Core drawing canvas is inherently inaccessible to screen readers; no alternative text layer for drawn content |
| **No WCAG audit** | No a11y testing infrastructure (axe, pa11y) in the codebase |

### 4.8 Security Model

| Aspect | Details |
|--------|---------|
| **E2E encryption** | AES-GCM 128-bit for collaboration rooms; server sees only ciphertext |
| **URL sanitization** | `@braintree/sanitize-url` for all user-provided hyperlinks |
| **No CSP in app** | Content Security Policy headers must be configured at the hosting layer |
| **Sentry telemetry** | Error tracking (opt-out via `VITE_APP_DISABLE_SENTRY`); analytics toggle via `VITE_APP_ENABLE_TRACKING` |
| **AI data flow** | Diagram content sent to external AI backend when using text-to-diagram or diagram-to-code features |

---

## 5. Competitive Positioning

| Differentiator | Excalidraw | Miro | draw.io | tldraw | FigJam |
|----------------|-----------|------|---------|--------|--------|
| Hand-drawn aesthetic | Core identity | No | No | Optional | No |
| Signup required | No | Yes | No | No | Yes |
| Open source | MIT | No | Yes (partial) | Apache 2.0 | No |
| E2E encryption | Yes | No | N/A (local) | No | No |
| Embeddable component | npm package | Embed only | Embed only | npm package | No |
| Offline-first PWA | Yes | No | Yes | Partial | No |
| Self-hostable | Docker + Vercel | No | Yes | Yes | No |
| Real-time collab | Yes (free) | Yes (paid tiers) | Limited | Yes | Yes (paid) |
| Price | Free / OSS | $8-16/user/mo | Free | Free / OSS | $3-5/user/mo |

---

## 6. Deployment Targets

| Target | Method | Output |
|--------|--------|--------|
| **Web (Vercel)** | `vercel.json` | Static SPA from `excalidraw-app/build` |
| **Docker** | Multi-stage Dockerfile | Node 18 build, nginx:1.27-alpine serving |
| **npm** | `@excalidraw/excalidraw` | `dist/prod/`, `dist/dev/`, `dist/types/` |
| **Examples** | Next.js 14 + vanilla browser | Integration reference implementations |

---

## 7. Out of Scope (not in this codebase)

- Collaboration server / WebSocket backend (only the client is present)
- AI backend services (endpoints referenced via env vars, implementation external)
- Excalidraw+ paid tier features and billing
- Native mobile applications
- Backend storage APIs (only Firebase client SDK is included)
- Content moderation or abuse prevention
- WCAG-conformant accessibility for canvas content
