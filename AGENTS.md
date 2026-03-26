# Agents

Excalidraw is an open-source virtual whiteboard for hand-drawn diagrams — a Yarn 1 monorepo with a Vite web app (`excalidraw-app/`) and an embeddable React component (`@excalidraw/excalidraw`).

## Quick Orientation

Read these files in order to get full project context:

| File | What you'll learn |
|------|-------------------|
| [docs/memory/projectbrief.md](docs/memory/projectbrief.md) | Monorepo structure, workspaces, key capabilities, deployment targets |
| [docs/memory/productContext.md](docs/memory/productContext.md) | Target users, problem statement, UX principles, key workflows |
| [docs/memory/techContext.md](docs/memory/techContext.md) | Dependencies, build tooling, npm scripts, env vars, TS config |
| [docs/memory/systemPatterns.md](docs/memory/systemPatterns.md) | Architecture, state management (Jotai), rendering, testing patterns |
| [docs/memory/decisionLog.md](docs/memory/decisionLog.md) | Key architectural decisions with rationale |
| [docs/memory/progress.md](docs/memory/progress.md) | Feature completion status, known gaps, technical debt |
| [docs/memory/activeContext.md](docs/memory/activeContext.md) | Current work focus, recent changes, next steps |

## Key Constraints

- **Yarn 1 Classic** — run `yarn install` at the root before any dev commands.
- **Two Jotai stores** — `editor-jotai` (library) and `app-jotai` (app). Direct `import from "jotai"` is ESLint-forbidden.
- **Library stays backend-agnostic** — Firebase, Sentry, and Socket.IO belong in `excalidraw-app/` only.
- **Import discipline** — barrel imports within `packages/excalidraw/` are forbidden; use direct relative imports.

## Extended Docs

- [docs/product/PRD.md](docs/product/PRD.md) — full product requirements document
- [docs/technical/dev-setup.md](docs/technical/dev-setup.md) — local development, build, test, and deploy guide
