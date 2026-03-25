# Active Context

## Current Focus
This repository is being used as a learning project for the "Crash Course: Agentic IDE" course (fwdays, 2026). The focus is on understanding AI-assisted development workflows using a real-world open-source codebase (Excalidraw).

## Recent Changes (Git Log)

```text
4451b1e - updates (koldovsky)
da795d2 - check-instructions (koldovsky)
5247322 - initial (koldovsky)
a345399 - Initial (koldovsky)
```

### Latest Commit Details
- Added `.coderabbit.yaml` — CodeRabbit CI configuration for automated code review
- Added `.github/PULL_REQUEST_TEMPLATE.md` — Standardized PR template
- Updated `yarn.lock`

## Active Working Areas
- Course homework and exercises on the Excalidraw codebase
- Memory Bank generation for project documentation
- Code review tooling setup (CodeRabbit integration)

## Current Branch
- `master` (main branch)

## Known TODOs in Codebase
- `App.tsx`: Legacy feature removal pending — "TODO maybe remove this in several months (shipped: 24-03-11)"
- `Collab.tsx`: Type system refactoring — "TODO: `ImportedDataState` type here seems abused"

## Pending Work
- `yarn.lock` has uncommitted modifications (visible in git status)

## Environment State
- Development environment configured for local development
- Firebase project: `excalidraw-oss-dev`
- WebSocket collaboration server expected at `localhost:3002`
- AI backend expected at `localhost:3016`

## How to Navigate This Codebase

### Quick Start for New Contributors
| Area | Entry Point | Description |
|------|-------------|-------------|
| **Main App** | `excalidraw-app/App.tsx` | Web app shell, routing, collaboration init |
| **Core Component** | `packages/excalidraw/components/App.tsx` | Monolithic core (~407KB), all drawing logic |
| **Collaboration** | `excalidraw-app/collab/Collab.tsx` | WebSocket sync, presence, conflict resolution |
| **State Management** | `packages/excalidraw/editor-jotai.ts` | Jotai store setup, isolated atoms |
| **Element Rendering** | `packages/excalidraw/renderer/` | Canvas rendering pipeline (static + interactive) |
| **Element Types** | `packages/element/src/types.ts` | All element type definitions |
| **Actions System** | `packages/excalidraw/actions/` | User actions (tools, transforms, clipboard) |
| **Data Layer** | `packages/excalidraw/data/` | Persistence, export, import, reconciliation |
| **Hooks** | `packages/excalidraw/hooks/` | Custom React hooks |
| **Error Types** | `packages/excalidraw/errors.ts` | Custom error hierarchy |
| **Config** | `excalidraw-app/data/` | Firebase config, environment variables |

### Key Files to Read First
1. `packages/excalidraw/types.ts` — Core type definitions (`AppState`, `ExcalidrawElement`)
2. `packages/excalidraw/editor-jotai.ts` — How state is managed
3. `packages/excalidraw/data/reconcile.ts` — Collaboration conflict resolution algorithm
4. `packages/excalidraw/renderer/interactiveScene.ts` — How the canvas renders
5. `excalidraw-app/collab/Collab.tsx` — How real-time sync works
