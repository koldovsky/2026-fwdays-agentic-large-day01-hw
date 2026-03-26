# Product Context — Excalidraw Monorepo

> **See also:** 
[Product Requirements Document](../product/PRD.md) 
[Domain Glossary](../product/domain-glossary.md) 

## Target Users

Excalidraw serves two distinct audiences:

| Audience | Description | Touchpoint |
|----------|-------------|------------|
| **App users** | Individuals, teams, educators, and anyone who needs quick visual communication — diagrams, wireframes, brainstorms, architecture sketches | excalidraw.com (web app, PWA) |
| **Library consumers** | Developers embedding a whiteboard into their own products — documentation platforms, note-taking apps, internal tools, educational software | `@excalidraw/excalidraw` npm package |

Within app users, key personas include:

- **Solo sketchers** — quick-and-dirty diagrams for personal use or async sharing
- **Collaborative teams** — real-time whiteboard sessions (design reviews, retrospectives, brainstorming)
- **Developers** — architecture diagrams, flowcharts, Mermaid-to-visual conversion
- **Educators** — classroom illustrations, assignment feedback, interactive explanations

## Problem Statement

Existing diagramming tools (Figma, Miro, Lucidchart, draw.io) optimize for
precision and polish. They are powerful but heavyweight — account creation,
complex UIs, subscription tiers, and a steep learning curve for casual use.

Excalidraw targets a different need: **fast, low-friction visual thinking**.
When you need a diagram in 30 seconds, not 30 minutes. When the sketch should
feel informal and approachable, not corporate and final.

## Core Value Propositions

| Value | Why It Matters |
|-------|---------------|
| **Hand-drawn aesthetic** | Sketches feel informal and inviting — reduces the pressure to make things "perfect," encouraging faster ideation |
| **Instant start, no signup** | Open the URL and draw. Zero onboarding friction. No account wall. |
| **Privacy via E2E encryption** | Collaboration rooms are end-to-end encrypted — the server never sees your content. Encryption key lives in the URL hash (never transmitted). |
| **Open source (MIT)** | Full transparency, community contributions, no vendor lock-in. Self-hostable via Docker. |
| **Embeddable React component** | Drop `<Excalidraw />` into any React app — the same full editor as the web app, without Firebase/Sentry/collaboration baggage |
| **Offline-capable PWA** | Works without internet after first load. Service worker caches fonts, locales, and code chunks. |
| **Simplicity** | Minimal UI surface. Power features exist but stay out of the way until needed. |

## UX Goals & Principles

1. **Instant start** — no signup, no onboarding wizard, no modal. Open the URL
   → canvas is ready. Saved locally by default (IndexedDB + localStorage).

2. **Minimal UI chrome** — the canvas dominates. Toolbars are compact. Side
   panels appear on demand. The interface recedes so the content can breathe.

3. **Pen-on-paper feel** — roughjs rendering makes every shape look hand-drawn.
   This is a deliberate design constraint, not a limitation. It signals "this is
   a sketch, not a specification."

4. **Keyboard-first power users** — single-key shortcuts for tools (`R` for
   rectangle, `L` for line, `A` for arrow, etc.), `Ctrl+D` to duplicate,
   `Ctrl+Shift+E` to export. Power users rarely touch the toolbar.

5. **Progressive disclosure** — basic drawing tools are visible immediately.
   Advanced features (libraries, Mermaid import, embedding, custom fonts,
   collaboration) reveal themselves contextually rather than cluttering the
   default experience.

## Key User Workflows

### 1. Solo Sketch
Open excalidraw.com → draw shapes, arrows, text → auto-saved locally.
Export as PNG/SVG or save as `.excalidraw` JSON for later editing.

### 2. Real-Time Collaboration
Click "Live collaboration" → generates a shareable link with E2E encryption key
in the URL hash. Multiple users draw simultaneously with cursor awareness and
reconciliation of concurrent edits via Socket.IO.

### 3. Export & Share
Export the canvas as PNG (with optional embedded scene data for re-import), SVG,
or `.excalidraw` JSON. Copy to clipboard for quick pasting into docs or chat.

### 4. Embed in Apps
Install `@excalidraw/excalidraw` → render `<Excalidraw />` with initial data,
theme, and callbacks. Use `ExcalidrawImperativeAPI` for programmatic control
(update scene, export, zoom, etc.).

### 5. Import from Mermaid
Paste Mermaid diagram syntax → Excalidraw converts it to visual elements via
`@excalidraw/mermaid-to-excalidraw`. Useful for developers who already have
text-based diagrams in their docs.
