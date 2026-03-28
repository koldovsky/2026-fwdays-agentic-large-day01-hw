# Product Requirements Document (PRD)

## Document Metadata

- **Product:** Excalidraw (app + embeddable package)
- **Repository:** `excalidraw-monorepo`
- **Version context:** aligned to `0.18.x` direction
- **Date:** 2026-03-28
- **Source documents:** `docs/memory/*`, `docs/product/domain-glossary.md`, `docs/technical/*`

## 1. Product Overview

Excalidraw is an open-source, browser-based whiteboard and diagramming platform with two complementary surfaces:

1. **Standalone web app** (`excalidraw-app`) for immediate use.
2. **Embeddable React package** (`@excalidraw/excalidraw`) for integration into third-party products.

The product emphasizes fast ideation, low-friction drawing, local-first resilience, privacy-conscious collaboration, and flexible export/sharing.

## 2. Project Goal

### Primary Goal

Deliver a full-featured online sketch/diagram editor that is:

- fast to start and easy to use;
- reliable for day-to-day visual thinking and team collaboration;
- usable both as a hosted app and as an integration-ready component API.

### Product Outcomes

- Users can create, edit, and recover visual work quickly in-browser.
- Teams can collaborate in real time with encrypted room communication.
- Content can be shared and exported with minimal steps.
- Product teams can embed the same core editor into their own applications.

### Scope Boundary

- This repository includes editor and app integration logic.
- External services (WebSocket backend, JSON backend, Firebase storage, AI backend) are configured via environment variables and are not fully implemented here.

## 3. Target Audience

### Primary Users

- **Individuals** brainstorming ideas, flows, wireframes, and quick diagrams.
- **Teams** collaborating on visual thinking sessions and walkthroughs.
- **Technical users** documenting architecture, systems, and structured diagrams.

### Secondary Users

- **Product/engineering organizations** embedding Excalidraw as a React component.
- **Open-source contributors/maintainers** extending quality, performance, and UX.

### User Needs

- Start drawing immediately with minimal setup.
- Maintain flow with smooth pan/zoom and predictable tools.
- Trust autosave, recovery, and collaboration privacy.
- Reuse assets (library items) and export/share without friction.
- Integrate editor capabilities into host applications through stable APIs.

## 4. Key Features

### 4.1 Core Editing Experience

- Infinite canvas drawing with essential shape/text/image tools.
- Hand-drawn visual style with low cognitive load.
- Undo/redo and interaction semantics that remain predictable at scale.
- Enhanced recent capabilities include command palette, scene search, image cropping, element linking, flowchart support, and richer text/font support.

### 4.2 Local-First Persistence

- Autosave to browser storage for scene/app state continuity.
- Persistence model combines `localStorage` (scene/app state) and IndexedDB (files/library).
- Recovery and cross-tab synchronization via versioned state keys.

### 4.3 Real-Time Collaboration

- Multi-user collaboration rooms with shared links.
- Collaboration payloads are encrypted before transport.
- Presence features include remote cursors/selections and room activity signals.
- Collaboration sync strategy includes incremental updates plus periodic full sync.

### 4.4 Sharing and Export

- Shareable readonly links.
- Export formats include PNG, SVG, clipboard, and `.excalidraw` JSON.
- Share-link flow supports compressed/encrypted scene payloads with key material in URL hash fragment.

### 4.5 Embeddable Library Surface

- Public React package `@excalidraw/excalidraw` as primary integration API.
- App-level concerns (collab/share/local persistence orchestration) are intentionally layered above core editor package.
- Ongoing API maturity direction includes explicit update/history capture semantics (`captureUpdate` modes).

### 4.6 Structured Diagram and Advanced Workflows

- Expanded support for Mermaid-derived diagrams, ERD, and charting breadth.
- Continued investment in text editing quality, arrow behavior correctness, and editor precision.
- View-mode and presentation workflows support non-edit interactions (e.g., laser pointer behaviors).

## 5. Technical Restrictions and Constraints

### 5.1 Platform and Toolchain Constraints

- Monorepo uses Yarn workspaces (Yarn Classic `1.22.22`).
- Node.js baseline is `>=18` for development; CI references Node `20.x`.
- Packaging direction is **ESM-first**; UMD assumptions are deprecated.
- Integrators must support modern TypeScript/bundler module resolution aligned with package `exports`.

### 5.2 Architecture Constraints

- Layering constraint: core editor logic in `packages/excalidraw`; product orchestration in `excalidraw-app`.
- Internal dependency direction must remain coherent (`common -> math -> element -> excalidraw`).
- Build order and package dependencies must preserve workspace boundaries and source-linking aliases.

### 5.3 Data and State Constraints

- Scene, app state, store snapshots, and history capture are separate concerns and must remain synchronized through defined update flows.
- History correctness depends on explicit `captureUpdate` policies:
  - `IMMEDIATELY` for local undoable updates,
  - `EVENTUALLY` for deferred capture flows,
  - `NEVER` for remote/init updates.
- Local persistence behavior (autosave/flush/sync) must guard against data loss during unload/collab transitions.

### 5.4 External Integration Constraints

- Collaboration transport relies on externally configured WebSocket service (`VITE_APP_WS_SERVER_URL`).
- Share/import endpoints depend on external backend URLs.
- File/media collaboration flows depend on Firebase configuration.
- AI features depend on optional external AI backend configuration.

### 5.5 Performance and UX Constraints

- Rendering pipeline relies on multi-canvas architecture and caching; regressions in hot paths materially impact UX.
- Text editing, frame/grouping logic, and arrow/snapping interactions are high-regression zones requiring focused validation.
- Collaboration and history semantics must avoid regressions in multi-user undo/redo behavior.

## 6. Non-Goals (Current Repository-Level)

- Implementing full backend services inside this repository.
- Reverting to legacy packaging models that conflict with ESM-first direction.
- Mixing app-level product behavior directly into low-level reusable package internals.

## 7. Quality and Validation Expectations

- Maintain passing test/lint/typecheck flows in CI and local checks.
- Prioritize correctness and regression coverage for:
  - editing semantics (selection/group/frame/text/arrow behavior),
  - collaboration/history edge cases,
  - rendering/geometry calculations.
- Keep product and architecture documentation synchronized with code evolution and release direction.

## 8. Risks and Mitigations

- **Risk:** Integrator breakage due to ESM/module-resolution mismatches.  
  **Mitigation:** clear migration guidance and compatibility documentation.
- **Risk:** Collaboration/history regressions from incorrect capture mode usage.  
  **Mitigation:** explicit capture policy usage and targeted regression tests.
- **Risk:** High-frequency text and interaction regressions.  
  **Mitigation:** focused UX bug triage and scenario-based testing in hot workflows.

## 9. Domain Alignment Notes

The PRD assumes established domain entities from the glossary, including `ExcalidrawElement`, `Scene`, `SceneData`, `AppState`, `Action`, `Collab`, and `LibraryItem`, and keeps a strict distinction between editor-domain models and generic UI/DOM terminology.
