# UX Patterns

This document captures recurring UX behavior patterns that should stay consistent across product changes.

## 1. Fast Time-to-Canvas
- Intent: users should reach a usable canvas quickly with minimal setup.
- Pattern:
  - Embeds work from a minimal integration contract (CSS import + sized container).
  - Standalone app restores recent work on startup when possible.
- Guardrails:
  - Avoid adding mandatory setup steps before first draw action.
  - Treat blank-canvas regressions (missing height/CSS issues) as high-priority onboarding failures.

## 2. Local-First Continuity
- Intent: users should not lose work between sessions.
- Pattern:
  - Local persistence is the baseline behavior.
  - Startup recovers recent scene state automatically.
- Guardrails:
  - Changes to persistence timing should preserve perceived immediacy and reduce loss risk.
  - Collaboration-specific behavior should not silently overwrite local draft state.

## 3. Compatibility over Purity
- Intent: old scenes and imports should still open correctly.
- Pattern:
  - Incoming payloads are restored/migrated before rendering.
  - Reconcile logic protects in-progress local edits during sync/import.
- Guardrails:
  - Avoid removals that strand historical payload formats without a migration path.
  - Prefer explicit fallback behavior over hard failures for recoverable payload issues.

## 4. Async Asset Transparency
- Intent: users should understand when file/image-backed content is still processing.
- Pattern:
  - File/image lifecycle states are reflected in behavior and persistence timing.
  - Export/share should avoid presenting unfinished asset states as final.
- Guardrails:
  - Do not treat async file availability as purely visual; it is part of product correctness.

## 5. Safe Collaboration Semantics
- Intent: collaborative edits feel live while personal undo/redo remains trustworthy.
- Pattern:
  - Remote updates flow in near real time with collaborator presence.
  - Remote/init updates are not captured as local undo history.
- Guardrails:
  - Any changes in sync/update APIs must preserve local history expectations.
  - Conflict-resolution behavior should prefer convergence without surprising destructive overrides.

## 6. Progressive Capability Layers
- Intent: advanced features extend core editing instead of replacing it.
- Pattern:
  - Core drawing/editing remains usable without external services.
  - Service-gated features (AI, hosted share/collab backends) degrade safely if unavailable.
- Guardrails:
  - Feature failure must not block baseline drawing, import, or export flows.
  - Keep app-specific integrations isolated from package-level core behavior.

## 7. Integrator Control Surface
- Intent: hosts can adapt Excalidraw without forking internals.
- Pattern:
  - Public props/events/API provide extension points for lifecycle, export, and state observation.
  - UI customizations should use documented hooks before internal overrides.
- Guardrails:
  - Avoid introducing product behavior that requires undocumented deep imports for common host needs.

## Related Docs
- `docs/product/prd/core-editor-experience.md`
- `docs/product/domain-glossary.md`
- `docs/product/feature-catalog.md`
