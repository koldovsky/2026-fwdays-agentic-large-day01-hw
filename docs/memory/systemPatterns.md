# System Patterns: Excalidraw

**Version:** 1.0
**Date:** 2026-03-28
**Status:** Active

---

## 1. Introduction

This document captures the recurring design patterns, architectural decisions, and technical conventions used across the Excalidraw codebase. It serves as the canonical reference for:

- **Consistency** — ensuring new features align with established approaches rather than introducing ad-hoc alternatives.
- **Onboarding** — helping new engineers and contributors understand *how* the system is built, not just *what* it does.
- **Future scalability** — providing a baseline against which architectural evolution can be measured and reasoned about.

Audience: engineers, architects, and tech leads working on or integrating with the Excalidraw monorepo.

---

## 2. Architectural Style

Excalidraw is a **client-side monolithic SPA** with a thin layer of external backend integrations. It is not microservices; there is no application server in this repository.

| Dimension              | Description                                                                                                             |
|------------------------|-------------------------------------------------------------------------------------------------------------------------|
| **Rendering model**    | Single-page application (SPA) — no SSR; Vite-bundled React                                                              |
| **Deployment targets** | Web app (`excalidraw-app/`) + embeddable npm component (`packages/excalidraw/`)                                         |
| **Package topology**   | Yarn workspaces monorepo: `common → math → element → excalidraw → excalidraw-app`                                       |
| **External backends**  | Firebase (persistence), Socket.IO server (collab relay), AI API (TTD), Sentry (errors) — none of these are in this repo |
| **Offline capability** | Full offline-first; localStorage + IndexedDB ensure zero-network operation                                              |
| **Real-time**          | Collaborative sessions use a relayed WebSocket model (not peer-to-peer)                                                 |

The architecture intentionally keeps all business logic, encryption, and reconciliation on the **client**. Servers act as dumb relays or opaque storage — they never see plaintext diagram data.

---

## 3. Core Patterns

### 3.1 State Management — Hybrid Jotai + React State

Excalidraw uses a **two-tier state model**:

| Tier                      | Technology       | Scope                                      | Location                                                             |
|---------------------------|------------------|--------------------------------------------|----------------------------------------------------------------------|
| **Global UI / app state** | Jotai atoms      | Cross-component, persistent within session | `excalidraw-app/app-jotai.ts`, `packages/excalidraw/editor-jotai.ts` |
| **Component-local state** | `React.useState` | Ephemeral, UI-only                         | Per-component                                                        |

**Why Jotai?** Selected over Redux for its minimal boilerplate, atomic granularity (avoids over-rendering), and compatibility with React concurrent features. `jotai-scope` is used in `editor-jotai.ts` to isolate multiple `<Excalidraw />` instances on the same page, which is critical for the embeddable component.

**AppState vs Element State separation:**

- `AppState` — transient UI state (tool selection, zoom, scroll, open panels). Stored in Jotai atoms and selectively persisted to localStorage via `clearAppStateForLocalStorage()`.
- `Element state` — the canonical scene data. Managed by the `Store` class (`packages/element/src/store.ts`) as an immutable snapshot; never stored directly in React state.

**Anti-pattern avoided:** No Redux, no MobX, no Context-for-data (Context is used only for providing API handles, not for reactive data flow).

---

### 3.2 Scene Store — Immutable Snapshot + Increment Model

**Files:** `packages/element/src/store.ts`, `packages/common/src/versionedSnapshotStore.ts`

The scene is managed through an **immutable snapshot + named increment** pattern:

```
User interaction → App.mutateElement() → Store.capture()
                                          ├─ DurableIncrement  → undo/redo history + collab broadcast
                                          └─ EphemeralIncrement → collab cursor/idle (not stored)
```

- `StoreSnapshot` — immutable point-in-time copy of all elements and appState.
- `DurableIncrement` — a named, versioned change with a `StoreDelta` (inserted/deleted element sets). Feeds into undo/redo (`History`) and collaboration delta sync.
- `EphemeralIncrement` — transient change (cursor movement, idle status). Broadcast but not stored.
- `CaptureUpdateAction` — enum (`IMMEDIATELY` / `EVENTUALLY` / `NEVER`) that controls whether a mutation creates a durable history entry.

`VersionedSnapshotStore` (generic) provides versioned state with a `pull()` API — callers can await the next version, enabling cross-tab synchronisation without polling.

---

### 3.3 Action Pattern — Centralised Command Registry

