# Architecture & toolchain decision log (expanded)

This file holds **full narrative** for decisions summarized in [docs/memory/decisionLog.md](../memory/decisionLog.md). Dates mark **Memory Bank capture**, not necessarily original upstream adoption.

---

## [2026-03-26] — Primary application shell: Vite SPA (not Next.js)

* **Context**: The product must ship a fast, static-friendly web editor with rich client-side behavior (canvas, input, collaboration hooks).
* **Decision**: The first-party app **`excalidraw-app`** is a **Vite 5** + **React 19** **single-page application**; **no App Router / SSR / Server Actions** on the main product path.
* **Rationale**: Client-heavy rendering and editor lifecycle fit a SPA; Vite gives fast dev feedback, explicit `VITE_*` env inlining, and a plugin ecosystem (PWA, SVGR, TS/ESLint checker) already wired in root scripts.
* **Consequences**: SEO and first-byte concerns are secondary to interactivity; server-rendered data fetching patterns (RSC, etc.) are out of scope for the host app. **Next.js 14** exists only under **`examples/with-nextjs`** as an integration sample.

---

## [2026-03-26] — Monorepo layout: Yarn 1 workspaces

* **Context**: The codebase must publish **`@excalidraw/excalidraw`** and share domain code across the app and packages.
* **Decision**: **Yarn 1** (**`yarn@1.22.22`**) **workspaces** spanning **`excalidraw-app`**, **`packages/*`**, **`examples/*`**.
* **Rationale**: Stable, simple linking for internal packages; aligns with existing scripts (`build:packages` chain, `yarn --cwd` invocations).
* **Consequences**: No npm/pnpm workspaces in use; contributors follow Yarn 1 conventions. Lockfile churn (e.g. registry URL normalization) is a known hygiene topic (see [docs/memory/progress.md](../memory/progress.md)).

---

## [2026-03-26] — Package boundaries: modular monolith

* **Context**: Editor logic, geometry, and app-only I/O must stay testable and embeddable without a single giant `src/` tree.
* **Decision**: **Split packages** — **`@excalidraw/common`**, **`element`**, **`math`**, **`utils`**, **`@excalidraw/excalidraw`** (library UI + editor), plus **`excalidraw-app`** for product shell, collab, and Firebase. **Path aliases** `@excalidraw/*` in TypeScript/Vite/Vitest.
* **Rationale**: Clear separation between domain algorithms (`element`, `math`), shared utilities (`common`, `utils`), and React-facing editor code (`packages/excalidraw`).
* **Consequences**: Build order depends on the `build:packages` sequence; cross-package APIs must stay semver-conscious for npm consumers.

---

## [2026-03-26] — TypeScript baseline

* **Context**: Large surface area and public types for library consumers.
* **Decision**: **TypeScript 5.9** with **`"strict": true`** (and shared base config); **`react-jsx`**, **ESNext** modules, **`allowJs`** at repo root where applicable.
* **Rationale**: Catch regressions early; support declaration emit for **`@excalidraw/excalidraw`** builds.
* **Consequences**: `tsc` is part of standard quality gates (`test:typecheck` / `test:all`). Some legacy JS remains allowed at root policy level.

---

## [2026-03-26] — Global and editor-adjacent state: Jotai with isolation

* **Context**: Multiple editor instances and host-injected UI need shared reactive state without a single global Redux store.
* **Decision**: **Jotai** for atomic state; **`jotai-scope`** **`createIsolation`** for **per-editor** and **tunnel-related** stores (`editor-jotai.ts`, `context/tunnels.ts`). **`excalidraw-app/app-jotai.ts`** for shell-level atoms.
* **Rationale**: Fine-grained subscriptions and scoped stores suit embeddable widgets; isolation avoids cross-instance leakage.
* **Consequences**: **ESLint** **`no-restricted-imports`** forbids importing **`"jotai"`** directly — code must use **`editor-jotai`** or **`app-jotai`**. Developers must respect store boundaries (see `library.ts` Jotai scoping notes in [docs/memory/progress.md](../memory/progress.md)).

---

## [2026-03-26] — Editor core loop: ActionManager + class `App`

* **Context**: User intents (keyboard, UI, API) must merge predictably into scene + `AppState` with traceable sources.
* **Decision**: **Command-style `Action`** objects executed by **`ActionManager`**, returning **`ActionResult`**; authoritative editor snapshot largely coordinated by a **class-based root `App`** component with **`roughjs`** and imperative hooks.
* **Rationale**: Centralized merge point for history, persistence granularity (`CaptureUpdateActionType`), and canvas lifecycle.
* **Consequences**: Heavy logic concentrates in `App` and `actions/`; functional components dominate leaf UI but must defer core mutations through actions.

---

## [2026-03-26] — Extensibility: tunnels and imperative API

* **Context**: Host apps need to inject chrome (menus, footers, dialogs) without forking the library.
* **Decision**: **`tunnel-rat`** + **`TunnelsContext`** for slot composition; **`ExcalidrawImperativeAPI`** exposed via **`ExcalidrawAPIContext`** / **`ExcalidrawAPIProvider`**; **`withInternalFallback`** for multi-instance defaults.
* **Rationale**: Decouple host UI from core layout while keeping a stable programmatic surface (`onChange`, load/export helpers).
* **Consequences**: Contributors must understand tunnel scope and provider wrapping when adding host-facing UI.

