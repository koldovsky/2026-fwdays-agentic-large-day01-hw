# Product Requirements Document (Reverse-Engineered)

## Product Purpose

Excalidraw is an open-source, browser-based virtual whiteboard that produces hand-drawn-style diagrams. It provides an infinite canvas for creating sketches, flowcharts, wireframes, and architectural diagrams with a distinctive "napkin sketch" aesthetic powered by Rough.js. It supports real-time collaboration and is also available as an embeddable React component for third-party integration.

## Target Audience

| Audience | Use Case |
|----------|----------|
| Software engineers | Architecture diagrams, system design, technical whiteboarding |
| Product/UX designers | Low-fidelity wireframes, user flow diagrams |
| Teams (remote/hybrid) | Collaborative brainstorming, sprint planning, retrospectives |
| Educators/students | Visual explanations, interactive lessons |
| Third-party app developers | Embedding drawing capabilities via `@excalidraw/excalidraw` React component |
| Individual users | Quick sketches, note-taking, personal diagrams |

## Key Features

### Drawing & Elements
1. **Shape primitives** — rectangle, ellipse, diamond, with configurable fill, stroke, roughness, and opacity
2. **Arrows & lines** — multi-point, curved or sharp, with arrowheads and automatic binding to shapes
3. **Freehand drawing** — pressure-sensitive freedraw with perfect-freehand algorithm
4. **Text** — inline text editing, bound text in shapes, multiple font families
5. **Images** — drag-and-drop, paste from clipboard, in-canvas cropping
6. **Embeddables** — embed YouTube, Vimeo, and other iframe content directly on canvas
7. **Frames** — visual grouping with content clipping

### Canvas & Interaction
8. **Infinite canvas** — pan, zoom (pinch + scroll), with configurable grid and snapping
9. **Selection tools** — box selection, lasso selection, multi-select with grouping
10. **Element locking** — lock elements/groups to prevent accidental edits
11. **Snap-to-grid and snap-to-objects** — alignment aids
12. **Undo/redo** — delta-based history system

### Collaboration
13. **Real-time collaboration** — WebSocket-based multi-user editing with cursor tracking
14. **Follow mode** — follow another user's viewport in real-time
15. **Laser pointer** — ephemeral pointer for presentations
16. **End-to-end encryption** — shared scenes are encrypted via Web Crypto API

### Import/Export
17. **Export formats** — PNG, SVG, clipboard, JSON (`.excalidraw`)
18. **Scene-embedded PNG** — PNG files contain full scene metadata for round-trip editing
19. **File System Access API** — native save/open dialogs in supported browsers

### Extensibility
20. **Library system** — save, import, export, and share reusable element collections
21. **Text-to-diagram** — convert Mermaid syntax to Excalidraw drawings
22. **Command palette** — keyboard-driven command search and execution
23. **Embeddable React component** — full API with imperative controls, callbacks, and customizable UI
24. **Plugin system** — diagram-to-code (magic frame), custom tools
25. **i18n** — 25+ languages, RTL support

### UX
26. **Dark/light theme** — system-aware with manual toggle
27. **Zen mode** — hides UI for distraction-free drawing
28. **View mode** — read-only mode for presentations
29. **Welcome screen** — customizable onboarding
30. **PWA support** — installable as a progressive web app

## Non-goals / Constraints

- **Not a vector editor** — no precision tools (bezier handles, path operations, node editing)
- **Not pixel-perfect** — the hand-drawn aesthetic is intentional, not a limitation
- **No server-side rendering** — all rendering happens in the browser via Canvas API
- **No native apps** — browser-only (though PWA provides app-like experience)
- **No built-in version history** — no timeline or revision tracking for drawings
- **No built-in user auth** — authentication is handled by the hosting app (Firebase in excalidraw.com)
- **Library package is UI-agnostic** — collaboration, storage backend, and auth are NOT part of `@excalidraw/excalidraw`; they must be implemented by the host app

## User Flows

### Core Drawing Flow
1. User selects a tool from the toolbar (or keyboard shortcut)
2. User clicks/drags on the canvas to create an element
3. Element appears with hand-drawn style, selected for immediate property editing
4. Tool reverts to selection (unless "locked" mode is on)

### Collaboration Flow
1. User creates a shared session (generates encrypted room link)
2. Collaborators join via the link
3. Changes sync in real-time via WebSocket; cursors and usernames are visible
4. Scene is persisted to Firebase; encrypted at rest

### Export Flow
1. User opens export dialog (Ctrl+Shift+E for image, Ctrl+S for file)
2. Selects format: PNG (optionally with embedded scene), SVG, or clipboard
3. Configures options: background, dark mode, scale
4. File is generated client-side and downloaded or copied

### Library Flow
1. User selects elements → "Add to library"
2. Library items appear in sidebar for reuse
3. Libraries can be exported as `.excalidrawlib` JSON and shared
4. Public library items can be browsed and imported from the community