**Files:** `packages/excalidraw/actions/`

All user-level operations are implemented as **registered actions** — pure functions with a standard signature:

```typescript
const myAction = register({
  name: "myAction",
  perform: (elements, appState, value, app): ActionResult => {
    return {
      elements: [...],
      appState: { ...appState, ... },
      captureUpdate: CaptureUpdateAction.IMMEDIATELY,
    };
  },
});
```

- **`register()`** appends the action to a global registry. The `ActionManager` discovers all registered actions at startup.
- Actions are pure: they receive current state and return a new state — no side effects inside `perform`.
- `ActionSource` (`"ui"` / `"keyboard"` / `"api"` / `"commandPalette"`) is tracked for analytics.
- The Command Palette consumes the same registry, giving all actions keyboard-searchable access for free.

This pattern enforces a single, auditable path for every state-modifying operation.

---

### 3.4 Event Bus / Emitter Pattern

**Files:** `packages/common/src/emitter.ts`, `packages/common/src/appEventBus.ts`

Two levels of event infrastructure are used:

**`Emitter<T>` (base):** Lightweight typed pub/sub. Used internally by the `Store` to emit `onDurableIncrementEmitter` / `onStoreIncrementEmitter` events to the `History` and `Collab` layers.

**`AppEventBus` (application-level):** A richer event bus with:
- **Cardinality control** — `"once"` (fires at most once) or `"many"`.
- **Replay behaviour** — `"last"` replays the most recent payload to late subscribers; `"none"` does not.
- **`await`-able events** — callers can `await appEventBus.on('eventName')` for one-time lifecycle events (e.g., app initialised).

Both buses are strictly typed — event names and payload shapes are defined in TypeScript, preventing untyped string-based event chains.

---

### 3.5 Real-Time Collaboration — Encrypted Relay Model

**Files:** `excalidraw-app/collab/Portal.tsx`, `excalidraw-app/collab/Collab.tsx`

Collaboration follows an **encrypted relay** topology:

```
Client A                    Relay Server                 Client B
  │                              │                           │
  ├── delta-diff encrypted ──►  WS relay  ──► decrypt ──►  │
  │   (only changed elements)    │             reconcile    │
  ◄── full-scene sync (20s) ────►│◄──────────────────────── │
```

Key implementation details:

- **Delta sync:** `Portal` tracks `broadcastedElementVersions` (Map<id, version>). Only elements with a higher version are included in `SCENE_UPDATE` payloads — minimising bandwidth.
- **Full-scene sync:** A `SYNC_FULL_SCENE_INTERVAL_MS = 20 000 ms` periodic broadcast acts as a safety net for dropped deltas or newly joined peers.
- **Cursor sync:** Broadcast at `CURSOR_SYNC_TIMEOUT = 33 ms` (~30 fps) as volatile (no ack required).
- **Encryption before send:** Every payload is AES-GCM encrypted on the client before being emitted to the Socket.IO server. The server stores and relays only ciphertext.
- **Collab class** orchestrates: Portal (transport), FileManager (binary files), LocalData (persistence), and Firebase (cloud backup of room state).

---

### 3.6 End-to-End Encryption

**File:** `packages/excalidraw/data/encryption.ts`

All collaboration and share-link data is encrypted **client-side before leaving the browser**:

| Property             | Value                                                      |
|----------------------|------------------------------------------------------------|
| **Algorithm**        | AES-GCM                                                    |
| **Key length**       | 256-bit                                                    |
| **IV**               | 12-byte random per message                                 |
| **Key format**       | JWK (exportable)                                           |
| **API**              | Web Crypto API (`window.crypto.subtle`)                    |
| **Key distribution** | URL fragment (`#roomId,key`) — never transmitted to server |

The server stores and relays only ciphertext. Even Firebase Firestore and Firebase Storage hold only encrypted blobs. Key loss (URL fragment cleared) means permanent data loss — this is a known, accepted trade-off for zero-trust storage.

---

### 3.7 Conflict Reconciliation — Last-Write-Wins with Nonce Tiebreaker

**File:** `packages/excalidraw/data/reconcile.ts`

Concurrent edits from multiple collaborators are resolved using a **Last-Write-Wins (LWW)** strategy with deterministic tiebreaking:

1. Every element carries `version` (monotonic integer) and `versionNonce` (random integer).
2. Remote elements are discarded (`shouldDiscardRemoteElement`) if:
   - The element is currently being edited locally (editing / resizing / new element in progress), **or**
   - The local version is strictly newer, **or**
   - Versions are equal and the local `versionNonce` is lower (deterministic winner).
