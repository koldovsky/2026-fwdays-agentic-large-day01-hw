# Active Context — Excalidraw

> **⟳ Living Document** — Review and update this file **weekly** as a team.
> Audience: Developers, QA, DevOps, Product Managers.
> Last updated: **2026-03-28** · Owner: Yevhen Moskalov

---

## 1. Introduction

This file is a living record of the **current project context** for the Excalidraw monorepo. It captures the most recent and relevant information that influences day-to-day development, debugging, and decision-making. Use it to:

- **Onboard** new contributors quickly without archaeology through git history.
- **Debug** by knowing what changed recently and what the known failure modes are.
- **Align** across teams (frontend, QA, DevOps, product) on the current state of the project.

It complements the static reference docs in `docs/memory/` (see `techContext.md`, `systemPatterns.md`, `decisionLog.md`) and the extended product and technical docs in `docs/product/` and `docs/technical/`. Those describe *what the system is*; this document describes *what is happening right now*.

---

## 2. Recent Changes

> Sorted newest-first. All changes below are relative to the divergence from `origin/master` (~2026-03-24).

| Date | Change | Author |
|---|---|---|
| 2026-03-28 | Added `docs/memory/decisionLog.md` — catalogues all undocumented behaviors, implicit state machines, and technical debt annotations (`HACK`/`FIXME`/`TODO`) across `excalidraw-app/` and `packages/`. | Yevhen Moskalov |
| 2026-03-28 | Added `docs/product/PRD.md` — formal product requirements document including features, user roles, and acceptance criteria. | Yevhen Moskalov |
| 2026-03-28 | Added `docs/technical/dev-setup.md` — step-by-step developer onboarding guide covering installation, env vars, and local run configuration. | Yevhen Moskalov |
| 2026-03-28 | Added `docs/product/domain-glossary.md` — canonical glossary of Excalidraw-specific terms and concepts. | Yevhen Moskalov |
| 2026-03-28 | Added `docs/technical/architecture.md` — comprehensive system design doc covering component topology, data flows, and deployment targets. | Yevhen Moskalov |
| 2026-03-28 | Added `docs/memory/techContext.md` — technology stack reference (React 19, TypeScript 5.9.3, Vite 5, Jotai 2.11, Vitest). | Yevhen Moskalov |
| 2026-03-28 | Added `docs/memory/systemPatterns.md` — documents core architectural patterns (hybrid Jotai + React state, immutable scene store, Store-delta sync, etc.). | Yevhen Moskalov |
| 2026-03-28 | Added `docs/memory/productContext.md` — documents vision, personas, key workflows, and data flow diagrams. | Yevhen Moskalov |
| 2026-03-28 | Added `docs/memory/projectbrief.md` — project-level objectives, scope, and success criteria. | Yevhen Moskalov |
| 2026-03-24 | Added `.cursorignore` to reduce noise in AI-assisted editing sessions. | koldovsky |
| 2026-03-24 | Baseline application state (`initial` / `updates` commits): full Excalidraw monorepo at `origin/master`. | koldovsky |

**Notable:** This sprint was primarily a **documentation sprint** — no production code changes were introduced. All commits above are documentation-only additions to `docs/`.

---

## 3. Ongoing Work

### Active

- **Documentation layer build-out** *(in progress)*
  - All core memory docs (`projectbrief`, `productContext`, `systemPatterns`, `techContext`, `decisionLog`) have been created in this sprint.
  - `activeContext.md` (this file) is the final planned doc in the memory layer.
  - `docs/scopes/` already contains `application.scope.md`, `packages.scope.md`, and `project.scope.md` (Repomix-generated scope snapshots).

### Planned / Not Yet Started

- **Technical debt remediation** — `decisionLog.md` surfaced multiple `FIXME`/`TODO` items (see §4 and §5 below). No tickets yet assigned; prioritization needed.
- **`Scene.getScene()` singleton removal** — tracked as a TODO by `dwelle` and `mtolmacs` inside `packages/element/src/elbowArrow.ts`. Requires broader refactor of element-to-scene lookup.
- **Library localStorage migration adapter cleanup** — migration adapter shipped `2024-03-11`; the `// TODO maybe remove this in several months` comment is now >1 year overdue.

