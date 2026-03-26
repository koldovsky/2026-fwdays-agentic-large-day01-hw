# Progress

## Maturity snapshot

- **Monorepo:** `excalidraw-monorepo` with Yarn workspaces covering `excalidraw-app`, `packages/*`, `examples/*`.
- **Library line:** Core publishable packages share version **0.18.0** (`@excalidraw/excalidraw`, `common`, `element`, `math`).
- **Application:** `excalidraw-app` is a **Vite + React 19** SPA with PWA registration and production static export to `build/`.

_Sources:_ root `package.json`; `packages/excalidraw/package.json`; `excalidraw-app/package.json`; `excalidraw-app/vite.config.mts` (`outDir`, `VitePWA`); `excalidraw-app/index.tsx` (`registerSW`).

## Feature completeness (grounded in shipped code)

| Area | Status | Evidence |
| --- | --- | --- |
| **Editor core** | Present | `packages/excalidraw/components/App.tsx`, `actions/*`, `scene/*`, `renderer/*` |
| **History / undo** | Present | `packages/excalidraw/history.ts`, tests e.g. `history.test.tsx` |
| **Export / import** | Present | `actionExport`, `data/blob`, `data/restore`, `overwriteConfirm` flows |
| **Mermaid import** | Present | `@excalidraw/mermaid-to-excalidraw` dependency; `en.json` `mermaid` strings |
| **AI chat / TTD** | Present | `TTDDialog` components, `en.json` `chat`, `IDB_TTD_CHATS` storage key |
| **Collaboration** | Present | `excalidraw-app/collab/Collab.tsx`, `socket.io-client` dependency |
| **Shareable links & cloud hooks** | Present | `ShareableLinkDialog`, `firebase` dependency, `FIREBASE_STORAGE_PREFIXES` |
| **i18n** | Present | Large `locales/` tree + `percentages.json` |
| **Examples** | Present | `examples/with-nextjs`, `examples/with-script-in-browser` |

## Quality gates

- **Typecheck:** `yarn test:typecheck` → `tsc` (root `tsconfig.json` includes `packages`, `excalidraw-app`).
- **Lint / format:** ESLint (`test:code`), Prettier (`test:other`).
- **Tests:** Vitest (`test:app`), jsdom environment, shared aliases mirroring Vite (`vitest.config.mts`).
- **Collab tests:** `excalidraw-app/tests/collab.test.tsx` exists.

_Sources:_ root `package.json` scripts; `vitest.config.mts`; `tsconfig.json`; collab test path.

## Delivery / ops progress

- **Docker:** Multi-stage `Dockerfile` builds static assets with Node 18, serves via `nginx:1.27-alpine`.
- **Compose:** `docker-compose.yml` exposes `3000:80` with dev-oriented volume mounts for source tree.
- **CI:** `.github/workflows/build-docker.yml` builds image on `release` branch pushes; additional workflows exist under `.github/workflows/` (e.g. cancel).

_Sources:_ `Dockerfile`; `docker-compose.yml`; `.github/workflows/build-docker.yml`.

## Documentation progress

- **Package READMEs** exist under several `packages/*/README.md` (usage notes for embed, math, etc.).
- **Memory Bank** (`docs/memory/`) adds structured onboarding context; **not** part of upstream Excalidraw unless contributed back.
- **Product docs** (`docs/product/`): [`PRD.md`](../product/PRD.md), [`domain-glossary.md`](../product/domain-glossary.md).
- **Technical docs** (`docs/technical/`): [`architecture.md`](../technical/architecture.md), [`dev-setup.md`](../technical/dev-setup.md), [`decisionLog.md`](../technical/decisionLog.md) (code-level fragile behavior / markers).

_Sources:_ glob `README.md` under `packages/`; `docs/memory/`; `docs/product/`; `docs/technical/` contents.

## Gaps / unknowns (explicit)

- **No in-repo product roadmap** or release checklist for _this_ clone (homework vs fork use is external).
- **Snapshot drift:** Many `__snapshots__` files appeared modified in git status during Memory Bank update — indicates local test output differences or pending refresh; treat as **pre-merge hygiene**, not feature progress.

_Source:_ `git status` snapshot referenced in `activeContext.md`.
