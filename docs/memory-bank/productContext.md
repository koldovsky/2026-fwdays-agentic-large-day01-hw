# Product Context

See [projectbrief.md](./projectbrief.md) for scope/constraints and [activeContext.md](./activeContext.md) for the current repo state.

## Problem
- Users need a low-friction whiteboard/diagram editor that feels instant in the browser.
- Integrators need the editor as a drop-in React component, not only as a hosted app.
- Maintainers need to evolve the editor without breaking old scenes, libraries, or collaboration links.

## Users
- Developers embedding Excalidraw into their own products.
- End users drawing locally, importing/exporting assets, or collaborating in shared rooms.
- Maintainers extending editor behavior, fixing rendering/data bugs, or shipping package releases.

## Desired Experience
- The minimal embed should work with `@excalidraw/excalidraw`, CSS import, and a container with height.
- The standalone app should restore a recent local scene automatically and feel local-first.
- Share links, collaboration rooms, file-backed images, and library imports should recover gracefully.
- Advanced tools such as Mermaid, text-to-diagram, and diagram-to-code should layer on top of core editing instead of redefining it.

## Key Workflows
- Embed `<Excalidraw />` inside another React app.
- Open the standalone app and continue from local browser state.
- Import a scene from a backend link, URL payload, local file, or collaboration room.
- Export/share a scene as JSON, PNG, SVG, or backend-hosted encrypted link.
- Reuse library items, collaborate live, and optionally use AI-backed generation workflows.

## Product Tradeoffs
- Local-first responsiveness is preferred over a server-authoritative model.
- Compatibility and migration logic are favored over aggressively simplifying old data paths.
- The base package remains host-agnostic; app-specific concerns such as Firebase, collaboration UI, Excalidraw+, and AI stay in `excalidraw-app`.
- Images/files are handled asynchronously, so UX correctness depends on status tracking and delayed persistence side effects.