### Dependencies & Blockers

- Collaboration server (Socket.IO relay), Firebase project, and AI API endpoint are **externally operated** — any work on real-time or cloud features requires coordination with those service owners.
- The `packages/` build order (`common → math → element → excalidraw`) is a hard dependency: running `yarn build:packages` must complete before `excalidraw-app` can build.

---

## 4. Known Issues & Incidents

| ID | Issue | Impact | Status | Notes |
|---|---|---|---|---|
| KI-001 | `isElementInFrame` is O(n) — iterates all elements per call with no cache | **High** — render jank / frame drop in scenes with 500+ elements in frames (drag ops worst case) | Open / No fix scheduled | `packages/element/src/frame.ts` line 752. Marked `// TODO: this a huge bottleneck for large scenes, optimise` |
| KI-002 | `UIOptions` normalization creates a new object on every parent render, busting memoization for all memoized toolbar/panel children | **Medium** — unnecessary re-renders in high-frequency scenarios (collab, animations) | Open | `packages/excalidraw` — FIXME comment. Incorrect memoization boundary. |
| KI-003 | Theme change detection is piggybacked on element-mutation Store listener, causing thousands of spurious theme comparisons per session | **Medium** — performance regression in text-heavy sessions; also causes a brief visual flash if theme changes with no concurrent mutations | Open | Workaround for missing Store event type. FIXME comment in source. |
| KI-004 | `isSomeElementSelected` utility holds global state that should be instance-scoped | **Low–Medium** — breaks isolation between multiple `<Excalidraw />` instances on same page | Open | `packages/element/src/selection.ts` line 138 — FIXME: `move this into the editor instance to keep utility methods stateless` |
| KI-005 | `LocalData.pauseSave("collaboration")` may not resume on error paths during collab startup | **Medium** — if collaboration startup throws mid-sequence, auto-save remains paused indefinitely for the session | Open | `excalidraw-app/collab/Collab.tsx` — no `try/finally` guard |
| KI-006 | Element deletion during delta-sync sets `isDeleted: true` and tracks `originalText`, which is acknowledged as a design violation breaking versioning | **Medium** — can cause stale data in collaborative sessions | Open | `// TODO: we should not do this since it breaks sync / versioning` |
| KI-007 | `positionElementsOnGrid` is acknowledged as low-quality (`// TODO rewrite (mostly vibe-coded)`) | **Low** — potential correctness issues in grid snapping edge cases | Open | `packages/element/src/` |

---

## 5. Recent Debugging Insights

### Collaboration State is Implicit — No Single State Object

Discovered while documenting `decisionLog.md`. The collaboration session lifecycle in `excalidraw-app/collab/Collab.tsx` has **no explicit state machine**. Session state is inferred from a combination of:
- Jotai atoms: `isCollaboratingAtom`, `collabErrorIndicatorAtom`
- Instance flags: `portal.socketInitialized`, `socketInitializationTimer`, `fallbackInitializationHandler`

**Key non-obvious transition:** `CONNECTING → CONNECTED` is gated on `portal.socketInitialized = true`, which is set inside `initializeRoom()`. This is triggered by three paths:
1. **Primary:** the `"first-in-room"` socket event.
2. **Fallback 1:** a `"connect_error"` socket event listener (`fallbackInitializationHandler`).
3. **Fallback 2:** `socketInitializationTimer` firing `fallbackInitializationHandler` after `INITIAL_SCENE_UPDATE_TIMEOUT` ms — guards against joining a non-empty room that never emits `"first-in-room"`.

`portal.socketInitialized` is the authoritative gate (checked at lines 585 and 976), but it has multiple setter paths — debugging a silent "connected but not initialised" state requires checking all three triggers.

**`restoreElements()` order matters:** It runs *before* reconciliation (not after), because running it post-reconciliation regenerates ephemeral state like `appState.newElement`, breaking in-progress drawing strokes.

### Touch/Wheel Event Listener Placement is Non-Negotiable

