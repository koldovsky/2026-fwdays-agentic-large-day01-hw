# Product Context

Defines the product-level understanding of Excalidraw for contributors working in this repository.

## 1. What Excalidraw Is
Excalidraw is a browser-based virtual whiteboard and diagramming tool with a hand-drawn visual style. It helps people quickly express ideas as sketches, flows, architecture diagrams, wireframes, and collaborative notes.

This monorepo contains both:
- The hosted Excalidraw app experience (`excalidraw-app/`)
- The reusable Excalidraw editor package for embedding in other products (`packages/excalidraw/`)

## 2. Product Value Proposition
- Fast idea-to-visual workflow with low friction and minimal setup.
- Distinctive sketch-like output that encourages early-stage thinking over pixel-perfect design.
- Shareable and collaborative canvases for synchronous and asynchronous teamwork.
- Portable editor capabilities that can be embedded into external applications.

## 3. Core User Jobs
- Capture ideas quickly during ideation, planning, and technical discussions.
- Create clear visual communication artifacts for product, engineering, education, and documentation.
- Collaborate on the same canvas with teammates.
- Reuse and integrate the editor in custom workflows through the library API.

## 4. Core Product Capabilities
- Infinite-canvas style drawing and diagram composition.
- Primitive shapes, arrows, text, freehand tools, and rich scene editing.
- Selection, transform, grouping, layering, and duplication workflows.
- Scene persistence/export/import flows for local and shared usage.
- Collaboration and sync-oriented pathways in the app runtime.
- Programmatic embedding and control via the reusable package API.

## 5. Product Boundaries In This Repo
- App-level UX, runtime integration, and collaboration wiring live in `excalidraw-app/`.
- Editor/runtime APIs and embeddable surface live in `packages/excalidraw/`.
- Shared element/math/common/utils packages provide foundational behavior reused across surfaces.

## 6. Product Quality Priorities
- Correctness of scene state, updates, and undo/redo history.
- Canvas performance for interactive editing at scale.
- Reliability of persistence and collaboration flows.
- Backward-compatible, predictable behavior for embedders and integrators.

## 7. References
- Project scope: `docs/memory/projectbrief.md`
- Current priorities: `docs/memory/activeContext.md`
- Architecture detail: `docs/technical/architecture.md`
- Domain terminology: `docs/product/domain-glossary.md`
