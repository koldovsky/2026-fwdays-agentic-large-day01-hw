# Feature Catalog

This catalog tracks the main product-facing capabilities in this repository and the behavior that should remain stable.

## 1. Embeddable Editor Component
- Primary users: developers integrating Excalidraw into their product.
- Value: drop-in canvas editor in React apps.
- Core behavior:
  - Render `<Excalidraw />` inside a sized container.
  - Import `@excalidraw/excalidraw/index.css`.
  - Expose integration hooks/events and imperative API for host orchestration.
- Rules and constraints:
  - SSR frameworks should render client-only.
  - Package should stay host-agnostic and avoid app-specific backend coupling.

## 2. Local-First Standalone App
- Primary users: direct users of `excalidraw-app`.
- Value: fast resume of work without mandatory sign-in or server dependency.
- Core behavior:
  - Restore local browser scene state on startup.
  - Persist scene and file/image data locally with debounced writes.
- Rules and constraints:
  - Local persistence is paused/adjusted during active collaboration to avoid source-of-truth conflicts.

## 3. Scene Import and Compatibility
- Primary users: end users importing existing diagrams, maintainers preserving compatibility.
- Value: old and external scene payloads remain usable.
- Core behavior:
  - Restore/migrate elements and app state from legacy and current payloads.
  - Reconcile incoming data with local state in collaboration and share flows.
- Rules and constraints:
  - Compatibility and migration logic has priority over aggressive schema simplification.

## 4. Export and Sharing
- Primary users: end users sharing or publishing their work; host apps implementing custom share flows.
- Value: move from editable scene to portable assets/links.
- Core behavior:
  - Export scene as JSON, PNG, and SVG.
  - Support backend-hosted share link workflows in the standalone app.
  - Support host-controlled export hooks in the package.
- Rules and constraints:
  - Export paths should preserve scene fidelity and avoid silent data loss.

## 5. Live Collaboration
- Primary users: teams editing the same scene together.
- Value: low-latency co-editing with durable room recovery.
- Core behavior:
  - Websocket-driven room updates and collaborator presence.
  - Encrypted room payload handling.
  - Firebase-backed snapshot/file persistence in app flows.
- Rules and constraints:
  - Remote/init updates should not be captured into local undo history.

## 6. Library Workflows
- Primary users: users reusing recurring shapes/components; integrators with custom library persistence.
- Value: reusable content across scenes.
- Core behavior:
  - Import and install library items.
  - Insert library items into scenes and keep them editable as normal elements.
- Rules and constraints:
  - Library persistence/migration behavior should not break existing user libraries.

## 7. Advanced Generation Workflows
- Primary users: users accelerating diagram creation.
- Value: convert structured input into editable Excalidraw scenes.
- Core behavior:
  - Mermaid conversion and related paste/import helpers.
  - AI-assisted text-to-diagram and diagram-to-code flows in app integrations.
- Rules and constraints:
  - These capabilities are additive and must not destabilize baseline drawing/editing.
  - External services are optional; features should fail gracefully when unavailable.

## 8. Internationalization and Accessibility Foundations
- Primary users: multilingual and keyboard-driven users.
- Value: usable editor across locales and input modes.
- Core behavior:
  - Locale assets and language selection support.
  - Keyboard shortcuts and accessible interaction patterns across key workflows.
- Rules and constraints:
  - New features should preserve existing keyboard and localization behavior.

## Related Docs
- `docs/product/PRD.md`
- `docs/product/domain-glossary.md`
- `docs/product/ux-patterns.md`
- `docs/memory-bank/productContext.md`