`touchstart` and `wheel` events must be attached in the **canvas ref callback** (not `componentDidMount` or `useEffect`). React 17+ makes all event listeners passive by default, preventing `preventDefault()`. The ref callback fires synchronously and is the only safe attachment point. Deviating from this pattern will silently break pinch-zoom and scroll prevention on mobile/trackpad.

### Bind Mode Timer — Hidden Timing Risk

The `bindModeHandler` in `App.tsx` is a bare `setTimeout` stored as an instance property (`BIND_MODE_TIMEOUT = 700ms`, defined in `packages/common/src/constants.ts`). The `bindMode` state has three values: `"orbit"` (hovering near a bindable element), `"inside"` (bound), and `"skip"` (binding suppressed). The timer drives the transition from `"orbit"` → `"inside"` — i.e., it gates *entering* bind, not exiting it.

Under GC pauses or heavy CPU load, the timer fires late, potentially binding an arrow to an unintended target. Several partial mitigations exist in the `effector` callback: it re-fetches `hoveredElement` from `lastPointerMoveCoords` at execution time (not from when the timer was set), checks `bindMode !== "skip"` before acting, and asserts `selectedLinearElement.elementId === arrow.id` via `invariant`. The timer is also cancelled via `clearTimeout` if the pointer leaves the bindable element before it fires. Despite these guards, the time-driven nature of the transition remains a latent debugging hazard under load.

---

## 6. Team Knowledge & Decisions

| Date | Decision | Rationale | Owner |
|---|---|---|---|
| (pre-existing) | **Jotai over Redux** for state management | Eliminates boilerplate; atomic granularity avoids over-renders; `jotai-scope` isolates multiple `<Excalidraw />` instances | Core team |
| (pre-existing) | **No SSR — client-side only** | Canvas API and Web Crypto API are browser-only; SSR adds complexity with no benefit | Core team |
| (pre-existing) | **Servers act as dumb relays** — all encryption and reconciliation on the client | Security: servers never see plaintext diagram data; simplifies backend ops | Core team |
| (pre-existing) | **Two-canvas architecture** — `StaticCanvas` (scene) + `InteractiveCanvas` (selection/cursors) | Avoids repainting the full scene on every cursor move or selection change | Core team |
| (pre-existing) | **Immutable element snapshots + delta increments** in the Store | Enables undo/redo, conflict-free reconciliation, and efficient collab sync | Core team |
| (pre-existing) | **Offline-first** — localStorage + IndexedDB as primary persistence | App must be fully functional without network; cloud is additive | Core team |
| 2026-03-28 | **Documentation sprint before feature work** — build a full memory layer before resuming feature development | Reduces onboarding friction and surfaces hidden assumptions before new changes layer on top | Yevhen Moskalov |

---

## 7. Configuration & Environment Notes

See the [`docs/technical/dev-setup.md`](../technical/dev-setup.md) for detailed local development environment configuration.

### Known Environment Caveats

- **Firebase emulator not configured** — local dev hits the real Firebase project unless manually overridden. Avoid destructive operations on shared rooms during dev.
- **Collaboration server is external** — there is no local collab server setup in this repo. Real-time collab features require a running Socket.IO relay.
- **Docker build slow on M-series Macs** — the `delegated` volume mount mitigates I/O overhead but initial `yarn install` inside the container can take 3–5 min.
- **PWA service worker** — disabled in dev (`vite-plugin-pwa` dev mode). Enable explicitly if testing offline behaviour.

---

## 8. Monitoring & Observability Alerts

> ⚠️ No active production monitoring dashboards are configured in this repository. The following are **known risk areas** to watch:

- **Large scene performance** — `isElementInFrame` O(n) scan (KI-001). Watch for frame drop reports from users with complex, frame-heavy diagrams. No dashboard metric exists yet.
- **Collaboration error rate** — `collabErrorIndicatorAtom` drives the in-app error badge. Sentry integration (`excalidraw-app/sentry.ts`) is opt-in and may be disabled in some environments.
- **Auto-save silent pause** (KI-005) — if users report "my work wasn't saved" after a failed collaboration attempt, the `pauseSave` leak is the first suspect.
- **Firebase quota** — shared Firebase project used across local dev and production. Monitor usage if load testing or running automated tests against the real project.

