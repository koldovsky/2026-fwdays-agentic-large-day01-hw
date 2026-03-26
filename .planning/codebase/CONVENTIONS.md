# Coding Conventions

**Analysis Date:** 2026-03-26

## Naming Patterns

**Files:**
- React components and screens: `PascalCase.tsx` (e.g. `packages/excalidraw/components/dropdownMenu/DropdownMenu.tsx`, `WelcomeScreen.Center.tsx`).
- Shared non-component modules: often `camelCase.ts` or domain names (`bounds.ts`, `point.ts` in `packages/element/src/`, `packages/math/src/`).
- Tests: `*.test.ts` or `*.test.tsx`; place either next to the module (`packages/excalidraw/components/dropdownMenu/DropdownMenu.test.tsx`) or under package `tests/` trees (`packages/element/tests/bounds.test.ts`, `packages/excalidraw/tests/App.test.tsx`).
- Special suffix: `*.unmocked.test.ts` when a file must run without the default module mocks (e.g. `packages/utils/tests/utils.unmocked.test.ts`).

**Functions:**
- `camelCase` for functions and methods; boolean predicates often prefixed with `is` / `has` / `get` as appropriate (e.g. `getElementBounds` in `packages/element/src/bounds.ts`).

**Variables:**
- `camelCase` for locals and parameters; `UPPER_SNAKE` for module-level constants shared across the app (e.g. `STORAGE_KEYS` imported in `packages/excalidraw/tests/test-utils.ts` from `excalidraw-app/app_constants`).

**Types:**
- `PascalCase` for types and interfaces; `Excalidraw`-prefixed element and app types live under `packages/*/src/types` and `@excalidraw/element/types` style imports.

## Code Style

**Formatting:**
- Prettier via shared config: root `package.json` sets `"prettier": "@excalidraw/prettier-config"`.
- Non-JS assets formatted with: `yarn prettier` targeting `**/*.{css,scss,json,md,html,yml}` with ignore path `.eslintignore` (see root `package.json` script `prettier`).

**Linting:**
- ESLint extends `@excalidraw/eslint-config` and `react-app`; root config: `.eslintrc.json`.
- `yarn test:code` runs `eslint --max-warnings=0 --ext .js,.ts,.tsx .` (root `package.json`).
- Package-local extensions: `packages/common/.eslintrc.json` and `packages/element/.eslintrc.json` extend `packages/eslintrc.base.json` (extra restriction: under `src/**/*.{ts,tsx}`, do not import runtime code from `@excalidraw/excalidraw`; type-only imports allowed).

## Import Organization

**Order:**
- Enforced by `import/order` in `.eslintrc.json`: groups `builtin` → `external` → `internal` → `parent` → `sibling` → `index` → `object` → `type`, with **newlines between groups** (`newlines-between`: `always-and-inside-groups`).
- `@excalidraw/**` is treated as `external` but ordered **after** other externals (`pathGroups` in `.eslintrc.json`).

**Path aliases:**
- TypeScript `paths` and Vitest aliases map `@excalidraw/common`, `@excalidraw/element`, `@excalidraw/excalidraw`, `@excalidraw/math`, `@excalidraw/utils` to `packages/*/src` or `packages/excalidraw` (see root `tsconfig.json` and `vitest.config.mts`).
- Prefer these aliases over long relative paths when importing across packages.

**Type-only imports:**
- `@typescript-eslint/consistent-type-imports` is **error**: use `import type { ... }` (or `type` modifiers) with **separate type import lines** where applicable (`fixStyle`: `separate-type-imports` in `.eslintrc.json`).

**Restricted imports:**
- Do not import from `jotai` directly; use app/editor-specific modules (message in `no-restricted-imports` in `.eslintrc.json`).
- Under `packages/excalidraw/**/*.{ts,tsx}` (excluding `*.test.*`), do not import from the `@excalidraw/excalidraw` barrel; use direct relative paths into the package (`@typescript-eslint/no-restricted-imports` override in `.eslintrc.json`).

## Error Handling

**Patterns:**
- **Exhaustive switches:** use `assertNever` from `@excalidraw/common` when a value should be `never` (implementation in `packages/common/src/utils.ts`): pass `null` as the message if you only need compile-time checking; otherwise pass a string to `throw new Error`; optional `softAssert` logs with `console.error` and returns instead of throwing.
- **Runtime invariants:** use `invariant(condition, message)` from `packages/common/src/utils.ts` (throws `Error` when condition is falsy).
- **User-facing / non-fatal paths:** some utilities use `console.warn` / `console.error` for recoverable issues (see `packages/common/src/utils.ts`).
- **Tests:** helpers may `throw new Error("not initialized yet")` inside `waitFor` predicates (e.g. `packages/excalidraw/tests/test-utils.ts`) to drive async retries.

## Logging

**Framework:** Browser `console` (`console.warn`, `console.error`) in shared utilities; no single app-wide logging abstraction detected in sampled code.

**Patterns:**
- Root `setupTests.ts` wraps `console.error` to highlight React `act()` warnings with the current test name (`expect.getState().currentTestName`).

## Comments

**When to Comment:**
- Explain non-obvious test setup, mock splits, or race-condition workarounds (e.g. comments in `setupTests.ts`, `packages/excalidraw/tests/test-utils.ts`, `packages/utils/tests/utils.unmocked.test.ts`).

**JSDoc/TSDoc:**
- Used on some exported helpers (e.g. `assertNever` in `packages/common/src/utils.ts`); not required on every symbol.

## Function Design

**Size:** Large cohesive modules exist (e.g. `packages/excalidraw/tests/helpers/api.ts`); prefer keeping new helpers focused and colocated with the feature they serve.

**Parameters:** Prefer explicit options objects for complex creation APIs (patterns in element factories imported from `@excalidraw/element` in tests).

**Return Values:** Prefer typed tuples and named types from `@excalidraw/math` and element types for geometry and scene data.

## Module Design

**Exports:** Packages expose entrypoints via `package.json` `exports` and `src/index.ts` (or `packages/excalidraw/index.tsx` for the main library).

**Barrel Files:** Avoid importing the Excalidraw package barrel from inside `packages/excalidraw` source (lint rule above); consumers use `@excalidraw/excalidraw` from apps or other packages.

---

*Convention analysis: 2026-03-26*
