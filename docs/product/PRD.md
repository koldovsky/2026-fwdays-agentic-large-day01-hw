# PRD — Excalidraw (repo scope)

This PRD describes the product and requirements **within the scope of this repository**: the web app (`excalidraw-app/`) and the embeddable React package (`packages/excalidraw` → `@excalidraw/excalidraw`).

---

## Product goal

- **Primary goal**: give users a **fast way** to sketch diagrams/ideas in the browser with a hand‑drawn look, with **sharing and real-time collaboration**.
- **Secondary goal (B2D)**: provide developers with a **ready-to-embed editor** as a React component, so they can integrate Excalidraw into their own apps.

---

## Target audience

- **End users (web app)**:
  - People who want to quickly visualize ideas/diagrams on a canvas.
  - Teams co-editing the same scene (collaboration).
- **Developers / integrators (library)**:
  - Teams embedding `<Excalidraw />` into React products (including SSR frameworks via client-only rendering).

---

## Key features (product capabilities)

### Scene editing (core editor)

- **Canvas editor**: an interactive canvas rendering scene elements and the editor UI state.
- **Tools**: the core creation/editing tools (selection, shapes, text, draw, eraser, hand, frame, laser, etc.).
- **Elements & Scene model**:
  - Elements (`ExcalidrawElement` and subtypes) as serializable entities for persistence/export/collaboration.
  - `Scene` as the container for current elements, maps, and selection caches.
- **Actions**: a command/action as a unit of behavior (UI/keyboard/context-menu/API) able to modify elements/appState/files.

### Collaboration & presence

- **Realtime co-editing**: syncing elements between room participants.
- **Presence**: cursor/laser, idle/active status, visible scene bounds, and “follow user” flows.
- **Files in collaboration**: image/file syncing and uploading (via the app shell).

### Library (reusable assets)

- **Library items**: saving groups of elements as reusable templates.
- **Import/merge/persist**: library updates (merge/replace), integration with a host persistence adapter, optional migrations from legacy stores.

### Sharing / export / integration

- **Export/share flows (app shell)**: UX for sharing a scene and entering collaboration (via `excalidraw-app`).
- **Embeddable API**: the imperative API (`onExcalidrawAPI`, `updateScene`, `updateLibrary`, callbacks `onChange`, `onIncrement`, etc.) for integrators.
- **SSR framework support**: guidance for client-only rendering (e.g. Next.js via dynamic import with `ssr: false`).

### Delivery / offline-ish behavior

- **PWA (app)**: caching assets/locales/fonts for faster loads and more “offline-friendly” behavior.
- **Bundle optimization**: manual chunk splitting for locales/heavy deps to improve initial load.

---

## Technical constraints

### Non-goals

- **No built-in backend / SSR**: this repo does not ship a server-side rendered app or a general-purpose backend service.
- **No hosted persistence guarantee**: not responsible for running/hosting a durable database for users’ scenes outside the app’s integrations.
- **No hosted realtime guarantee**: not responsible for running/hosting websocket/realtime infrastructure; collaboration depends on external services.
- **No first-party auth service**: not a built-in authentication/authorization provider (integrators choose their own identity/access model).
- **No official native mobile app**: mobile support is via the web app (PWA/browser), not a dedicated iOS/Android client.
- **Not a general-purpose CMS**: not intended to be a content management system for websites or documents.
- **No plugin marketplace**: not a platform for third-party plugins/extensions with an official marketplace and compatibility guarantees.

### Repository / build / platform

- **Frontend-first**: the web app builds to **static assets** and can be served via nginx; a backend is not a primary deliverable of this repository.
- **Monorepo**: Yarn workspaces with shared internal packages (`packages/common`, `packages/element`, `packages/math`, `packages/utils`).
- **Node.js**: minimum **Node >= 18**.
- **Package manager**: **Yarn 1.x** (pinned as `yarn@1.22.22`).
- **TypeScript**: used across the repo; typecheck exists as part of CI-like commands (`yarn test:typecheck`).
- **React/Vite**: `excalidraw-app` is a Vite SPA; the editor is shipped as a React component in `@excalidraw/excalidraw`.

### Library distribution (embeddable package)

- **ESM + exports map**: `@excalidraw/excalidraw` is distributed as ESM with an `exports` map.
- **Peer deps**: React/ReactDOM are peer dependencies (multiple major versions supported).
- **CSS requirement**: integrators must import the CSS and provide a non-zero-height container.

### Collaboration & integrations (app shell)

- **Dependency on external services**:
  - Realtime: requires a websocket server (the client uses `socket.io-client`).
  - Persistence/files: Firebase integration exists in the app shell.
- **Payload encryption**: socket payloads are encrypted/decrypted on the client (adds constraints around protocol compatibility and room key management).

### Quality & maintainability

- **Lint/format/tests**: the repo has ESLint/Prettier/Vitest and “all checks” commands (`yarn test:all`) that set the minimum quality bar for changes.