3. Remaining elements (remote wins) are merged with uncontested local elements.
4. The final list is re-ordered by **fractional index** to preserve stable z-ordering across clients, and indices are validated/repaired (`syncInvalidIndices`).

This is not full OT (Operational Transformation) or CRDT, but is sufficient for the eventual-consistency requirements of a whiteboard with periodic full-scene syncs.

---

### 3.8 Data Persistence — Layered Offline-First Strategy

**Files:** `excalidraw-app/data/`

Persistence is implemented as a hierarchy of stores with different durability and capacity characteristics:

| Layer                       | Storage                         | Data                                                         | Trigger                            |
|-----------------------------|---------------------------------|--------------------------------------------------------------|------------------------------------|
| **L1 — localStorage**       | Browser localStorage (~5-10 MB) | Serialised elements + filtered AppState                      | 300 ms debounce on every change    |
| **L2 — IndexedDB**          | Browser IndexedDB (large)       | Binary file assets (images), shape library, TTD chat history | On file import / library change    |
| **L3 — Firebase Firestore** | Cloud (encrypted)               | Collaboration room scene JSON                                | On join/mutation in collab session |
| **L4 — Firebase Storage**   | Cloud (encrypted)               | Binary files for collab rooms and share links                | Throttled upload on file add       |

On load, the app hydrates from the highest available layer. Firebase is authoritative for active collab sessions; localStorage is authoritative for solo sessions.

Cross-tab synchronisation uses `BroadcastChannel` with a `SYNC_BROWSER_TABS_TIMEOUT = 50 ms` debounce, backed by `VersionedSnapshotStore` to only propagate actual changes.

---

### 3.9 API Design — Imperative React Component API

The `@excalidraw/excalidraw` npm package does not expose a REST or GraphQL API. Its public surface is a **typed React component + imperative API handle**:

```typescript
// Consumer mounts the component
const [api, setApi] = useState<ExcalidrawImperativeAPI | null>(null);

<Excalidraw excalidrawAPI={(api) => setApi(api)} />

// Then controls it imperatively
api.updateScene({ elements: [...], appState: {...} });
api.getSceneElements();
api.scrollToContent(elements, { animate: true });
api.addFiles([...]);
```

**`ExcalidrawImperativeAPI`** is the single stable public contract. All internal classes (`App`, `ActionManager`, `Store`) are private implementation details.

For out-of-tree hook access (e.g., from a parent component), `ExcalidrawAPIProvider` wraps children and exposes `useExcalidrawAPI()`.

**Package exports** follow the Node.js conditional exports standard:
```json
{
  "exports": {
    ".": {
      "development": "./dist/dev/index.js",
      "production": "./dist/prod/index.js",
      "types": "./dist/types/excalidraw/index.d.ts"
    }
  }
}
```
This provides tree-shakeable, environment-appropriate builds with full TypeScript types.

---

### 3.10 Component Composition Patterns

**Files:** `packages/excalidraw/components/`

| Pattern                                  | Usage                                                                                                                               |
|------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------|
| **React.memo + custom equality**         | Canvas components (`InteractiveCanvas`, `StaticCanvas`) to prevent re-renders on unrelated state changes                            |
| **Hooks**                                | Primary pattern for all shared logic; custom hooks (`useAppStateValue`, `useUIAppState`, `useOutsideClick`) are preferred over HOCs |
| **Jotai atoms via hooks**                | `useAtom` / `useAtomValue` / `useSetAtom` for reactive state; avoids prop drilling                                                  |
| **Compound components**                  | `Sidebar.Header`, `Sidebar.Tabs`, `Sidebar.Tab` — parent component owns layout/behaviour, consumers compose named slots             |
| **`forwardRef` + `useImperativeHandle`** | For components that need to expose DOM refs to parents (e.g., `SidebarInner`)                                                       |
| **Context (API access only)**            | `ExcalidrawAPIContext` provides the `App` instance handle — not used for reactive data                                              |

HOCs and render props are intentionally avoided. Redux `connect()` is not used anywhere.

---

### 3.11 AI / TTD Pipeline

**Files:** `packages/excalidraw/components/TTDDialog/`

The Text-to-Diagram (TTD) pipeline follows a **streaming → validate → auto-fix → render** chain:

