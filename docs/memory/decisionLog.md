# Decision Log

## ADR-001: Keep A Monorepo With App Plus Publishable Packages

### Context

- The hosted app and the embeddable package share most core editor behavior.
- Separate repositories would increase drift in types, exports, examples, and build tooling.

### Decision

- Keep the web app, shared packages, examples, and release scripts in one Yarn workspace monorepo.

### Consequences

- Shared code stays close to production usage and example integrations.
- Build, release, and documentation workflows must span multiple package boundaries.

## ADR-002: Use Local-First Browser Persistence As A Core Behavior

### Context

- The editor must remain useful with unreliable connectivity.
- Scene payloads and binary payloads have different storage profiles.

### Decision

- Persist scene and app state to `localStorage`, and persist larger files/library/chat payloads to IndexedDB with debounced writes.

### Consequences

- Offline editing and refresh recovery are first-class behaviors.
- Browser quota limits and cross-tab freshness arbitration become part of normal maintenance.

## ADR-003: Use Socket.IO For Live Sync And Firebase For Persisted Recovery

### Context

- Realtime collaboration needs low-latency event delivery.
- Late joiners and reconnects still need recoverable room state and file access.

### Decision

- Use Socket.IO-style live sync for active collaboration and Firebase services for persisted room scenes and file blobs.

### Consequences

- Collaboration stays responsive during active sessions.
- Correctness depends on reconciliation logic across sockets, Firestore, and Storage.

## ADR-004: Keep Encryption Client-Side For Rooms And Share Links

### Context

- Shared payloads should remain opaque to the storage backends.
- URLs already carry room/share identifiers and client-held keys.

### Decision

- Encrypt collaboration and share-link payloads client-side and store only ciphertext remotely.

### Consequences

- Privacy posture is stronger because servers do not need plaintext access.
- URL fragment handling is security-sensitive and recovery is impossible without the client-held key.

## ADR-005: Keep Product-Specific Integrations Out Of The Core Package

### Context

- The published editor package should remain reusable in third-party apps.
- Hosted-product concerns should not leak into the public package API by default.

### Decision

- Keep collaboration orchestration, Sentry, share dialogs, AI flows, and Plus hooks in `excalidraw-app`, not in `@excalidraw/excalidraw`.

### Consequences

- The npm package stays cleaner for integrators.
- Some end-to-end behaviors require reading both hosted-app and package code.

## ADR-006: Use Vite Plus PWA Caching Instead Of A Heavier Legacy Build Stack

### Context

- The app needs fast local iteration and static deployment output.
- Offline-friendly asset behavior is part of the product experience.

### Decision

- Use Vite for development/build and Workbox-based PWA support for caching.

### Consequences

- Local iteration and static deployment stay fast.
- Service-worker and chunk-cache issues remain a known operational risk.

## Undocumented Behavior Findings

- UBF-001: Deleted elements keep a tombstone retention window in collaboration paths.
- UBF-002: Local persistence and remote collaboration intentionally serialize different deletion states.
- UBF-003: Multi-tab freshness relies on timestamp heuristics instead of transactional coordination.
- UBF-004: Local file cleanup is opportunistic and age-based rather than immediate.
- UBF-005: PWA install prompt capture depends on early `beforeinstallprompt` listener registration.
- UBF-006: Same-origin self-embedding follows a different runtime path from generic iframe embedding.
- UBF-007: Clipboard-sharing failures are explicit user-facing collaboration errors.
- UBF-008: Telemetry intentionally ignores several known noisy client-side error classes.

## Related Docs

- Product rationale and user-facing requirements behind these decisions: [../product/PRD.md](../product/PRD.md)
- Terminology used across ADRs and behavior notes: [../product/domain-glossary.md](../product/domain-glossary.md)
- Structural implementation details for the decisions above: [../technical/architecture.md](../technical/architecture.md)
- Runtime caveats and hidden constraints: this section in this document.
- Operational setup impacted by build, service, and environment decisions: [../technical/dev-setup.md](../technical/dev-setup.md)