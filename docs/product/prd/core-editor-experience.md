---
doc_type: product
doc_id: PRD-core-editor-experience
status: draft
owner: "@product-and-engineering"
last_updated: "2026-03-27"
sources:
  - "docs/memory-bank/productContext.md"
  - "docs/memory-bank/projectbrief.md"
  - "packages/excalidraw/README.md"
  - "packages/excalidraw/CHANGELOG.md"
links:
  - "docs/product/domain-glossary.md"
  - "docs/product/feature-catalog.md"
  - "docs/product/ux-patterns.md"
---

# PRD: Core Editor Experience

## Problem / Goal
- End users need a browser whiteboard that feels immediate for solo work and team sessions.
- Integrators need a stable React component that can be embedded without product-specific backend coupling.
- Maintainers need to ship new editor capabilities without breaking old scenes, links, and collaboration behavior.

## Users and Scenarios
- Product teams embedding `<Excalidraw />` into an existing React app.
- Individual users resuming local work in the standalone app.
- Teams sharing a scene through a link or live room and editing concurrently.
- Users importing from files/links and exporting to JSON, PNG, or SVG.

## Scope
- Embeddable editor package (`@excalidraw/excalidraw`) with public integration API.
- Standalone app flows for local restore, share links, collaboration, and library usage.
- Scene compatibility and migration behavior for historical data formats.
- Optional AI-assisted diagram flows when backend services are configured.

## Non-Goals
- Building backend services in this repository (share backend, websocket infra, Firebase services).
- Defining mobile-native app UX outside browser runtime constraints.
- Replacing low-level architecture documentation already covered under `docs/technical/`.

## Requirements
- The minimal embed must work with package CSS import and a non-zero-height container.
- The standalone app must remain local-first outside active collaboration sessions.
- Incoming scene data from file/share/collab paths must be restored and reconciled through migration-safe logic.
- Export must support JSON, PNG, and SVG with consistent scene fidelity.
- Collaboration must support encrypted room payloads, presence, and remote update application without polluting local undo/redo.
- Library workflows must support reuse/import of library items and preserve scene consistency.
- Advanced generation flows (Mermaid, text-to-diagram, diagram-to-code, AI endpoints) must remain additive to core editing, not a replacement.

## Non-Functional Expectations
- Browser-first responsiveness for common edit operations.
- Backward compatibility for persisted scene and library payloads.
- Graceful degradation when optional external services are unavailable.
- Clear host/integrator contract for React 17/18/19 compatibility in the package.

## Acceptance Criteria
- A host app can render a visible editor using only package install, CSS import, and a sized container.
- A user can close/reopen the standalone app and recover the previous local scene when not in collaboration mode.
- A shared room applies remote updates without inserting remote-only changes into the local undo stack.
- A user can import a valid scene payload and export the same scene intent as JSON and visual formats.
- Library items can be inserted/reused without breaking core element editing behavior.
- Service-gated capabilities fail safely (feature unavailable/disabled) instead of corrupting current work.

## Success Metrics
- Integration support requests related to basic embed setup (CSS/height/SSR) trend down over time.
- Data-loss regressions in restore/reconcile/collaboration paths stay at zero for accepted releases.
- Collaboration and share-link workflows show stable completion in manual QA and automated checks.
- Optional AI/advanced flows can be enabled or disabled without affecting core editor stability.

## Open Questions
- Which service/env variables should be considered required vs optional for local contributor setup?
- Which advanced flows should be treated as GA vs experimental in user-facing communication?
- Does this checkout intentionally diverge from upstream Excalidraw in product behavior?
