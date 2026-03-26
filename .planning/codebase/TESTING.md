# Testing Patterns

**Analysis Date:** 2026-03-26

## Test Framework

**Runner:**
- Vitest `3.0.6` (root `package.json`); config: `vitest.config.mts` at repository root.
- Environment: `jsdom` (`vitest.config.mts` `test.environment`).
- Globals: `describe`, `it`, `expect`, etc. are global (`test.globals: true` in `vitest.config.mts`); many files still import `vi` / `expect` explicitly from `vitest` for clarity.

**Assertion Library:**
- Vitest built-in `expect` (Jest-compatible API). `chai` appears in `devDependencies` but is not imported in test sources; use `expect`.

**DOM / React testing:**
- `@testing-library/react` with `act`, `render`, `waitFor`, `fireEvent`, `cleanup` (see `packages/excalidraw/tests/test-utils.ts`).
- `@testing-library/jest-dom` loaded from root `setupTests.ts`.

**Run Commands:**
```bash
yarn test                 # vitest (default watch)
yarn test:app             # vitest
yarn test:all             # typecheck + eslint + prettier --list-different + vitest --watch=false
yarn test:update          # vitest --update --watch=false (snapshots)
yarn test:coverage        # vitest --coverage
yarn test:coverage:watch   # vitest --coverage --watch
yarn test:ui              # vitest --ui --coverage.enabled=true
yarn test:typecheck       # tsc
yarn test:code            # eslint --max-warnings=0 --ext .js,.ts,.tsx .
yarn test:other           # prettier --list-different (non-JS globs)
```

## Test File Organization

**Location:**
- **Package integration / app behavior:** `packages/excalidraw/tests/**/*.test.{ts,tsx}` (e.g. `packages/excalidraw/tests/App.test.tsx`, `packages/excalidraw/tests/regressionTests.test.tsx`).
- **Colocated UI/unit tests:** beside components or features (e.g. `packages/excalidraw/components/dropdownMenu/DropdownMenu.test.tsx`, `packages/excalidraw/components/TTDDialog/utils/TTDstreamFetch.test.ts`).
- **Pure packages:** dedicated folders — `packages/element/tests/`, `packages/math/tests/`, `packages/utils/tests/`.

**Naming:**
- `*.test.ts` / `*.test.tsx`; optional descriptive middle (`utils.unmocked.test.ts`).

**Structure:**
```
packages/
├── excalidraw/
│   ├── tests/              # app-level suites, helpers, test-utils
│   └── components/**/**/*.test.tsx
├── element/tests/
├── math/tests/
└── utils/tests/
```

## Test Structure

**Suite Organization:**
```typescript
describe("getElementAbsoluteCoords", () => {
  it("test x1 coordinate", () => {
    const element = _ce({ x: 10, y: 20, w: 10, h: 0 });
    const [x1] = getElementAbsoluteCoords(element, arrayToMap([element]));
    expect(x1).toEqual(10);
  });
});
```
(From `packages/element/tests/bounds.test.ts`.)

**Patterns:**
- **Setup:** root `setupTests.ts` applies canvas mock, IndexedDB fake, font/canvas/DOM stubs, and `vi.mock("@excalidraw/common", …)` to replace `throttleRAF` with `mockThrottleRAF` from `packages/excalidraw/tests/helpers/mocks.ts`.
- **Render flow:** `packages/excalidraw/tests/test-utils.ts` exports `render` as `renderApp`, which uses Testing Library `render` with custom queries, seeds `GlobalTestState`, and `waitFor`s until static and interactive canvases exist and `window.h.state.isLoading` is false.
- **App harness:** `API` class in `packages/excalidraw/tests/helpers/api.ts` wraps `window.h` / `act` for scene and state updates in integration tests.
- **Sequence:** `vitest.config.mts` sets `test.sequence.hooks: "parallel"` so hooks run in parallel across suites (comment explains Vitest v2+ stack behavior).

## Mocking

**Framework:** Vitest `vi` (`vi.mock`, `vi.fn`, `vi.spyOn`, `vi.stubGlobal`, `importOriginal`).

**Patterns:**
```typescript
vi.mock("@excalidraw/common", async (importOriginal) => {
  const module = await importOriginal<typeof import("@excalidraw/common")>();
  return { ...module, throttleRAF: mockThrottleRAF };
});
```
(From root `setupTests.ts`.)