```
User prompt
  → TTDStreamFetch (streaming fetch to external AI endpoint)
  → Mermaid syntax string (streamed)
  → mermaidValidation.ts (syntax check)
  → mermaidAutoFix.ts (LLM-assisted repair on failure)
  → @excalidraw/mermaid-to-excalidraw (conversion)
  → elements placed on canvas
  → chat history written to IndexedDB (IDB_TTD_CHATS)
```

Validation and auto-fix run on every streaming chunk completion. Chat history is persisted in IndexedDB for session continuity.

---

### 3.12 Error Handling

**Files:** `excalidraw-app/components/TopErrorBoundary.tsx`, `excalidraw-app/sentry.ts`

**React Error Boundary** (`TopErrorBoundary`) catches unhandled render errors and:
1. Captures the exception in Sentry with component stack context.
2. Displays a fallback UI with a GitHub issue template pre-filled with the localStorage snapshot.
3. Exposes the Sentry event ID for support correlation.

**Sentry** integration:
- Enabled only in production and staging builds (disabled via `VITE_APP_DISABLE_SENTRY=true` in Docker).
- `beforeSend()` hook sanitises URLs by stripping the fragment (which contains the encryption key) before sending to Sentry.
- Known benign errors (Safari runtime quirks, IndexedDB close events, storage quota exceeded, dynamic import failures in private browsing) are suppressed via `ignoreErrors`.
- Release is tagged with `VITE_APP_GIT_SHA` for source-map correlation.

There are no circuit breakers or retry logic within the client for Firebase/Socket.IO failures — connection loss is surfaced to the user via UI state indicators and the app degrades gracefully to offline mode.

---

### 3.13 Caching Strategy

Excalidraw does not use Redis or a server-side cache. Client-side caching is handled at two levels:

| Cache                      | Mechanism                                                   | Purpose                                                                                                 |
|----------------------------|-------------------------------------------------------------|---------------------------------------------------------------------------------------------------------|
| **PWA / Service Worker**   | Vite PWA plugin (Workbox)                                   | Caches the app shell and static assets for offline use and instant repeat loads                         |
| **Scene data**             | localStorage (300 ms debounced write)                       | Ensures zero data loss on unexpected browser close; acts as the L1 read cache on startup                |
| **Binary files**           | IndexedDB + TTL cleanup                                     | Content-addressed by `FileId` (hash); de-duplicated across sessions; auto-cleaned after 1 day if unused |
| **Shape library**          | IndexedDB (`IDB_LIBRARY` store)                             | Persists user library across sessions                                                                   |
| **Container layout cache** | `containerCache` (`packages/element/src/containerCache.ts`) | In-memory cache for computed text container dimensions to avoid re-measuring on every render frame      |

---

## 4. Cross-Cutting Concerns

### 4.1 Authentication & Authorization

There is **no authentication system** in this repository. This is an intentional design decision:

- The core app requires no login. User identity is ephemeral (display name stored locally).
- Collaboration room access is controlled solely by possession of the room URL (which embeds both the room ID and the encryption key in the fragment).
- Excalidraw Plus account detection uses the presence of an `excplus-auth` cookie; auth is managed entirely by the Plus backend.
- Role-based access control is out of scope for this codebase.

### 4.2 Configuration Management

All runtime configuration is supplied via **Vite environment variables** (prefixed `VITE_APP_`). There are no config files loaded at runtime — all config is baked in at build time.

| Variable                                   | Purpose                                   |
|--------------------------------------------|-------------------------------------------|
| `VITE_APP_FIREBASE_CONFIG`                 | Firebase project JSON (parsed at startup) |
| `VITE_APP_WS_SERVER_URL`                   | Socket.IO collaboration server URL        |
| `VITE_APP_AI_BACKEND`                      | AI/TTD endpoint                           |
| `VITE_APP_BACKEND_V2_GET_URL` / `POST_URL` | Scene share backend                       |
| `VITE_APP_DISABLE_SENTRY`                  | Set `"true"` to suppress error reporting  |
| `VITE_APP_ENABLE_TRACKING`                 | Opt-in analytics                          |
| `VITE_APP_GIT_SHA`                         | Injected by CI for Sentry release tagging |

Environment files: `env.development` and `env.production` at repo root. Secrets are never committed — they are injected by the deployment platform (Vercel env vars, Docker `--env-file`).

### 4.3 Internationalisation (i18n)

