# Error Handling

**Status:** Active

---

## Overview

Excalidraw's error handling strategy combines a React Error Boundary for unhandled render failures, Sentry for production observability, and graceful UI degradation for network/storage loss. There are no circuit breakers or retry loops — failures surface to the user via UI state indicators and the app falls back to offline mode.

---

## React Error Boundary

**File:** `excalidraw-app/components/TopErrorBoundary.tsx`

`TopErrorBoundary` wraps the entire application tree and catches unhandled render errors. On catch it:

1. Captures the exception in Sentry with component stack context.
2. Displays a fallback UI with a GitHub issue template pre-filled with the localStorage snapshot.
3. Exposes the Sentry event ID for support correlation.

---

## Sentry Integration

**File:** `excalidraw-app/sentry.ts`

- Enabled only in production and staging builds (disabled via `VITE_APP_DISABLE_SENTRY=true` in Docker).
- `beforeSend()` hook sanitises `event.request.url` by stripping the fragment (which contains the encryption key) before sending to Sentry. **Limitation:** only `event.request.url` is sanitised; other URL-like fields on the event (e.g. breadcrumb URLs) are not modified.
- Known benign errors are suppressed via `ignoreErrors`:
  - Safari runtime quirks
  - IndexedDB close events
  - Storage quota exceeded
  - Dynamic import failures in private browsing
- Release is tagged with `VITE_APP_GIT_SHA` for source-map correlation.

---

## Graceful Degradation

There are no circuit breakers or retry logic within the client for Firebase or Socket.IO failures. Connection loss is surfaced to the user via UI state indicators and the app degrades gracefully to offline mode, relying on the layered persistence strategy (localStorage / IndexedDB) to preserve work.

---

## Related Documentation

| Document | Location | Relationship |
|---|---|---|
| **System Patterns** | [`docs/memory/systemPatterns.md`](../memory/systemPatterns.md) | Broader pattern catalogue; error handling fits within the client-side resilience patterns |
| **Technical Architecture** | [`docs/technical/architecture.md`](./architecture.md) | Full system design including the offline-first storage strategy that underpins graceful degradation |