```typescript
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  headers: new Headers(),
  body: createMockStream(mockChunks),
});
```
(From `packages/excalidraw/components/TTDDialog/utils/TTDstreamFetch.test.ts`; `afterEach` restores `fetch` and calls `vi.restoreAllMocks()`.)

**Helpers:** `packages/excalidraw/tests/helpers/mocks.ts` — `mockThrottleRAF`, `mockMermaidToExcalidraw`, `mockHTMLImageElement`, etc.

**What to Mock:**
- Network (`fetch`), heavy or non-deterministic deps (Mermaid), `throttleRAF` for synchronous test behavior, font loading (`setupTests.ts` patches `packages/excalidraw/fonts/ExcalidrawFontFace`), canvas where needed (`vitest-canvas-mock` in `setupTests.ts`).

**What NOT to Mock:**
- When validating real export pipelines, use a dedicated file such as `packages/utils/tests/utils.unmocked.test.ts` (comment explains split from mocked suites).

## Fixtures and Factories

**Test Data:**
- Inline factory functions in test files (e.g. `_ce` in `packages/element/tests/bounds.test.ts`).
- `API.createElement` and related helpers in `packages/excalidraw/tests/helpers/api.ts` for Excalidraw elements.
- `reseed` from `@excalidraw/common` in `beforeEach` for deterministic randomness (e.g. `packages/excalidraw/tests/App.test.tsx`).

**Location:**
- Helpers under `packages/excalidraw/tests/helpers/` (`api.ts`, `mocks.ts`, `ui.ts`, `colorize.ts`, `polyfills.ts`); queries under `packages/excalidraw/tests/queries/`.

## Coverage

**Requirements:** Enforced thresholds in `vitest.config.mts` under `test.coverage.thresholds`: `lines` 60%, `branches` 70%, `functions` 63%, `statements` 60%. `ignoreEmptyLines: false` is set explicitly for stable metrics.

**View Coverage:**
```bash
yarn test:coverage
# HTML report emitted under coverage/ (also listed in .eslintignore)
```

**CI:** `.github/workflows/test-coverage-pr.yml` runs `yarn test:coverage` and uploads via `davelosert/vitest-coverage-report-action@v2`. `.github/workflows/test.yml` runs `yarn test:app` on push to `master`. `.github/workflows/lint.yml` runs `yarn test:other`, `yarn test:code`, `yarn test:typecheck` on pull requests.

## Test Types

**Unit Tests:**
- Math, element geometry, utilities — mostly pure functions under `packages/math/tests/`, `packages/element/tests/`, `packages/utils/tests/`.

**Integration Tests:**
- Excalidraw package: React tree + canvas + app state via `render` from `packages/excalidraw/tests/test-utils.ts` and `API` helpers.

**E2E Tests:**
- Not detected as a separate Playwright/Cypress suite in root scripts; primary coverage is Vitest + Testing Library.

## Common Patterns

**Async Testing:**
```typescript
await render(<Excalidraw />);
await waitFor(() => {
  if (!canvas) throw new Error("not initialized yet");
});
```
(Custom `render` in `packages/excalidraw/tests/test-utils.ts` already awaits initialization; additional `waitFor` used inside helpers.)

**Snapshot Testing:**
```typescript
expect(h.state).toMatchSnapshot(`[${name}] appState`);
expect(element).toMatchSnapshot(`[${name}] element ${i}`);
```
(From `packages/excalidraw/tests/regressionTests.test.tsx` and similar suites.)

**Spies:**
```typescript
const renderStaticScene = vi.spyOn(StaticScene, "renderStaticScene");
```
(From `packages/excalidraw/tests/App.test.tsx`.)

**Skipped suites:**
- Use `describe.skip` when environment lacks required APIs (e.g. PNG path in `packages/utils/tests/utils.unmocked.test.ts` notes `canvas.toBlob` in jsdom).

## Local git hooks

**lint-staged:** `.lintstagedrc.js` runs ESLint with `--fix` on staged `*.{js,ts,tsx}` (respecting ignore rules) and Prettier on staged `*.{css,scss,json,md,html,yml}`. Root `.husky/pre-commit` exists; the `yarn lint-staged` line is commented out — CI remains the main gate unless the hook is enabled locally.

---

*Testing analysis: 2026-03-26*
