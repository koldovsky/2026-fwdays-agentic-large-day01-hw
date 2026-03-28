# Project progress

This file describes **what exists in the codebase today** (implementation status), not a roadmap. **Verified against** file layout and key entry points as of the Memory Bank authoring pass.

---

## Monorepo foundation

| Item | Status | Evidence |
|------|--------|----------|
| Yarn workspaces | Done | Root `package.json` — `workspaces: ["excalidraw-app", "packages/*", "examples/*"]` |
| Shared TS paths | Done | Root `tsconfig.json` — `@excalidraw/*` → `packages/*/src` (except `excalidraw` which maps to `packages/excalidraw/index.tsx` / package root, not `src/`) |
| Tooling | Done | ESLint, Prettier, Vitest, Husky — root `package.json` `devDependencies` / `scripts` |
| Node requirement | Documented | `engines.node: ">=18.0.0"` |

---

## Packages (`packages/`)

| Package | Role | Build |
|---------|------|--------|
| `common` | Shared constants/utilities | `yarn build:common` |
| `math` | Geometry | `yarn build:math` |
| `element` | Element model, store/history | `yarn build:element` |
| `excalidraw` | Editor UI + renderer + i18n + tests | `yarn build:excalidraw` |
| `utils` | Helpers | Present under `packages/utils` |

**Dependency order** for builds: `common` → `math` / `element` → `excalidraw` (see `projectbrief.md` graph).

---

## Hosted web application (`excalidraw-app/`)

| Capability | Status | Evidence |
|------------|--------|----------|
| Vite dev/build | Done | `excalidraw-app/package.json` scripts |
| Excalidraw embed | Done | `App.tsx` — `<Excalidraw>` with children (menus, collab, share, AI) |
| Scene init from URL | Done | `initializeScene` — query `id`, `#json=`, `#url=`, collab links |
| Local persistence | Done | `data/localStorage.ts`, `data/LocalData.ts`; `STORAGE_KEYS` defined in `app_constants.ts` |
| Firebase (files / storage prefixes) | Done | `data/firebase.ts` (uses it); `FIREBASE_STORAGE_PREFIXES` defined in `app_constants.ts` |
| Real-time collaboration | Done | `collab/Collab.tsx`, `socket.io-client`, `WS_SUBTYPES` / `WS_EVENTS` |
| Share dialog + QR | Done | `share/ShareDialog.tsx`, `QRCode.tsx` |
| Sentry | Done | `index.tsx` imports `./sentry` |
| PWA / service worker | Done | `registerSW()` in `index.tsx` |
| Theming | Done | `useHandleAppTheme.ts` |
| i18n app layer | Done | `app-language/` |
| Tests (app) | Present | `excalidraw-app/tests/*.tsx` |
| Deploy config | Present | `vercel.json` — `outputDirectory: excalidraw-app/build` |

---

## Examples

| Example | Purpose |
|---------|---------|
| `examples/with-nextjs` | Next.js integration |
| `examples/with-script-in-browser` | Script / Vite browser embed (`start:example` in root scripts) |

---

## Testing and quality gates

- **Unit/integration:** Vitest across packages (large `packages/excalidraw/tests/` tree).
- **CI-style local check:** `yarn test:all` runs typecheck, eslint, prettier, and `test:app --watch=false`.

---

## Gaps / not inferable from repo alone

- **Production env vars** — backend URLs (`VITE_APP_BACKEND_V2_*`), Plus URLs, Firebase config are **environment-dependent**; see `.env*` patterns locally (not enumerated here).
- **Roadmap** — upstream Excalidraw release planning is outside this clone unless copied into issues/README.

---

## How to refresh this document

After a significant feature merge:

1. Scan `excalidraw-app/` for new folders or top-level components.
2. Check root `package.json` for new workspaces or scripts.
3. Update the tables above in one pass to avoid drift.
