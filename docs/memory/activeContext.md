# Active Context: Excalidraw

_This file updates most frequently. Reflects state as of 2026-03-25._

---

## Current Branch & Status

- **Branch**: `master`
- **Dirty files**: `yarn.lock` (modified), `docs/` and `repomix-output.xml` (untracked)
- **Recent commits**: `updates`, `check-instructions`, `initial`, `Initial`

---

## Latest Library Version

- **Released**: `0.18.0` (2025-03-11)
- **In development**: Unreleased changes on `master` (CHANGELOG `## Unreleased` section)

---

## Unreleased Changes (in progress on master)

### Breaking API Changes

- `excalidrawAPI` prop renamed to `onExcalidrawAPI`
  - Now called on mount (not constructor), and with `null` on unmount
- Deprecated UMD bundle — **ESM only** going forward (since 0.18.0)

### Available on `master` (Unreleased)

- `ExcalidrawAPI.isDestroyed` flag — throws in dev / `console.error` in prod if called after unmount
- `onMount`, `onInitialize`, `onUnmount` lifecycle props
- `api.onEvent(name, callback)` — imperative event subscription
- `ExcalidrawAPIProvider` + `useExcalidrawAPI()` — exported from package
- `useAppStateValue(prop | props | selectorFn)` hook exported
- `useOnExcalidrawStateChange(prop | props | selectorFn, callback)` hook exported
- `onExport` prop — allows host apps to delay/intercept JSON export with async work and progress reporting

---

## Recently Shipped in 0.18.0

- Command palette
- Multiplayer undo / redo
- Editable element stats
- Text element wrapping
- Font picker with extended font library
- CJK (Chinese/Japanese/Korean) font support
- Font subsetting for SVG export
- Elbow arrows
- Flowchart support
- Scene search
- Image cropping
- Element linking
- TypeScript: `"moduleResolution": "node"` / `"node10"` no longer supported — use `"bundler"`, `"node16"`, or `"nodenext"`

---

## Coding Standards (from `.github/copilot-instructions.md` on GitHub)

- TypeScript for all new code; prefer zero-allocation implementations
- Performance over memory: trade RAM for fewer CPU cycles
- Prefer immutable data (`const`, `readonly`)
- Use `?.` optional chaining and `??` nullish coalescing
- Functional components with hooks
- Keep components small and focused
- CSS modules for component styling
- `PascalCase` for components/interfaces/types; `camelCase` for vars/fns; `ALL_CAPS` for constants
- For math code: always include `packages/math/src/types.ts` and use `Point` type instead of `{ x, y }`
- After modifications: offer to run `yarn test:app` and fix reported issues

---

## Next Steps / Known Work

- Decision pending: `ExcalidrawAPI.on*` subscriptions likely to be removed in favor of `api.onEvent(name)`
- Stabilize ESM-only bundle migration (breaking for CRA users without eject/craco workaround)

---

## Key Reminders for Active Work

- Do NOT add Firebase/Socket.io to `packages/` — app-layer only
- Do NOT break SSR compatibility in packages (no top-level `window`/`document`)
- Offer to run `yarn test:app` after any changes and fix failures before finishing
- Element mutations: always use `newElementWith()` — never mutate directly
- For math: import `Point` from `packages/math/src/types.ts`

---

## Related Documents

| Document | Relevance |
|----------|-----------|
| [progress.md](./progress.md) | Full breakdown of what's shipped, in progress, and known issues |
| [systemPatterns.md](./systemPatterns.md) | Coding patterns referenced in standards (immutability, actions, state) |
| [techContext.md](./techContext.md) | CLI commands (yarn test:app, yarn fix), full stack versions |
| [projectbrief.md](./projectbrief.md) | Element model reference, monorepo layout, key files |
| [dev-setup.md](../technical/dev-setup.md) | PR workflow, pre-commit hooks, CI checks, coding standards detail |
| [architecture.md](../technical/architecture.md) | Data flow diagrams and component tree for understanding active code areas |
