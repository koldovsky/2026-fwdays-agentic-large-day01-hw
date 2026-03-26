# Decision Log

**Summary** of major **architecture and toolchain** choices (evidence: root/workspace `package.json`, `.eslintrc.json`, `vitest.config.mts`, `vercel.json`, `Dockerfile`, `packages/excalidraw/editor-jotai.ts`, `context/tunnels.ts`, and sources under `excalidraw-app/`, `packages/*`). **Entry dates** = when captured in the Memory Bank.

**Full rationale / consequences (narrative)** → [docs/technical/decision-log.md](../technical/decision-log.md). 
**Diagrams & runtime architecture** → [docs/technical/architecture.md](../technical/architecture.md). 
**Product requirements** → [docs/product/PRD.md](../product/PRD.md).

---

## Decisions (2026-03-26)

| Topic | Decision |
|--------|-----------|
| App shell | **Vite 5 + React 19 SPA** (`excalidraw-app`); no SSR/Server Actions on main path. **Next.js** only under `examples/with-nextjs`. |
| Monorepo | **Yarn 1.22** workspaces: `excalidraw-app`, `packages/*`, `examples/*`. |
| Packages | **Modular monolith**: `@excalidraw/{common,element,math,utils,excalidraw}` + app shell; `@excalidraw/*` path aliases. |
| TypeScript | **5.9**, **strict**, `react-jsx`, ESNext; `allowJs` at root policy. |
| State | **Jotai** + **`jotai-scope`** (per-editor / tunnels); **`app-jotai`** for shell. ESLint blocks direct `"jotai"` import. |
| Editor loop | **`ActionManager`** + **`Action` → `ActionResult`**; class **`App`** coordinates scene + `roughjs`. |
| Extensibility | **`tunnel-rat`** slots; **`ExcalidrawImperativeAPI`** via **`ExcalidrawAPIProvider`**; **`withInternalFallback`**. |
| Styling | **Sass + clsx** (+ **`CLASSES`**); **no** Tailwind/shadcn. |
| A11y primitives | **Radix UI** where used. |
| Canvas / media | **roughjs**, **perfect-freehand**, **pica**, **CodeMirror 6**, **mermaid-to-excalidraw**, etc. |
| Persistence | **No** in-repo SQL; **IndexedDB** (`idb-keyval`), **Firebase**, **socket.io-client**, optional **Sentry**. |
| Tests | **Vitest** + Testing Library + canvas mock; coverage floors in `vitest.config.mts`. |
| Library npm | **Dual dev/prod ESM** + **`index.css`**; `scripts/buildPackage.js`. |
| Delivery | **Vercel** static output, **Docker** + nginx, **PWA** (Workbox; dev gated by `VITE_APP_ENABLE_PWA`). |
| Quality | **ESLint** (max warnings 0 in `test:code`) + **Prettier** + **lint-staged** / husky. |

## Pending decisions

* [ ] Repo hygiene: `repomix-compressed.txt`, `yarn.lock` churn, `.cursorignore` (see `progress.md`).
* [ ] Course scope: documentation-only vs editor feature work (`progress.md`).
* [ ] E2E standard (Playwright/Cypress/…) beyond Vitest.
* [ ] Long-term collaboration backend strategy (self-hosted vs managed).

---

*Last Updated: 2026-03-26*
