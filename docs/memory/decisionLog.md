# Decision log

Decisions inferred **only** from implementation artifacts (configs, code). No product intent beyond what code enforces.

## Related documentation

- **Product:** [PRD](../product/PRD.md), [Domain glossary](../product/domain-glossary.md)
- **Technical:** [Architecture](../technical/architecture.md), [Dev setup](../technical/dev-setup.md), [Code vs documentation](../technical/code-vs-documentation.md) — gaps between recorded decisions / architecture docs and implicit behavior in the codebase (side effects, init order, library races, HACK/FIXME semantics)

---

#### Yarn workspaces monorepo

- Context: Single root manifest lists multiple packages and apps.
- Decision: Use `yarn` workspaces spanning `excalidraw-app`, `packages/*`, `examples/*`.
- Evidence:
  - `package.json` — `"workspaces": ["excalidraw-app", "packages/*", "examples/*"]`, `"packageManager": "yarn@1.22.22"`.
- Status: Active

---

#### TypeScript path aliases for `@excalidraw/*`

- Context: Packages consumed as logical modules during dev and typecheck.
- Decision: Map `@excalidraw/common|element|excalidraw|math|utils` to `packages/...` sources via `paths`.
- Evidence:
  - `tsconfig.json` — `compilerOptions.paths` entries (~21–31).
  - `vitest.config.mts` — matching `resolve.alias` entries (~7–47).
  - `excalidraw-app/vite.config.mts` — `resolve.alias` to same package roots (e.g. ~27–77).
- Status: Active

---

#### Library packages built with esbuild (not Vite)

- Context: Publishable ESM outputs under `dist/dev` and `dist/prod`.
- Decision: Node-driven `esbuild` in `scripts/buildBase.js` / `scripts/buildPackage.js` with dev/prod defines on `import.meta.env`.
- Evidence:
  - `scripts/buildBase.js` — `require("esbuild").build`, `format: "esm"`, `buildDev`/`buildProd` (~6–44).
  - `packages/common/package.json` — `build:esm` invokes `../../scripts/buildBase.js`.
- Status: Active

---

#### App shell built with Vite

- Context: `excalidraw-app` dev server and production bundle.
- Decision: `vite` in app scripts; root delegates `start` / `build` to `excalidraw-app`.
- Evidence:
  - `excalidraw-app/package.json` — `"start": "yarn && vite"`, `"build:app": "... vite build"` (~49–48).
  - `excalidraw-app/vite.config.mts` — `defineConfig`, `@vitejs/plugin-react`, plugins (file header ~1–11).
- Status: Active

---

#### Restrict direct `jotai` imports at ESLint level; wrappers allowed

- Context: State management with Jotai across editor vs app.
- Decision: `no-restricted-imports` on package name `jotai` with message to use `editor-jotai` or `app-jotai`; wrapper modules use `eslint-disable-next-line no-restricted-imports` when importing `jotai`.
- Evidence:
  - `.eslintrc.json` — `no-restricted-imports` for `"jotai"` (~29–34).
  - `packages/excalidraw/editor-jotai.ts` — `eslint-disable-next-line no-restricted-imports` then `from "jotai"` (~1–8).
  - `excalidraw-app/app-jotai.ts` — same pattern (~1–10).
- Status: Active

---

#### Barrel import from `@excalidraw/excalidraw` restricted inside package (non-test)

- Context: Large package with `index.tsx` entry.
- Decision: ESLint override forbids importing from `@excalidraw/excalidraw` barrel for `packages/excalidraw/**/*.{ts,tsx}` (excluding tests); prefer relative paths.
- Evidence:
  - `.eslintrc.json` — `overrides` for `packages/excalidraw/**/*` with `@typescript-eslint/no-restricted-imports` patterns (~43–61).
- Status: Active

---

#### Vitest + jsdom + shared setup

- Context: Unit/integration tests without browser driver.
- Decision: `vitest` with `environment: "jsdom"`, `setupFiles: ["./setupTests.ts"]`, `sequence.hooks: "parallel"`.
- Evidence:
  - `vitest.config.mts` (~51–59).
  - `setupTests.ts` — side-effect imports and mocks.
- Status: Active

---

#### Share link encryption key in URL hash (not query) for static export

- Context: Backend returns id after POST; client builds share URL.
- Decision: Comment states hash used so key is not sent as query param to server.
- Evidence:
  - `excalidraw-app/data/index.ts` — comment `We need to store the key ... as hash instead of queryParam in order to never send it to the server` (~283–285); sets `url.hash = \`json=${json.id},${encryptionKey}\`` (~286).
- Status: Active

---

#### Root `tsc` excludes `examples` and does not emit JS

- Context: Typecheck command for repo.
- Decision: `noEmit: true`; `include` only `packages` and `excalidraw-app`; `exclude` includes `examples`.
- Evidence:
  - `tsconfig.json` — `noEmit`, `include`, `exclude` (~18, ~34–35).
- Status: Active

---

#### Firebase Storage path prefixes for collab vs share files

- Context: Upload helpers need stable prefixes.
- Decision: Constants `FIREBASE_STORAGE_PREFIXES.shareLinkFiles` and `collabFiles`.
- Evidence:
  - `excalidraw-app/app_constants.ts` — `FIREBASE_STORAGE_PREFIXES` (~32–35).
- Status: Active

---

#### Socket.IO transports websocket + polling

- Context: Collaboration client connection.
- Decision: `socketIOClient(VITE_APP_WS_SERVER_URL, { transports: ["websocket", "polling"] })`.
- Evidence:
  - `excalidraw-app/collab/Collab.tsx` (~523–526).
- Status: Active

---

#### Trade-off: duplicate alias resolution (Vite + Vitest + TS paths)

- Context: Same logical imports resolved in three configs.
- Decision: Parallel `alias` / `paths` definitions (no single shared module imported by all three verified in this scan).
- Evidence:
  - `tsconfig.json` — `paths`.
  - `vitest.config.mts` — `resolve.alias`.
  - `excalidraw-app/vite.config.mts` — `resolve.alias`.
- Status: Implicit (duplication visible; **not verified** whether intentional vs historical).
