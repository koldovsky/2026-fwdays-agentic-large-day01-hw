# Active Context

> **See also**: [projectbrief](projectbrief.md) | [techContext](techContext.md) | [systemPatterns](systemPatterns.md) | [decisionLog](decisionLog.md) | [productContext](productContext.md) | [progress](progress.md)
> **Technical docs**: [Architecture](../technical/architecture.md) | [Dev Setup](../technical/dev-setup.md)
> **Product docs**: [PRD](../product/PRD.md) | [Domain Glossary](../product/domain-glossary.md)

Current development focus and recent areas of activity in the codebase.

## Current Version

**0.18.0** — consistent across `excalidraw`, `common`, `element`, `math` packages. `utils` is versioned independently at 0.1.2.

## Active Development Areas

### AI / Text-to-Diagram (Beta)

Primary area of recent activity. Components in `excalidraw-app/components/AI.tsx`:

- **TTDDialog** — Text-to-Diagram dialog: natural language → diagram generation
- **DiagramToCodePlugin** — Reverse: diagram → code output
- **Chat system** — `ChatInterface`, `ChatMessage`, `useChatAgent`, `TTDChatPanel`
- **Persistence** — `TTDIndexedDBAdapter` in `excalidraw-app/data/TTDStorage.ts`
- **Integration** — `TTDDialogTrigger` wired into main `App.tsx`
- **i18n label** — `"aiBeta"` in localization files

Both examples (`with-nextjs`, `with-script-in-browser`) expose TTDDialog for testing.

### Lasso Tool

Fully implemented and tested:
- Source: `packages/excalidraw/lasso/` (index.ts, utils.ts)
- Tests: `packages/excalidraw/tests/lasso.test.tsx`
- Action: `actionToggleLassoTool` with toolbar UI integration
- Feature: Selection/Lasso toggle in toolbar

### Elbow Arrows

Fully implemented with dedicated binding logic:
- Type guard: `isElbowArrow()` distinguishing from regular arrows
- Binding: `bindingStrategyForElbowArrowEndpointDragging()` with `BASE_BINDING_GAP_ELBOW = 5`
- Tests: `packages/element/tests/elbowArrow.test.tsx`
- Point management: `updateElbowArrowPoints()`

## Recent Migration Work

From v0.17.0 to v0.18.0:
- Removed `Ref`, `ready`/`readyPromise` APIs
- `LibraryLocalStorageMigrationAdapter` added to `excalidraw-app/App.tsx` for library data migration
- Comprehensive restore system: `restoreElements()`, `restoreAppState()`, `restore()` in `packages/excalidraw/data/restore.ts`

## Deprecated APIs

| Removed | Replacement |
|---------|------------|
| UMD bundle | ES modules |
| `excalidraw-assets` folders | `packages/excalidraw/locales` |
| `commitToHistory` | `captureUpdate` |
| `UIOptions.welcomeScreen` | `<WelcomeScreen>` component |

## Known Performance TODOs

From code comments:
- "TODO: this a huge bottleneck for large scenes, optimise" — binding calculations
- "TODO maybe remove this (shipped: 24-03-11)" — cleanup candidate
- Free-drawing shake optimization pending
- General rendering optimization for large element counts

## Tech Debt Indicators

- ~50+ `TODO`/`FIXME` comments across codebase — standard maintenance level
- 3 deprecated fonts marked in `packages/common/src/font-metadata.ts`
- Circular dependency workarounds present (`disableSideHack`)
- Legacy service worker cleanup in `public/service-worker.js` (CRA→Vite migration)

## Configuration State

### Build & Dev
- Vite 5.0.12 dev server with HMR
- TypeScript 5.9.3 strict mode
- Vitest for testing with jsdom environment

### CI/Quality Gates
- Coverage thresholds: Lines 60%, Branches 70%, Functions 63%, Statements 60%
- ESLint with Jotai import enforcement
- TypeScript strict checks enabled

### Deployment
- Vercel for production (`vercel.json` present)
- Docker support (`Dockerfile` + `docker-compose.yml`)
- Crowdin for i18n management

## Documentation Status

Created docs in this project:
- `docs/technical/architecture.md` — 5-section architecture overview with mermaid diagrams
- `docs/product/domain-glossary.md` — 25+ domain terms
- `docs/memory/projectbrief.md` — project overview and goals
- `docs/memory/techContext.md` — full tech stack with versions
- `docs/memory/systemPatterns.md` — 14 architectural patterns
- `docs/memory/decisionLog.md` — 15 key decisions with rationale
- `docs/memory/productContext.md` — UX goals and scenarios
- `docs/memory/activeContext.md` — this file
- `docs/memory/progress.md` — project progress tracking
