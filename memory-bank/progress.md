# Progress

## Project Maturity

Excalidraw is a **mature, production open-source project** (v0.18.0 of the npm package). The core drawing engine and collaboration protocol are stable. Active development focuses on:
- AI features (TTD, Magic Frame)
- Flowchart automation
- Performance improvements for large scenes
- Excalidraw+ premium tier features

## Documentation State (Before This Sprint)

| Area | Before | After This Sprint |
|------|--------|------------------|
| Memory Bank | 3/7 files | 7/7 files ✅ |
| Technical Docs | architecture.md only | + dev-setup.md ✅ |
| Product Docs | domain-glossary.md only | + PRD.md ✅ |
| Undocumented behaviors | 0 documented | 5 documented in decisionLog.md ✅ |
| Cross-references | None | All files linked ✅ |

## Known Technical Debt in Codebase

- `customData` on elements is untyped (`Record<string, any>`) — Magic Frame uses it for generation metadata but there's no schema
- Font loading from CDN can silently fail; fallback is graceful but unobservable to users
- `APP_STATE_STORAGE_CONF` controls what gets persisted but is not publicly documented
- TTD chat history in IndexedDB has no retention/cleanup policy

## Test Coverage

- Unit tests: Vitest, focused on element manipulation, rendering, actions
- Integration tests: `excalidraw-app/tests/` covers collab flows, mobile menu, language list
- No E2E tests in the repo (Excalidraw+ likely has separate E2E suite)

## What Works Well

- Element versioning + versionNonce provides robust concurrent edit conflict resolution
- Jotai scope isolation allows multiple editors on the same page without state leakage
- The action system makes it easy to add new operations without touching core render logic
- localStorage/IDB separation means the canvas survives browser crashes

## Related Docs

- Active tasks: [`activeContext.md`](activeContext.md)
- Architecture: [`docs/technical/architecture.md`](../docs/technical/architecture.md)