### Recommended Future Alerts

- [ ] Error rate on `portal.socketInitialized` timeout (collab connect failures)
- [ ] P95 render time on scenes > 200 elements
- [ ] Failed `saveCollabRoomToFirebase` calls (silent data-loss risk)

---

## 9. Upcoming Work & Roadmap

> Items are directional — not yet formally scheduled. Derived from `decisionLog.md`, `PRD.md`, and open TODOs in code.

### Near-Term (next sprint)

- **Prioritize and ticket the technical debt** surfaced in `decisionLog.md` — at minimum assign owners to KI-001 through KI-007.
- **Remove the library migration adapter** (overdue since 2024-03-11; KI-007 equivalent in `excalidraw-app/App.tsx`).
- **Review `Scene.getScene()` removal plan** with `dwelle` / `mtolmacs` — this is a prerequisite for several element-layer cleanups.

### Medium-Term

- **`isElementInFrame` optimisation** (KI-001) — introduce a spatial index or dirty-flag cache for frame membership lookups.
- **`UIOptions` memoization fix** (KI-002) — move normalization to a stable `useMemo` or factory outside the render cycle.
- **Explicit collaboration state machine** — consider introducing an `xstate` machine or equivalent to replace the implicit atom + flag approach in `Collab.tsx`.
- **Store event system expansion** — add discrete theme-change events to avoid the mutation-listener workaround (KI-003).

### Longer-Term / Strategic

- **Package versioning** — move `@excalidraw/common`, `@excalidraw/element`, `@excalidraw/math`, `@excalidraw/utils` to independent semantic versioning for downstream consumers.
- **AI feature maturation** — TTD (Text-to-Diagram) and Diagram-to-Code are early-stage; roadmap includes improving Mermaid auto-fix reliability and expanding AI chat history persistence.
- **Accessibility audit** — formal WCAG 2.1 AA pass across the canvas interactions and toolbar.

---

## 10. Action Items

| # | Action | Owner | Priority | Status |
|---|---|---|---|---|
| A-01 | Triage `decisionLog.md` findings into GitHub issues with owners and milestones | Tech lead | 🔴 High | Open |
| A-02 | Remove overdue library migration adapter (`migrationAdapter: LibraryLocalStorageMigrationAdapter`) — shipped 2024-03-11 | TBD | 🔴 High | Open |
| A-03 | Add `try/finally` guard around `LocalData.pauseSave` in `Collab.tsx` startup to prevent save-lock on error | TBD | 🟠 Medium | Open |
| A-04 | Profile and benchmark `isElementInFrame` on a 500+ element scene; establish a performance budget | TBD | 🟠 Medium | Open |
| A-05 | Clarify Firebase environment separation — ensure local dev does not hit the production Firebase project | DevOps | 🟠 Medium | Open |
| A-06 | Set up Sentry alerts for collab error rate and auto-save failures in production | DevOps | 🟡 Low | Open |
| A-07 | Schedule review of `Scene.getScene()` removal plan with `dwelle` / `mtolmacs` | Tech lead | 🟡 Low | Open |
| A-08 | Confirm this `activeContext.md` is reviewed and updated each week in team sync | All | 🟡 Low | Open |

---

## 11. Related Documentation

| Document | Location | Relationship |
|---|---|---|
| **Product Requirements Document** | [`docs/product/PRD.md`](../product/PRD.md) | Canonical product feature specs and acceptance criteria; reference when assessing impact of active changes on feature contracts |
| **Domain Glossary** | [`docs/product/domain-glossary.md`](../product/domain-glossary.md) | Authoritative terminology reference; use when documenting issues, decisions, or change descriptions in this file |
| **Technical Architecture** | [`docs/technical/architecture.md`](../technical/architecture.md) | Full system design; consult when an ongoing change touches data flows, storage layers, collaboration, or the rendering pipeline |
| **Developer Setup Guide** | [`docs/technical/dev-setup.md`](../technical/dev-setup.md) | Local environment setup and troubleshooting; relevant for the environment config entries in §6 |

---

> 📌 **Reminder:** This file should be reviewed and updated **every week** during team sync. Stale context is worse than no context — if something changes, update it immediately.
