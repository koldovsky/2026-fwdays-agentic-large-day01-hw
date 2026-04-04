# Product context — UX goals and scenarios

## UX principles (Excalidraw)

- **Speed over precision by default**: users should start drawing immediately; advanced precision (grids, alignment) is available without blocking the first stroke.
- **Readable “sketch” aesthetic**: the rough stroke style (via Rough.js) signals informality and reduces perfectionism compared to vector CAD tools.
- **Browser-first**: no install required for the primary web app; embedding works where React runs.
- **Trust through export**: users can leave with PNG/SVG (and related flows) so the canvas is not a dead end.

## Primary personas

- **Individual contributor**: quick diagram for a doc, ticket, or slide.
- **Team member**: shared board for brainstorming; needs collaboration and link sharing when the deployment supports it.
- **Integrator developer**: embeds `@excalidraw/excalidraw` in another product and cares about API stability and bundle behavior.

## Core scenarios

### Scenario A — Whiteboard a flow in minutes

- Open the app → pick rectangle/arrow/text → sketch a flowchart.
- Pan and zoom to work at different densities.
- Export to PNG or SVG for Slack/docs.

### Scenario B — Iterate on an existing scene

- Select elements, duplicate, align roughly, edit text in place (WYSIWYG).
- Undo/redo when experimenting with layout.

### Scenario C — Embed in a product

- Load the React component with initial data; subscribe to updates from the host app.
- Keep theming and container sizing predictable for the parent layout.

### Scenario D — Collaborate (when enabled)

- Share a session; see remote pointers/names where the deployment wires real-time sync.

## Non-UX product boundaries (reminder)

- Excalidraw is **not** a full design system tool (no component libraries as a first-class product surface).
- It is **not** a GIS/CAD replacement; precision tooling is intentionally lighter than those domains.
