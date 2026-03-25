# Technical Context — Excalidraw

## Tech Stack

| Layer            | Technology                          |
| ---------------- | ----------------------------------- |
| Language         | TypeScript 5.9                      |
| UI Framework     | React 19                            |
| State Management | Jotai (atomic state)                |
| Bundler          | Vite 5 (dev), ESBuild (production)  |
| Package Manager  | Yarn 1.22 (workspaces)              |
| Runtime          | Node.js >= 18                       |
| Testing          | Vitest + Jsdom                      |
| Linting          | ESLint + Prettier                   |
| Backend          | Firebase (auth, storage)            |
| Real-time        | socket.io-client (collaboration)    |
| Rendering        | HTML5 Canvas + rough.js             |
| UI Components    | Radix UI                            |
| CI/CD            | Vercel (deployment), Docker support |

## Key Dependencies

- **rough.js** — Renders shapes in a hand-drawn, sketchy style
- **jotai** — Lightweight atomic state management replacing Redux
- **firebase** — Cloud storage, authentication, and real-time database
- **socket.io-client** — WebSocket-based collaboration transport
- **@excalidraw/laser-pointer** — Laser pointer trail for presentations
- **@excalidraw/mermaid-to-excalidraw** — Converts Mermaid diagrams to Excalidraw elements
- **@excalidraw/random-username** — Generates random usernames for collaborators
- **radix-ui** — Accessible, unstyled UI primitives

## Build & Development

| Command                | Purpose                                  |
| ---------------------- | ---------------------------------------- |
| `yarn start`           | Dev server with hot reload               |
| `yarn build:packages`  | Build all internal packages              |
| `yarn build:app`       | Build the standalone web application     |
| `yarn test:all`        | Run TypeCheck + ESLint + Prettier + Vitest |

## Development Standards

- TypeScript for all code — no plain JavaScript
- React functional components with hooks (no class components)
- Immutable data patterns for element state
- Performance-first approach — avoid unnecessary re-renders
- Small, focused components with clear responsibilities
- Always run tests after code modifications

## Configuration Files

| File                 | Purpose                        |
| -------------------- | ------------------------------ |
| `package.json`       | Workspace root, scripts, deps  |
| `tsconfig.json`      | TypeScript compiler settings   |
| `vitest.config.mts`  | Test runner configuration      |
| `vercel.json`        | Vercel deployment settings     |
| `docker-compose.yml` | Docker-based local development |
| `crowdin.yml`        | Translation/i18n management    |

## Related Documentation

- [Project Brief](projectbrief.md) — project overview and goals
- [System Patterns](systemPatterns.md) — architectural patterns
- [Architecture](../technical/architecture.md) — system diagrams and data flow
- [Dev Setup](../dev-setup.md) — full onboarding guide with all commands
- [Decision Log](decisionLog.md) — undocumented behaviors and architectural decisions
