# Excalidraw — Active Context

## Current State

This repository is a fork of the main Excalidraw project, used for the fwdays Agentic IDE crash course. It serves as the base for Day 1 homework: building a Memory Bank documentation framework.

## Recent Focus Areas (upstream)

- **React 19 migration** — upgraded from React 18 to React 19 with concurrent features
- **Jotai state management** — migrating from custom state to Jotai atoms for fine-grained reactivity
- **Elbow arrows** — sophisticated auto-routing arrow system (`elbowArrow.ts`, 64KB)
- **Frame system** — artboard-like containers for grouping and exporting sections
- **Embeddable elements** — support for embedding iframes (YouTube, websites) on canvas
- **Collaboration improvements** — delta-based sync and fractional indexing for multiplayer

## Architecture Highlights for AI Agents

- The main component `App.tsx` in `packages/excalidraw/components/` is 407KB — the largest file. Changes here require careful scoping.
- The action system in `packages/excalidraw/actions/` is the primary extension point for new features.
- Element types are defined in `packages/element/src/types.ts` and created via factories in `newElement.ts`.
- Rendering is split between `staticScene.ts` (export) and `interactiveScene.ts` (UI).
- Tests use Vitest with canvas mocking; run `yarn test:app` to execute.

## Known Constraints

- `yarn.lock` must not be manually edited
- Build must pass via `yarn build` before PR submission
- TypeScript strict mode enforced — no `any` types without justification
- i18n keys must be added for any user-visible strings (58 locales)
