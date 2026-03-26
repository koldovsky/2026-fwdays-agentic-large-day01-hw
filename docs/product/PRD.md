# PRD (reverse-engineered)

**Product:** Excalidraw — web diagram editor and embeddable React component, as shipped in this monorepo (`excalidraw-monorepo`).  
**Document type:** Reverse-engineered from repository structure, dependencies, and implementation (not an official product brief).

## 1. Problem statement

Users need a **fast, hand-drawn-style** diagramming tool in the browser, usable standalone or **embedded** in other products, with optional **real-time collaboration**, **export**, **offline/PWA** use, and **localization**.

## 2. Goals

| Goal | Evidence |
|------|----------|
| Rich drawing experience | Canvas editor, tools, shape library, undo/redo in `packages/excalidraw` |
| Embeddable SDK | `@excalidraw/excalidraw` package, `examples/*`, public props and imperative API |
| Standalone product | `excalidraw-app` with menus, sharing, collab, analytics |
| Performance at scale | Vite chunking (locales, Mermaid, CodeMirror), font asset strategy |
| Quality | TypeScript strict, ESLint, Prettier, Vitest + coverage thresholds, CI workflows |

## 3. Non-goals (inferred)

- **Collaboration inside arbitrary iframes** — explicitly disabled (`isRunningInIframe`) for safety and UX.
- **Single bundle for all locales** — locales split for caching; English + percentages stay in core for bootstrap/offline.

## 4. Primary personas

1. **End user (web app)** — creates diagrams, exports, may use collab and account-linked flows (Plus, Firebase-related features).
2. **Developer (embedder)** — integrates `<Excalidraw />` or script example; cares about bundle exports, React peers, and initial data APIs.
3. **Contributor** — works across workspaces; needs aliased source builds and parallel test hooks.

## 5. Functional requirements (high level)

- **F1 — Create and edit diagrams** on canvas with standard tools and library.
- **F2 — Persist and load** via files, blobs, shareable links, and backend helpers where configured.
- **F3 — Collaborate in real time** when not embedded in an iframe, with share UI and socket client.
- **F4 — Export** to images and product-specific cloud export (Plus).
- **F5 — Internationalization** with many locales and browser language detection.
- **F6 — PWA** install and offline-oriented behavior.
- **F7 — Text-to-diagram** (e.g. Mermaid) via TTD dialog.
- **F8 — Theming and accessibility-oriented UX** (theme handling, error boundaries, toasts).

## 6. Non-functional requirements

- **NFR1 — Node ≥ 18** for development and CI (`engines`).
- **NFR2 — Monorepo consistency** — Yarn workspaces, shared TypeScript base config.
- **NFR3 — Observable errors** — Sentry integration in the app layer.
- **NFR4 — Container deployment** — Docker multi-stage build serving static files with nginx.

## 7. Key user journeys

1. Open app → welcome hints on empty canvas → draw → export.
2. Open collaboration link → join session → concurrent edits (top window only).
3. Embed in host app → editor works; collab controls not active in iframe.
4. Open URL with library tokens → library merges into local shape library.
5. Developer runs `yarn start` → Vite serves app with source aliases to packages.

## 8. Dependencies on external systems

- **Optional:** Firebase, collaboration backend, Sentry DSN, Excalidraw Plus endpoints — wired in `excalidraw-app` and env-driven `VITE_*` variables (see `docs/technical/dev-setup.md`).

## 9. Success metrics (not in repo)

Production metrics are outside this codebase; engineering proxies include tests passing, coverage thresholds, and CI workflow success.

## 10. References

- `docs/memory/projectbrief.md` — scope and artifacts
- `docs/memory/productContext.md` — UX scenarios
- `docs/technical/architecture.md` — technical depth and edge behaviors
- `docs/product/domain-glossary.md` — terminology
