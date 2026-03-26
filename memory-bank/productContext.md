# Product Context

## Why This Project Exists
Excalidraw was created to fill the gap between heavyweight diagramming tools (Visio, Lucidchart) and simple drawing apps. It provides a fast, browser-based whiteboard where the hand-drawn aesthetic keeps sketches intentionally informal — encouraging brainstorming and iteration over pixel-perfect precision.

## Problems It Solves
1. **Tool overhead** — No install, no account required. Open a URL and start drawing.
2. **Collaboration friction** — Real-time, multi-cursor editing via WebSocket so distributed teams can diagram together without screen sharing.
3. **Embeddability** — Published as `@excalidraw/excalidraw` on npm, allowing any React app to integrate a full drawing canvas with a single component.
4. **Export portability** — Diagrams export to SVG, PNG, and a native `.excalidraw` JSON format that can be shared as links or files.

## User Experience Goals
- **Instant productivity** — Zero learning curve; tools behave like pen-on-napkin.
- **Hand-drawn look** — Rough.js rendering makes every shape feel approachable and non-final, reducing the pressure of "getting it right."
- **Keyboard-first power users** — Command palette, extensive keyboard shortcuts, and an actions system for rapid workflow.
- **Responsive & offline** — PWA support allows installation and offline use.

## Business Context
- **Open-source core** — The repository is the OSS engine. A commercial "Excalidraw+" product layers on persistent storage, team management, and enhanced collaboration.
- **Community-driven** — Active contributor base; the npm package is widely embedded in tools like Notion, Obsidian, and various dev tools.
- **Workshop context** — This specific repository is used as the basis for the FWDays 2026 Agentic IDE workshop (Day 1 homework), where participants document and explore the codebase using AI-assisted tooling.
