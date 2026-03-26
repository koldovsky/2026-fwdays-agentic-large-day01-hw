# PRD — Launch Plan

> Extracted from `docs/product/PRD.md`. See that file for goals, requirements, and open questions.

## Phases

**Phase 0 — Internal (current)**
What: Core drawing, export, local persistence, PWA offline.
Access: Engineering team only.
Gate to Phase 1: All P0 functional requirements pass QA; pointer-event latency < 200ms in CI benchmark; export round-trip test passing.
Rollback: Revert to previous commit; no external users affected.

**Phase 1 — Open beta (web app)**
What: Phase 0 + real-time collaboration, library panel, undo/redo.
Access: Public URL, no account required.
Gate to Phase 2: Time-to-first-shareable-diagram < 60s confirmed via session analytics; no critical export regression in first 72 hours.
Rollback: Feature-flag collaboration off; Phase 0 canvas remains live.

**Phase 2 — npm library GA**
What: `@excalidraw/excalidraw` published to npm with stable `ExcalidrawImperativeAPI`.
Access: All npm users.
Gate: API surface reviewed and locked; bundle size guardrail established (Q-2 resolved); integration docs complete.
Rollback: Yank package version; pin consumers to previous minor.

## Launch checklist

1. All P0 functional requirements verified by QA.
2. Pointer-event latency benchmark passing (< 200ms p95 at 500 elements).
3. Export round-trip test passing (PNG re-import fidelity 100%).
4. PWA offline mode verified in Chrome, Firefox, Safari.
5. Accessibility audit: all toolbar and dialog interactions pass WCAG 2.1 AA.
6. Q-1 (minimum browser version) resolved and documented.
7. Analytics events instrumented: `session_start`, `first_shape_drawn`, `share_link_copied`, `export_completed`.
8. Rollback plan confirmed for each phase.
9. Support team briefed on known issues (see `docs/technical/undocumented-behavior.md`).
10. `docs/product/domain-glossary.md` up to date for support and docs team.

## Communication plan

**Internal**: Engineering and design leads review PRD before Phase 0 gate. Support team briefed on known quirks (flushSync, jsdom test failures) before Phase 1. Leadership informed at Phase 2 milestone.

**External**: No press or partner announcement planned for Phase 0–1 (open-source, organic adoption). npm publish announcement via GitHub release notes and project README at Phase 2.
