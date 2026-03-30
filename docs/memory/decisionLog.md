## Decision 1
Decision:
- Use a **Yarn workspaces monorepo** to manage app, packages, and examples.
Context:
- Single repository includes `excalidraw-app`, `packages/*`, `examples/*` (package.json).
Alternatives:
- Separate repositories, or a single-package repo (Not found in code).
Why:
- Reason not explicitly documented.
Trade-offs:
- **Pros**: shared tooling/deps, local package development via workspace aliases.
- **Cons**: more complex dependency graph and build orchestration.

## Decision 2
Decision:
- Build the web app with **Vite**.
Context:
- App uses `vite.config.mts`, and `excalidraw-app/index.html` loads `index.tsx` as a module; scripts use `vite` (excalidraw-app/vite.config.mts, excalidraw-app/package.json).
Alternatives:
- CRA/webpack/Next-only (Not found in code).
Why:
- Reason not explicitly documented.
Trade-offs:
- **Pros**: fast dev server, modern ESM pipeline.
- **Cons**: Vite-specific plugin ecosystem and config.

## Decision 3
Decision:
- Use **hash-based links** for collaboration/share data (e.g. `#room=...`, `#json=...`).
Context:
- Collaboration regex and link generation uses `window.location.origin/pathname + #room=...` (excalidraw-app/data/index.ts).
- Share link stores key in hash “to never send it to the server” (excalidraw-app/data/index.ts).
Alternatives:
- Query params or path-based routing (Not found in code).
Why:
- Explicitly documented for share links: keep encryption key out of server requests (excalidraw-app/data/index.ts).
Trade-offs:
- **Pros**: avoids leaking encryption key via HTTP requests.
- **Cons**: hash parsing logic; limited server-side handling.

## Decision 4
Decision:
- Use **Jotai** for state management, with app/editor-specific wrappers and isolated stores.
Context:
- App wrapper exports `appJotaiStore` and hooks (excalidraw-app/app-jotai.ts).
- Editor uses `jotai-scope` isolation in `editor-jotai` (packages/excalidraw/editor-jotai.ts referenced across packages/excalidraw/*).
- ESLint forbids importing `jotai` directly; requires `editor-jotai`/`app-jotai` (.eslintrc.json).
Alternatives:
- Redux/Zustand/Context-only (Not found in code).
Why:
- Reason not explicitly documented.
Trade-offs:
- **Pros**: small, composable atoms; enforced module boundaries.
- **Cons**: requires discipline around store scoping and atom lifecycle.

## Decision 5
Decision:
- Implement scene change tracking via a **store + delta/increment model** with durable vs ephemeral updates.
Context:
- `CaptureUpdateAction` semantics and `Store` class emitting increments (packages/element/src/store.ts).
Alternatives:
- Direct state snapshots or immutable reducers only (Not found in code).
Why:
- Reason not explicitly documented.
Trade-offs:
- **Pros**: supports undo/redo and batching semantics.
- **Cons**: complexity; TODO notes indicate potential error-proneness (packages/element/src/store.ts).

## Decision 6
Decision:
- Use **Firebase (Firestore + Storage)** for collaboration/share persistence.
Context:
- Firebase initialization and operations in `excalidraw-app/data/firebase.ts`.
- Firebase rules/config in `firebase-project/*` (firebase-project/firebase.json, firebase-project/firestore.rules, firebase-project/storage.rules).
Alternatives:
- Custom backend persistence only (Not found in code).
Why:
- Reason not explicitly documented.
Trade-offs:
- **Pros**: managed realtime-capable datastore and object storage.
- **Cons**: requires Firebase config and rules management.

## Decision 7
Decision:
- Ship as a **static site** (built assets) for container deployment with nginx.
Context:
- Docker build outputs `excalidraw-app/build` and serves via `nginx:alpine` (Dockerfile).
Alternatives:
- Node server runtime (Not found in code).
Why:
- Reason not explicitly documented.
Trade-offs:
- **Pros**: simple runtime, low operational overhead.
- **Cons**: runtime configuration limited to build/env strategies.

## Decision 8
Decision:
- Add **PWA** support with runtime caching rules for fonts/locales/chunks.
Context:
- `registerSW()` (excalidraw-app/index.tsx)
- VitePWA config with runtime caching for `.woff2`, `fonts.css`, locales chunks, etc. (excalidraw-app/vite.config.mts)
Alternatives:
- No PWA/service worker (Not found in code).
Why:
- Reason not explicitly documented.
Trade-offs:
- **Pros**: offline-ish behavior and caching performance.
- **Cons**: SW caching complexity (see “FIXME” note in index.html) (excalidraw-app/index.html).

## Documentation references

**Product**

- [PRD](../product/PRD.md)
- [Domain glossary](../product/domain-glossary.md)

**Technical**

- [Architecture](../technical/architecture.md)
- [Developer setup](../technical/dev-setup.md)
- [Technical decision log](../technical/decisionlog.md)