---

## [2026-03-26] — Styling: SCSS + clsx (no Tailwind / shadcn)

* **Context**: Large legacy stylesheet surface and design tokens tied to the editor chrome.
* **Decision**: **Sass** (**global and partial SCSS** under `packages/excalidraw/css` et al.) plus **`clsx`** and shared **`CLASSES`** from **`@excalidraw/common`**. **Tailwind CSS** and **shadcn** are **not** dependencies of this repo.
* **Rationale**: Consistent with existing Excalidraw styling approach; avoids migrating the entire design system to utility classes.
* **Consequences**: New UI work follows SCSS and naming conventions; no utility-first stack for rapid prototyping unless introduced later (would be a large decision).

---

## [2026-03-26] — Accessible primitives: Radix UI

* **Context**: Overlays, popovers, and dialogs need baseline accessibility behavior.
* **Decision**: **`radix-ui`** as the **component primitive** layer where used in the library.
* **Rationale**: Headless, accessible patterns without prescribing a full design system.
* **Consequences**: Version upgrades must be regression-tested around focus traps and portal behavior inside the editor.

---

## [2026-03-26] — Canvas and media stack

* **Context**: Hand-drawn aesthetic, freehand input, image handling, and text/diagram tooling.
* **Decision**: **`roughjs`**, **`perfect-freehand`**, **`pica`**, PNG chunk utilities, **`fractional-indexing`**, **`browser-fs-access`**; structured text via **CodeMirror 6** and **`@lezer/*`**; diagram import via **`@excalidraw/mermaid-to-excalidraw`**.
* **Rationale**: Match product goals (sketchy rendering, pressure-sensitive strokes, import pipelines).
* **Consequences**: Performance tuning stays sensitive to canvas and worker usage; heavy dependencies increase bundle scrutiny (size-limit tooling in package devDeps).

---

## [2026-03-26] — Persistence and collaboration without an app-owned SQL database

* **Context**: Offline-first editing, optional sync, and shared sessions.
* **Decision**: **No first-party relational DB** in-repo. Client persistence uses **`idb-keyval`** (IndexedDB); cloud paths use **Firebase 11**; realtime collaboration uses **`socket.io-client`** against configurable **`VITE_*`** backends; optional **Sentry** for errors.
* **Rationale**: Aligns with a front-end-centric repo: backends are configured via environment, not shipped as a monolithic server here.
* **Consequences**: Data model and auth rules live in Firebase/project config and external services; local-only flows must handle quota and conflict reconciliation in app code.

---

## [2026-03-26] — Testing stack: Vitest + Testing Library

* **Context**: Unit tests for React, domain packages, and canvas-using code.
* **Decision**: **Vitest** (**jsdom**, **`vitest-canvas-mock`**, **`@testing-library/react` / `dom` / `jest-dom`**) with thresholds in **`vitest.config.mts`** (e.g. lines/statements **60%**, branches **70%**, functions **63%**).
* **Rationale**: Vite-aligned test runner, fast feedback, good React Testing Library integration. **`@types/jest`** remains for typings compatibility in places; **Jest** is not the primary runner at root.
* **Consequences**: E2E/browser automation is not fully specified by this stack (see Pending Decisions in [docs/memory/decisionLog.md](../memory/decisionLog.md)).

---

## [2026-03-26] — Library distribution: dual dev/prod ESM + CSS

* **Context**: npm consumers need tree-shakeable ESM and stable styling entrypoints.
* **Decision**: **`@excalidraw/excalidraw`** **`exports`** map with **development** / **production** JS and **`index.css`**; build via **`scripts/buildPackage.js`** with declaration emit.
* **Rationale**: Smaller prod bundles while preserving debuggable dev builds.
* **Consequences**: Consumers must import the correct CSS path; internal `build:packages` order must be preserved before app/example builds.

---

## [2026-03-26] — Delivery: static hosting, Docker, and PWA

* **Context**: Deploy to CDN-style hosting and optional container images.
* **Decision**: **`vercel.json`** targets **`excalidraw-app/build`**; **Dockerfile** builds static assets and serves via **nginx**; **`vite-plugin-pwa`** (Workbox) with dev gated by **`VITE_APP_ENABLE_PWA`**.
* **Rationale**: Static export fits SPA; PWA improves offline font/locale/chunk caching where enabled.
* **Consequences**: Service worker and cache invalidation require explicit testing when releasing; Docker build uses **`yarn build:app:docker`** (Sentry disabled via env).

---

## [2026-03-26] — Quality gates: ESLint + Prettier

* **Context**: Consistent style and import hygiene across workspaces.
* **Decision**: **ESLint** (**`@excalidraw/eslint-config`**, **`eslint-config-react-app`**, **`max-warnings=0`** in `test:code`); **Prettier** with **`@excalidraw/prettier-config`**; **`lint-staged`** + **husky** for pre-commit automation.
* **Rationale**: Enforce **consistent-type-imports**, ordered imports (including **`@excalidraw/**`** grouping), and restricted patterns (e.g. Jotai import path).
* **Consequences**: CI/local `test:all` fails on warnings; contributors run `fix` scripts for bulk cleanup.

---

*Last Updated: 2026-03-26*
