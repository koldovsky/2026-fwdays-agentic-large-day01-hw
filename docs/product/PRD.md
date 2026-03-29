# PRD: Excalidraw — Reverse-Engineered Product Requirements

> Reverse-engineered from source code: `types.ts`, `appState.ts`, `packages/common/src/constants.ts`, `app_constants.ts`, `locales/en.json`
> Version: `@excalidraw/excalidraw` 0.18.0

---

## 1. Product Vision

**Excalidraw** is a browser-based collaborative whiteboard with a deliberate hand-drawn aesthetic. It lowers the barrier to visual thinking by removing the need for accounts, installations, or design skills.

**Core positioning:**
- Zero-friction: works instantly in browser, no sign-up required
- Hand-drawn style: feels informal and approachable (powered by Rough.js)
- Dual product: standalone web app + embeddable React library (`@excalidraw/excalidraw`)
- Privacy-first: end-to-end encrypted collaboration (128-bit keys, client-side only)

---

## 2. Target Audience

| Segment | Primary Use |
|---------|-------------|
| Software engineers | System design diagrams, architecture sketches |
| Product managers | User flows, journey maps, wireframes |
| Designers | Low-fidelity prototypes, brainstorming |
| Educators & students | Visual explanations, teaching diagrams |
| Remote teams | Real-time collaborative whiteboarding |
| Developers (library) | Embed drawing into their own apps |

---

## 3. Drawing Tools

Verified from `TOOL_TYPE` constants and `AppState.activeTool`:

| Tool | Key | Notes |
|------|-----|-------|
| Selection | `V` | Click + drag to select/move |
| Lasso | — | Free-form selection area |
| Rectangle | `R` | |
| Diamond | `D` | |
| Ellipse | `E` | |
| Arrow | `A` | 3 types: sharp, round, elbow |
| Line | `L` | Straight/curved, polygon-closable |
| Freedraw | `P` | Freehand sketching |
| Text | `T` | With container binding |
| Image | — | Raster images with crop/scale |
| Eraser | `E` | Remove elements |
| Hand (pan) | `H` | Navigate canvas |
| Frame | `F` | Named container groups |
| Magic Frame | — | AI wireframe-to-code (Excalidraw+) |
| Embeddable | — | YouTube, Figma, custom iframes |
| Laser | — | Presentation pointer (no persist) |

---

## 4. Element Properties & Styling

All verified from `appState.ts` default values:

### Appearance
- **Stroke color** — any hex/rgba
- **Background color** — any hex/rgba + transparent
- **Stroke width** — thin / bold / extra-bold
- **Stroke style** — solid / dashed / dotted
- **Fill style** — solid / hachure / cross-hatch / zigzag
- **Roughness** — 0 (architect) / 1 (artist) / 2 (cartoonist)
- **Opacity** — 0–100%
- **Roundness** — none / proportional / adaptive radius

### Text
- **Font families** — Virgil, Helvetica, Cascadia, Excalifont, Nunito, Lilita One, Comic Shanns, Liberation Sans + CJK (Chinese/Japanese/Korean)
- **Font size** — default 20px, min 1px
- **Alignment** — left / center / right
- **Vertical alignment** — top / middle / bottom

### Arrows
- **Arrowhead types** — arrow, bar, circle, diamond, triangle, crowfoot, cardinality (none/one/many)
- **Arrow styles** — sharp / round / elbow (auto-routing)
- **Binding** — arrows snap and bind to element connection points

---

## 5. Key Features

### 5.1 Collaboration (real-time)
- WebSocket-based multiplayer via Socket.io 4.7.2
- End-to-end encryption (AES-128, client-side key, never sent to server)
- Live cursor + name labels for each collaborator
- User follow mode — viewport syncs to another user
- Laser pointer trails visible to all collaborators
- Idle/active/away status detection (idle after 60s)
- Voice call integration with mute/speaking indicators
- Offline detection with reconnect handling
- Full scene sync every 20 seconds as fallback

### 5.2 Canvas & Navigation
- Infinite canvas
- Zoom: 10%–3000% (step 0.1, verified from `MIN_ZOOM`/`MAX_ZOOM` constants)
- Pan via hand tool or Space+drag
- Fit to content / fit selection
- Grid mode (default 20px grid, step 5)
- Snap to objects (midpoints + outlines)
- Fullscreen mode

