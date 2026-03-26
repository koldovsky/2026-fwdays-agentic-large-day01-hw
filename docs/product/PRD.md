# PRD

Reverse-engineered product requirements document for this repository snapshot.

Use this document when:
- you need a product-level summary of what Excalidraw is expected to do
- you want feature scope without reading implementation details first
- you are validating whether a change fits the current product surface

This is not an upstream official PRD. It is reconstructed from repository behavior, product docs, app structure, and public package intent in this repo.

---

## Product Summary

Excalidraw is a browser-based whiteboard and diagram editor with two product surfaces:
- a standalone web app in `excalidraw-app/`
- an embeddable React editor package in `packages/excalidraw/`

The product supports fast freeform diagramming on an infinite canvas, lightweight collaboration and sharing flows in the app shell, and integration into third-party React applications through a public component and API.

---

## Problem Statement

Users need a low-friction way to sketch, annotate, organize, and share visual ideas without the overhead of a heavyweight design tool.

Integrators need to embed the same editor experience inside their own products with a stable API surface, extensibility points, and predictable state-change behavior.

---

## Goals

### User Goals

- Create diagrams and sketches quickly on an infinite canvas.
- Edit visual elements with predictable selection, grouping, alignment, ordering, and styling flows.
- Navigate large boards efficiently with pan and zoom.
- Save, export, and share work with minimal friction.
- Collaborate in shared sessions when using the standalone app.

### Product Goals

- Provide a cohesive editor experience across standalone and embedded surfaces.
- Keep command behavior consistent across toolbar, menu, keyboard, context menu, and API paths.
- Preserve user trust through reliable undo/redo and stable editing behavior.
- Support import/export and persistence flows needed for practical diagram work.
- Maintain a reusable library package for integrators.

### Repository-Specific Goals

- Keep the monorepo buildable as both app and library.
- Keep examples functional for integration scenarios.
- Keep documentation current as architecture and behavior are investigated.

---

## Non-Goals

- Full enterprise workflow management or project management features.
- High-fidelity vector design workflows beyond the editor's existing diagramming scope.
- Native desktop-first application behavior in this repository snapshot.
- Server-side product requirements beyond the app shell integrations already present.

---

## Target Users

### End Users

People who want to sketch diagrams, flows, annotations, or quick visual explanations directly in the browser.

### Collaborators

People joining a shared editing session through the standalone app collaboration flow.

### Integrators

Developers embedding `<Excalidraw />` into React applications and consuming its public API and change events.

---

## Primary Use Cases

1. Create a new scene and draw basic shapes, arrows, text, frames, and images.
2. Select, move, resize, group, align, reorder, and style elements.
3. Navigate a large canvas with zoom and pan.
4. Export the scene or otherwise persist/load it through supported flows.
5. Join or host collaborative sessions in the standalone app.
6. Embed the editor in another product and react to state changes through the library API.

---

## Functional Requirements

### Canvas Editing

- The product must provide an infinite-canvas style editing experience.
- The user must be able to create supported element types such as shapes, text, arrows, frames, images, and other editor-supported objects present in the current build.
- The product must support selecting single and multiple elements.
- The product must support moving, resizing, rotating where applicable, and deleting elements.
- The product must preserve element order and allow reordering-related actions where supported.

### Styling and Structure

- The user must be able to change relevant style properties for supported elements.
- The product must support grouping and alignment flows for selected elements.
- The product must support frame-related workflows present in the current editor surface.
- The product must support reusable library items as a separate concept from scene elements.

### Navigation and Interaction

- The product must support zooming and panning.
- The product must provide selection overlays and editing affordances that remain readable during interaction.
- The user must be able to invoke commands from multiple entry points with consistent outcomes.

### Undo/Redo and State Consistency

- The product must support undo and redo for local user operations that are intended to be history-worthy.
- The product must avoid recording operations that are explicitly marked as non-undoable, such as remote synchronization or initialization paths.
- The product must preserve consistent editor state across action execution, scene updates, and history capture.

### Persistence, Import, and Export

- The product must support scene serialization and restoration flows used by the app and library.
- The product must support export flows for practical sharing and downstream usage.
- The product must support loading scene data and files through the current app and library pathways.

### Collaboration

- The standalone app must support collaboration-related flows present in `excalidraw-app/collab`.
- Remote updates must integrate into the editor without being treated as local undoable user actions.
- Collaboration links and room/session mechanics are app-level concerns, not core library requirements.

### Embedding and API

- Integrators must be able to render the editor as a React component.
- Integrators must be able to observe changes and interact with the editor through the exposed API surface.
- The embedded editor must preserve the same core editing semantics as the standalone experience, subject to host configuration.

---

## UX Requirements

- The editor should feel fast and low-friction for first use.
- Canvas interaction and UI chrome should remain visually separated.
- Keyboard, menu, context-menu, and toolbar actions should converge on the same product behavior.
- The interface should remain readable under theming and localization support present in the repo.
- Common tasks should not require users to understand internal editor concepts such as store snapshots or action capture modes.

---

## Success Criteria

The product is meeting this reconstructed PRD when:
- users can create and edit scenes without fighting the interaction model
- undo/redo behaves predictably for local editing work
- export/load/share flows work for common scenarios in the current surface
- collaboration flows in the app shell do not corrupt local editor behavior
- integrators can embed the component and receive stable editor updates

---

## Scope Boundaries

### In Scope

- Standalone app editor behavior
- Embeddable React editor package
- Core diagramming and editing flows
- Collaboration hooks present in the app shell
- Import/export and scene persistence flows
- Library items and reusable asset workflows present in the current editor

### Out of Scope

- Guarantees about undocumented or unfinished features not represented in this repository snapshot
- Operational deployment requirements
- Full backend product specification for external services
- Feature commitments beyond what can be inferred from the current code and docs

---

## Key Risks and Constraints

- Product behavior depends on shared editor internals such as the action pipeline, scene/store/history interaction, and hidden behavioral contracts documented elsewhere.
- Collaboration behavior is partly app-shell specific and should not be assumed to define the core library contract.
- Some product behavior is encoded through implementation constraints rather than explicit API-level documentation.

---

## Dependencies

- `packages/excalidraw/` for the reusable editor package.
- `excalidraw-app/` for standalone product shell behavior.
- `packages/element/`, `packages/common/`, `packages/math/`, and `packages/utils/` for core editor functionality.
- Data, export, and collaboration modules for persistence and sharing-related workflows.

---

## Related Docs

- `docs/memory/productContext.md`
- `docs/product/domain-glossary.md`
- `docs/product/feature-catalog.md`
- `docs/product/ux-patterns.md`
- `docs/memory/systemPatterns.md`
- `docs/technical/architecture.md`