- Translation strings are stored as JSON in `packages/excalidraw/locales/`.
- Locale files are **lazy-loaded** at runtime (`import(`./locales/${lang.code}.json`)`) — only the active language is fetched.
- The `t("key.path")` function performs nested key lookup with English fallback.
- RTL layout is applied by setting `document.documentElement.dir` on language change.
- Translation coverage is managed via **Crowdin** (`crowdin.yml`). Languages below 85% completion are excluded from the app language list.
- `TranslationKeys` is derived from the English `en.json` shape, ensuring type-safe usage.

### 4.4 Build & Package Strategy

| Concern                    | Tool                                                                       |
|----------------------------|----------------------------------------------------------------------------|
| **App dev server & build** | Vite                                                                       |
| **Package library build**  | esbuild (via `scripts/buildPackage.js`)                                    |
| **Testing**                | Vitest (jsdom environment, `vitest-canvas-mock`)                           |
| **Type checking**          | TypeScript strict mode                                                     |
| **Package manager**        | Yarn 1.22.22 with workspaces                                               |
| **Monorepo topology**      | `common → math → element → excalidraw → excalidraw-app` (dependency order) |

Package builds produce separate `dist/dev/` and `dist/prod/` bundles selected via `package.json` conditional exports. This allows consuming applications to tree-shake dev-only code in production without `NODE_ENV` guards.

### 4.5 Deployment Patterns

| Target             | Mechanism                                                                           |
|--------------------|-------------------------------------------------------------------------------------|
| **excalidraw.com** | Vercel (configuration in `vercel.json`); CD on push to `main`                       |
| **Self-hosted**    | Docker (`Dockerfile` + `docker-compose.yml`); single-container, static file serving |
| **npm package**    | Published to npm registry on tagged release; semantic versioning enforced           |

There is no blue/green deployment or canary release infrastructure managed within this repository — that is a Vercel platform concern. Feature flags are partially implemented via `VITE_APP_ENABLE_*` build-time variables rather than runtime toggles.

### 4.6 Observability

| Concern            | Implementation                                                                                   |
|--------------------|--------------------------------------------------------------------------------------------------|
| **Error tracking** | Sentry (opt-in, production only) — captures unhandled exceptions and React boundary errors       |
| **Analytics**      | Matomo (opt-in via `VITE_APP_ENABLE_TRACKING`) — page views and action events                    |
| **Logging**        | `console.error` / `console.warn` in development; suppressed in prod where not captured by Sentry |
| **Performance**    | No structured metrics pipeline; browser DevTools and Sentry performance traces are used ad-hoc   |

There is no OpenTelemetry, Prometheus, or distributed tracing implementation. The system is client-side only, so server-side observability is a concern for the separately operated collaboration server and Firebase project.

### 4.7 Testing Strategy

- **Framework:** Vitest with jsdom environment (`vitest.config.mts`).
- **Canvas mocking:** `vitest-canvas-mock` replaces the Canvas 2D API in tests.
- **Coverage thresholds:** lines 60%, branches 70%, functions 63%.
- **Test helpers:** `UI.*` (canvas interactions) and `API.*` (imperative API calls) utilities abstract away render boilerplate.
- **External services:** Firebase and Socket.IO are mocked with `vi.mock()` in collaboration tests.
- **No e2e tests** in this repo (Playwright/Cypress absent); integration tests render the full `<Excalidraw />` component via Vitest + React Testing Library.

---

## 5. Patterns to Avoid

| Anti-Pattern                                 | Reason Avoided                                                                                                                          |
|----------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------|
| **Redux / global mutable store**             | Over-engineered for a client-side SPA with well-scoped state; Jotai provides fine-grained reactivity without action/reducer boilerplate |
| **Server-side rendering (SSR)**              | Canvas API and Web Crypto API are browser-only; SSR would require polyfills and provide no meaningful benefit for a drawing tool        |
| **Transmitting encryption keys to servers**  | Zero-trust principle; keys live only in URL fragments and are never sent to Firebase, Socket.IO relay, or any logging pipeline          |
| **Storing plaintext scene data server-side** | All server/cloud storage holds only AES-GCM ciphertext; servers are treated as untrusted relays                                         |
| **Higher-Order Components (HOCs)**           | React hooks and compound components provide the same composition without the wrapper-hell debugging issues                              |
| **Direct DOM mutation outside React**        | Canvas drawing goes through `requestAnimationFrame` + Canvas 2D API (not DOM); all React-managed UI is mutated through state only       |
| **Polling for real-time updates**            | WebSocket (Socket.IO) for collab, BroadcastChannel for cross-tab sync, and `VersionedSnapshotStore.pull()` replace all polling patterns |
| **Synchronous encryption**                   | All crypto operations use the async `window.crypto.subtle` API — synchronous crypto would block the main thread                         |
| **Bundling all locales upfront**             | Locale files are lazy-loaded to avoid bloating the initial bundle; only the active locale is fetched                                    |