### 5.3 Flowchart Support
- `FlowChartCreator` / `FlowChartNavigator` — create and navigate node graphs
- Quick-connect: hover element edge → arrow appears → click to create connected shape
- Arrow binding modes: orbit / skip (hold `Alt` to bypass)
- Elbow arrows auto-route around obstacles

### 5.4 Frames
- Named rectangular containers
- Elements can be members of frames
- Frame clipping (content outside frame hidden in export)
- Frame outline toggle
- `getFrameLikeTitle()` for display names

### 5.5 Library
- Save element selections as reusable templates
- Shareable via token URL
- Stored in IndexedDB (`excalidraw-library`)
- Restrictions: no iframe, embeddable, or image elements in library items

### 5.6 Export
| Format | Notes |
|--------|-------|
| PNG | 1×/2×/3× DPI, optional dark mode, optional scene embedding |
| SVG | Vector, font subsetting for CJK characters |
| JSON | Full scene restore (`.excalidraw` format) |
| Clipboard | PNG or SVG copy |

Scene data can be embedded inside PNG/SVG for round-trip restore.

### 5.7 Import
- JSON (`.excalidraw` files)
- Image files (PNG, JPEG, SVG, WebP, BMP, ICO, AVIF, JFIF, GIF)
- **Mermaid diagrams** — flowchart, sequence, class diagram, ERD converted to native elements
- Web Share Target API (mobile share-to-Excalidraw)
- Drag & drop onto canvas

### 5.8 View Modes
- **View mode** — read-only, no editing (consumer-facing embed use case)
- **Zen mode** — hides all UI chrome, canvas only
- **Dark / Light / System** theme

### 5.9 AI Features (Excalidraw+)
- Text-to-diagram generation via `AIComponents`
- Magic Frame: convert wireframe sketch to code
- AI chat history stored in IndexedDB (`excalidraw-ttd-chats`)

### 5.10 Search
- Search text content and frame names on canvas
- Results highlighted, viewport scrolls to match

---

## 6. Technical Constraints & Limits

Verified from `packages/common/src/constants.ts` and `excalidraw-app/app_constants.ts`:

### File & Image Limits
| Constraint | Value | Source |
|------------|-------|--------|
| Max file upload | 4 MB | `MAX_ALLOWED_FILE_BYTES` |
| Max image dimension | 1440px (auto-resize) | `DEFAULT_MAX_IMAGE_WIDTH_OR_HEIGHT` |
| File cache max age | 1 year | `FILE_CACHE_MAX_AGE_SEC` |

### Zoom & Canvas
| Constraint | Value |
|------------|-------|
| Min zoom | 10% |
| Max zoom | 3000% |
| Zoom step | 0.1 |
| Default grid size | 20px |
| Export padding | 10px |

### Interaction Thresholds
| Constraint | Value |
|------------|-------|
| Drag initiation | 10px minimum |
| Minimum arrow size | 20px |
| Double-tap radius | 35px |
| Double-tap timeout | 300ms |
| Idle timeout | 60 seconds |
| Collab full sync interval | 20 seconds |
| Deleted element TTL | 24 hours |

### Encryption
- Algorithm: AES-128 (128-bit key)
- Room ID: 10 bytes random
- Key never sent to server — URL fragment only

---

## 7. Persistence & Storage

| Key | Storage | Content |
|-----|---------|---------|
| `excalidraw` | localStorage | Canvas elements |
| `excalidraw-state` | localStorage | App UI state |
| `excalidraw-theme` | localStorage | Theme preference |
| `excalidraw-collab` | localStorage | Collab session data |
| `excalidraw-library` | IndexedDB | Element library |
| `excalidraw-ttd-chats` | IndexedDB | AI chat history |
| Firebase | Cloud | Scenes + binary files (Excalidraw+) |

---

## 8. Embedding API (Library Consumers)

Minimum setup:
```tsx
import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";

<div style={{ height: "100vh" }}>
  <Excalidraw />
</div>
```

Key props: `initialData`, `onChange`, `onExcalidrawAPI`, `viewModeEnabled`, `zenModeEnabled`, `theme`, `renderTopRightUI`, `UIOptions`

Imperative API via `onExcalidrawAPI`: `updateScene`, `getSceneElements`, `getAppState`, `resetScene`, `scrollToContent`, `setActiveTool`

---

## 9. Out of Scope (Not Supported)

- PDF import/export
- Mobile native app
- 3D drawing
- Animation timeline
- Figma/Adobe import
- Handwriting recognition
- Scripting / macro system
- Offline collaboration sync
- Version history / git-style branching
