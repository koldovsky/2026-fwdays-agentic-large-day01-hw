# Product Requirements Document (Reverse-Engineered)

## Product

Excalidraw (web application and embeddable editor package)

## Document status

Reverse-engineered from current repository implementation and architecture artifacts.

---

## 1. Main goal of product development

Build and evolve a fast, collaborative, low-friction visual whiteboard that allows users to:

- convert ideas into diagrams quickly,
- collaborate in real time,
- persist and share work safely,
- embed the editor in host applications with stable APIs.

### Product objective

Prioritize speed of thought and collaboration over high-fidelity design complexity.

### Success direction (qualitative)

- First usable interaction is immediate (open -> draw).
- Editing remains smooth during common operations.
- Collaboration state is understandable (who is where/what is selected).
- Data can be recovered/shared/exported without user confusion.

---

## 2. Target users

## Primary user groups

### A) Technical users

- Engineers, architects, and technical leads who need architecture/data-flow/system sketches.

### B) Product and design collaborators

- PMs, designers, and cross-functional teams for ideation/workshop flows.

### C) Education / explanation users

- Educators and learners creating explanatory diagrams.

### D) Integrator developers

- Teams embedding Excalidraw into other products and extending top-level UI through provided APIs/hooks.

## Usage contexts

- Solo whiteboarding
- Live collaborative sessions
- Async sharing and review
- Embedded whiteboard feature in external apps

---

## 3. Key capabilities (product requirements)

## 3.1 Core canvas editing

- Create and edit scene elements (shapes, lines/arrows, text, images, frame-like items).
- Select, move, resize, rotate, group/ungroup, align/distribute, reorder.
- Tool-based interaction model with keyboard + pointer workflows.
- Undo/redo and finalize flows integrated with action system/history.

## 3.2 View and interaction modes

- Support multiple tool and UI modes (selection, lasso, hand, eraser, frame, embeddable, laser, etc.).
- Support grid and snapping controls.
- Support view/zen style modes and mode switching via state/actions.

## 3.3 Collaboration

- Render collaborators’ pointer, selected elements, and presence metadata.
- Merge remote and local scene updates deterministically.
- Preserve local in-progress edits during reconciliation (version/versionNonce rules).

## 3.4 Persistence and exchange

- Local persistence support (browser-side storage patterns are present in app stack).
- Cloud-backed flows (Firebase integration in app package).
- Export/import scene data (JSON and image-related flows in project APIs).
- Library management for reusable element groups with change notifications.

## 3.5 Extensibility / embedding

- Expose imperative API for host apps (`updateScene`, `mutateElement`, `addFiles`, subscriptions, etc.).
- Provide customizable top-level UI hooks and component exports.
- Offer package exports for consumers (`@excalidraw/excalidraw` + CSS and typed subpaths).

## 3.6 Operational quality baseline

- Monorepo scripts for build, test, lint, typecheck.
- Workspace structure supporting app + package + examples.
- Hooks/lint-staged integration to enforce code quality on commits.

---

## 4. Technical limitations and constraints

## 4.1 Architecture constraints

- Editor orchestration is centralized in a large `components/App.tsx` class component.
- Behavior relies on coordinated subsystems (`AppState`, `Scene`, `Store`, `History`, `ActionManager`, renderer layers).
- Lifecycle and side-effect sequencing are significant and order-dependent in several paths.

## 4.2 State and rendering constraints

- Hybrid state model increases integration complexity (React state + scene/store deltas + Jotai atoms).
- Static and interactive canvas layering improves performance but requires strict boundary discipline.
- Some temporary/known technical debt is present (TODO/FIXME/HACK markers around event handling, state naming, render boundaries, etc.).

## 4.3 Environment and dependency constraints

- Node.js `>=18` required.
- Repository pinned to Yarn 1 (`yarn@1.22.22`).
- Real-time and persistence behavior depends on external services (Socket.io backend and Firebase in app context).

## 4.4 Integration constraints

- Host apps depend on API stability and context behavior.
- SSR environments require client-only rendering patterns for editor usage.

---

## 5. Out of development scope (non-goals)

The current product direction should not optimize for:

- becoming a high-fidelity design suite for pixel-perfect production assets,
- replacing full CAD/vector authoring tools,
- complex document/page layout editing workflows,
- backend-first monolithic server architecture inside this repository,
- broad feature additions that compromise first-draw speed and low cognitive load.

---

## 6. Requirement guardrails for future changes

- Preserve fast time-to-first-draw and responsive editing.
- Preserve deterministic collaboration merge behavior.
- Preserve undo/redo correctness and capture semantics.
- Preserve embeddability and public API usability.
- Prefer incremental changes in lifecycle-heavy editor core.

---

## 7. Traceability note

This PRD is reverse-engineered from current implementation and project documents in this repository (memory docs, technical architecture doc, and source modules). It should be updated whenever architecture or product boundaries materially change.
