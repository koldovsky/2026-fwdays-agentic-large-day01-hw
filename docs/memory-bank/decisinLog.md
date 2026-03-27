# Decision Log

See [systemPatterns.md](./systemPatterns.md) for architecture and [hidden invariants](../technical/hidden-invariants.md) for source-level caveats.

## D-001 Layered Monorepo Split
- Status: accepted
- Context: the project needs a reusable editor package, internal geometry/model primitives, and a richer host app without forcing all consumers to take app-specific integrations.
- Decision: keep a layered split across `common`, `math`, `element`, `excalidraw`, `utils`, and `excalidraw-app`.
- Why: this keeps low-level logic reusable, lets the published package stay relatively host-agnostic, and confines Firebase/socket/AI concerns to the app.
- Alternatives Considered: a single package with app code mixed in; rejected because it would blur API boundaries and complicate reuse.
- Consequences: package boundaries and path aliases are part of the repo’s mental model and should be preserved during refactors.

## D-002 Store Capture Modes Drive History Semantics
- Status: accepted
- Context: the editor needs to distinguish local undoable edits from remote, initialization, and transient updates.
- Decision: use `CaptureUpdateAction.IMMEDIATELY`, `NEVER`, and `EVENTUALLY` as first-class capture modes in the store layer.
- Why: history should only record durable local edits, while remote/init changes still need snapshot updates and consumer notifications.
- Alternatives Considered: always recording every update into history; rejected because collaboration/init would pollute undo/redo and break expectations.
- Consequences: any new scene update path must choose the correct capture mode explicitly.

## D-003 Restore First, Then Reconcile, With Aggressive Migration
- Status: accepted
- Context: scenes arrive from local storage, files, backend links, and collaboration payloads across multiple historical formats.
- Decision: normalize incoming elements/app state through restore/migration helpers, repair bindings/containers/frames, and only then reconcile with current state.
- Why: it preserves backward compatibility and gives collaboration/import code a canonical shape to work with.
- Alternatives Considered: only accepting current schemas; rejected because it would strand older scenes and links.
- Consequences: restore logic is a critical compatibility layer and should be treated as high-risk.

## D-004 Collaboration Uses Encrypted Transport Plus Firebase Snapshot/File Storage
- Status: accepted
- Context: live rooms need both low-latency updates and durable recovery for late joiners and image assets.
- Decision: use websocket transport for scene/user events, encrypt room payloads, and persist room snapshots/files through Firebase-backed APIs.
- Why: websocket broadcasts provide interactivity while Firebase persistence handles recovery and file delivery.
- Alternatives Considered: purely peer-to-peer or purely server-authoritative sync; neither is reflected in the current implementation.
- Consequences: collaboration changes must account for websocket initialization, full-scene rebroadcasts, Firebase saves, and file status reconciliation together.

## D-005 Local-First Persistence Yields To Collaboration
- Status: accepted
- Context: the app restores/saves local browser state by default, but collaboration introduces a competing source of truth.
- Decision: keep the app local-first outside collaboration, pause local saves while collaborating, and sync browser tabs using storage timestamps.
- Why: this avoids accidental overwrites between local draft state and active room state.
- Alternatives Considered: writing both local and collab state simultaneously; rejected by current implementation because it risks conflicts and stale restores.
- Consequences: start/stop collaboration flows must keep browser-state versions, file storage, and scene/image statuses in sync.

## D-006 Advanced Integrations Stay App-Specific
- Status: accepted
- Context: features such as AI generation, Excalidraw+, share dialogs, and Firebase-backed services are useful but not universal.
- Decision: keep those integrations in `excalidraw-app` rather than in the base published editor package.
- Why: the core package stays embeddable with fewer assumptions, while the host app can evolve richer product flows.
- Alternatives Considered: bundling app integrations directly into the library; rejected because it would make the package opinionated and heavier.
- Consequences: future app-only product work should avoid leaking backend assumptions into the base package API.
