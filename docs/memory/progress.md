# Project Progress

## Current status

- **excalidraw-app**: `1.0.0` (private workspace); root monorepo version unpinned.
- **Codebase**: Mature (editor, app shell, packages, examples). **Memory Bank**: evolving; keep aligned with `docs/product/*` and `docs/technical/*`.

## Layout (pointer)

No repo-root **`src/`**: app in **`excalidraw-app/`**; libraries in **`packages/<name>/`** (mostly `src/` except `packages/excalidraw` at package root). Examples under **`examples/`**. **Diagram** → [docs/technical/architecture.md](../technical/architecture.md).

## Work in progress

- [ ] Memory Bank vs root duplicates (e.g. stray `systemPatterns.md`), **yarn.lock** / **repomix** hygiene — see [activeContext.md](./activeContext.md).
- [ ] Confirm next milestone: docs-only vs feature work (course brief).

## Completed (summary)

- [x] Monorepo toolchain (Yarn, Vite 5, React 19, TS, ESLint/Prettier/Vitest).
- [x] **excalidraw-app**: shell, collab, persistence (local/Firebase), share, i18n, Sentry, AI/Plus surfaces, theme.
- [x] **packages/excalidraw**: public API, editor UI, actions, data, renderer/scene, TTD/Mermaid, tests.
- [x] **packages/{common,element,math,utils}**: shared model, geometry, utilities.
- [x] Examples (Next.js, script/browser), Docker/Vercel/PWA/Crowdin artifacts, documented quality scripts.

## Roadmap / backlog (high level)

- Deeper collab/ops hardening, performance on large scenes, a11y audits, optional E2E standardization — **when** in product scope.
- More embed recipes for integrators if needed.

## Known issues

- **Lockfile noise**: registry URL churn — verify before commit ([activeContext.md](./activeContext.md)).
- **TODO/FIXME** hotspots (non-exhaustive): `packages/common/colors.ts` (circular dep); `packages/element/store.ts`, `frame.ts`; `packages/excalidraw` (library Jotai scope, export tests, fonts); `excalidraw-app/collab/Collab.tsx` typing notes; skipped/disabled tests in `packages/element/tests/`. **Full detail** → search in source or future triage docs.

---

*Last Updated: 2026-03-26*
