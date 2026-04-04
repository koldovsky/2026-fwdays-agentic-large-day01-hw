# Project brief — Excalidraw

## What this project is

- **Excalidraw** is an open-source **virtual whiteboard** for sketching diagrams, UI mockups, and informal drawings with a hand-drawn (“rough”) aesthetic.
- This repository is the **official monorepo**: the embeddable React library (`@excalidraw/excalidraw`), the full web application (`excalidraw-app`), shared packages, and examples.
- The product focuses on **fast, in-browser drawing**, **sharing** (links, export), and **real-time collaboration** in hosted deployments (e.g. via WebSockets in the app layer).

## Primary goals

- **Low-friction creation**: draw shapes, arrows, text, and freehand strokes without a heavy design tool workflow.
- **Interoperability**: export to PNG/SVG and related formats; embed Excalidraw in other sites as a React component.
- **Accessibility of the codebase**: clear separation between UI, scene data, and rendering so the community can extend tools and behaviors.

## Scope (this fork / workshop context)

- Treat this tree as an **Excalidraw fork** used for coursework: same architecture as upstream (packages under `packages/`, app under `excalidraw-app/`).
- **Out of scope for this brief**: product roadmap, hosting SLAs, and third-party service specifics—these belong in product docs, not the Memory Bank core files.

## Who it is for

- **End users**: individuals and teams who need quick diagrams and whiteboarding in the browser.
- **Developers**: teams embedding the editor or contributing to the open-source project.

## Success criteria (engineering)

- Builds and tests pass using the **documented Yarn workspace commands** (see `techContext.md`).
- Changes preserve the separation between **scene model** (elements + app state) and **canvas rendering**.
