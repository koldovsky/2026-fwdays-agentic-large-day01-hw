# Project brief — Excalidraw

## What this project is

- **Excalidraw** is an open-source **virtual whiteboard** for diagrams, UI sketches, and informal drawings with a hand-drawn (“rough”) visual style.
- This repository is the **Excalidraw monorepo**: the **embeddable React package** (`@excalidraw/excalidraw` in `packages/excalidraw/`), the **full browser app** (`excalidraw-app/`), **shared libraries** (`packages/common`, `element`, `math`, `utils`), and **examples** (`examples/`).
- The **default license** for the published library is **MIT** (see `packages/excalidraw/package.json`).

## Mission (product)

- **Fast creation in the browser** — minimal friction to draw shapes, connectors, text, and freehand strokes.
- **Share and reuse** — export to raster/vector, portable **JSON** scenes, shareable links where the deployment supports them.
- **Optional collaboration** — real-time sessions in the **hosted app** depend on WebSocket/collab infrastructure (`excalidraw-app/collab/`); behavior differs when the app runs in an **iframe** (see `decisionLog.md`, UB-001).

## Primary goals

- **Low-friction creation** — no heavyweight design-suite workflow for everyday diagrams.
- **Interoperability** — PNG/SVG export paths; embed via `<Excalidraw />` with documented CSS and layout constraints (`packages/excalidraw/README.md`).
- **Maintainable architecture** — separation between **scene data** (elements + app state), **actions**, and **canvas rendering** so contributors can extend tools without rewriting the pipeline.

## In scope (this tree)

- Workshop and coursework artifacts: **Memory Bank** (`docs/memory/`), **technical/product docs** under `docs/`, **Cursor** config (`.cursorignore`, optional `.cursorrules`).
- **Same runtime architecture as upstream** — treat feature work as contributing to the established package boundaries (`systemPatterns.md`).

## Out of scope (for this brief)

- Roadmaps, release dates, and commercial offerings outside this repo’s facts.
- **Guaranteed** SLAs for hosted services (Firebase, collaboration servers, analytics) — deployment-specific.

## Audience

- **End users** — individuals and teams whiteboarding in the browser.
- **Integrators** — developers embedding `@excalidraw/excalidraw` or running a fork of the app.
- **Contributors** — engineers fixing bugs or adding editor features in `packages/excalidraw/`.

## Success criteria (engineering)

- **CI-quality checks pass** using root **Yarn** scripts (`techContext.md`): typecheck, lint, Prettier, tests as appropriate.
- **Scene vs rendering** — changes keep **elements** and **`AppState`** as the source of truth; rendering and export stay derived from that model.
- **Documentation** — Memory Bank and `docs/` stay aligned with observable code (see `decisionLog.md` for known doc gaps).

## Related docs

- **Tech stack & commands**: `techContext.md`
- **Architecture patterns**: `systemPatterns.md`
- **Product-level PRD**: `docs/product/PRD.md`
- **UX scenarios**: `productContext.md`