---

## 6. Rationale

### Why client-side-only architecture?

The product's core promise is **zero-friction, no-account, instant use**. SSR would add deployment complexity and operational cost for no user benefit. Browser APIs (Canvas, Web Crypto, IndexedDB) provide everything needed.

### Why AES-GCM with URL-fragment key distribution?

URL fragments are not included in HTTP requests and are never sent to servers. This provides end-to-end encryption without any key management infrastructure. The trade-off (permanent data loss on key loss) is accepted because the target use case is ephemeral collaboration, not long-term document storage.

### Why LWW reconciliation instead of CRDTs?

Full CRDT convergence for rich canvas elements (geometry, styles, z-order, groups) would require significantly more complex element representation and larger payloads. The 20-second full-scene sync provides a safety net that makes LWW sufficient for the expected usage patterns (short-lived collaborative sessions with eventual consistency needs).

### Why Jotai over Redux or Zustand?

Jotai's atomic model aligns with how Excalidraw's state is actually shaped — many independent, fine-grained UI booleans (panelOpen, editingElement, activeToolType, etc.) that should not trigger global re-renders when one changes. `jotai-scope` solves multi-instance isolation elegantly.

### Why the Action registry pattern?

Centralising all mutations through registered actions gives a single, auditable code path for every state change. It also enables the Command Palette to discover all actions dynamically without a separate registry, and makes undo/redo capture consistent (via `CaptureUpdateAction`).

### Why a separate element `Store` instead of React state?

The scene can contain hundreds of elements. Storing them in React state would cause re-renders on every canvas pointer event. The `Store` pattern decouples the mutable scene from the React render cycle — renders are driven by explicit `updateScene()` calls, not by React reconciliation.

---

## 7. Future Considerations

| Consideration                                      | Context                                                                                                                                                                                                |
|----------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **CRDT-based collaboration**                       | As canvas complexity and session sizes grow, CRDT (e.g., Yjs) could replace the LWW reconciliation algorithm and eliminate the need for periodic full-scene syncs                                      |
| **Server-side rendering for SEO / share previews** | Adding a lightweight SSR layer (e.g., Next.js or Astro for the marketing/share-preview pages) without touching the canvas runtime                                                                      |
| **Runtime feature flags**                          | Move from build-time `VITE_APP_ENABLE_*` flags to a runtime feature flag service (e.g., LaunchDarkly, GrowthBook) to enable gradual rollouts without redeployment                                      |
| **Backend storage abstraction**                    | The current Firebase coupling could be replaced by a storage interface (already partially abstracted in `excalidraw-app/data/firebase.ts`) to support alternative backends (S3, Supabase, self-hosted) |
| **Structured observability**                       | Introducing OpenTelemetry client-side spans for canvas render latency, collaboration sync latency, and AI TTD pipeline duration                                                                        |
| **Web Workers for heavy computation**              | Offloading reconciliation, encryption, and Mermaid-to-Excalidraw conversion to a dedicated Web Worker thread to keep the main thread free for rendering                                                |
| **PWA background sync**                            | Using the Background Sync API to queue Firebase writes when offline and flush on reconnect, reducing data loss risk during intermittent connectivity                                                   |
| **Sidecar pattern for AI features**                | Containerising the AI/TTD proxy as a sidecar alongside the Docker deployment, enabling self-hosted users to run the full feature set without an external AI API contract                               |
| **Micro-frontend / module federation**             | If the Excalidraw Plus team needs to inject UI surface into the open-source shell without forking, Webpack/Vite Module Federation could provide a clean boundary                                       |

---

## 8. Related Documentation

| Document | Location | Relationship |
|---|---|---|
| **Technical Architecture** | [`docs/technical/architecture.md`](../technical/architecture.md) | Full system design document; the patterns described here are grounded in the architectural decisions and component topology detailed there |
| **Product Requirements Document** | [`docs/product/PRD.md`](../product/PRD.md) | Product requirements that shaped specific architectural choices — e.g., the offline-first storage pattern, E2E encryption design, and embeddable component API surface |
