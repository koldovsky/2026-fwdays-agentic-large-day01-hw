# Product Context

## Product purpose

Excalidraw provides a fast, low-friction digital whiteboard for visual thinking.  
The product is optimized for quickly turning ideas into diagrams that feel informal, editable, and easy to share.

## UX goals

### 1. Instant start

- Users should be able to open the app and draw immediately.
- Minimal setup and minimal required configuration.
- Canvas-first experience with low UI overhead.

### 2. Low cognitive load

- The interface should feel approachable for non-designers and technical users alike.
- Tooling and controls should be predictable and discoverable.
- Common actions should be fast (draw, select, move, label, connect, export).

### 3. Maintain flow state

- Interaction latency should stay low during drawing and editing.
- Keyboard shortcuts and direct manipulation should support uninterrupted work.
- Mode switches (view/edit/zen/grid/collab) should be clear and reversible.

### 4. Collaboration-first communication

- Multi-user presence should be understandable (pointers, selections, follow mode).
- Shared work should preserve intent and avoid accidental overwrite.
- Remote updates should reconcile safely with local in-progress edits.

### 5. Reliable persistence and portability

- Users should not lose work during typical editing sessions.
- Local and cloud save flows should be straightforward.
- Scene data should be easy to export/import across environments.

### 6. Extensibility for host apps

- Embedded usage should allow host-specific UI additions and integration hooks.
- API and callbacks should support application-specific workflows.

## Primary user scenarios

### Solo ideation

- User opens canvas, sketches concepts, groups elements, adjusts layout, exports image/JSON.
- Success criteria: very fast first-draw and easy iterative refinement.

### Technical diagramming

- User creates architecture/process/flow diagrams with arrows, labels, frames, and links.
- Success criteria: precision where needed, while preserving quick sketch feel.

### Live collaboration session

- Multiple users co-edit, follow each other, and communicate intent via cursor presence and selection.
- Success criteria: clear awareness of others and robust conflict handling.

### Async sharing and review

- User prepares a scene, shares link or exported artifact, and collaborators review later.
- Success criteria: scene fidelity and easy re-entry for continued editing.

### Embedded whiteboard in another product

- Host app integrates Excalidraw component and custom top-level UI.
- Success criteria: stable embed API, predictable state callbacks, and branding flexibility.

## Personas (high-level)

- Product and design teams: brainstorms, flows, workshops.
- Engineers and architects: system diagrams, API/data flow docs, incident mapping.
- Educators and students: explanation diagrams, collaborative teaching.
- Cross-functional teams: lightweight visual communication without design tooling overhead.

## UX quality attributes

- Learnability: clear defaults and discoverable controls.
- Responsiveness: smooth interaction on common hardware.
- Forgiveness: undo/redo and non-destructive editing patterns.
- Consistency: uniform behavior across tools and interaction modes.
- Accessibility baseline: keyboard support and readable visual states.

## Non-goals (relative positioning)

- Not a high-fidelity vector design suite.
- Not a heavy document-layout editor.
- Not a replacement for full CAD/Figma-style precision tooling.

The product intentionally favors speed of thought, collaboration, and editable sketch aesthetics over pixel-perfect production design workflows.

## Details
For detailed architecture → see docs/technical/architecture.md
For domain glossary → see docs/product/domain-glossary.md
